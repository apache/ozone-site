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
