# HDDS-10239: Container Reconciliation

Storage Container Reconciliation Epic:  [HDDS-10239](https://issues.apache.org/jira/browse/HDDS-10239)
Git Branch: https://github.com/apache/ozone/tree/HDDS-10239-container-reconciliation

## 1. Builds/intermittent test failures

All the CI checks need to pass before merging any commit. No additional flaky tests have been introduced by the feature branch.

## 2. Documentation

Documentation is a WIP, which is tracked here: [HDDS-13039](https://issues.apache.org/jira/browse/HDDS-13039)

## 3. Design, attached the docs

The design document is added to the [master via pull request](https://github.com/apache/ozone/pull/6121)

Design Document: [Hadoop-HDDs/docs/content/design/container-reconciliation.md](https://github.com/apache/ozone/blob/HDDS-10239-container-reconciliation/hadoop-hdds/docs/content/design/container-reconciliation.md)

## 4. S3 compatibility

N/A, S3 compatibility remains the same. Container Reconciliation only affects the block storage layer.

## 5. Docker-compose / Acceptance tests

New acceptance tests were added to test the container reconciliation process [HDDS-10372](https://issues.apache.org/jira/browse/HDDS-10372)

The acceptance test mainly tests the SCM CLI for container reconciliation. It does not test fault injection.

More comprehensive tests with fault injection were added as part of unit tests and integration tests.

## 6. Support of containers / Kubernetes

No addition. No change in existing support.

## 7. Coverage / Code quality

[New code coverage](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-10239-container-reconciliation) for Storage Container Reconciliation (HDDS-10239) is 89.2, and [Overall code coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=HDDS-10239-container-reconciliation) is 78.5

[Overall code coverage](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=master) for master is 77.9

## 8. Build time

[Build time of the latest commit](https://github.com/apache/ozone/actions/runs/15448452385/job/43484284706) from the reconciliation branch is 11m 51s

[Build time of the latest commit](https://github.com/apache/ozone/actions/runs/15461566472/job/43523882533) from the master branch is 11m 37s

The build time is similar to that of master.

## 9. Possible incompatible changes/used feature flag

There is no feature flag for reconciliation. There are no modifications to existing container data or metadata unless an admin manually runs the `ozone admin container reconcile`  command. Container checksums and merkle trees will be generated and persisted by the container scanner and reported to SCM, but without an admin command the system will not act on this information.

There is a possibility that some orphan blocks may appear when containers created before this feature are reconciled. Reconciliation tracks the blocks that were deleted from each container so that the data checksum of the container does not change after it is closed. Containers that deleted blocks before the reconciliation changes were present did not register these deletions in the persisted merkle tree. The following order of events is possible, where software v1 does not have the reconciliation feature and version v2 does:

1. Block 1 is deleted from container replica 1 in v1.
2. Cluster is upgraded to v2.
3. Container replicas 1 and 2 will report different data checksums until replica 2 also deletes block 1
4. Container replicas 1 and 2 are reconciled, and replica 2 has still not yet deleted block 1.
    - During reconciliation replica 1 will see that it does not have block 1 that replica 2 has, and this block is not tracked in either replica's deleted block list.
    - Replica 1 will re-ingest block 1 from replica 2, since it has no record of the block being deleted.
5. Replica 1 now contains block 1 again and deletion will not be retried from SCM.
6. Replica 2 then deletes block 1 as part of the normal block deletion flow and persists the result to the merkle tree. Only replica 1 has the orphan block.

In the above example, if replicas 1 and 2 are reconciled again replica 2 will ignore block 1 from replica 1 since it knows the block was deleted. Currently replica 1 will not take action to remove block 1 once it learns replica 2 deleted it. This will be handled by HDDS-11765, such that a subsequent reconciliation cleans up the orphan block.

Integrity of existing data is a bigger problem than presence of orphan data. Therefore we feel that the reconciliation branch should still be merged with this case outstanding so admins have the option to repair containers even with this caveat. Orphan data arising from this issue at any time can be fixed by HDDS-11765.

If the `ozone admin container reconcile`  command is never used then this issue will not happen.

## 10. Third-party dependencies/License changes

No new dependencies are added.

## 11. Performance

This feature might impact the startup time of the Datanode, as we are reading a Merkle tree file for each container during the startup. This will be resolved by  [HDDS-12824](https://issues.apache.org/jira/browse/HDDS-12824) . All other reconciliation operations are asynchronous and designed to run at the same time as other container operations. If parallel operations cause containers to diverge (replication of a replica while it is being reconciled, for example), another round of reconciliation will bring the replica up to date with its peers.

## 12. Security considerations

- The SCM CLI, which is used to trigger reconciliation, is only accessible to the admins. [There is a specific robot test to verify this](https://github.com/apache/ozone/blob/47c1eaa1eb903175c1729186da48b7bffda85bd8/hadoop-ozone/dist/src/main/smoketest/admincli/container.robot#L172).
- An API on the Datanode was added to read the merkle tree from peer Datanodes. It uses a container token for authorization. [There are specific integration tests for container token verification](https://github.com/apache/ozone/blob/47c1eaa1eb903175c1729186da48b7bffda85bd8/hadoop-ozone/integration-test/src/test/java/org/apache/hadoop/ozone/container/ozoneimpl/TestOzoneContainerWithTLS.java#L233).
- All the other APIs used in this feature are existing secure APIs.
- All the RPC calls within the cluster in this feature are secure and use secure container/block tokens for each call.
