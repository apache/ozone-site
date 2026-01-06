---
sidebar_label: Overview
---

# Buckets Overview

## What is a Bucket?

A **Bucket** is the second level in the Ozone data hierarchy, residing within a volume. Buckets are analogous to directories or folders in a traditional file system.
They serve as containers for keys (data objects).

**Key Characteristics:**

- **Contained within Volumes:** Every bucket must belong to a volume.
- **Container for Keys:** A bucket can contain any number of keys.
- **No Nested Buckets:** Unlike directories, buckets cannot contain other buckets.

## Details

### Creation and Management

Buckets are created within a specified volume.

```bash
ozone sh bucket create /myvolume/mybucket
```

For more details on bucket operations, refer to the [Ozone CLI documentation](../../../04-user-guide/01-client-interfaces/01-o3.md#bucket-operations).

### Bucket Layouts (Object Store vs. File System Optimized)

Ozone supports different bucket layouts, primarily:

- **Object Store (OBS):** The traditional object storage layout, where keys are stored with their full path names. This is suitable for S3-like access patterns.
For more details, refer to the [Object Store documentation](./04-layouts/01-object-store.md).
- **File System Optimized (FSO):** An optimized layout for Hadoop Compatible File System (HCFS) semantics, where intermediate directories are stored separately, improving performance for file system operations like listing and renaming.
For more details, refer to the [Prefix FSO documentation](./04-layouts/02-file-system-optimized.md).

### Erasure Coding

Erasure Coding (EC) can be enabled at the bucket level to define data redundancy strategies. This allows for more efficient storage compared to replication, especially for large datasets.
For more information, see the [Erasure Coding documentation](../../02-replication/04-erasure-coding.md).

### Snapshots

Ozone's snapshot feature allows users to take point-in-time consistent images of a given bucket. These snapshots are immutable and can be used for backup, recovery, archival, and incremental replication purposes.
For more details, refer to the [Ozone Snapshot documentation](./08-snapshots.md).

### GDPR Compliance

Ozone provides features to support GDPR compliance, particularly the "right to be forgotten." When a GDPR-compliant bucket is created, encryption keys for deleted data are immediately removed, making the data unreadable even if the underlying blocks haven't been physically purged yet.
For more details, refer to the [GDPR documentation](https://ozone.apache.org/docs/edge/security/gdpr.html).

### Bucket Linking

Bucket linking allows exposing a bucket from one volume (or even another bucket) as if it were in a different location, particularly useful for S3 compatibility or cross-tenant access. This creates a symbolic link-like behavior.
For more information, see the [S3 Protocol documentation](../../../04-user-guide/01-client-interfaces/03-s3.md) and [S3 Multi-Tenancy documentation](../../../05-administrator-guide/03-operations/07-s3-multi-tenancy.md).

### Access Control Lists (ACLs)

ACLs define permissions for buckets, controlling who can list keys, read/write data, or delete the bucket.
For more details, refer to the [Security ACLs documentation](../../04-security/02-acls/01-native-acls.md).
