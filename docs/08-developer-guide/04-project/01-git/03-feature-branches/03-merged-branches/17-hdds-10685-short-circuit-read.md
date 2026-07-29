# HDDS-10685 : Short-Circuit Read

Epic: [HDDS-10685](https://issues.apache.org/jira/browse/HDDS-10685)
Feature branch:  https://github.com/apache/ozone/tree/HDDS-10685

## 1. Builds/intermittent test failures

There are no intermittent failures specific to the HDDS-10685 branch as of now. During the development, it was ensured all the CI checks were clean prior to every commit merge.

The plan is to run repeated CI checks on the merge commit to master.

## 2. Documentation

[User Documentation](https://ozone.apache.org/docs/next/administrator-guide/configuration/performance/short-circuit-local-reads/) of Short Circuit Read has been added.

## 3. Design, attached the docs

Design document can be found here : [Short Circuit Read Support](https://github.com/apache/ozone/blob/HDDS-10685/hadoop-hdds/docs/content/design/short-circuit-read.md).

## 4. S3 compatibility

N/A, S3 compatibility remains the same. Short Circuit Read only affects the client and Datanode read path.

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

Short-circuit read is gated by DatanodeVersion.SHORT_CIRCUIT_READS (version 4), which prevents a new version of Ozone client from communicating with a cluster that does not support short-circuit reads.

A global enable/disable switch is provided via `ozone.client.read.short-circuit` (default: false).

To enable this feature, add the following to both the client and Datanode `ozone-site.xml`:

```xml
<property>
    <name>ozone.client.read.short-circuit</name>
    <value>true</value>
    <tag>CLIENT, DATANODE</tag>
    <description>Disable or enable the short-circuit local read feature. By default it is disabled.</description>
</property>
```

And the following to the client and Datanode `ozone-site.xml`, to specify the path of the UNIX domain socket:

```xml
<property>
    <name>ozone.domain.socket.path</name>
    <value>$your-domain-socket-path</value>
    <tag>CLIENT, DATANODE</tag>
    <description>UNIX domain socket path for co-located client–Datanode short-circuit communication.</description>
</property>
```

## 10. Third-party dependencies/License changes

There are no third party dependencies introduced by this feature.

## 11. Performance

The major workflow of Short-Circuit Read is: The client detects a local Datanode replica → opens a UNIX domain socket → sends GetBlock with requestShortCircuitAccess=true → Datanode passes a file descriptor → The client reads block data directly from the local disk via FileChannel.

End-to-end read performance is therefore dominated by local disk I/O, similar to a direct file read, rather than by gRPC data transfer.

A benchmark was run against feature branch HDDS-10685, testing short-circuit performance with the `ozone fs` command and `YCSB` on Cloudera's internal test bed. Short-circuit read was toggled with `ozone.client.read.short-circuit` and `ozone.domain.socket.path`.

### Cluster configuration

- Hosts: 9 nodes, node8 has no region server and Datanode
- Ozone: 8 Datanodes (16GB heap, 1 data volume), 3 OMs (8GB heap), 3 SCMs (8GB heap)
- Hbase: 2 masters (1GB heap), 8 region servers (31GB heap)
- `ozone.client.bytes.per.checksum` = 1MB

### Ozone FS

Use `ozone fs -get ofs://ozone1733996033/vol-scr/buck/scr/file33 ./file33` to download a 10 GB file. Node9 and node7 have the Datanode role; node8 does not.

| | Short-circuit disabled(A) | short-circuit-enabled(B) | B/A |
| :---: | :---: | :---: | :---: |
| node9 | 4m4.123s | 3m21.165s | 82.4% |
| node7 | 4m57.135s | 3m58.782s | 80.5% |
| node8 | 4m21.895s | 4m46.193s | |

### YCSB

The tests are performed by running 3 consecutive iterations after changing the `ozone.client.read.short-circuit` configuration and restarting all related services. HBase `l1CacheHitRatio` is around 90% during the test.

#### Workload C

| | Short-Circuit disabled | | | Short-Circuit enabled | | | |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| | run1(A) | run2(B) | run3(C) | run1(D) | run2(E) | run3(F) | (A+B+C)/(D+E+F) |
| **Num Ops(360s)** | 140266 | 128684 | 136483 | 152988 | 162343 | 150459 | 87.0% |
| **Throughput** | 387.6 | 353.7 | 378.9 | 423.7 | 449.5 | 416.5 | 86.9% |
| **Avg Latency(ms)** | 163.9 | 179.1 | 168.4 | 150.5 | 142.0 | 153.3 | 114.7% |
| **95 Latency(ms)** | 833 | 1061.9 | 850.9 | 908.8 | 936.9 | 870.9 | 101.1% |
| **99 Latency(ms)** | 2316.3 | 3149.8 | 4345.9 | 2510.8 | 2709.5 | 3151.9 | 117.2% |

#### Workload A

| | Short-Circuit disabled | | | Short-Circuit enabled | | | |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| | run1(A) | run2(B) | run3(C) | run1(D) | run2(E) | run3(F) | (A+B+C)/(D+E+F) |
| **Throughput** | 611.2 | 592.5 | 586.7 | 859.7 | 723.0 | 706.6 | 78.2% |

Metrics (`ContainerLocalOps`, local op latencies, local bytes stats) are added in Datanode to observe the runtime state/latency.

## 12. Security considerations

Short-Circuit Read does not introduce any new CLI or admin command.

Short-circuit communication uses a UNIX domain socket (`ozone.domain.socket.path`) between the client and Datanode.

It follows the same rules as HDFS short-circuit reads. Refer to the "Security" section of [Design](https://github.com/apache/ozone/blob/HDDS-10685/hadoop-hdds/docs/content/design/short-circuit-read.md) for details.
