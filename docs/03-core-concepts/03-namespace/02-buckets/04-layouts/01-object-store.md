---
sidebar_label: Object Store (OBS)
---

# Object Store Buckets (OBS)

## 1. Overview

Object Store bucket layout stores keys with their full path names in a flat namespace, optimized for S3-compatible access patterns. Each key is stored independently with its complete path (e.g., `dir1/dir2/file.txt`), similar to Amazon S3.

Unlike File System Optimized (FSO) buckets, Object Store buckets:

- Do not create intermediate directory entries
- Preserve key names exactly as provided (no path normalization)
- Prioritize S3 API compatibility over file system semantics

:::note
Apache Ozone supports three bucket layout types:

- **OBJECT_STORE (OBS)**, **FILE_SYSTEM_OPTIMIZED (FSO)** and **LEGACY** (deprecated layout for backward compatibility).

:::

## 2. How It Works

- Keys are stored with their full path names as single entries. When creating `dir1/dir2/file.txt`, only the key itself is stored—no intermediate directories are created.

- Operations support prefix-based listing and filtering. Keys are independent objects—deleting one does not affect others, even if they share a common prefix.

- Object Store is the **default layout** for buckets created through the **S3 Gateway**, ensuring S3 API compatibility.

### Example: Creating Keys

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

## 3. Command Line Operations

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
  "volumeName": "myvolume",
  "name": "mybucket",
  "bucketLayout": "OBJECT_STORE",
  "storageType": "DISK",
  "versioning": false,
  "creationTime": "2024-01-15T10:30:00.000Z",
  "modificationTime": "2024-01-15T10:30:00.000Z"
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

## 4. Configuration

### Default Bucket Layout

You can configure the default bucket layout used when creating buckets without specifying the `--layout` option. Set this in `ozone-site.xml`:

```xml
<property>
  <name>ozone.default.bucket.layout</name>
  <value>OBJECT_STORE</value>
</property>
```

### S3 Gateway Default Layout

For buckets created through the S3 Gateway, configure the default layout:

```xml
<property>
  <name>ozone.s3g.default.bucket.layout</name>
  <value>OBJECT_STORE</value>
</property>
```

## 5. Limitations

When using Object Store bucket layout, be aware of the following limitations:

- No atomic rename (copy and delete required)
- No atomic directory delete
- No directory operations (directories are part of key names)
- Limited Hadoop file system compatibility
- No path normalization

## 6. Best Practices

- Use Object Store layout for S3 APIs; use FSO for file system operations
- Organize keys with consistent prefixes (e.g., `year/month/day/file.txt`)
