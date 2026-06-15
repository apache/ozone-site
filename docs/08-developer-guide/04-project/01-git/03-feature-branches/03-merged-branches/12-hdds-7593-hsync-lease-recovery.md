# HDDS-7593: HSync and Lease Recovery

Epic: HDDS-7593
Feature branch: https://github.com/apache/ozone/tree/HDDS-7593

## 1. builds/intermittent test failures

Ran full CI for the [latest commit](https://github.com/apache/ozone/actions/runs/10081026756) for the feature branch two times. In both the runs all the tests has passed.

## 2. documentation

The new API is for developers to build upon. Not intended for end-users or administrators.

## 3. design, attached the docs

The design and architecture spans across multiple design docs

[Design doc: Supporting Hflush and lease recovery](https://docs.google.com/document/d/1KcB9qjIe6vEg7iRu4rFsHE5kTj6A1JCaJ-Q2PKWLpGw/edit?usp=sharing)

[Ozone File Lease Recovery Protocol Detail Design](https://docs.google.com/document/d/1wS0dVL3huManP8OrKl-sBjxE5vFVyeW4XEFdHHIctO4/edit?usp=sharing)

[Support Incremental ChunkList in PutBlock requests](https://docs.google.com/document/d/1Q7skR1xndQ1W3qzkz5rdwjN_2ZFA1zD63bZtKHciY28/edit?usp=sharing)

## 4. S3 compatibility

S3 behaviour was not changed.

The new APIs (hsync, recoverLease, ...) are Hadoop file system APIs and are not supported by S3.

## 5. Docker-compose / acceptance tests

Use cases are covered by integration tests.

## 6. support of containers / Kubernetes

N/A, the new request does not affect support of containers.

## 7. coverage/code quality

Current coverage is ~46.8% for both [master](https://sonarcloud.io/project/activity?custom_metrics=coverage&graph=custom&id=hadoop-ozone) and ~44.4% for the [feature branch](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-7593).

## 8. build time

Build time in CI of the latest commit on the [feature branch (https://github.com/apache/ozone/commit/f7610c0012cd5e83769ff22eebeba092d3893d14)](https://github.com/apache/ozone/actions/runs/9847179268) is similar to that of [master (https://github.com/apache/ozone/actions/runs/9847590592)](https://github.com/apache/ozone/actions/runs/9847590592): 1hr15m vs. 1hr15m.

## 9. possible incompatible changes/used feature flag

A number of feature flags were introduced:

```text
ozone.client.incremental.chunk.list
ozone.client.stream.putblock.piggybacking
ozone.incremental.chunk.list
```

Additionally, new Datanode layout version "HBASE_SUPPORT" was added. A Datanode wire protocol version COMBINED_PUTBLOCK_WRITECHUNK_RPC was added too.

## 10. third party dependencies/license changes

N/A, no new dependencies were introduced.

## 11. performance

The changes do not impact performance. If the new API is used, an additional parameter is passed and check on the server side. If the feature is not used, the code path is unchanged. No new locks or expensive checks have been added to facilitate the new feature.

## 12. security considerations

N/A.  New method was added to the existing OM client API.
