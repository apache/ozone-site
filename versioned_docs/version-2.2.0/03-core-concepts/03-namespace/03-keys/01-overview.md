---
sidebar_label: Overview
---

# Keys

## What is a Key?

A **Key** is the fundamental data object in Ozone, analogous to a file in a traditional file system. Keys are stored within buckets and represent the actual data that users interact with.

**Key Characteristics:**

- **Contained within Buckets:** Every key must reside within a bucket.
- **Immutable Data Blocks:** Once written, the underlying data blocks of a key are immutable. Updates or modifications to a key typically result in new versions or new data blocks being written, with the metadata pointing to the latest version.

## Details

### Creation, Reading, and Management

Keys are created, read, and managed using the Ozone CLI or various client APIs (Java, S3, etc.).

```bash
ozone sh key put /myvolume/mybucket/mykey.txt /path/to/local/file.txt
```

For more details on key operations, refer to the [Ozone CLI documentation](../../../user-guide/client-interfaces/o3#key-operations).

### Key Write and Read Process

When a client writes a key, the Ozone Manager handles the metadata (key name, location of data blocks), and the Datanodes store the actual data blocks. For reads, the Ozone Manager provides the client with the locations of the data blocks, which the client then retrieves directly from the Datanodes.

<!-- TODO: Link to Ozone Manager documentation -->
For a deeper dive into the key write and read process, refer to the Ozone Manager documentation.

### Atomic Key Replacement

Ozone supports atomic key replacement, ensuring that a key is only overwritten if it hasn't changed since it was last read. This prevents lost updates in concurrent write scenarios.

<!-- TODO: Link to overwrite-key-only-if-unchanged design document when created -->
For more details, refer to the Overwriting Key Only If Unchanged design document.

### Trash

When keys are deleted from File System Optimized (FSO) buckets, they are moved to a trash directory, allowing for recovery. For Object Store (OBS) buckets, keys are permanently deleted.

For more information on the trash feature, refer to the [Trash documentation](../../../administrator-guide/operations/trash).

### Encryption

If the parent bucket is encrypted, all keys written to that bucket will be transparently encrypted.

For more details, refer to the [Transparent Data Encryption documentation](../../../administrator-guide/configuration/security/encryption/transparent-data-encryption).

### Access Control Lists (ACLs)

ACLs can also be applied to individual keys, providing fine-grained control over read and write permissions.

For more details, refer to the [Native ACLs documentation](../../security/acls/native-acls).
