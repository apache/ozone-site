---
sidebar_label: Overview
---

# Overview of Ozone's Namespace

Apache Ozone organizes data in a three-level hierarchy: Volumes, Buckets, and Keys. This structure provides a flexible and scalable way to manage large datasets, similar to how traditional file systems use directories and files, but optimized for object storage.

## Overview of the Hierarchy

- **[Volumes](volumes/overview):** The top-level organizational unit, akin to user accounts or home directories.
- **[Buckets](buckets/overview):** Reside within volumes, similar to directories or folders, and contain the actual data objects.
- **Keys:** The fundamental data objects, analogous to files, stored inside buckets.

```text
Volume
└─── Bucket
    ├─── Key 1
    ├─── Key 2
    └─── ...
```

This hierarchy is managed by the Ozone Manager, which is the principal namespace service of Ozone.
