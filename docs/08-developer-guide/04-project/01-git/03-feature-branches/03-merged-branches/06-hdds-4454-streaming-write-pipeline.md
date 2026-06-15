# HDDS-4454: Streaming Write Pipeline

Git branch:

Currently, Ozone write pattern is bursty and involves multiple buffers copies as well multiple Ratis log syncs in a block write. The idea of the Jira is to use a zero buffer copy based Ratis streaming ([RATIS-979](https://issues.apache.org/jira/browse/RATIS-979)) in Ozone write path for better performance and resource utilization.

To enable the feature, the following configuration properties need to be added to Ozone Manager's `ozone-site.xml`.

```xml
<property>
  <name>dfs.container.ratis.datastream.enable</name>
  <value>true</value>
  <tag>OZONE, CONTAINER, RATIS, DATASTREAM</tag>
  <description>If enable datastream ipc of container.</description>
</property>
 
<property>
  <name>ozone.fs.datastream.enabled</name>
  <value>true</value>
  <tag>OZONE, DATANODE</tag>
  <description>
    To enable/disable filesystem write via ratis streaming.
  </description>
</property>
```

## 1. Builds/intermittent test failures

No additional flaky tests have been introduced by the feature branch.

## 2. Documentation

Documentation was added by  [HDDS-7425](https://issues.apache.org/jira/browse/HDDS-7425) .

## 3. Design, attached the docs

The design docs can be found under the Attachments section in the umbrella Jira:  [HDDS-4454](https://issues.apache.org/jira/browse/HDDS-4454)

## 4. Compatibility

Ozone Streaming Write Pipeline feature does not change any existing APIs.

## 5. Docker-compose / acceptance tests

New acceptance test was added by Jira: [HDDS-7426](https://issues.apache.org/jira/browse/HDDS-7426)

## 6. Support of containers / Kubernetes

No addition.

## 7. Coverage/code quality

[HDDS-4454 feature branch coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=HDDS-4454) (65.4%) vs [master branch coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=master) (65.9%)

## 8. Build time

No significant build time difference has been observed.

master branch succeeded (1h 28m 9s):

HDDS-4454 branch succeeded (1h 22m 11s):

## 9. Possible incompatible changes/used feature flag

There should not be any incompatible changes introduced with this feature.

A global enable/disable switch for the this feature is added in [HDDS-5480](https://issues.apache.org/jira/browse/HDDS-5480) .

## 10. Third party dependencies/license changes

There is no third party dependencies introduced by this feature.

## 11. Performance

The throughput of the new Streaming Pipeline is roughly 2x and 3x of the throughput of the existing Write Pipeline for the single client case and the 3-client case, respectively.

Single client case: [20220702_Single Client - Benchmarks for Ozone Streaming.pdf](https://issues.apache.org/jira/secure/attachment/13046179/20220702_Single%20Client%20-%20Benchmarks%20for%20Ozone%20Streaming.pdf)

3-client case: [20220702_3 Clients - Benchmarks for Ozone Streaming.pdf](https://issues.apache.org/jira/secure/attachment/13046180/20220702_3%20Clients%20-%20Benchmarks%20for%20Ozone%20Streaming.pdf)
