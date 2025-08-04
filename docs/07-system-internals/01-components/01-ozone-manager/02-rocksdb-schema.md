---
sidebar_label: RocksDB Schema
---

# Ozone Manager RocksDB Schema

The Ozone Manager (OM) stores all its critical metadata, including the namespace hierarchy (volumes, buckets, keys), security information (ACLs, tokens), and operational state (multipart uploads, deleted keys), in a [RocksDB](https://rocksdb.org/) key-value database. This database is located within the directory specified by `ozone.om.db.dirs` (typically in a subdirectory named `om.db`).

Understanding the schema of this database is helpful for debugging, troubleshooting, and gaining deeper insight into OM's internal state.

## Schema Overview

The OM database schema is defined in the `org.apache.hadoop.ozone.om.codec.OMDBDefinition` class. It consists of multiple logical tables, implemented as RocksDB **Column Families**. Each Column Family stores specific types of metadata, with keys and values serialized using appropriate codecs (often Protobuf).

Here are some of the most important Column Families (Tables):

**Namespace Tables:**

*   `userTable`: Maps user principals to the list of volumes they own.
    *   *Key:* User name (String)
    *   *Value:* `PersistedUserVolumeInfo` (Protobuf containing list of volume IDs)
*   `volumeTable`: Stores metadata for each volume.
    *   *Key:* `/volumeId` (String, using internal volume object ID)
    *   *Value:* `OmVolumeArgs` (Protobuf containing owner, admin, quota, creation time, etc.)
*   `bucketTable`: Stores metadata for each bucket.
    *   *Key:* `/volumeId/bucketId` (String, using internal object IDs)
    *   *Value:* `OmBucketInfo` (Protobuf containing layout, replication, versioning, encryption key, quota, source bucket for links, etc.)
*   `keyTable`: Stores metadata for keys in OBS (Object Store) and Legacy layout buckets.
    *   *Key:* `/volumeId/bucketId/keyName` (String)
    *   *Value:* `OmKeyInfo` (Protobuf containing data size, block locations, creation/modification time, replication config, ACLs, etc.)
*   `directoryTable`: Stores metadata for directories in FSO (File System Optimized) layout buckets.
    *   *Key:* `/volumeId/bucketId/directoryObjectId` (String)
    *   *Value:* `OmDirectoryInfo` (Protobuf containing name, object ID, parent object ID, ACLs, etc.)
*   `fileTable`: Stores metadata for files in FSO layout buckets.
    *   *Key:* `/volumeId/bucketId/fileObjectId` (String)
    *   *Value:* `OmKeyInfo` (Similar to `keyTable` value)

**Operational State Tables:**

*   `openKeyTable`: Tracks keys currently being written (OBS/Legacy). Keys are moved to `keyTable` or `deletedTable` upon commit or abort.
    *   *Key:* `/volumeId/bucketId/keyName/clientId` (String)
    *   *Value:* `OmKeyInfo`
*   `openFileTable`: Tracks files currently being written (FSO).
    *   *Key:* `/volumeId/bucketId/fileObjectId/clientId` (String)
    *   *Value:* `OmKeyInfo`
*   `multipartInfoTable`: Stores metadata about ongoing multipart uploads.
    *   *Key:* `/volumeId/bucketId/keyName/uploadId` (String)
    *   *Value:* `OmMultipartKeyInfo`

**Deletion & Cleanup Tables:**

*   `deletedTable`: Stores keys that have been deleted but whose blocks haven't been reclaimed yet. Processed by the KeyDeletingService.
    *   *Key:* `/volumeId/bucketId/keyName` (String)
    *   *Value:* `RepeatedOmKeyInfo` (Protobuf potentially containing multiple versions if versioning was enabled)
*   `deletedDirTable`: Stores FSO directories marked for deletion. Processed by the DirectoryDeletingService.
    *   *Key:* `/volumeId/bucketId/directoryObjectId` (String)
    *   *Value:* `OmKeyInfo` (Contains directory info needed for recursive delete)

**Security Tables:**

*   `dtokenTable`: Stores Ozone delegation tokens.
    *   *Key:* `OzoneTokenIdentifier` (Serialized object)
    *   *Value:* Expiry Time (Long)
*   `s3SecretTable`: Stores S3 secrets associated with access IDs (for multi-tenancy).
    *   *Key:* Access ID (String)
    *   *Value:* `S3SecretValue` (Protobuf containing the secret)
*   `prefixTable`: Stores prefix ACL information.
    *   *Key:* `/volumeId/bucketId/prefixObjectId` (String)
    *   *Value:* `OmPrefixInfo` (Protobuf containing prefix name and ACLs)

**Multi-Tenancy Tables:**

*   `tenantAccessIdTable`: Maps S3 access IDs to tenant information.
*   `principalToAccessIdsTable`: Maps user principals to their associated S3 access IDs.
*   `tenantStateTable`: Stores overall state information for each tenant.

**Snapshot Tables:**

*   `snapshotInfoTable`: Stores metadata about created Ozone snapshots.
    *   *Key:* `/volumeName/bucketName/.snapshot/<snapshotName>` (String)
    *   *Value:* `SnapshotInfo` (Protobuf containing snapshot ID, creation time, status, etc.)
*   `snapshotRenamedTable`: Tracks keys/directories renamed between snapshots to aid cleanup.

**Internal Metadata Table:**

*   `metaTable`: Stores miscellaneous OM metadata.
    *   *Key:* Predefined keys like `LAYOUTVERSION`, `USER_COUNT`, `VOLUME_COUNT`, `BUCKET_COUNT`, `OM_CERT_SERIAL_ID`, `RANGER_OZONE_SERVICE_VERSION_KEY`, etc. (String)
    *   *Value:* Corresponding value (String)

## Key Structure Notes

*   Keys within the RocksDB tables often use internal **Object IDs** (long integers) assigned by OM for volumes, buckets, directories, and files, rather than just their names. This ensures uniqueness even if objects are renamed.
*   The path structure `/volumeId/bucketId/...` is common, providing a natural hierarchy for lookups and scans.
*   Specific key formats can be complex and are best understood by examining the relevant code in `OmMetadataManagerImpl.java` (e.g., `getVolumeKey`, `getBucketKey`, `getOzoneKey`, `getOzoneDirKey`).

## Inspecting the OM DB with CLI

Ozone provides a debug tool to inspect the contents of the OM RocksDB database directly. This is useful for troubleshooting but should be used with caution, especially on a running cluster. **Never directly modify the database files.**

**Prerequisites:**

*   Access to the OM node.
*   Know the path to the OM metadata directory (`ozone.om.db.dirs`).
*   Stop the OM service if performing extensive scans or dumps to avoid performance impact or inconsistencies.

**Commands:**

```bash
# Define the path to the OM DB directory
OM_DB_PATH=/path/to/your/om/metadata/om.db

# List all Column Families (Tables)
ozone debug ldb --db ${OM_DB_PATH} ls

# Scan all key-value pairs in a specific Column Family
# (Use with caution on large tables - may take a long time)
ozone debug ldb --db ${OM_DB_PATH} scan --column_family volumeTable
ozone debug ldb --db ${OM_DB_PATH} scan --column_family bucketTable
ozone debug ldb --db ${OM_DB_PATH} scan --column_family keyTable

# Get the value for a specific key in a Column Family
# Note: You need to know the exact DB key format (often involving Object IDs)
# Example: Get info for volume with ID 1 (hypothetical key format)
# ozone debug ldb --db ${OM_DB_PATH} get --column_family volumeTable /1

# Dump the entire DB content (or specific CFs) to text files in a directory
# (Use with caution - can generate very large output)
ozone debug ldb --db ${OM_DB_PATH} dump --output /path/to/dump/directory

# Get help for the ldb tool
ozone debug ldb --help
```

**Note:** The output of `scan` and `get` will show raw key/value bytes or a best-effort string representation. Understanding the exact Protobuf serialization requires deeper analysis or specific tooling.

This schema provides the foundation for Ozone's namespace management, security, and operational state persistence.
