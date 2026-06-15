# HDDS-3816: Erasure Coding Phase 1

Distributed systems basic expectation is to provide the data durability.
To provide the higher data durability, many popular storage systems use replication
approach which is expensive. The Apache Ozone supports \`RATIS/THREE\` replication scheme.
The Ozone default replication scheme \`RATIS/THREE\` has 200% overhead in storage
space and other resources (e.g., network bandwidth).
However, for warm and cold datasets with relatively low I/O activities, additional
block replicas rarely accessed during normal operations, but still consume the same
amount of resources as the first replica.

Therefore, a natural improvement is to use Erasure Coding (EC) in place of replication,
which provides the same level of fault-tolerance with much less storage space.
In typical EC setups, the storage overhead is no more than 50%. The replication factor of an EC file is meaningless.
Instead of replication factor, we introduced ReplicationConfig interface to specify the required type of replication,
either \`RATIS/THREE\` or \`EC\`.

Integrating EC with Ozone can improve storage efficiency while still providing similar
data durability as traditional replication-based Ozone deployments.
As an example, a 3x replicated file with 6 blocks will consume 6\*3 = \`18\` blocks of disk space.
But with EC (6 data, 3 parity) deployment, it will only consume \`9\` blocks of disk space.

## Git Branch

## 1. builds/intermittent test failures

There are no intermittent failures specific to the HDDS-3861-EC branch as of now. During the development , it was ensured

all the CI checks are clean prior to every commit merge .The plan is to run repeated CI checks on the merge commit to master.

## 2. documentation

Described feature in Apache Ozone page via [HDDS-6172](https://issues.apache.org/jira/browse/HDDS-6172) .

- *[Hadoop-HDDs/docs/content/feature/ErasureCoding.md](https://github.com/apache/ozone/blob/HDDS-3816-ec/hadoop-hdds/docs/content/feature/ErasureCoding.md)* has the feature details and related configurations.

## 3. design, attached the docs

Following design docs are linked from the documentation present in [HDDS-6172](https://issues.apache.org/jira/browse/HDDS-6172)  Jira

- [Design Document](https://issues.apache.org/jira/secure/attachment/13021096/Ozone%20EC%20v3.pdf)
- *[Hadoop-HDDs/docs/content/feature/Hadoop-HDDs/docs/content/feature/ErasureCoding.md](https://github.com/apache/ozone/blob/HDDS-3816-ec/hadoop-hdds/docs/content/feature/ErasureCoding.md)* has the feature details and related configurations.

## 4. S3 compatibility

EC feature does not beak any existing S3 compatibility. Please note S3 support is not ready yet for EC though. But this should not be a blocker for merge.

## 5. Docker-compose / acceptance tests

Acceptance tests added [HDDS-6231](https://issues.apache.org/jira/browse/HDDS-6231)

## 6. support of containers / Kubernetes

NA. Deployment model for OzoneManager remains as earlier.

## 7. coverage/code quality

**[Sonar master branch](https://sonarcloud.io/dashboard?branch=master&id=hadoop-ozone)
[Sonar HDDS-3816-EC branch](https://sonarcloud.io/dashboard?branch=HDDS-3816-ec&id=hadoop-ozone).**

The branch has better coverage than master (68% vs 72%)

## 8. build time

There is no significant difference between local build time.

[**Recent master build**](https://github.com/apache/ozone/actions/runs/1807694482)

[**Recent HDDS-3816-EC branch build**](https://github.com/apache/ozone/actions/runs/1826490688)

## 9. possible incompatible changes/used feature flag

For using this feature, users create bucket with EC replication config, so that the keys created in that bucket will be written in EC mode.

Upgrade: Before finalization, we would like to reject EC related requests. Even though EC feature not introduced any new APIs, but parameters carry different values to indicate EC options. So, We needed some special handling to check the parameters level and validate the requests. Related upgrade JIRAs being worked on are: [HDDS-6213](https://issues.apache.org/jira/browse/HDDS-6213) and [HDDS-5909](https://issues.apache.org/jira/browse/HDDS-5909)

Compatibility Changes: Currently forward compatibility broken due to the introduction if server side defaults and removal of client side default configurations. This is also being work on [HDDS-6209](https://issues.apache.org/jira/browse/HDDS-6209)

We are tracking down the above issues before the merge.

## 10. third party dependencies/licence changes

No new dependencies are added.

## 11. performance

There should not be any performance impact for Non-EC flows. For EC files there is basic benchmark performed [HDDS-6194](https://issues.apache.org/jira/browse/HDDS-6194) .

## 12. security considerations

Everything works as earlier and there is no security implications because of the feature.
