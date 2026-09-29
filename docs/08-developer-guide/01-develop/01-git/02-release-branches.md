---
sidebar_label: Release Branches
---

# Release Branches and Tags

## Release branches

When the project prepares a **minor** (or major) release, maintainers cut a **release branch** from an agreed point on `master`. The naming pattern is:

`ozone-<major>.<minor>`

Examples: `ozone-2.0`, `ozone-2.1`. **Patch** releases for that line (for example 2.0.1) are typically produced from the same branch. Details — `proto.lock` updates, bumping the SNAPSHOT on `master`, tagging — are in the [release manager guide](../release-guide).

Release branches are **not** where general feature development happens; fixes that belong in the release are cherry-picked or landed on the release branch as described in that guide.

## Tags

Ozone uses **annotated Git tags** on [`apache/ozone`](https://github.com/apache/ozone) to mark release candidates and final releases. You will see names such as:

- **`ozone-2.1.0`**, **`ozone-2.0.0`** — final release tags
- **`ozone-2.1.0-RC0`**, **`ozone-2.1.0-RC1`**, … — release candidate tags

Tags appear on the [Tags](https://github.com/apache/ozone/tags) page and drive [GitHub Releases](https://github.com/apache/ozone/releases). Creating and pushing the final tag is part of the release process in the [release manager guide](../release-guide).

## See also

- [Release Manager Guide](../release-guide) — step-by-step release process, RC tags, and publishing
- [Feature branches](./feature-branches) — feature branch lifecycle and merge process
- [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) — everyday PR workflow to `master`
