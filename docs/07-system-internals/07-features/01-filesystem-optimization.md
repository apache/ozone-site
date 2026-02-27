---
draft: true
sidebar_label: Filesystem Optimization (FSO)
---

# File System Optimization (FSO) System Internals

**TODO:** Uncomment the link to this page in docs/03-core-concepts/03-namespace/02-buckets/04-layouts/02-file-system-optimized.md
**TODO:** Uncomment the link to this page in docs/04-user-guide/01-client-interfaces/01-o3.md
**TODO:** Uncomment the link to this page in docs/05-administrator-guide/02-configuration/03-security/05-encryption/02-transparent-data-encryption.md

The prefix-based File System Optimization feature supports atomic rename and delete of any directory at any level in the
namespace in deterministic/constant time.

This feature can be enabled for each specific bucket that requires it by setting the `--layout` flag
to `FILE_SYSTEM_OPTIMIZED` at the time of bucket creation.

```bash
ozone sh bucket create /<volume-name>/<bucket-name> --layout FILE_SYSTEM_OPTIMIZED
```

Note: File System Optimization favors Hadoop Compatible File System instead of S3 compatibility. Some irregular S3 key
names may be rejected or normalized.

This feature is strongly recommended to be turned ON for Ozone buckets mainly used via Hadoop compatible interfaces,
especially with high number of files in deep directory hierarchy.

## OzoneManager Metadata layout format

OzoneManager supports two metadata bucket layout formats - Object Store (OBS) and File System Optimized (FSO).

Object Store (OBS) is the existing OM metadata format, which stores key entry with full path name. In File System
Optimized (FSO) buckets, OM metadata format stores intermediate directories into `DirectoryTable` and files
into `FileTable` as shown in the below picture. The key to the table is the name of a directory or a file prefixed by
the unique identifier of its parent directory, `<parent unique-id>/<filename>`.

![Prefix FSO Format](PrefixFSO-Format.png)

### Directory delete operation with prefix layout

Following picture describes the OM metadata changes while performing a delete
 operation on a directory.

![Prefix FSO Delete](PrefixFSO-Delete.png)

### Directory rename operation with prefix layout

Following picture describes the OM metadata changes while performing a rename
 operation on a directory.

![Prefix FSO Rename](PrefixFSO-Rename.png)

## Configuration

The following configuration can be configured in `ozone-site.xml` to define the default value for bucket layout during bucket creation
if the client has not specified the bucket layout argument.
Supported values are `OBJECT_STORE`, `FILE_SYSTEM_OPTIMIZED` and `LEGACY`.

By default, this config value is empty. Ozone will default to `FILE_SYSTEM_OPTIMIZED` bucket layout if it finds an empty config value.

```xml
<property>
    <name>ozone.default.bucket.layout</name>
    <value/>
</property>
```
