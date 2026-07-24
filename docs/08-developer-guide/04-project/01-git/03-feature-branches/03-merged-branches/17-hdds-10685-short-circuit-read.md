# HDDS-10685 : Short-Circuit Read

Epic: [HDDS-10685](https://issues.apache.org/jira/browse/HDDS-10685)
Feature branch:  https://github.com/apache/ozone/tree/HDDS-10685

## 1. Builds/intermittent test failures

There are no intermittent failures specific to the HDDS-10685 branch as of now. During the development, it was ensured all the CI checks were clean prior to every commit merge. 

The plan is to run repeated CI checks on the merge commit to master.

## 2. Documentation

[User Documentation](https://github.com/apache/ozone/blob/HDDS-10685/hadoop-hdds/docs/content/feature/Short-Circuit-Read.md) of Short Circuit Read has been added.

## 3. Design, attached the docs

Design document can be found here : [Short Circuit Read Support](https://github.com/apache/ozone/blob/HDDS-10685/hadoop-hdds/docs/content/design/short-circuit-read.md).

## 4. S3 compatibility

N/A, S3 compatibility remains the same. Short Circuit Read only affects the client and DataNode read path. 

## 5. Docker-compose / Acceptance tests

New robot test [short-circuit.robot](https://github.com/apache/ozone/blob/HDDS-10685/hadoop-ozone/dist/src/main/smoketest/short-circuit/short-circuit.robot) is being added.

New acceptance tests are added, mainly tests the Short Circuit Read metrics. It does not test fault injection.

## 6. Support of containers / Kubernetes

No addition. No change in existing support.

## 7. Coverage / Code quality

[New Code Coverage](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-10685) for Short Circuit Read Support (HDDS-10685) is 80.78%% and [Overall Code Coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=HDDS-10685) is 78.5%.
[Overall Code Coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=master) for master is 78.5%%.

## 8. Build time

[Build time for the latest commit](https://github.com/apache/ozone/actions/runs/27126447271/job/80056268213) from HDDS-10685 Branch is 9m 59s.
[Build time for the latest commit](https://github.com/apache/ozone/actions/runs/29915076929/job/88926295859) from the master branch is 10m 43s.

## 9. Possible incompatible changes/used feature flag

Short-circuit read is gated by the non-rolling upgrade framework as HDDSLayoutFeature.SHORT_CIRCUIT_READS (layout version 11). 

It remains inactive until the cluster upgrade is finalized. A global enable/disable switch is provided via ozone.client.read.short-circuit (default: false).

To enable the feature (after finalization), add the following to the client and Datanode ozone-site.xml to enable the feature:

```xml
<property>
    <name>ozone.client.read.short-circuit</name>
    <value>true</value>
    <tag>CLIENT, DATANODE</tag>
    <description>Disable or enable the short-circuit local read feature. By default it is disabled.</description>
</property>
```
And the following to the client and Datanode ozone-site.xml, to specify the path of the UNIX domain socket:
```xml
<property>
    <name>ozone.domain.socket.path</name>
    <value></value>
    <tag>CLIENT, DATANODE</tag>
    <description>UNIX domain socket path for co-located client–Datanode short-circuit communication.</description>
</property>
```

## 10. Third-party dependencies/License changes

There are no third party dependencies introduced by this feature.

## 11. Performance

The major workflow of Short-Circuit Read is: The client detects a local Datanode replica → opens a UNIX domain socket → sends GetBlock with requestShortCircuitAccess=true → Datanode passes a file descriptor → The client reads block data directly from the local disk via FileChannel.

End-to-end read performance is therefore dominated by local disk I/O, similar to a direct file read, rather than by gRPC data transfer.

A benchmark was run against feature branch HDDS-10685, and get this result https://docs.google.com/document/d/1xmjCbK4rP287pPN0_iOonnQee6HgwSI3h5hVbtgfu3k/edit?tab=t.0. 

Metrics (ContainerLocalOps, local op latencies, local bytes stats) are added in Datanode to observe the runtime state/latency.

## 12. Security considerations

Short-Circuit Read does not introduce any new CLI or admin command.

Short-circuit communication uses a UNIX domain socket (`ozone.domain.socket.path`) between the client and Datanode. 

It follows the same [Hadoop Socket Path Security](https://cwiki.apache.org/confluence/spaces/HADOOP2/pages/120730260/SocketPathSecurity) rules as HDFS short-circuit reads.

