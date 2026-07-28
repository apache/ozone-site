# HDDS-8342 : S3 Lifecycle Configuration - Object Expiration

Epic: [HDDS-8342](https://issues.apache.org/jira/browse/HDDS-8342)
Feature branch:  https://github.com/apache/ozone/tree/HDDS-8342

## 1. Builds/intermittent test failures

There are no intermittent failures specific to the HDDS-8342 branch as of now. During the development , it was ensured all the CI checks were clean prior to every commit merge .

The plan is to run repeated CI checks on the merge commit to master.

## 2. Documentation

[User Documentation](https://ozone.apache.org/docs/next/administrator-guide/operations/object-lifecycle) for S3 Lifecycle Configuration - Object Expiration has been added.

## 3. Design, attached the docs

Design document can be found here : [S3 Lifecycle Configuration - Object Expiration Design Doc](https://github.com/apache/ozone/blob/master/hadoop-hdds/docs/content/design/s3-object-lifecycle-management.md).

## 4. S3 compatibility

N/A, only the object expiration action of S3 Lifecycle configuration is supported. 

## 5. Docker-compose / Acceptance tests

New robot test [`om-lifecycle.robot`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dist/src/main/smoketest/lifecycle/om-lifecycle.robot) and [`bucketlifecycle.robot`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dist/src/main/smoketest/s3/bucketlifecycle.robot) are being added.

Comprehensive tests with fault injection were added. The major one is [TestKeyLifecycleService](https://github.com/apache/ozone/blob/HDDS-8342/hadoop-ozone/ozone-manager/src/test/java/org/apache/hadoop/ozone/om/service/TestKeyLifecycleService.java).

## 6. Support of containers / Kubernetes

No addition. No change in existing support.

## 7. Coverage / Code quality

[New Code Coverage](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-8342) for S3 Lifecycle Configuration - Object Expiration (HDDS-8342) is 80.54% and [Overall Code Coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=HDDS-8342) is 78.4 .
[Overall Code Coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=master) for master is 78.2.

## 8. Build time

[Build time for the latest commit](https://github.com/ChenSammi/ozone/actions/runs/29250637888/job/86975578390) from HDDS-8342 Branch is 10m 12s.
[Build time for the latest commit](https://github.com/apache/ozone/actions/runs/29310061591/job/87011782215) from the master branch is 10m 21s.

## 9. Possible incompatible changes/used feature flag

A global enable/disable switch for this feature is added in HDDS-12780. [Implement the Lifecycle Service](https://issues.apache.org/jira/browse/HDDS-12780).

To enable the feature, the following configs need to be added to OM ozone-site.xml, and set the value to "true"

```xml
<property>
      <name>ozone.lifecycle.service.enabled</name>
      <value>false</value>
      <tag>OZONE</tag>
      <description>It specifies whether to enable lifecycle management service. By default, it is disabled. </description>
</property>
```

A new table with "lifecycleConfigurationTable" is introduced in OM to persist bucket's lifecycle configurations, as a configuration can have up to 1000 rules per AWS S3 document, so including the lifecycle configuration in bucketInfo instead of a new table is considered but not chosen finally.  New table "lifecycleScanStateTable" is introduced to save the checkpoint of each bucket's scan, so the scan can be resumed when there is leader transfer or OM restart. 

A OM feature with name S3_LIFECYCLE_SUPPORT is introduced in OM, to reject Lifecycle configuration operations(put/get/delete) call if the feature is not finalized yet. 

## 10. Third-party dependencies/License changes

There are no third party dependencies introduced by this feature.

## 11. Performance

The major performance consideration based on real production environment experience is it's not recommended to delete expired keys too quickly, other wise the RocksDB access latency can increase due to too many tombstone not compacted. Property "ozone.lifecycle.service.delete.batch-size" with default value 1000 is introduced to control the batch deletion size,  so deletion will not happen too fast. 

## 12. Security considerations

The API to set/delete bucket's Lifecycle configuration requires the caller is the owner of bucket for native ACL, and bucket write permission for Ranger. 

The CLI to pause/resume/get Lifecycle service status, is only accessible to the OM admins.

Besides this, there are no other security implications of this feature.
