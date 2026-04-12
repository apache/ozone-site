---
sidebar_label: Branches and Tags
---

# Git Branches and Tags

The [Apache Ozone](https://github.com/apache/ozone) codebase on GitHub uses a small number of **long-lived branch patterns**, many **short-lived Jira-named branches**, and **signed tags** for releases. This page summarizes how they fit together for contributors and release managers.

:::info Product repo versus this website

Branch and tag names below refer to **[`apache/ozone`](https://github.com/apache/ozone)**. The documentation site you are reading is **[`apache/ozone-site`](https://github.com/apache/ozone-site)** and follows its own branching (for example `master` and `asf-site` for publishing).

:::

## The `master` branch

Day-to-day development targets **`master`** in [`apache/ozone`](https://github.com/apache/ozone). Pull requests from forks are usually opened against `master`, and GitHub Actions CI ([`build-branch`](https://github.com/apache/ozone/blob/master/.github/workflows/post-commit.yml)) validates proposed changes.

The community tries to keep **`master` in a releasable state**: it should build, tests should be in good shape, and risky work should not land without review and appropriate checks. That expectation is why large or disruptive efforts are often done on **feature branches** (see below) and merged only after broader validation.

For routine contribution steps (fork, branch, PR, Jira), see [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md).

## Release branches

When the project prepares a **minor** (or major) release, maintainers cut a **release branch** from an agreed point on `master`. The naming pattern is:

`ozone-<major>.<minor>`

Examples: `ozone-2.0`, `ozone-2.1`. **Patch** releases for that line (for example 2.0.1) are typically produced from the same branch. Details—`proto.lock` updates, bumping the SNAPSHOT on `master`, tagging—are in the [Apache release manager guide](./release-guide).

Release branches are **not** where general feature development happens; fixes that belong in the release are cherry-picked or landed on the release branch as described in that guide.

## Tags

Ozone uses **annotated Git tags** on [`apache/ozone`](https://github.com/apache/ozone) to mark release candidates and final releases. You will see names such as:

- **`ozone-2.1.0`**, **`ozone-2.0.0`** — final release tags  
- **`ozone-2.1.0-RC0`**, **`ozone-2.1.0-RC1`**, … — release candidate tags  

Tags appear on the [Tags](https://github.com/apache/ozone/tags) page and drive [GitHub Releases](https://github.com/apache/ozone/releases). Creating and pushing the final tag is part of the release process in the [release manager guide](./release-guide).

## Feature branches

### When to use a feature branch

Feature branches are used for **larger or longer-running work** that would be hard to land incrementally on `master` without destabilizing it—subsystems that need many coordinated changes, long QA cycles, or broad community testing before merge.

Smaller changes should continue to use **topic branches on a fork** and normal pull requests to `master` (see [`CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md)).

In the upstream repo, feature lines often show up as branches named after the Jira, for example `HDDS-3816-ec` or `HDDS-10611-mpu` (see [Branches](https://github.com/apache/ozone/branches)).

### Merge process and community vote

Merging a shared feature branch into `master` is a **formal step**: the community typically discusses and **votes on the dev mailing list** so people can test the line and agree it is ready. Expectations are described on the wiki page **[Merging branches](https://cwiki.apache.org/confluence/display/OZONE/Merging+branches)**.

Important points from that process (see the wiki for the full text):

- **Do not use GitHub “Squash and merge” or rebase** to land the feature branch onto `master`. Use a **regular `git merge`** so history, Jira links, and PR discussions stay aligned with the original commit IDs.
- Maintainers run **full CI multiple times** on the revision proposed for merge and investigate failures.
- **Documentation** and **design** updates should live in the versioned tree under `hadoop-hdds/docs` (not only on the wiki), where applicable.
- The wiki also calls out areas such as S3 behavior, Docker Compose / acceptance tests, Kubernetes examples, SonarCloud, upgrade compatibility, licensing, and performance—so reviewers know what to validate.

### Checklist (wiki and PR, not duplicated here)

The **[Merging branches](https://cwiki.apache.org/confluence/display/OZONE/Merging+branches)** page includes a detailed **checklist** and a **copy-paste template**. That list is maintained on Confluence so it can evolve with the project.

**You do not need to mirror the full checklist on this website.** For a given merge, attach or link the completed checklist in the **GitHub merge pull request** and in the **mailing-list thread** (for example `dev@ozone.apache.org`) so reviewers and voters have one place to read it.

## See also

- [Apache release manager guide](./release-guide) — release branches, RC tags, and publishing
- [Merging branches](https://cwiki.apache.org/confluence/display/OZONE/Merging+branches) — feature-branch merge expectations and checklist
- [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) — everyday PR workflow to `master`
- [`.github/ci.md`](https://github.com/apache/ozone/blob/master/.github/ci.md) — what CI runs on branches and PRs
