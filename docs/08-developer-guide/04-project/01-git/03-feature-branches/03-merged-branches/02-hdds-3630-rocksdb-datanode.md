# HDDS-3630: RocksDB in Datanode

Git branch:  https://github.com/apache/ozone/tree/HDDS-3630

Currently there will be one RocksDB for each Container on Datanode, which leads to hundreds of thousands of RocksDB instances on one Datanode. It's very challenging to manage this amount of RocksDB instances in one JVM. Please refer to the "problem statement" section of the design document[1] for challenge details. Unlike the current approach, Datanode RocksDB merge feature will use only one RocksDB for each data volume. With far fewer RocksDB instances to manage, the write path performance and DN stability are improved, Refer to the Micro Benchmark Data section of the design document.

To enable the feature, the following configs need to be added to Ozone Manager's `ozone-site.xml`.

```xml
<property>
   <name>hdds.datanode.container.schema.v3.enabled</name>
   <value>false</value>
</property>
<property>
    <name>Hdds.datanode.container.db.dir</name>
    <description>Determines where the per-disk rocksdb instances will be
      stored. This setting is optional. If unspecified, then rocksdb instances are stored on the same disk as HDDS data.
      The directories should be tagged with corresponding storage types ([SSD]/[DISK]/[ARCHIVE]/[RAM_DISK]) for storage policies.
      The default storage type will be DISK if the directory does not have a storage typetagged explicitly.
      Ideally, this should be mapped to a fast disk like an SSD.</description>
</property>
<property>
    <name>Hdds.datanode.failed.db.volumes.tolerated</name>
    <value>-1</value>
    <description>The number of db volumes that are allowed to fail before a datanode stops offering service.
        Default -1 means unlimited, but we should have at least one good volume left.</description>
</property>
```

## 1. Builds/intermittent test failures

No additional flaky tests have been introduced by the feature branch.

## 2. Documentation

Documentation is being added by [HDDS-6790](https://issues.apache.org/jira/browse/HDDS-6790)

## 3. Design, attached the docs

The design docs can be found under the Attachments section in the umbrella Jira: [HDDS-3630](https://issues.apache.org/jira/browse/HDDS-3630)

## 4. Compatibility

Merge RocksDB in Datanode feature does not change any existing Datanode API. All container data with the existing Ozone cluster will remain their current format and can always be accessible after the Datanode upgrade.

## 5. Docker-compose / acceptance tests

New acceptance test is being added by Jira: [HDDS-6791](https://issues.apache.org/jira/browse/HDDS-6791)

## 6. Support of containers / Kubernetes

No addition.

## 7. Coverage/code quality

[Current feature branch coverage](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-3630) is **85.0%** (vs [82.3 % of master branch](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=master))

## 8. Build time

No significant build time difference has been observed.

master branch succeeded 3 days ago in 9m 9s:

Feature branch succeeded 7 days ago in 8m 42s:

## 9. Possible incompatible changes/used feature flag

There should not be any incompatible changes introduced with this feature.

A global enable/disable switch for the this feature is added in [HDDS-6541](https://issues.apache.org/jira/browse/HDDS-6541) .

## 10. Third party dependencies/license changes

There is no third party dependencies introduced by this feature.

## 11. Performance

We have tested major Datanode activities which require RocksDB operation, include container create & close & delete, and block put & get.  Except that container delete performance drops because container metadata KV need to be deleted from RocksDB, other four major activities all have performance improved.
