# Feature Branch Merge Checklist

This section collects generic questions which can be checked for each feature branch. Some of them are obvious for some branches (for example: the decommissioning feature didn't change the s3 interface) but it's good to go through them for each of the merges. Answering these questions will also help the community to test the branch. If you have any new idea about what should be checked, submit a pull request to the [ozone-site](https://github.com/apache/ozone-site) repo to update this page.

## Summary

Include a brief summary of the feature, and fill in the following information:

- Branch name: `<feature branch to be merged>`
- Jira: `<Jira epic tracking all subtasks of the feature>`
- Commit: `<Git hash of the commit at the tip of the branch that will be merged>`

## Stable Builds

To keep the master branch stable, it's recommended to run the full CI build 3-5 times on the latest commit proposed to be merged. Any failure should be analyzed and checked against previous failures on master to see if it is related to the branch.

All CI runs for the feature branch can be checked at `github.com/apache/ozone/actions?query=<BRANCH_NAME>`.

## User Documentation

Adding user documentation before the merge will help the community test and evaluate the feature. User documentation should be added to this website with a pull request to the [ozone-site](https://github.com/apache/ozone-site) repo. Note that the documentation will be listed under the `next` version section until it is included in a release.

## Developer Documentation

If the feature required a design document, ensure its PR is approved and it has been committed under the main Ozone repo's `hadoop-hdds/docs/content/design/` directory so it is preserved in the source history.

## S3 Compatibility

Explain how any S3 API behavior changes with the addition of this feature.

## Docker Compose and Acceptance Tests

Verify that Docker-compose clusters still start correctly. Add or update Robot Framework acceptance tests in `hadoop-ozone/dist/src/main/compose` to cover the new feature's behavior and allow other developers to test it in a local environment.

## Containers and Kubernetes

If the feature affects cluster topology, configuration, or runtime behavior, update the Kubernetes example manifests under `hadoop-ozone/dist/src/main/k8s`.

## Code Coverage and Quality

Review the [SonarCloud](https://sonarcloud.io/project/overview?id=apache_ozone) metrics for the branch and compare them against `master`. Regressions in coverage, duplications, or code smells should be addressed before merge.

## Build Time

The ASF uses a shared pool of Github Actions CI minutes for all projects, so we should avoid significant increase of the build time unless it's fully necessary. Compare the end-to-end CI build duration of the feature branch against `master`. Flag significant regressions so the community can decide whether they are acceptable.

All Github actions runs for a branch can be found at `github.com/apache/ozone/actions?query=<BRANCH_NAME>`.

## Incompatible Changes

Ozone currently supports non-rolling upgrades and downgrades even when backwards incompatible features are present. Backwards incompatible features should be added to the versioning framework so that they are not used until the Ozone upgrade is finalized, after which downgrading is not possible.

Client cross compatibility should also be maintained as much as possible, with sensible error messages provided when this is not possible. An old client should be able to talk to the new Ozone instance, and a new client should be able to talk to the old Ozone instance.

## Third Party Dependencies or License Changes

Diff the distribution tar files to identify any new or updated third-party libraries. For each new library, update `LICENSE` and `NOTICE` in the appropriate module so the release artifacts remain license-compliant.

The easiest way to check this is by building Ozone from the feature branch and from master, then comparing the files between them:

```shell
git checkout origin/master
mvn clean install -DskipTests
cd hadoop-ozone/dist/target/ozone-*/
find -type f | sort > /tmp/master

git checkout origin/$BRANCH_NAME
mvn clean install -DskipTests
cd hadoop-ozone/dist/target/ozone-*/
find -type f | sort > /tmp/$BRANCH_NAME

git diff /tmp/$BRANCH_NAME /tmp/master
```

## Performance

Share `ozone freon` benchmark results that demonstrate the performance impact of the feature. Include baseline numbers from `master` so the community can evaluate the delta. Feature branches should not introduce performance regressions, but in some cases they may improve performance.

## Security Considerations

Document any new attack surfaces, privilege changes, or cryptography decisions. Pay particular attention to input validation for features that add network-accessible endpoints or handle user-supplied data.

## Configuration Changes

Document any new configuration keys added or existing configurations whose defaults were changed by this feature and what their impact will be.

## Dangling TODO Comments

`TODO` comments are often left in the code when working on a feature branch for ideas that need to be worked out later or were split into smaller PRs. If there are new `TODO` comments introduced by the branch, ensure that the comment also contains the ID of an open Jira which will resolve it and document this existing gap. For example:

```java
// TODO HDDS-1234: Finalize the return type of this method.
```

There should be no new `TODO`s that do not contain references to open Jiras.

To see all TODOs unique to your branch from `master`, check out your feature branch and run `git diff master... | grep -i todo`.
