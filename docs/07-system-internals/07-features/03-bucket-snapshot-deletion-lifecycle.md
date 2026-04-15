---
sidebar_label: Snapshot Deletion Lifecycle
---

# Snapshot Deletion Lifecycle

This document describes the internal lifecycle of snapshot deletion in Apache Ozone, from the initial user request to the final physical removal of data and metadata.

The snapshot deletion process is divided into four main phases:

## 1. Request Phase: `OMSnapshotDeleteRequest`

*   **Trigger:** User executes the command `ozone sh snapshot delete <bucket> <snapshot>`.
*   **Operation:** 
    *   The Ozone Manager (OM) receives the request and validates it.
    *   The snapshot's status is updated to `SNAPSHOT_DELETED` in the `SnapshotInfoTable`.
    *   The `deletionTime` is set to the current timestamp.
*   **Result:** This phase only "labels" the snapshot for deletion. It does not yet adjust the snapshot chain or reclaim any data. The snapshot remains in the system but is now a candidate for the background reclamation service.

## 2. Reclamation Phase: `SnapshotDeletingService`

*   **Trigger:** A background service that runs periodically.
*   **Operation:** 
    *   The service identifies snapshots with the `SNAPSHOT_DELETED` status.
    *   It processes the deleted snapshot's internal tracking tables: `deletedTable`, `deletedDirTable`, and `renamedTable`.
    *   **Data Moving:** It moves entries from these tables to either:
        1.  The **next active snapshot** in the chain (if one exists).
        2.  The **Active Object Store (AOS)** if no subsequent snapshot exists.
*   **Settling:** Once all keys and directories for the snapshot have been successfully moved (i.e., the snapshot's deleted tables are empty), the service collects the snapshot's DB key into a "purge list".

## 3. Finalization Phase: `OMSnapshotPurgeRequest`

*   **Trigger:** Triggered by the `SnapshotDeletingService` once a snapshot is fully "empty" (all keys reclaimed).
*   **Chain Adjustment (The Surgeon):** This is where the actual snapshot chain surgery occurs. The service updates the `previousSnapshotId` of the next snapshot in the chain to point to the deleted snapshot's predecessor, effectively "stitching" the chain back together.
*   **Deep Clean Flag:** It sets `setDeepClean(false)` on the next snapshots. This signals the `KeyDeletingService` that it can now perform a "deeper" cleanup because a snapshot in the middle of the chain has been removed, potentially uncovering more keys that are no longer referenced by any snapshot.
*   **Removal (The Janitor):** The snapshot record is removed from the `SnapshotInfoTable` cache, and the corresponding checkpoint directory on disk is deleted.

## 4. Persistence: `OMSnapshotPurgeResponse`

*   **Operation:** The Ozone Manager double-buffer flushes the transaction to disk.
*   **Result:** The snapshot record is physically and permanently deleted from the RocksDB `snapshotInfoTable`.

---

## Summary of Roles

| Component | Role | Description |
| :--- | :--- | :--- |
| **`OMSnapshotDeleteRequest`** | The Labeler | Marks the snapshot for death by updating its status. |
| **`SnapshotDeletingService`** | The Reclaimer | Moves the data references to the next snapshot or AOS. |
| **`OMSnapshotPurgeRequest`** | The Surgeon & Janitor | Re-links the snapshot chain and deletes the physical records. |
