---
sidebar_label: Disk Layout
---

# Ozone Manager Disk Layout

The Ozone Manager (OM) persists critical metadata about the Ozone namespace (volumes, buckets, keys) and its own state onto local disk. Understanding this layout is important for administration, backups, and troubleshooting.

The layout consists of several key directories configured in `ozone-site.xml`.

## 1. Metadata Directory

*   **Configuration:** `ozone.om.db.dirs`
*   **Purpose:** Stores the primary metadata database for the Ozone namespace.
*   **Contents:**
    *   **`om.db/`:** This directory contains the RocksDB database files where all Ozone namespace metadata is stored.
        *   **Column Families:** Inside RocksDB, data is organized into logical tables called Column Families. Key examples include:
            *   `volumeTable`: Information about volumes.
            *   `bucketTable`: Information about buckets.
            *   `keyTable` / `fileTable`: Information about keys/files (depending on bucket layout).
            *   `directoryTable`: Information about directories (for FSO buckets).
            *   `deletedTable`: Information about recently deleted keys (pending purge).
            *   `openKeyTable`: Information about keys currently being written.
            *   `snapshotInfoTable`: Metadata about Ozone snapshots.
            *   `delegationTokenTable`: Delegation token information.
            *   `s3SecretTable`: S3 secret keys for multi-tenancy.
            *   `prefixTable`: Prefix ACL information.
            *   `tenantStateTable`, `tenantAccessIdTable`, `principalToAccessIdsTable`: Multi-tenancy related information.
            *   ... and others.
        *   **RocksDB Files:** Standard RocksDB files like `.sst` (data files), `LOG*` (transaction logs), `MANIFEST*`, `CURRENT`, `LOCK`, etc.
    *   **`om.db.snapshots/` (Implicit):** When Ozone snapshots are created, OM generates RocksDB checkpoints. These checkpoints, representing a consistent point-in-time view of the `om.db`, are typically stored in subdirectories within this location (e.g., `om.db.snapshots/CHECKPOINT-<snapshot_uuid>/`).

## 2. Storage Directory (Parent of Metadata Directory)

*   **Configuration:** Implicitly defined by the path set in `ozone.om.db.dirs`. The `OMStorage` class manages this directory.
*   **Purpose:** Holds essential state information about the OM instance itself.
*   **Contents:**
    *   **`VERSION` file:** A crucial file containing properties like:
        *   `storageType`: Should be `OM`.
        *   `clusterID`: The unique ID of the Ozone cluster. Must match across all OMs and SCMs.
        *   `creationTime`: Timestamp of initialization.
        *   `layoutVersion`: The metadata layout version number (managed by `OMLayoutVersionManager`). Essential for upgrades.
        *   `omUuid`: A unique UUID for this specific OM instance.
        *   `certSerialId`: (In secure clusters) The serial ID of the OM's current certificate.
        *   `omNodeId`: (In HA) The unique node ID for this OM within the Ratis ring.
    *   **`current/` directory:** A subdirectory that typically contains the active `om.db/` directory.
    *   **`previous/` directory:** May appear during the Ozone software upgrade process, containing a backup of the previous state before finalization.

## 3. Ratis Log Directory (OM HA Only)

*   **Configuration:** `ozone.om.ratis.storage.dir`
*   **Purpose:** Stores the write-ahead logs (WAL) for the Ratis consensus protocol, used to replicate OM state changes across peers in an HA setup. This is separate from the RocksDB metadata.
*   **Contents:**
    *   Subdirectories named after the Ratis group ID (usually one group for OM).
    *   Inside the group directory:
        *   `current/`: Contains Ratis log segment files (`log_*.ratis`) and Ratis snapshot files (`snapshot_*.ratis`). Ratis snapshots are internal to Ratis for log compaction and are distinct from Ozone user-visible snapshots.

## Summary

The OM relies on these directories to persist its state:

*   `ozone.om.db.dirs`: Contains the RocksDB (`om.db`) holding the core namespace metadata. Also implicitly contains RocksDB checkpoints for Ozone snapshots.
*   Parent of `ozone.om.db.dirs`: Contains the `VERSION` file with OM identity and layout version.
*   `ozone.om.ratis.storage.dir` (HA only): Contains Ratis WAL logs for state replication.

Properly configuring and backing up these directories, especially the metadata directory (`om.db`), is critical for the durability and recoverability of the Ozone namespace.
