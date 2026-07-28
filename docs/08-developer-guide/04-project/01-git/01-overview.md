---
sidebar_label: Overview
---

# Git Branches and Tags

The [Apache Ozone](https://github.com/apache/ozone) codebase on GitHub uses a small number of **long-lived branch patterns**, many **short-lived Jira-named branches**, and **signed tags** for releases. This section covers how they fit together for contributors and release managers.

:::info Product repo versus this website

Branch and tag names below refer to **[`apache/ozone`](https://github.com/apache/ozone)**. The documentation site you are reading is **[`apache/ozone-site`](https://github.com/apache/ozone-site)** and follows its own branching (for example `master` and `asf-site` for publishing).

:::

## The `master` branch

Day-to-day development targets **`master`** in [`apache/ozone`](https://github.com/apache/ozone). Pull requests from forks are usually opened against `master`, and GitHub Actions CI ([`build-branch`](https://github.com/apache/ozone/blob/master/.github/workflows/post-commit.yml)) validates proposed changes.

The community tries to keep **`master` in a releasable state**: it should build, tests should be in good shape, and risky work should not land without review and appropriate checks. That expectation is why large or disruptive efforts are often done on **feature branches** and merged only after broader validation.

For routine contribution steps (fork, branch, PR, Jira), see [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md).

## See also

- [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) — everyday PR workflow to `master`
- [`.github/ci.md`](https://github.com/apache/ozone/blob/master/.github/ci.md) — what CI runs on branches and PRs
- [Release Manager Guide](../release-guide) — step-by-step release process

