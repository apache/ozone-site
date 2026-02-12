---
sidebar_label: Quotas
---

# Volume Quotas

## What are Volume Quotas?

Volume quotas in Ozone provide a mechanism to limit resource consumption at the volume level. They enable administrators to control and manage storage resources in multi-tenant environments, preventing any single volume from monopolizing cluster resources.

Quotas act as upper bounds that constrain how much storage space and how many objects can be stored within a volume. When quotas are set, Ozone enforces these limits during write operations, ensuring that resource usage stays within the defined boundaries.

## Quota Management

Ozone defines two types of quota: namespace quota and storage space quota.

- **Namespace Quota:** A namespace quota limits the number of objects in a volume. This number cannot be greater than `LONG.MAX_VALUE` in Java.
- **Storage Space Quota:** A storage space quota limits the maximum used space of a volume. It allows the use of units B, KB, MB, GB and TB.

### Key Characteristics

- **Hierarchical Enforcement:** Volume quotas apply to the aggregate of all contained buckets
- **Visibility:** Quota usage and limits can be monitored through the CLI and management interfaces
- **Enforcement:** When a quota is reached, write operations fail with a descriptive error message

:::note Important Notes

- By default, the volume quota is unlimited.
- The total quota of the buckets cannot exceed the volume quota.
- Volume quota has no effect if bucket quota is not set.
- Volume having linked bucket do not consume space quota for keys within linked bucket. Linked bucket keys will consume space quota of source volume and source bucket.
- If the cluster is upgraded from old version less than 1.1.0, use of quota on older volumes and buckets (We can confirm by looking at the info for the volume or bucket, and if the quota value is -2 the volume or bucket is old) is not recommended. Since the old key is not counted to the bucket's usedBytes and namespace quota, the quota setting is inaccurate at this point.

:::

## Setting Both Quotas Simultaneously

You can set both space and namespace quotas at the same time:

```bash
# Set both space (1TB) and namespace (1 million objects) quotas simultaneously
ozone sh volume setquota --space-quota=1TB --namespace-quota=1000000 /volume1

# Check current quota settings and usage
ozone sh volume info /volume1

# Clear the space quota (set space limit to unlimited)
ozone sh volume clrquota --space-quota /volume1

# Clear the namespace quota (set object count limit to unlimited)
ozone sh volume clrquota --namespace-quota /volume1
```

For detailed information on how to set and manage both types of volume quotas using CLI commands separately, see the [Quota Operations Guide](/docs/administrator-guide/operations/quota).
