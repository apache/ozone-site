---
sidebar_label: Quotas
---

# Volume Quotas

## What are Volume Quotas?

Volume quotas in Ozone provide a mechanism to limit resource consumption at the volume level. They enable administrators to control and manage storage resources in multi-tenant environments, preventing any single volume from monopolizing cluster resources.

Quotas act as upper bounds that constrain how much storage space and how many objects can be stored within a volume. When quotas are set, Ozone enforces these limits during write operations, ensuring that resource usage stays within the defined boundaries.

## Quota Management

Quotas provide a mechanism to control resource utilization at the volume level:

- **Space Quotas:** Limit the total amount of storage (in bytes) a volume can use. It allows the use of units B, KB, MB, GB and TB.
- **Namespace Quotas:** Limit the total number of objects that can be stored within a volume. This number cannot be greater than `LONG.MAX_VALUE` in Java.
- **Hierarchical Enforcement:** Volume quotas apply to the aggregate of all contained buckets
- **Visibility:** Quota usage and limits can be monitored through the CLI and management interfaces
- **Enforcement:** When a quota is reached, write operations fail with a descriptive error message

## Setting only Storage Space Quota

```bash
# Create Volume with Storage Space Quota - This means setting the storage space of Volume1 to 5MB
ozone sh volume create --space-quota 5MB /volume1

# Set Storage Space Quota - This behavior changes the quota of Volume1 to 10GB
ozone sh volume setquota --space-quota 10GB /volume1

# Clear Storage Space Quota - This clears the space quota for the volume, setting the space limit to unlimited
ozone sh volume clrquota --space-quota /volume1

# Check Storage Space Quota and Usage - We can get the quota value and usedBytes in the info of the volume
ozone sh volume info /volume1
```

:::note Storage Space Quota Notes

- Decimals are not supported while setting quota for volume. For example, 1.5 TB is not allowed.
- Ensure that the minimum storage quota is default block size × replication factor. If you set the value lesser than the default block size × replication factor, while writing the data (key put) operation, an operation error is displayed.
- Total bucket quota should not be greater than its Volume quota. If we have a 10MB Volume, the sum of the sizes of all buckets under this volume cannot exceed 10MB, otherwise the bucket set quota fails.

:::

## Setting only Namespace Quota

```bash
# Create Volume with Namespace Quota - This means setting the namespace quota of Volume1 to 100
ozone sh volume create --namespace-quota 100 /volume1

# Set Namespace Quota - This behavior changes the namespace quota of Volume1 to 1000
ozone sh volume setquota --namespace-quota 1000 /volume1

# Clear Namespace Quota - This clears the namespace quota for the volume, setting the object count limit to unlimited
ozone sh volume clrquota --namespace-quota /volume1

# Check Namespace Quota and Usage - We can get the quota value and usedNamespace in the info of the volume
ozone sh volume info /volume1
```

## Setting Both Quotas Simultaneously

You can set both space and namespace quotas at the same time:

```bash
# Set both space (1TB) and namespace (1 million objects) quotas simultaneously
ozone sh volume setquota --space=1TB --count=1000000 /volume1

# Check current quota settings and usage
ozone sh volume info /volume1

# Clear the space quota (set space limit to unlimited)
ozone sh volume clrquota --space /volume1

# Clear the namespace quota (set object count limit to unlimited)
ozone sh volume clrquota --count /volume1
```
