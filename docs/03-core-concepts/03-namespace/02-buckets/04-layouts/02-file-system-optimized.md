---
sidebar_label: File System Optimized (FSO)
---

# File System Optimized Buckets (FSO)

## Overview

**File System Optimized** (FSO) is a bucket layout optimized for Hadoop Compatible File System (HCFS) operations. Unlike the Object Store (OBS) layout, FSO maintains separate entries for intermediate directories, enabling efficient file system operations like directory listing, renaming, and deletion.
FSO buckets support **atomic rename** and **delete operations** on directories at any level in constant time, regardless of directory depth or the number of files contained within.

For example, in an FSO bucket, keys are stored with their hierarchical structure preserved:

```text
/mybucket/data/2025/nov/report
/mybucket/data/2025/dec/summary
/mybucket/archive/2024/logs/applog
```

Each intermediate directories (`data`, `2025`, `nov`, etc.) are stored as a separate entry, allowing efficient directory-level operations.

:::note
FSO is the default bucket layout in Ozone. To explicitly specify FSO layout when creating a bucket, use the `--layout` flag:

```bash
ozone sh bucket create /<volume-name>/<bucket-name> --layout FILE_SYSTEM_OPTIMIZED
```

:::

## Why FSO for Hadoop?

### 1. Atomic Operations (The O(1) Factor)

In a standard Object Store, if you rename a directory containing **1 million files**, the system has to:

- Find all 1 million keys
- Copy them to a new path string
- Delete the 1 million old keys

This is **O(n)** operation — the more files you have, the longer it takes.

In FSO, a **rename** is just a metadata pointer update. To rename `/data` to `/archive`, Ozone simply finds the entry for `data` in the `DirectoryTable` and updates its name to `archive`. All the children (the millions of files) stay exactly where they are because they point to the `unique ID` of that directory, not its name.

### 2. Delete operations

Deleting a directory with millions of files is efficient because all child entries share the same parent ID prefix, allowing Ozone to quickly locate and remove them using prefix-based queries, rather than scanning the entire namespace.

## When to Use FSO vs Object Store (OBS)

Choose **File System Optimized (FSO)** when:

- Using Hadoop Compatible File System interfaces
- Working with hierarchical directory structures
- Requiring atomic directory operations (rename, delete)
- Needing trash/recycle bin functionality

Choose **Object Store (OBS)** when:

- Primarily using S3-compatible APIs
- Working with flat object access patterns

For detailed technical information about the internal metadata structure and implementation, see the [File System Optimization System Internals](../../../../07-system-internals/07-features/01-filesystem-optimization.md) documentation.
