---
sidebar_label: Quota in Ozone
---

# Quota in Ozone

## Client usage

### Storage Space level quota

Storage space level quotas allow the use of units B, KB, MB, GB and TB. Represents how much storage Spaces will be used.

#### Note

- Decimals are not supported while setting quota for volume and bucket. For example, 1.5 TB.

- Ensure that the minimum storage quota is default block size x replication factor. If you set the value lesser than the default block size x replication factor, while writing the data (key put) operation, an operation error is displayed.

#### Volume Storage Space level quota

```shell
bin/ozone sh volume create --space-quota 5MB /volume1
```

This means setting the storage space of Volume1 to 5MB

```shell
bin/ozone sh volume setquota --space-quota 10GB /volume1
```

This behavior changes the quota of Volume1 to 10GB.

#### Bucket Storage Space level quota

```shell
bin/ozone sh bucket create --space-quota 5MB /volume1/bucket1
```

That means bucket1 allows us to use 5MB of storage.

```shell
bin/ozone sh bucket setquota  --space-quota 10GB /volume1/bucket1 
```

This behavior changes the quota for Bucket1 to 10GB

Total bucket quota should not be greater than its Volume quota. If we have a 10MB Volume, The sum of the sizes of all buckets under this volume cannot exceed 10MB, otherwise the bucket set quota fails.

#### Clear the quota for volume and bucket

```shell
bin/ozone sh volume clrquota --space-quota /volume1
bin/ozone sh bucket clrquota --space-quota /volume1/bucket1
```

#### Check quota and usedBytes for volume and bucket

```shell
bin/ozone sh volume info /volume1
bin/ozone sh bucket info /volume1/bucket1
```

We can get the quota value and usedBytes in the info of volume and bucket.

### Namespace quota

Namespace quota is a number that represents how many unique names can be used. This number cannot be greater than LONG.MAX_VALUE in Java.

#### Volume Namespace quota

```shell
bin/ozone sh volume create --namespace-quota 100 /volume1
```

This means setting the namespace quota of Volume1 to 100.

```shell
bin/ozone sh volume setquota --namespace-quota 1000 /volume1
```

This behavior changes the namespace quota of Volume1 to 1000.

#### Bucket Namespace quota

```shell
bin/ozone sh bucket create --namespace-quota 100 /volume1/bucket1
```

That means bucket1 allows us to use 100 of namespace.

```shell
bin/ozone sh bucket setquota --namespace-quota 1000 /volume1/bucket1 
```

This behavior changes the quota for Bucket1 to 1000.

#### Clear the quota for volume and bucket

```shell
bin/ozone sh volume clrquota --namespace-quota /volume1
bin/ozone sh bucket clrquota --namespace-quota /volume1/bucket1
```

#### Check quota and usedNamespace for volume and bucket

```shell
bin/ozone sh volume info /volume1
bin/ozone sh bucket info /volume1/bucket1
```

We can get the quota value and usedNamespace in the info of volume and bucket.

## Bucket Quota with snapshots

Starting with Apache Ozone 2.1, bucket quota handling with snapshots is more accurate and transparent.
When you use snapshots in Apache Ozone, deleting data (keys or directories) doesn't always mean the space or namespace count is immediately reclaimed.
This is because snapshots can retain data even after it has been "deleted" from the active bucket.
Ozone now tracks and calculates bucket quotas more clearly to give you an accurate view of your usage.

**How Your Quota is Calculated and Reported**

Your bucket's total reported quota usage is now a sum of both actively used resources and those pending deletion:

*   **Total Reported Used Space:** `usedBytes` (active data) + `pendingDeleteSnapshotBytes` (data pending deletion due to snapshots)
*   **Total Reported Used Namespace:** `usedNamespace` (active items) + `pendingDeleteSnapshotNamespace` (items pending deletion due to snapshots)

Quota checks and reporting use these comprehensive totals.

**What This Means for You:**

*   **Accurate Quota View:** Your reported bucket quota is more accurate. It includes active data and data held by snapshots, even if deleted from the active view. This prevents a misleading impression of available quota.
*   **Understanding Space Reclamation:** You'll see that quota is reclaimed only when data is fully purged. This happens after it's no longer held by any snapshot and background cleanup is complete.
*   **Better Capacity Planning:** This clearer view of quota usage helps in more effective monitoring and capacity planning for your storage.

