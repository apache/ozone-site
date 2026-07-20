# HDDS-5713: Disk Balancer

DiskBalancer for Datanode Epic : HDDS-5713. DiskBalancer for Datanode
Git Branch : https://github.com/apache/ozone/tree/HDDS-5713

## 1. Builds/intermittent test failures

There are no intermittent failures specific to the HDDS-5713 branch as of now. During the development , it was ensured all the CI checks were clean prior to every commit merge .

The plan is to run repeated CI checks on the merge commit to master.

## 2. Documentation

[User Documentation](https://github.com/apache/ozone/blob/HDDS-5713/hadoop-hdds/docs/content/feature/DiskBalancer.md) for DiskBalancer has been added.

## 3. Design, attached the docs

Markdown design document for Ozone-site can be found here : [DiskBalancer Design Doc](https://github.com/apache/ozone/blob/HDDS-5713/hadoop-hdds/docs/content/design/diskbalancer.md).

Google design doc : [Design Doc](https://docs.google.com/document/d/1G3fcXqmyiB7MNs7eq0nc4zGmGuLsY_IaFOMpTT5eiq4/edit?pli=1&tab=t.0) .

## 4. S3 compatibility

N/A, S3 compatibility remains the same. DiskBalancer only affects the Data Volumes within a Datanode.

## 5. Docker-compose / Acceptance tests

New robot test [`testdiskbalancer.robot`](https://github.com/apache/ozone/blob/HDDS-5713/hadoop-ozone/dist/src/main/smoketest/diskbalancer/testdiskbalancer.robot) is being added.

New acceptance test are added, mainly tests the CLI for DiskBalancer. It does not test fault injection.

More comprehensive tests with fault injection were added as part of unit tests.

## 6. Support of containers / Kubernetes

No addition. No change in existing support.

## 7. Coverage / Code quality

[New Code Coverage](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-5713) for DiskBalancer (HDDS-5713) is 83.83 and [Overall Code Coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=HDDS-5713) is 78.4 .
[Overall Code Coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=master) for master is 75.6.

## 8. Build time

[Build time for the latest commit](https://github.com/apache/ozone/actions/runs/16464370250) from DiskBalancer Branch is 1hr 11m 54s.
[Build time for the latest commit](https://github.com/apache/ozone/actions/runs/16580591540) from the master branch is 1hr 13m 36s.

## 9. Possible incompatible changes/used feature flag

There should not be any incompatible changes introduced with this feature.

A global enable/disable switch for the DiskBalancer feature is to be added in [HDDS-13497. [DiskBalancer] Add new property "HDDs.Datanode.disk.balancer.enabled"](https://issues.apache.org/jira/browse/HDDS-13497)

To enable the feature, the following configs need to be added to DN `ozone-site.xml`, and set the value to "true"

| Property | Default | Tags | Description |
|---|---|---|---|
| `hdds.datanode.disk.balancer.enabled` | `false` | `OZONE, Datanode, DISKBALANCER` | If this property is set to true, then the Disk Balancer  service is enabled on Datanodes, and users can use this service. By default, this is disabled.  |

## 10. Third-party dependencies/License changes

There are no third party dependencies introduced by this feature.

## 11. Performance

The major work flow of DiskBalancer on Datanode, is first select a pair of data volumes, one is over-utilized as source volume, the other is lower-utilized as destination volume, then select one container from the source volume, then move the container from source volume to destination volume. The overall end-to-end performance is mainly dominated by the time spent on moving container from source volume to destination volume, which in turn is mainly decided by volume physical medium.

Except the move container part,  we did the microbenchmark performance testing for volume pair choosing(VolumeChoosingPolicy), and container choosing(ContainerChoosingPolicy) . VolumeChoosingPolicy, it chooses a pair of volumes which will act as source volume(most used) and destination volume(least used). ContainerChoosingPolicy, it decides which container to move from an over-utilized disk to least-utilized to help balance storage across volumes.

Performance test for ContainerChoosingPolicy is done by [HDDS-13055. Optimize ContainerChoosingPolicy Performance](https://issues.apache.org/jira/browse/HDDS-13055) . The test shows it takes approx 0.02ms to pick one container.

Performance test for VolumeChoosingPolicy is done by [HDDS-13291. Add Performance test for VolumeChoosingPolicy](https://issues.apache.org/jira/browse/HDDS-13291) . It shows it takes approx 0.12ms to pick one pair of volume.

The container move process will consume Datanode resource, especially disk IO resource, so Disk balancer is by default stopped in Datanode. User can start the disk balancer only when needed, with IO bandwidth throttling supported.

## 12. Security considerations

The CLI to start/stop/update DiskBalancer, is only accessible to the admins. [There is a specific robot test to verify this](https://github.com/apache/ozone/blob/HDDS-5713/hadoop-ozone/dist/src/main/smoketest/diskbalancer/testdiskbalancer.robot).

Besides this, there are no other security implications of this feature.
