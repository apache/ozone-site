---
sidebar_label: Quota
---

# Implementation of Quota

This page describes how Ozone enforces quotas in the Ozone Manager (OM). It complements user-facing quota documentation with an implementation-focused view. Tracked as [HDDS-15153](https://issues.apache.org/jira/browse/HDDS-15153).

Ozone implements quota to manage physical data usage and the number of logical entities created by users. The implementation spans multiple layers, from volume-level restrictions to fine-grained bucket tracking and background garbage collection.

## Types of quota

Ozone tracks two dimensions of quota, stored on `OmVolumeArgs` and `OmBucketInfo`:

- **Quota in bytes (space quota):** Limits the physical storage consumed by data blocks in the cluster, including replication.
- **Quota in namespace:** Limits how many logical objects exist: buckets under a volume, or keys and directories under a bucket.

When a quota is unset or cleared, it uses `OzoneConsts.QUOTA_RESET`, which behaves as unbounded.

## Volume-level quota enforcement

At the volume layer, quota acts as a structural constraint across child buckets. The OM does not continuously re-sum active key sizes across the subtree to evaluate volume limits; volume space quota is enforced in terms of **per-bucket space quotas** and their aggregate.

[`OMVolumeSetQuotaRequest`](https://github.com/apache/ozone/blob/master/hadoop-ozone/ozone-manager/src/main/java/org/apache/hadoop/ozone/om/request/volume/OMVolumeSetQuotaRequest.java) applies updates from a set-quota RPC. Bucket-level quotas that participate in volume accounting are reconciled through bucket metadata updates (including [`OMBucketSetPropertyRequest`](https://github.com/apache/ozone/blob/master/hadoop-ozone/ozone-manager/src/main/java/org/apache/hadoop/ozone/om/request/bucket/OMBucketSetPropertyRequest.java)).

- **Namespace:** `checkQuotaNamespaceValid()` ensures the **current bucket count** in the volume does not exceed the new volume namespace quota.
- **Space:** `checkQuotaBytesValid()` requires that **every non-link bucket** in the volume has an explicit space quota set. It then ensures the **sum** of those bucket quotas does not exceed the volume’s space quota.

## Bucket-level metrics and tracking

At the bucket layer, `OmBucketInfo` records usage the OM uses for enforcement and reporting. Important fields include:

| Field | Role |
| --- | --- |
| `usedBytes` | Active space for keys currently in the bucket namespace. |
| `usedNamespace` | Count of active keys and directories (per bucket semantics). |
| `snapshotUsedBytes` | Space still charged against quota while blocks are retained (for example pending physical delete or snapshot retention). Added as part of [HDDS-13756](https://issues.apache.org/jira/browse/HDDS-13756). |
| `snapshotUsedNamespace` | Namespace similarly retained until purge completes. |

When OM checks remaining headroom for an operation, it uses **total** utilization by combining active and retained usage:

```java
// OmBucketInfo (Ozone OM helpers)
public long getTotalBucketSpace() {
    return usedBytes + snapshotUsedBytes;
}

public long getTotalBucketNamespace() {
    return usedNamespace + snapshotUsedNamespace;
}
```

## Active quota validation (write path)

On the write path OM blocks operations that would exceed bucket limits before committing metadata visible to clients.

Implementations such as `OMKeyCreateRequest`, `OMFileCreateRequest`, and `OMAllocateBlockRequest` call **`checkBucketQuotaInBytes`** and **`checkBucketQuotaInNamespace`** from [`OMKeyRequest`](https://github.com/apache/ozone/blob/master/hadoop-ozone/ozone-manager/src/main/java/org/apache/hadoop/ozone/om/request/key/OMKeyRequest.java):

- **Block allocation:** Before granting new blocks, `checkBucketQuotaInBytes()` checks whether `getTotalBucketSpace()` plus the allocation would exceed `quotaInBytes`. If so, OM fails with `OMException.ResultCodes.QUOTA_EXCEEDED`.
- **Key commit:** After a successful commit (`OMKeyCommitRequest`), OM updates usage. Overwrites decrement `usedBytes` by prior block lengths before applying the newly committed sizes.

## Quota reclamation and deletion (delete path)

Reclaiming quota is asynchronous and coordinated with background deletion (and snapshots), so totals stay consistent while blocks still exist on Datanodes.

### Client-driven delete

When a client deletes a key (`OMKeyDeleteRequest`), OM removes the key from the live namespace but **does not immediately drop total charged space** from the bucket’s perspective. Usage is moved from the “active” counters into the snapshot or pending-delete side so `getTotalBucketSpace()` stays stable until purge:

```java
// OMKeyDeleteRequest — illustrative; see Ozone source for full context
omBucketInfo.decrUsedBytes(quotaReleased, true);
omBucketInfo.decrUsedNamespace(1L, true);
```

The `true` flag routes the released bytes and namespace into the retained (`snapshot*`) counters so quota remains consumed until storage is actually reclaimed.

### Background purging

Services such as **`KeyDeletingService`** and **`SnapshotDeletingService`** drive physical deletion and related OM cleanup. When blocks are purged and OM processes **`OMKeyPurgeRequest`**, retained usage is reduced and quota becomes available for new writes:

```java
// OMKeyPurgeRequest — illustrative; see Ozone source for full context
omBucketInfo.purgeSnapshotUsedBytes(bucketPurgeKeysSize.getPurgedBytes());
omBucketInfo.purgeSnapshotUsedNamespace(bucketPurgeKeysSize.getPurgedNamespace());
```

After this step, `getTotalBucketSpace()` and `getTotalBucketNamespace()` drop, reflecting freed quota.

For the full delete pipeline (tables, services, and SCM), see [Implementation of Delete Operations](./delete).
