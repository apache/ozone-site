# HDDS-2939: FileSystem Optimizations

Presently, a rename/delete operation can become prohibitively expensive for such directories which have large sub-trees/sub-paths. Ozone does rename/delete each and every sub-file & sub-dir under the given directory via multiple RPC calls to OM thus makes it very expensive. Also, rename and delete doesn't guarantee the atomicity.

The prefix based FileSystem optimization idea allows performing rename, delete of any directory in a deterministic/constant time atomically. Now, Ozone performs rename/delete operations in a single RPC call by sending only the given directory to OM. It will finish rename, delete operations with O(1) complexity. Also, makes it possible to support atomic rename/delete of any directory at any level in the namespace.

## Git Branch

Implementing this in a separate feature [HDDS-2939](https://github.com/apache/ozone/tree/HDDS-2939) branch. Thanks to all contributors/reviewers.

## How to enable prefix based optimization feature

Following are the set of configurations to be configured in 'ozone-default.xml' to enable this feature. By default, the feature will be turned OFF.

An example of Ozone-site.xml

```xml
<configuration>
  <property>
    <name>ozone.om.enable.filesystem.paths</name>
    <value>true</value>
  </property>
  
  <property>
    <name>ozone.om.metadata.layout</name>
    <value>prefix</value>
  </property>
</configuration>
```

## Related documents

- [Performance Test Report](https://issues.apache.org/jira/secure/attachment/13023395/Performance%20Comparison%20Between%20%20Master%20and%20HDDS-2939%20branch-Report-001.pdf)

## 1. builds/intermittent test failures

There are no intermittent failures specific to the HDDS-2939 branch as of now. During the development , it was ensured all the CI checks are clean prior to every commit merge .The plan is to run repeated CI checks on the merge commit to master.

## 2. documentation

Described feature in Apache Ozone page via HDDS-5067.

- *[Hadoop-HDDs/docs/content/feature/PrefixFSO.md](https://github.com/apache/ozone/blob/HDDS-2939/hadoop-hdds/docs/content/feature/PrefixFSO.md)* has the feature details and related configurations.

## 3. design, attached the docs

Following design docs are linked from the documentation present in HDDS-2939 Jira

- [Design Document](https://issues.apache.org/jira/secure/attachment/12991926/Ozone%20FS%20Namespace%20Proposal%20v1.0.docx)
- [Internal design - metadata format](https://issues.apache.org/jira/secure/attachment/13023399/OzoneFS%20Optimizations_DesignOverview_%20HDDS-2939.pdf)
- *[Hadoop-HDDs/docs/content/feature/PrefixFSO.md](https://github.com/apache/ozone/blob/HDDS-2939/hadoop-hdds/docs/content/feature/PrefixFSO.md)* has the feature details and related configurations.

## 4. S3 compatibility

There are no incompatibilities with respect to S3. This feature can be enabled only together with *ozone.OM.enable.filesystem.paths.* When file system-style path handling is enabled, 100 % S3 compatibility could not be guaranteed. FS compatible S3 key names supposed to be working well, but non-fs compatible, extra key names (like 'a/../b1 or real file with the name \`key1/\` might be normalized or rejected by the implementation of *ozone.OM.enable.filesystem.paths*)

Note: Added S3 acceptance test with feature is turned on - PREFIX layout.

## 5. Docker-compose / acceptance tests

The `compose/ozone` cluster is modified with testing `ozonefs/ozonefs.robot` with or without turning on the new feature. (both ofs and o3fs and linked and unlinked bucket are tested...)

## 6. support of containers / Kubernetes

NA. Deployment model for OzoneManager remains as earlier.

Example files are committed with HDDS-5018

## 7. coverage/code quality

**[Sonar master branch](https://sonarcloud.io/dashboard?branch=master&id=hadoop-ozone)
[Sonar HDDS-2939 branch](https://sonarcloud.io/dashboard?branch=HDDS-2939&id=hadoop-ozone).**

The branch has better coverage than master (73.5% vs 742.2%) but two new Sonar bugs are introduced (169 vs 171)

## 8. build time

There is no significant difference between local build time.

[**Recent master build**](https://github.com/apache/ozone/pull/2132/checks)

---

[**Recent HDDS-2939 branch build**](https://github.com/apache/ozone/pull/2151/checks)

---

- **test time of acceptance unsecure is increased with ~3 minutes**
- **integration test is increased with ~4 mins**

## 9. possible incompatible changes/used feature flag

For using this feature, "ozone.OM.metadata.layout" config needs to be set to be true in *ozone-site.xml*

The new metadata layout is supported only in a fresh cluster and the layout detail is stored in per-bucket. Presently, both old and new metadata layout buckets can't co-exists in the same cluster. User can't start OM in new layout(prefix) if there are existing old layout buckets(simple) and vice-versa. Work is in progress to support the existing old buckets to be available in new layout, this will be supported in the next development phase.

## 10. third party dependencies/license changes

No new dependencies are added.

## 11. performance

Done testing to evaluate the performance of delete, rename operations in feature branch vs master code base. Following charts capturing the directory delete and rename operations execution time shows that, feature branch has a very significant performance gain compared to the master.

Ran `freon dtsg` dfs tree generator benchmark test in a single node cluster. V0 represents master code(simple) and V1 represents feature branch(prefix). Please refer to the [Jira document](https://issues.apache.org/jira/secure/attachment/13023395/Performance+Comparison+Between++Master+and+HDDS-2939+branch-Report-001.pdf) for more details.

## 12. security considerations

Everything works as earlier and there is no security implications because of the feature.
