---
sidebar_label: Quotas
---

# Bucket Quotas

Apache Ozone allows administrators or bucket owners to set **quotas** on buckets to limit the amount of resources they can consume. This is crucial for managing storage capacity and ensuring fair resource allocation in multi-tenant environments.

## Types of Quotas

Ozone supports two types of quotas at the bucket level:

1.  **Namespace Quota:**
    *   Limits the total number of **keys** (objects, files, directories) that can exist within the bucket.
    *   Helps control the size of the Ozone Manager's metadata.
    *   Expressed as a simple count (e.g., 1,000,000 keys).

2.  **Storage Space Quota:**
    *   Limits the total **disk space** consumed by the data blocks of all objects within the bucket.
    *   This limit applies to the logical size of the data *before* replication. For example, a 1 GB object will count as 1 GB towards the quota, regardless of whether it's replicated 3 times (consuming 3 GB physically) or uses erasure coding.
    *   Helps control the overall physical storage usage.
    *   Expressed in bytes, often using units like KB, MB, GB, TB, PB (e.g., `100GB`, `1TB`).

## Setting Quotas

Quotas can be set during bucket creation or modified later using the Ozone shell.

**Setting during creation:**

```bash
ozone sh bucket create --quota <space_quota> --namespace-quota <namespace_quota> /volumeName/bucketName

# Example: 1TB space quota, 10 million namespace quota
ozone sh bucket create --quota 1TB --namespace-quota 10000000 /vol1/limited-bucket
```

**Modifying existing bucket quotas:**

```bash
ozone sh bucket setquota --quota <space_quota> --namespace-quota <namespace_quota> /volumeName/bucketName

# Example: Change space quota to 500GB, keep namespace quota
ozone sh bucket setquota --quota 500GB /vol1/limited-bucket

# Example: Remove space quota, set namespace quota to 5 million
ozone sh bucket setquota --quota -1 --namespace-quota 5000000 /vol1/limited-bucket
```

*   Use `-1` or `none` to remove a specific quota limit.

## Enforcement

*   When a write operation (creating an object, uploading data) would cause a bucket to exceed its quota, the operation will fail.
*   Namespace quota is checked when creating new keys.
*   Space quota is checked based on the size of the data being written.

## Viewing Quotas

You can view the current quota settings and usage for a bucket using the `info` command:

```bash
ozone sh bucket info /volumeName/bucketName
```

The output will show fields like `quotaInBytes`, `quotaInNamespace`, `usedBytes`, and `usedNamespace`.

Bucket quotas are a fundamental tool for managing storage resources effectively in Ozone.