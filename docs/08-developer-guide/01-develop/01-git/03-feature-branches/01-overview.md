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

## Keeping the feature branch up to date

While development continues on `master`, periodically bring those changes into your feature branch (roughly every two weeks) so it does not drift too far and the eventual merge stays manageable. You can use either `git merge` or `git rebase` for this. Any merge commits created with this process will be removed before the branch is incorporated into `master` (see below), so both approaches lead to the same clean result.

## Merge Process

Merging a feature branch directly to master would carry the back-and-forth merge commits accumulated during development into `master`, where the layered merge commits become difficult to follow. Instead, the community votes on a frozen merge candidate branch that has been rebased onto `master`, similar to how a release candidate is voted on. Complete the following steps when a feature branch is ready to be merged into `master`:

1. Create a merge candidate (`mc`) branch from your feature branch and rebase it onto `master`, for example `HDDS-3816-ec-mc0`. This accomplishes a few things:
    - The rebase of the candidate branch will create new copies of the commits while leaving the original feature branch intact. It is non-destructive.
    - The rebase erases any incremental merge commits in the candidate branch so `master` ends up with a clean history when the final candidate branch is merged.
    - Voting happens on a frozen candidate. If development continues in the background on the feature branch it is clearly separated from what is being voted on.

2. Complete the [branch merge checklist](./merge-checklist) for the merge candidate and raise it as a pull request to the [ozone-site](https://github.com/apache/ozone-site) repo's `master` branch.
    - Feature branch merge checklists will be committed once the branch merge is approved.

3. Start a mail thread on the `dev@ozone.apache.org` mailing list for committers and PMC members to vote on the merge candidate branch. Include a link to the branch merge checklist PR. The subject of the mail thread should contain the merge candidate number, and a new thread should be started for each merge candidate.

4. If more changes are needed (for example, addressing review feedback), continue development on the original feature branch. Cut a new candidate (`mc1`, and so on) and re-vote as needed.

5. If the vote passes, merge the candidate branch into `master` with a regular `git merge`, then development can continue on the `master` branch.
    - The merge will need to be done locally by a committer and then pushed directly to the master branch, since Github is configured to only allow "Squash and merge" to incorporate changes from pull requests.
    - The merge commit creates a single clear point in history where the whole feature was added, which helps with later tasks such as flaky test triage.

## See also

- [Release branches](../release-branches) — release branch lifecycle and tags
- [Release Manager Guide](../../release-guide) — RC tags and publishing
- [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) — everyday PR workflow to `master`
