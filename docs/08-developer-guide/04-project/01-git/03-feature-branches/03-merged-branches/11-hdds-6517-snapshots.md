# HDDS-6517: Snapshots

01 Feb 2023 Snapshot feature branch `HDDS-6517-Snapshot` has been merged to master. All future snapshot development work should continue on the master branch.

Snapshot feature umbrella Jira: [HDDS-6517](https://issues.apache.org/jira/browse/HDDS-6517)

## 1. builds/intermittent test failures

No additional flaky tests have been introduced by the feature branch.

## 2. documentation

Documentation for this feature is tracked through [HDDS-7745](https://issues.apache.org/jira/browse/HDDS-7745) .

## 3. design, attached the docs

The design docs can be found under the Attachments section in the umbrella Jira: [HDDS-6517](https://issues.apache.org/jira/browse/HDDS-6517)

## 4. Compatibility

The feature doesn't break compatibility for any of the existing features.

## 5. Docker-compose / acceptance tests

We have some basic Snapshot acceptance tests. This will remain an ongoing activity throughout Snapshot development and is tracked through [HDDS-7768](https://issues.apache.org/jira/browse/HDDS-7768) .

## 6. support of containers / Kubernetes

No addition so far. This should not be a merge blocker.

## 7. coverage/code quality

[Current feature branch coverage](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-6517-Snapshot)

## 8. build time

No significant build time difference has been observed.

master branch succeeded yesterday in 13m 30s:

Feature branch succeeded in 15m 31s:

## 9. possible incompatible changes/used feature flag

There should not be any incompatible changes introduced with this feature.

Snapshot feature will be a layout upgrade in new releases and can be used after upgrade finalization. This will be tracked through Jira [HDDS-7772](https://issues.apache.org/jira/browse/HDDS-7772)

## 10. third party dependencies/licence changes

NA

## 11. performance

The feature won't affect performance if the Snapshot feature is not in use. When snapshots are used, the performance can get impacted proportionate to the number of snapshots that are actively read from and the number of concurrent snapdiff operations,

## 12. security considerations

Security consideration associated with Snapshot feature are tracked through  [HDDS-6851](https://issues.apache.org/jira/browse/HDDS-6851) . Authorization model for Snapshots is attached to this Jira ticket.
