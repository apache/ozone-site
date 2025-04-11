---
sidebar_label: Overview
---

# Buckets Overview

In Apache Ozone, a **Bucket** is the primary container for storing objects (keys). Buckets reside within [Volumes](../01-volumes/01-overview.md) and provide a way to group related objects.

## Key Concepts

*   **Namespace:** Buckets exist within a specific Volume. The full path to an object in Ozone follows the format `/volumeName/bucketName/keyName`. Bucket names must be unique within their parent Volume.
*   **Object Container:** Buckets directly contain Keys (objects or files). They do not contain other buckets.
*   **Attributes:** Each bucket has several configurable attributes that define its behavior and characteristics, including:
    *   **Owner:** The user who owns the bucket (see [Owners](./02-owners.md)).
    *   **Versioning:** Whether multiple versions of an object are kept (default: disabled).
    *   **Storage Type:** The default storage medium (e.g., DISK, SSD) for objects within the bucket.
    *   **Layout:** How keys are organized internally (see [Layouts](./04-layouts/README.mdx)). This impacts compatibility and performance for different access protocols (S3 vs. HCFS/OFS).
    *   **Replication:** The default replication configuration (type and factor) for data blocks belonging to objects in the bucket (see [Replication](./05-replication.md)).
    *   **Encryption:** Whether data written to the bucket is transparently encrypted at rest (see [Encryption](./06-encryption.md)).
    *   **Quotas:** Limits on the namespace usage (number of keys) and storage space (total bytes) consumed by the bucket (see [Quotas](./03-quotas.md)).
    *   **ACLs:** Access Control Lists defining permissions for users and groups (see [Security](../../04-security/02-acls/01-overview.md)).

## Analogy

If a Volume is like a top-level user directory or tenant space, a Bucket can be thought of as a specific project folder or data category within that space. Keys within the bucket are the actual files or objects belonging to that project or category.

## Usage

Buckets are created using Ozone tools (CLI, Java API) or compatible interfaces (S3 API, HCFS API).

**CLI Example:**

```bash
# Create a bucket named 'my-data' inside volume 'user-vol'
ozone sh bucket create /user-vol/my-data

# List buckets within a volume
ozone sh bucket list /user-vol

# Get information about a specific bucket
ozone sh bucket info /user-vol/my-data
```

Understanding bucket properties is essential for configuring Ozone storage to meet specific application requirements regarding performance, durability, security, and cost.