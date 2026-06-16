---
sidebar_label: Overview
---

# Feature Branches

Feature branches are used for larger or longer-running work that would be hard to land incrementally on `master` without destabilizing it. Feature branches are often named after the Jira epic tracking the work and an abbreviated feature name, for example `HDDS-3816-ec` or `HDDS-10611-mpu`. You can see all the Ozone repo's branches [here](https://github.com/apache/ozone/branches). Most incremental changes do not require feature branches and can go directly to `master` as a pull request as documented in [`CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md).

## When to use a feature branch

Use a feature branch for changes that:
- Make iterative changes to core code paths.
- Require broader community testing.
- Cannot be easily gated with a feature flag.
  - The covers changes that migrate existing code paths instead of adding completely new ones.
- Would have issues if a release was cut in the middle of their development.
  - A release branch can be cut from `master` at any time and feature development should not block this.
  - If a feature has upgrade compatibility concerns that will not be addressed right away, it should be developed on a feature branch.
  - Note that protobuf messages and wire protocols become locked into compatibility guarantees once they are released.
    - If a feature is making changes in this area and it wants to keep the structure flexible while it is being finalized, it should be done on a feature branch.


## Merge Process

Complete the following steps when a feature branch is ready to be merged into `master`:

1. Complete the [branch merge checklist](./merge-checklist) for your feature branch and raise it as a pull request to the [ozone-site](https://github.com/apache/ozone-site) repo's `master` branch.

    - Feature branch merge checklists will be committed [to the website](./merged-branches) once the branch merge is approved.

2. Start a mail thread on the `dev@ozone.apache.org` mailing list for committers and PMC members to vote on the branch merge. Include a link to the branch merge checklist PR.

3. If the vote passes, changes from the feature branch will be incorporated into `master`, and development can continue on the `master` branch.

**Do not use GitHub "Squash and merge" or rebase** to land the feature branch onto `master`. Use a **regular `git merge`** so history, Jira links, and PR discussions stay aligned with the original commit IDs.

## See also

- [Release branches](../release-branches) — release branch lifecycle and tags
- [Release Manager Guide](../../release-guide) — RC tags and publishing
- [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) — everyday PR workflow to `master`

