---
sidebar_label: Datanode Container Schema v3
---

# Datanode Container Schema v3

In Ozone, user data are separated into blocks and stored in HDDS Containers. Containers are the fundamental replication unit of Ozone/HDDS. Each Container has its metadata and data. Data are saved as files on disk. Metadata is saved in RocksDB.

Earlier, there was one RocksDB for each Container on Datanode. With user data continuously growing, there will be hundreds of thousands of RocksDB instances on one Datanode. It's a big challenge to manage this amount of RocksDB instances in one JVM.

Unlike the previous approach, Container Schema v3 uses only one RocksDB for each data volume, holding all metadata of Containers in this RocksDB.

## Configuration

This is mainly a Datanode feature, which doesn't require much configuration. By default, it is enabled.

Here is a configuration which disables this feature if the "one RocksDB for each container" mode is more preferred. Please be noted that once the feature is enabled, it's strongly suggested not to disable it later.

```xml
<property>
   <name>hdds.datanode.container.schema.v3.enabled</name>
   <value>false</value>
   <description>Disable or enable this feature.</description>
</property>
```

Without any specific configuration, the single RocksDB will be created under the data volume configured in `hdds.datanode.dir`.

For some advanced cluster admins who have the high performance requirement, they can leverage quick storages to save RocksDB. In this case, configure these two properties:

```xml
<property>
   <name>hdds.datanode.container.db.dir</name>
   <value/>
   <description>This setting is optional. Specify where the per-disk RocksDB instances will be stored.</description>
</property>

<property>
   <name>hdds.datanode.failed.db.volumes.tolerated</name>
   <value>-1</value>
   <description>The number of db volumes that are allowed to fail before a Datanode stops offering service.
   Default -1 means unlimited, but we should have at least one good volume left.</description>
</property>
```

## Backward Compatibility

Existing containers each has one RocksDB for them will be still accessible after this feature is enabled. All container data will co-exist in an existing Ozone cluster.

## References

- Design doc: [HDDS-3630 Merge Container RocksDB in DN](pathname:///docs/2.0.0/design/dn-merge-rocksdb.html)
- Jira: [HDDS-3630](https://issues.apache.org/jira/browse/HDDS-3630)
