---
sidebar_label: RocksDB Schema
---

# Ozone Manager RocksDB Schema

This page describes the RocksDB layout used by the Ozone Manager (OM). The OM persists namespace and related metadata in RocksDB: volumes, buckets, keys, S3-style multipart uploads, snapshots, tenancy, and supporting system state.

The exact column families and key encodings can evolve between Ozone releases; treat this as a guide to how data is organized, not a stable API.

## Database overview

| Property | Value |
| -------- | ----- |
| Database directory | Configured by [`ozone.om.db.dirs`](../../../05-administrator-guide/02-configuration/99-appendix) (falls back to `ozone.metadata.dirs` if unset) |
| On-disk name | `om.db` |
| Engine | RocksDB with multiple column families |

## Column families

Column families are grouped by role below. **Key format** uses placeholders such as `volume`, `bucket`, and `key` for path-style keys, or `volId`, `buckId`, `parentId` for ID-based (FSO) keys. Most namespace keys use a leading `/`, per `OzoneConsts.OM_KEY_PREFIX`.

### 1. Hierarchy and ownership

Stores the top levels of the namespace: users, volumes, and buckets.

| Table name | Key format | Value type | Description |
| ---------- | ---------- | ---------- | ----------- |
| `userTable` | `userName` | `UserVolumeInfo` | User to owned volumes |
| `volumeTable` | `/{volume}` | `OmVolumeArgs` | Volume metadata (owner, quota, ACLs) |
| `bucketTable` | `/{volume}/{bucket}` | `OmBucketInfo` | Bucket metadata (layout, quota, ACLs) |

### 2. Object store (OBS) layout

Used for buckets with **LEGACY** or **OBJECT_STORE** layout. Keys are stored under their full path names.

| Table name | Key format | Value type | Description |
| ---------- | ---------- | ---------- | ----------- |
| `keyTable` | `/{volume}/{bucket}/{key}` | `OmKeyInfo` | Committed keys (includes block locations) |
| `openKeyTable` | `/{volume}/{bucket}/{key}/{clientId}` | `OmKeyInfo` | In-progress writes (uncommitted) |
| `deletedTable` | `/{volume}/{bucket}/{key}` | `RepeatedOmKeyInfo` | Keys pending deletion / GC |

### 3. File system optimized (FSO) layout

Used for buckets with **FILE_SYSTEM_OPTIMIZED** layout. Keys use volume ID, bucket ID, and parent object ID so directory operations (for example `ls`, rename) can avoid scanning full string paths. See also [Filesystem optimization](../../07-features/01-filesystem-optimization).

| Table name | Key format | Value type | Description |
| ---------- | ---------- | ---------- | ----------- |
| `directoryTable` | `/{volId}/{buckId}/{parentId}/{dirName}` | `OmDirectoryInfo` | Directories |
| `fileTable` | `/{volId}/{buckId}/{parentId}/{fileName}` | `OmKeyInfo` | Committed files |
| `openFileTable` | `/{volId}/{buckId}/{parentId}/{fileName}/{clientId}` | `OmKeyInfo` | Files currently being written |
| `deletedDirectoryTable` | `/{volId}/{buckId}/{parentId}/{dirName}/{objId}` | `OmKeyInfo` | Directories marked for deletion |

### 4. Multipart upload

Metadata for S3-style multipart uploads.

| Table name | Key format | Value type | Description |
| ---------- | ---------- | ---------- | ----------- |
| `multipartInfoTable` | `/{volume}/{bucket}/{key}/{uploadId}` | `OmMultipartKeyInfo` | Overall upload session |
| `multipartPartsTable` | `{uploadId}/{partNumber}` | `OmMultipartPartInfo` | Individual parts (`partNumber` is not a full path key) |

### 5. Snapshots

Snapshot metadata and bookkeeping for snapshot-related garbage collection.

| Table name | Key format | Value type | Description |
| ---------- | ---------- | ---------- | ----------- |
| `snapshotInfoTable` | `/{volume}/{bucket}/{snapshotName}` | `SnapshotInfo` | One snapshot’s metadata |
| `snapshotRenamedTable` | `/{volName}/{buckName}/{objectId}` | `String` | Tracks renames across snapshots for correct GC |
| `compactionLogTable` | `{dbTrxId}-{compactionTime}` | `CompactionLogEntry` | Compaction history used by snapshot services |

### 6. Multi-tenant and security

Tenants, access mappings, S3 secrets, and delegation tokens.

| Table name | Key format | Value type | Description |
| ---------- | ---------- | ---------- | ----------- |
| `tenantStateTable` | `tenantId` | `OmDBTenantState` | Tenant configuration and state |
| `tenantAccessIdTable` | `accessId` | `OmDBAccessIdInfo` | Access ID to secret and tenant |
| `principalToAccessIdsTable` | `userPrincipal` | `OmDBUserPrincipalInfo` | Kerberos principal to access IDs |
| `s3SecretTable` | `accessKeyId` | `S3SecretValue` | S3 secrets |
| `dTokenTable` | `OzoneTokenID` | `Long` | Delegation tokens and renewal times |

### 7. Administrative and system

Prefix ACLs, Ratis apply point, and miscellaneous metadata.

| Table name | Key format | Value type | Description |
| ---------- | ---------- | ---------- | ----------- |
| `prefixTable` | `prefix` | `OmPrefixInfo` | Prefix-level ACLs and metadata |
| `transactionInfoTable` | `#TRANSACTIONINFO` (literal key) | `TransactionInfo` | Last applied Ratis transaction index and term |
| `metaTable` | `metaDataKey` | `String` | Misc. system metadata (for example DB layout version) |

## Key concepts

- **OBS vs. FSO:** OBS encodes the namespace with path strings under volume and bucket names. FSO encodes parents with numeric **object IDs** (`parentId`), which makes hierarchical FS operations cheaper at scale.
- **Object ID:** A 64-bit identifier for volumes, buckets, keys, and directories. In FSO tables, `parentId` refers to the parent object’s ID.
- **OM epoch:** The high bits of object IDs can encode an **epoch** so IDs stay unique across OM restarts or metadata migrations.
- **Key prefix:** Most hierarchy and object keys start with `/` as defined by `OzoneConsts.OM_KEY_PREFIX`. Some tables (multipart parts, compaction log) use other key shapes as noted above.
