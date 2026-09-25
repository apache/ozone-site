# HDDS-10656: Atomic Key Overwrite

Epic: [HDDS-10656](https://issues.apache.org/jira/browse/HDDS-10656)
Feature branch:  https://github.com/apache/ozone/tree/HDDS-10656-atomic-key-overwrite

## 1. builds/intermittent test failures

Intermittent test failures observed on the branch are the same as on master.  Currently most of these are due to [HDDS-10750](https://issues.apache.org/jira/browse/HDDS-10750), which will be fixed by Ratis 3.1.0.

Ran full [CI for the latest commit](https://github.com/apache/ozone/actions/runs/9624466946) on the feature branch 4 times.  The first run had an unrelated failure, all tests passed in the following 3 runs.

## 2. documentation

The new API is for developers to build upon.  Not intended for end-users or administrators.

## 3. design, attached the docs

Design doc added on the master branch ([HDDS-10657](https://issues.apache.org/jira/browse/HDDS-10657), [pull request](https://github.com/apache/ozone/pull/6482)).

## 4. S3 compatibility

N/A, S3 behavior was not changed.

## 5. Docker-compose / acceptance tests

Robot test was added in [HDDS-10947](https://issues.apache.org/jira/browse/HDDS-10947) to cover rewrite of key created via multipart upload.  Other use cases are covered by integration tests.

## 6. support of containers / Kubernetes

N/A, the new request does not affect support of containers.

## 7. coverage/code quality

Current coverage is ~58% for both [master](https://sonarcloud.io/project/activity?custom_metrics=coverage&graph=custom&id=hadoop-ozone) and the [feature branch](https://sonarcloud.io/project/activity?id=hadoop-ozone&graph=custom&custom_metrics=coverage&branch=HDDS-10656-atomic-key-overwrite).

## 8. build time

Build time in CI of the latest commit on the [feature branch (54f151946cc349087bf73de04aa85a5d128f4584)](https://github.com/apache/ozone/actions/runs/9624466946/job/26551824083) is similar to that of [master (9f1f7ed23801f219a41d9dd9283cc6fdf57381c8)](https://github.com/apache/ozone/actions/runs/9608208083/job/26500618875): 19:02 vs. 18:36.

## 9. possible incompatible changes/used feature flag

A new OM version number was introduced to prevent new client sending atomic key overwrite request to old OM which does not support this feature.

## 10. third party dependencies/license changes

N/A, no new dependencies were introduced.

## 11. performance

The changes do not impact performance. If the new API is used, an additional parameter is passed and check on the server side. If the feature is not used, the code path is unchanged. No new locks or expensive checks have been added to facilitate the new feature.

## 12. security considerations

N/A.  New method was added to the existing OM client API.
