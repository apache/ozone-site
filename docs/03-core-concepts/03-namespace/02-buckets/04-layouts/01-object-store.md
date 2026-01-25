---
sidebar_label: Object Store (OBS)
---

# Object Store Buckets (OBS)

## 1. Overview

The Object Store (OBS) bucket layout is Ozone's metadata storage format optimized for S3-compatible object storage access patterns. This layout stores keys with their full path names in a flat namespace structure, making it ideal for applications that primarily use S3 APIs or require strict S3 compatibility.

Object Store buckets are designed to provide maximum compatibility with S3 semantics while maintaining high performance for object storage workloads. This layout is particularly well-suited for cloud-native applications, data lakes accessed via S3 APIs, and scenarios where object storage semantics are preferred over file system operations.

## 2. What is Object Store Bucket Layout?

Object Store bucket layout is one of three bucket layout types supported by Apache Ozone:

- **OBJECT_STORE**: Optimized for S3-compatible object storage access patterns. This layout stores keys with their full path names in a flat namespace structure.
- **FILE_SYSTEM_OPTIMIZED (FSO)**: Optimized for Hadoop Compatible File System operations.
- **LEGACY**: Deprecated layout for backward compatibility with older Ozone versions.

### Key Characteristics

- **Full Path Storage**: Keys are stored with their complete path names (e.g., `dir1/dir2/file.txt`) as single entries in the metadata store. This approach treats each key as an independent object, regardless of its path structure.

- **No Path Normalization**: Object Store buckets preserve key names exactly as provided, without normalizing paths. This ensures strict S3 compatibility and allows for irregular key names that might not be valid in file system contexts.

- **S3-First Design**: The layout prioritizes S3 API compatibility over file system semantics. Operations are optimized for object storage patterns like PUT, GET, DELETE, and LIST operations on individual objects.

- **No Intermediate Directories**: Unlike FSO buckets, Object Store buckets do not create separate directory entries. When you create a key like `dir1/dir2/file.txt`, only the key itself is stored - no intermediate directory objects are created.

- **Flat Namespace**: The metadata structure is essentially flat, with each key being an independent entry. This simplifies metadata management for pure object storage workloads.

## 3. How It Works

### Metadata Storage Format

In Object Store buckets, the Ozone Manager stores metadata in a simplified structure:

```text
KeyTable:
  Key: /volume/bucket/dir1/dir2/file.txt
  Value: OmKeyInfo (contains all key metadata, block locations, etc.)
```

Each key entry contains the following:

- **Full Key Path**: The complete path name including all directory components
- **Key Metadata**: Size, creation time, modification time, replication config, etc.
- **Block Locations**: References to the actual data blocks stored in containers
- **Versioning Information**: If bucket versioning is enabled
- **Encryption Info**: If Transparent Data Encryption (TDE) is enabled

#### Example: Creating Keys

When you create keys in an Object Store bucket:

```bash
# Create these keys:
ozone sh key put /myvolume/mybucket/images/photo1.jpg photo1.jpg
ozone sh key put /myvolume/mybucket/images/subfolder/photo3.jpg photo3.jpg
ozone sh key put /myvolume/mybucket/data/2024/01/report.json report.json
```

The KeyTable will contain three independent entries:

- `/myvolume/mybucket/images/photo1.jpg`
- `/myvolume/mybucket/images/subfolder/photo3.jpg`
- `/myvolume/mybucket/data/2024/01/report.json`

**No intermediate directories are created** - the paths (`images/`, `images/subfolder/`, `data/2024/01/`) are just part of the key names themselves.

**Comparison with File System Optimized Layout:**

```text
Object Store (OBS) Structure:          File System Optimized (FSO) Structure:
┌─────────────────────────┐            ┌─────────────────────────┐
│      KeyTable           │            │    DirectoryTable       │
│  (Flat, full paths)     │            │  (Hierarchical IDs)     │
│                         │            │                         │
│ /vol/bucket/dir/file    │            │ /volID/bucketID/dirID   │
│ /vol/bucket/dir/file2   │            │ /volID/bucketID/dir2ID  │
│ /vol/bucket/dir2/file3  │            │                         │
└─────────────────────────┘            │      FileTable          │
                                       │  (Files with parent IDs) │
                                       │                         │
                                       │ dirID/file              │
                                       │ dirID/file2             │
                                       │ dir2ID/file3            │
                                       └─────────────────────────┘
```

### Key Operations

**Key Listing**: Listing keys in an Object Store bucket:

- Supports prefix-based filtering (e.g., list all keys starting with `dir1/`)
- Returns keys matching the prefix pattern
- Does not distinguish between "directories" and "files" - everything is a key
- Performance is optimized for prefix-based queries

**Key Deletion**: Deleting a key:

- Removes the single key entry from the KeyTable
- Releases associated data blocks
- Does not affect other keys, even if they share a common prefix

**Path Handling**: Unlike FSO buckets, Object Store buckets:

- Do not normalize paths (preserves exact key names)
- Do not create intermediate directory objects
- Treat all keys as independent objects regardless of path structure

### S3 Gateway Integration

Object Store buckets are the default layout for buckets created through the S3 Gateway. When buckets are created via S3 API calls, they use the Object Store layout by default (configurable via `ozone.s3g.default.bucket.layout`).

This ensures that:

- S3 clients can work seamlessly with Ozone buckets
- S3-specific features (like multipart uploads, versioning, etc.) work correctly
- Key names follow S3 naming conventions
- No interoperability issues between S3 and file system APIs

## 4. Command Line Operations

### Creating an Object Store Bucket

To create a bucket with Object Store layout, use the `--layout` option with the value `obs` or `OBJECT_STORE`:

```bash
# Using short form 'obs'
ozone sh bucket create /myvolume/mybucket --layout obs

# Using full form 'OBJECT_STORE'
ozone sh bucket create /myvolume/mybucket --layout OBJECT_STORE
```

**Example:**

```bash
$ ozone sh bucket create /s3v/myapp-data --layout obs
Bucket myapp-data is created
```

### Checking Bucket Layout

To verify the layout of an existing bucket, use the `bucket info` command:

```bash
ozone sh bucket info /myvolume/mybucket
```

The output will include the `bucketLayout` field:

```json
{
  "volumeName" : "myvolume",
  "name" : "mybucket",
  "bucketLayout" : "OBJECT_STORE",
  "storageType" : "DISK",
  "versioning" : false,
  "creationTime" : "2024-01-15T10:30:00.000Z",
  "modificationTime" : "2024-01-15T10:30:00.000Z"
}
```

### Deleting Keys

Delete keys from an Object Store bucket:

```bash
# Delete a single key
ozone sh key delete /myvolume/mybucket/dir1/dir2/file.txt

# Delete multiple keys (requires prefix matching)
ozone sh key delete /myvolume/mybucket/dir1/ --recursive
```

**Note**: The `--recursive` flag deletes all keys with the specified prefix, but this is not an atomic operation - it deletes keys one by one.

### Deleting Buckets

Delete an Object Store bucket:

```bash
# Delete empty bucket
ozone sh bucket delete /myvolume/mybucket

# Delete bucket with all keys (recursive)
ozone sh bucket delete /myvolume/mybucket --recursive
```

**Warning**: Recursive deletion permanently removes all keys in the bucket. There is no recovery option.

## 5. Configuration

### Default Bucket Layout

You can configure the default bucket layout used when creating buckets without specifying the `--layout` option. Set this in `ozone-site.xml`:

```xml
<property>
  <name>ozone.default.bucket.layout</name>
  <value>OBJECT_STORE</value>
  <description>
    Default bucket layout used by Ozone Manager during bucket creation when a client does not specify the
    bucket layout option. Supported values are OBJECT_STORE and FILE_SYSTEM_OPTIMIZED.
    OBJECT_STORE: This layout allows the bucket to behave as a pure object store and will not allow
    interoperability between S3 and FS APIs.
    FILE_SYSTEM_OPTIMIZED: This layout allows the bucket to support atomic rename/delete operations and
    also allows interoperability between S3 and FS APIs.
  </description>
</property>
```

### S3 Gateway Default Layout

For buckets created through the S3 Gateway, configure the default layout:

```xml
<property>
  <name>ozone.s3g.default.bucket.layout</name>
  <value>OBJECT_STORE</value>
  <description>
    The bucket layout that will be used when buckets are created through
    the S3 API.
  </description>
</property>
```

**Note**: The default value for `ozone.s3g.default.bucket.layout` is `OBJECT_STORE`, which ensures S3 API compatibility.

## 6. Use Cases

Object Store bucket layout is ideal for:

1. **S3-Compatible Applications**: Applications designed to work with Amazon S3 or S3-compatible APIs
2. **Cloud-Native Workloads**: Microservices and cloud applications using object storage patterns
3. **Data Lakes via S3**: Data lakes accessed primarily through S3 APIs
4. **Backup and Archive**: Long-term storage where object semantics are preferred
5. **Content Delivery**: Storing static assets, media files, and web content
6. **API-First Access**: Applications that primarily interact via REST APIs rather than file system interfaces

## 7. Limitations

When using Object Store bucket layout, be aware of the following limitations:

1. **No Atomic Rename**: Renaming keys is not supported. You must copy and delete.
2. **No Atomic Directory Delete**: Deleting all keys with a common prefix is not atomic.
3. **No Directory Operations**: Directories don't exist as separate entities - they're just part of key names.
4. **Limited HCFS Compatibility**: Some Hadoop file system operations may not work as expected.
5. **No Path Normalization**: Key names are stored exactly as provided, which may cause issues with some tools.

## 8. Best Practices

1. **Choose Layout Based on Access Pattern**: Use Object Store layout if you primarily use S3 APIs; use FSO if you need file system operations.

2. **Consistent Naming**: Use consistent path separators (`/`) in key names to maintain logical organization.

3. **Prefix-Based Organization**: Organize keys using prefixes (e.g., `year/month/day/file.txt`) for efficient listing and management.

4. **Avoid Deep Hierarchies**: While Object Store buckets support deep paths, consider your access patterns - very deep hierarchies may impact listing performance.

5. **Use Versioning for Critical Data**: Enable bucket versioning for important data to protect against accidental deletions.

6. **Monitor Key Count**: Object Store buckets can handle millions of keys, but monitor performance as key count grows.
