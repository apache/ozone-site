# Apache Ozone  2.0.0 Release Notes

These release notes cover new developer and user-facing incompatibilities, important issues, features, and major improvements.


---

* [HDDS-10295](https://issues.apache.org/jira/browse/HDDS-10295) | *Major* | **Provide an "ozone repair" subcommand to update the snapshot info in transactionInfoTable**

A new command "ozone repair update-transaction" is added to update the highest index in OM transactionInfoTable.


---

* [HDDS-11258](https://issues.apache.org/jira/browse/HDDS-11258) | *Blocker* | **[hsync] Add new OM layout version**

A new layout version, HBASE\_SUPPORT (7) is added to Ozone Manager that provides the guardrail for the full support of hsync, lease recovery and listOpenFiles APIs for HBase.


---

* [HDDS-11375](https://issues.apache.org/jira/browse/HDDS-11375) | *Major* | **DN Startup fails with Illegal configuration**

Remove the predefined hdds.ratis.raft.grpc.message.size. Its default value is determined by hdds.container.ratis.log.appender.queue.byte-limit + 1MB = 33MB.


---

* [HDDS-11342](https://issues.apache.org/jira/browse/HDDS-11342) | *Major* | **[hsync] Add a config as HBase-related features master switch**

It is now required to toggle an extra config switch to allow HBase-related enhancements to be enabled.

Server-side (OM): Set ozone.hbase.enhancements.allowed to true.
Client-side: Set ozone.client.hbase.enhancements.allowed to true.

For more details, see their respective config description.


---

* [HDDS-7593](https://issues.apache.org/jira/browse/HDDS-7593) | *Major* | **Supporting HSync and lease recovery**

Ozone 2.0 added support for output stream hsync/hflush API support. In addition, lease recovery (recoverLease()), setSafeMode(), file system API support are added.


---

* [HDDS-11329](https://issues.apache.org/jira/browse/HDDS-11329) | *Major* | **Update Ozone images to Rocky Linux-based runner**

Provide Rocky Linux-based convenience Ozone docker image


---

* [HDDS-11705](https://issues.apache.org/jira/browse/HDDS-11705) | *Critical* | **Snapshot operations on linked buckets should work on actual underlying bucket**

Ozone did not support snapshots on linked buckets before this release. However, a user could have inadvertently created snapshots on linked buckets. Hence when upgrading from an older version that doesn't support snapshots on linked buckets to a newer version that supports snapshots on linked buckets, it is essential to ensure that there are no snapshots on linked buckets otherwise they will linger around. If there are any snapshots on linked buckets, those snapshots need to be deleted by using snapshot delete command:

ozone sh snapshot delete \<vol\>/\<linked bucket name\> \<snapshot name\>


---

* [HDDS-8101](https://issues.apache.org/jira/browse/HDDS-8101) | *Major* | **Add FSO repair tool to ozone CLI in read-only and repair modes**

Added a new command "ozone repair om fso-tree" to detect and repair broken FSO trees caused by bugs such as HDDS-7592, which can orphan data in the OM.

Usage:
ozone repair om fso-tree --db \<dbPath\> [--repair \| --r] [--volume \| -v \<volName\>] [--bucket \| -b \<bucketName\>] [--verbose]


---

* [HDDS-11753](https://issues.apache.org/jira/browse/HDDS-11753) | *Blocker* | **Deprecate file per chunk layout from datanode code**

FILE\_PER\_CHUNK container layout (ozone.scm.container.layout) is deprecated. Starting from Apache Ozone 2.0, users will not be able to create new FILE\_PER\_CHUNK containers.

The support will be removed in a future release.


---

* [HDDS-11754](https://issues.apache.org/jira/browse/HDDS-11754) | *Blocker* | **Drop support for non-Ratis OM and SCM**

Ozone Manager and Storage Container Manager will always run in HA (Ratis) mode. Clusters upgrading from non-Ratis (Standalone) mode will automatically run in single node HA (Ratis) mode.



