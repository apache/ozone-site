# HDDS-3698: Non-Rolling Upgrade

## 1. stable builds/intermittent test failures

- The `HDDS-3698-nonrolling-upgrade` branch has no intermittent test failures.
- Most intermittent failures specific to the `HDDS-3698-nonrolling-upgrade` branch were tracked and resolved in [HDDS-4833](https://issues.apache.org/jira/browse/HDDS-4833).
- Other intermittent failures have been resolved in [HDDS-5109](https://issues.apache.org/jira/browse/HDDS-5109) and [HDDS-5336](https://issues.apache.org/jira/browse/HDDS-5336).

## 2. documentation

- `hadoop-hdds/docs/feature/design/how-to-do-a-nonrolling-upgrade.md` contains instructions for users to upgrade a cluster using the framework.

- Documentation will be refined in coming weeks, before it is needed in the 1.2.0 release.

## 3. design, attached the docs

- `Hadoop-hdds/docs/content/design/upgrade-dev-primer.md` contains instructions for developers who need to add a feature using the upgrade framework.
- `hadoop-hdds/docs/content/design/nonrolling-upgrade.md` contains links to the main design document and presentation.
- `hadoop-hdds/docs/content/design/omprepare.md` contains links and summary for OM preparation design document.

## 4. S3 compatibility

- There are no S3 incompatibilities. This code was not changed.

## 5. Docker-compose / acceptance tests

- Upgrades can be done in Docker-compose to/from any Ozone version which has a Docker image, or to the current code.
- See *Hadoop-ozone/dist/src/main/compose/upgrade/README.md* for more information.

## 6. support of containers / Kubernetes

- The upgrade framework will not effect Kubernetes deployments, since it does not require additional configuration for startup.

## 7. coverage/code quality

- [Sonar for master](https://sonarcloud.io/dashboard?id=hadoop-ozone)

  - Code coverage: 74.8%

- [Sonar for upgrades](https://sonarcloud.io/dashboard?branch=HDDS-3698-nonrolling-upgrade&id=hadoop-ozone)

  - Code coverage: 73.3%

- OM Prepare and general upgrade flow are tested through new acceptance tests which are not reflected in the code coverage.

## 8. build time

- Recent passing runs from master:
  - https://github.com/apache/ozone/actions/runs/927339353 (2:09)
  - https://github.com/apache/ozone/actions/runs/923891108 (1:49)
  - https://github.com/apache/ozone/actions/runs/923951010 (2:02)

- Recent passing runs from upgrade branch:
  - https://github.com/apache/ozone/actions/runs/923010777 (2:02)
  - https://github.com/apache/ozone/actions/runs/941546330 (1:58)

- Although lots of upgrade specific tests were added, the following are the most time consuming:

1. New upgrade acceptance tests, which walk through a cluster upgrade from the last release's Docker image to the current build, in order to catch backwards incompatible changes.

```text

- Although we previously had upgrade tests on master, the added tests use the upgrade framework which uses more commands and tests, and therefore takes longer to run.

```

- New upgrade integration tests in TestHDDSUpgrade, which test various failure combinations that could occur during the upgrade.

```text

- Only a subset of these tests are currently being run to save time.

```

- New integration tests in TestOzoneManagerPrepare, which tests OM preparations under various failure and request combinations.

## 9. possible incompatible changes/used feature flag

There are no incompatible changes and no feature flags. The upgrade framework will only be used during an upgrade.

## 10. third party dependencies/license changes

- The following dependencies have been added:

  - `aspectjrt-1.8.9.jar`
  - `aspectjweaver-1.8.9.jar`
  - reflections-0.9.12.jar

- All new libraries have compatible licenses. (License file update: HDDS-5137)

## 11. performance

- The majority of the upgrade framework is not used when an upgrade is not being performed, so it is not expected to have a performance impact.

- `LayoutVersionInstanceFactory` was added to potentially handle client requests within `OzoneManagerRatisUtils`, although this is not being used yet to accommodate HDDS-2939 (filesystem optimizations).

- Changes do not seem to affect performance based on simple freon testing (3 runs per branch):

`ozone freon rk --num-of-keys=100 --num-of-buckets=10 --num-of-volumes=1 --replication-type=RATIS --factor=THREE`

`HDDS-3698-nonrolling-upgrade`:

```text

***************************************************
Status: Success
Git Base Revision: 7a3bc90b05f257c8ace2f76d74264906f0f7a932
Number of Volumes created: 1
Number of Buckets created: 10
Number of Keys added: 1000
Ratis replication factor: THREE
Ratis replication type: RATIS
Average Time spent in volume creation: 00:00:00,013
Average Time spent in bucket creation: 00:00:00,050
Average Time spent in key creation: 00:00:02,493
Average Time spent in key write: 00:00:01,163
Total bytes written: 10240000
Total Execution time: 00:00:20,679
***************************************************

```

```text

***************************************************
Status: Success
Git Base Revision: 7a3bc90b05f257c8ace2f76d74264906f0f7a932
Number of Volumes created: 1
Number of Buckets created: 10
Number of Keys added: 1000
Ratis replication factor: THREE
Ratis replication type: RATIS
Average Time spent in volume creation: 00:00:00,007
Average Time spent in bucket creation: 00:00:00,065
Average Time spent in key creation: 00:00:02,014
Average Time spent in key write: 00:00:01,144
Total bytes written: 10240000
Total Execution time: 00:00:23,661
***************************************************

```

```text

***************************************************
Status: Success
Git Base Revision: 7a3bc90b05f257c8ace2f76d74264906f0f7a932
Number of Volumes created: 1
Number of Buckets created: 10
Number of Keys added: 1000
Ratis replication factor: THREE
Ratis replication type: RATIS
Average Time spent in volume creation: 00:00:00,006
Average Time spent in bucket creation: 00:00:00,089
Average Time spent in key creation: 00:00:02,442
Average Time spent in key write: 00:00:01,076
Total bytes written: 10240000
Total Execution time: 00:00:23,655
***************************************************

```

master:

```text

***************************************************
Status: Success
Git Base Revision: 7a3bc90b05f257c8ace2f76d74264906f0f7a932
Number of Volumes created: 1
Number of Buckets created: 10
Number of Keys added: 1000
Ratis replication factor: THREE
Ratis replication type: RATIS
Average Time spent in volume creation: 00:00:00,007
Average Time spent in bucket creation: 00:00:00,046
Average Time spent in key creation: 00:00:02,422
Average Time spent in key write: 00:00:01,411
Total bytes written: 10240000
Total Execution time: 00:00:25,699
***************************************************

```

```text

***************************************************
Status: Success
Git Base Revision: 7a3bc90b05f257c8ace2f76d74264906f0f7a932
Number of Volumes created: 1
Number of Buckets created: 10
Number of Keys added: 1000
Ratis replication factor: THREE
Ratis replication type: RATIS
Average Time spent in volume creation: 00:00:00,006
Average Time spent in bucket creation: 00:00:00,039
Average Time spent in key creation: 00:00:02,762
Average Time spent in key write: 00:00:01,466
Total bytes written: 10240000
Total Execution time: 00:00:23,617
***************************************************

```

```text

***************************************************
Status: Success
Git Base Revision: 7a3bc90b05f257c8ace2f76d74264906f0f7a932
Number of Volumes created: 1
Number of Buckets created: 10
Number of Keys added: 1000
Ratis replication factor: THREE
Ratis replication type: RATIS
Average Time spent in volume creation: 00:00:00,006
Average Time spent in bucket creation: 00:00:00,029
Average Time spent in key creation: 00:00:01,975
Average Time spent in key write: 00:00:01,040
Total bytes written: 10240000
Total Execution time: 00:00:23,677
***************************************************

```

## 12. security considerations

The branch introduced the RPC methods in the ScmAdminProtocol.proto to initialize (and finalize) the upgrade process. They are available only to the admins (HDDS-5138).
