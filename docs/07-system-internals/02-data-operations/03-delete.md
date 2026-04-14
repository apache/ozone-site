---
sidebar_label: Delete
---

# Implementation of Delete Operations

A common question is: after a user deletes something, when is space actually reclaimed? Ozone spreads work across the client, Ozone Manager (OM), Storage Container Manager (SCM), and Datanodes. This page is a single map of that pipeline: **metadata moves first**, then **blocks are deleted asynchronously**, and **bytes on disk** disappear only after Datanodes finish their background cleanup.

AuthN, authZ (Kerberos, Ranger, native ACLs), and encryption behave like other OM requests; they gate the flows below but are not repeated in every step.

## Client: CLI, FileSystem, and trash

Deletion depends on **which API** you use and on **bucket layout**. Trash is implemented on the **client** (renames into `.Trash`), not as a separate table inside OM.

### Ozone CLI (`DeleteKeyHandler`)

- **FSO buckets**  
  - If trash is enabled (`fs.trash.interval > 0`), the CLI **renames** the key into the Hadoop trash layout: `.Trash`, a per-user segment, `Current`, then the key’s relative path.  
  - If trash is disabled, it calls **`bucket.deleteKey(keyName)`** for a direct delete.
- **OBS / legacy buckets**  
  - **`ozone sh key delete`** calls **`bucket.deleteKey(keyName)`** directly. Trash is **not** supported for this path the way it is for FSO.

### Hadoop FileSystem (`o3fs://`, `ofs://`)

`hadoop fs -rm` follows the usual Hadoop **TrashPolicy**:

- With trash enabled, the client issues a **rename** from the source path to `/.Trash/Current/...`.
- With **`-skipTrash`** or trash disabled, it calls **`FileSystem.delete()`**, which becomes a **`deleteKey`** RPC to OM.

### What OM sees for trash vs delete

- **Rename into `.Trash`** is a normal **metadata rename** in **`keyTable`** or **`fileTable`**. The object id and blocks stay put; **no space is reclaimed**.
- **`deleteKey`** removes the key from the live namespace and stages it for asynchronous block cleanup (see [OM](#ozone-manager-tables-and-background-services) below).

### Trash emptier

`.Trash` is an ordinary directory tree. A **Trash emptier** (Hadoop client background thread or scheduled job) eventually:

1. Renames `.Trash/Current` to a timestamped checkpoint under `.Trash/`.
2. After retention, issues a **recursive delete** on that checkpoint.
3. Those **`deleteKey`** operations finally move keys into **`deletedTable`** and start physical reclamation.

### Client summary

| Client action | Trash | OM operation | Result |
| --- | --- | --- | --- |
| `rm` file | Off | `deleteKey` | Entry moves toward **`deletedTable`**; async reclamation begins |
| `rm` file | On | `renameKey` | Data under **`.Trash/Current`**; no reclamation yet |
| `rm -skipTrash` | On | `deleteKey` | Same as direct delete |
| Trash emptier | — | `deleteKey` (recursive) | Keys reach **`deletedTable`**; space can be reclaimed |

**Takeaway:** OM has **no trash table**. It only sees **renames** or **final deletes**.

## Ozone Manager: tables and background services

Deletion in OM is **multi-phase** and **asynchronous** so large trees and huge key counts do not block a single RPC.

### Synchronous delete (`OMKeyDeleteRequest`)

When **`deleteKey`** is processed:

- **File (FSO):** Row leaves **`fileTable`** (or **`keyTable`** in non-FSO layouts) and is recorded in **`deletedTable`**.
- **Directory (FSO):** Row moves from **`directoryTable`** to **`deletedDirectoryTable`**.
- **Quota:** Bucket **used bytes** and **namespace** usage are updated for the **logical** delete at this stage.

### Directory expansion (`DirectoryDeletingService`) — FSO

Deleting a directory does **not** instantly move every descendant. The service:

1. Scans **`deletedDirectoryTable`** for pending directory deletes.
2. Moves child **files** from **`fileTable`** → **`deletedTable`** and child **directories** from **`directoryTable`** → **`deletedDirectoryTable`** for later iterations.
3. When a directory has **no remaining children** in the live tables, it sends **`PurgePathRequest`** to drop that directory from **`deletedDirectoryTable`**.

### Block handoff and purge (`KeyDeletingService`, `OMKeyPurgeRequest`)

**`KeyDeletingService`** drains **`deletedTable`**:

1. Reads **block groups** for each deleted key.
2. Asks **SCM** to persist **delete-block** intent and waits for acknowledgement that SCM has recorded it.
3. Submits **`OMKeyPurgeRequest`** to remove metadata from **`deletedTable`** once SCM has accepted the work.

**`OMKeyPurgeRequest`** is the terminal metadata step for a key. With **snapshots**, purge may **retain** or **redirect** entries (for example toward a snapshot’s deleted tables) so snapshot chains stay consistent—details depend on snapshot configuration and chain state.

### OM table flow (FSO)

| Step | Entity | From | To | Handler / service |
| --- | --- | --- | --- | --- |
| 1 | File | `fileTable` | `deletedTable` | `OMKeyDeleteRequest` |
| 1 | Directory | `directoryTable` | `deletedDirectoryTable` | `OMKeyDeleteRequest` |
| 2 | Child file | `fileTable` | `deletedTable` | `DirectoryDeletingService` |
| 2 | Child dir | `directoryTable` | `deletedDirectoryTable` | `DirectoryDeletingService` |
| 3 | File metadata | `deletedTable` | removed | `KeyDeletingService` → `OMKeyPurgeRequest` |
| 4 | Directory metadata | `deletedDirectoryTable` | removed | `DirectoryDeletingService` → `PurgePathRequest` |

## OBS and LEGACY buckets

OBS / legacy layouts use a **flat key namespace** (paths with slashes are still **one key**). There is **no** directory tree in **`directoryTable`**, so there is **no** **`DirectoryDeletingService`** expansion step.

1. **`OMKeyDeleteRequest`** works against **`keyTable`** (`BucketLayout.OBJECT_STORE` / legacy equivalents). A **tombstone** may be visible in cache while the transaction completes; quota updates apply with the delete.
2. **`OMKeyDeleteResponse`** persists: **delete** from **`keyTable`**, **insert** into **`deletedTable`** (often keyed like `volume/bucket/keyName/objectId`). “Directories” in the name are **string prefixes**, not rows in **`directoryTable`**.
3. From **`deletedTable`** onward, **`KeyDeletingService`**, SCM, and Datanodes behave **like FSO file deletes**.

| | FSO | OBS / LEGACY |
| --- | --- | --- |
| Live tables | `fileTable`, `directoryTable` | `keyTable` |
| Directory staging | `deletedDirectoryTable` | — |
| Deleted keys | `deletedTable` | `deletedTable` |
| Directory expansion | Yes (`DirectoryDeletingService`) | No |

## Physical reclamation: SCM and Datanodes {#deleting-data}

OM never deletes bytes on disk directly. It hands **block ids** to **SCM**, which coordinates **replicas** on **Datanodes**.

### SCM: log, throttle, dispatch

1. **Persist intent:** On **`deleteKeyBlocks`** from OM, SCM **groups** blocks by **container**, creates **`DeletedBlocksTransaction`** records with **transaction ids (TXIDs)**, and stores them in **`DeletedBlocksTXTable`** (RocksDB in SCM). A restart replays this log—work is not forgotten.
2. **`SCMBlockDeletingService`:** Periodically scans pending transactions, respects **healthy Datanodes** and **queue limits**, builds **`DeleteBlocksCommand`** payloads (often batched), and attaches them to **heartbeat responses**.
3. **Completion:** Datanodes report **`ContainerBlocksDeletionACKProto`** / delete-block status. **`SCMDeletedBlockTransactionStatusManager`** tracks which replicas acknowledged which TXID. SCM removes a transaction from **`DeletedBlocksTXTable`** only after **all required replicas** have acknowledged.

This design favors **eventual completion** under failures, **no orphan replicas** left behind, and **fewer RPCs** via batching.

### Datanode: ACK first, erase in the background

1. **`DeleteBlocksCommandHandler`:** Commands go on **`deleteCommandQueues`**; **`DeleteCmdWorker`** runs **`ProcessTransactionTask`** per TX. The handler **records deletion intent** in the container DB—**schema v2/v3:** transactions in **`DeletedBlocksTXTable`** inside the container DB; **schema v1:** block keys move to a **`deletedBlocksTable`** / deleting prefix. It then **ACKs** SCM so the control plane can track replica progress.
2. **`BlockDeletingService`:** A background loop schedules **`BlockDeletingTask`** per container, calls **`handler.deleteBlock()`** to **remove chunk files** from disk, then **cleans DB state** (block rows, transaction rows, **`usedBytes`**, pending-delete counters). **Empty containers** can be marked so SCM may retire the container later.

| Piece | Role |
| --- | --- |
| `DeleteBlocksCommandHandler` | Apply SCM command, persist intent in container DB, send ACK |
| `BlockDeletingService` | Throttled physical deletes and DB cleanup |
| `BlockDeletingTask` | Per-container work unit; uses the container **handler** (e.g. key-value) |

**Net effect:** SCM and OM do not wait for slow disks before moving their own state forward; Datanodes **guarantee** eventual removal or keep retrying until the cluster agrees every replica is gone.

## See also

- [RocksDB tables in OM](../01-components/01-ozone-manager/02-rocksdb-schema) — where `fileTable`, `deletedTable`, and related column families are documented.
- [RocksDB on SCM](../01-components/02-storage-container-manager/02-rocksdb-schema) and [on Datanodes](../01-components/03-datanode/02-rocksdb-schema).
- [Administrator trash guide](../../05-administrator-guide/03-operations/12-trash) — operations-focused trash behavior.
