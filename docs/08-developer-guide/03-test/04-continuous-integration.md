---
sidebar_label: Continuous Integration
---

# Continuous Integration With GitHub Actions

If you are new to the project, you do not need to understand every job below on day one. The goal of this page is to help you get a green `build-branch` run on your fork, know where to look when something fails, and find deeper detail when you need it.

Apache Ozone uses [GitHub Actions](https://docs.github.com/en/actions) to build and test every meaningful change. Workflow files live in [`.github/workflows`](https://github.com/apache/ozone/tree/master/.github/workflows) in [`apache/ozone`](https://github.com/apache/ozone). A longer, file-by-file reference lives in [`.github/ci.md`](https://github.com/apache/ozone/blob/master/.github/ci.md).

:::info Use the right repository

This page is about [`apache/ozone`](https://github.com/apache/ozone) (the Ozone product source code). The documentation site you are reading comes from [`apache/ozone-site`](https://github.com/apache/ozone-site) and has its own CI. For website-only edits, use the [ozone-site contributing guide](https://github.com/apache/ozone-site/blob/master/CONTRIBUTING.md).

:::

## Start here: your first code contribution

Follow these steps once; after that, pushing to your branch is the usual loop.

1. Fork and clone [`apache/ozone`](https://github.com/apache/ozone) to your GitHub account, then clone your fork locally. You will push branches to `origin` on the fork, then open a PR to `apache/ozone`.
2. Turn on Actions on the fork so workflows actually run ([how to enable them](#enable-github-actions-on-your-fork)).
3. Jira — Create or choose an issue in [HDDS](https://issues.apache.org/jira/projects/HDDS/) (the Ozone Jira project; the name is historical). Need an account? Use the ASF [Jira self-service](https://selfserve.apache.org/jira-account.html?project=ozone) form.
4. Branch — Work on a branch, often named after the issue (for example `HDDS-1234`).
5. Push — When you push, GitHub should show a `build-branch` workflow run under the Actions tab on your fork. Wait for it to finish and fix any failures you can reproduce.
6. Open the PR — Use the [pull request template](https://github.com/apache/ozone/blob/master/.github/pull_request_template.md) to describe your work and raise the PR. When the change is ready for review, set the Jira to Patch Available so committers know to look. Anyone can review pull requests, not just committers; reviews from other contributors are welcome.

The full narrative (reviews, merging, Jira etiquette) is in the [Ozone contributing guide](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#contribute-your-modifications).

:::tip You can lean on CI first

Many contributors fix quick issues by reading the failing log on GitHub, then pushing a small follow-up commit. Running every check locally is optional but helpful for faster feedback; see [Run checks on your machine](#run-checks-on-your-machine).

:::

## Enable GitHub Actions on your fork

New forks sometimes have workflows off until you allow them.

1. Open your fork on GitHub → Settings → Actions → General.
2. Under Actions permissions, pick a policy that allows workflows to run (many people use Allow all actions and reusable workflows on personal forks).
3. Open the Actions tab. If GitHub asks to enable workflows, confirm so `build-branch` runs when you push.

More detail: [Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository).

## What you see in GitHub: `build-branch`

Two names show up in docs; both mean “the main CI pipeline”:

| What | Meaning |
| --- | --- |
| `build-branch` | The name of the workflow in the Actions tab. It comes from the `name:` field in [`post-commit.yml`](https://github.com/apache/ozone/blob/master/.github/workflows/post-commit.yml). |
| `ci.yml` | Where most jobs (build, compile, tests, and so on) are defined. `post-commit.yml` calls this file as a [reusable workflow](https://docs.github.com/en/actions/using-workflows/reusing-workflows). |

So: `post-commit.yml` is the front door; `ci.yml` is where the heavy lifting is described.

When you push new commits to an open pull request, newer runs can cancel older ones still in progress ([concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)). That is normal and saves time.

## Why did CI skip some jobs?

Not every pull request runs every job. A step called `build-info` runs [`selective_ci_checks.sh`](https://github.com/apache/ozone/blob/master/dev-support/ci/selective_ci_checks.sh) and only enables jobs that match the files you changed—unless:

- the run is not from a PR, or
- the PR has the `full tests needed` label ([examples and discussion using that label](https://github.com/apache/ozone/issues?q=label%3A%22full%20tests%20needed%22)).

A focused change might show fewer checks than a large refactor. That is expected. Reviewers can add `full tests needed` when the full matrix is required. If you think the wrong jobs were skipped, ask on the PR; reviewers are used to that question.

## Run checks on your machine

Running scripts locally catches problems before you push. You need a working dev environment first; see [Building Ozone With Maven](../build/maven).

Most checks live in [`hadoop-ozone/dev-support/checks`](https://github.com/apache/ozone/tree/master/hadoop-ozone/dev-support/checks). The table below groups them by rough duration (similar to the contributing guide, without duplicating its long narrative):

| Rough time | Scripts | What they do |
| --- | --- | --- |
| Varies (full compile) | `build.sh` | Compile Ozone |
| A few minutes | `author.sh`, `bats.sh`, `rat.sh`, `docs.sh`, `dependency.sh`, `checkstyle.sh`, `pmd.sh` | Style, license headers, docs, dependency list |
| ~10 minutes | `findbugs.sh`, `kubernetes.sh` | SpotBugs, small Kubernetes-related checks |
| An hour or more | `integration.sh`, `acceptance.sh` | JUnit tests (via integration), mini-cluster style tests, Docker Compose acceptance tests |

This is an example command to run the `build` check locally from the root of your clone (the directory that contains `hadoop-ozone/`):

```bash
./hadoop-ozone/dev-support/checks/build.sh
```

Other test scripts in `hadoop-ozone/dev-support/checks/` can be run similarly. To run individual acceptance tests, see [Acceptance tests](./acceptance-tests#running-tests-locally-using-docker-compose).

### Reproducing failures locally (by check type)

What you need depends on which job failed:

1. `basic` — Safe to run locally without a full prior build; scripts are quick (author tags, BATS, RAT, docs, Checkstyle, PMD, SpotBugs, and similar—whatever `basic` selected for that run).
2. `dependency` / license — Quick, but expects a build already (the dependency check compares against built outputs / the dependency list).
3. Compiler or packaging issues — Re-run the same `build.sh` (or the narrower Maven command) shown in the failing job log until it matches CI.
4. `integration` (JUnit) — After a build, narrow work with Maven’s `-Dtest=...`. Prefer the fully qualified class name (package + class) if a short class name is ambiguous. You can also run the same class or method from your IDE. [`integration.sh`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dev-support/checks/integration.sh) wraps the full suite; open it for flags and defaults.
5. `acceptance` — Needs a build (often one that produces a distribution layout the scripts expect—see the log and `acceptance.sh` for what it invokes). Prefer re-running only the failing shell driver the log names instead of the whole suite. For example, a line like `ERROR: Test execution of ozone/test-legacy-bucket.sh is FAILED` points at `test-legacy-bucket.sh`.
6. `kubernetes` — The `kubernetes.sh` check is aimed at Linux environments; macOS or Windows may not match CI.

`integration.sh` and `acceptance.sh` can take extra arguments to run a subset; open the scripts to see options. Output usually lands under `target/` (for example `target/docs`).

## What the main CI jobs do (overview)

The list below matches [`.github/ci.md`](https://github.com/apache/ozone/blob/master/.github/ci.md). Treat it as a map when reading logs, not something to memorize.

- `build-info` — Decides which other jobs run (selective CI).
- `build` — Performs a full build; its output is reused by later jobs.
- `compile` — Re-builds with various Java versions. It consumes the source tarball (release artifact) produced by `build`, not a fresh checkout of the git repository.
- `basic` — Checks like author tags, BATS, Checkstyle, docs, SpotBugs, PMD, RAT—depending on what was selected.
- `dependency` — Detects whether dependencies were added or removed, as a reminder to update `LICENSE.txt`.
- `acceptance` — [`acceptance.sh`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dev-support/checks/acceptance.sh) (Robot Framework + Docker Compose; variants like secure / unsecure / misc).
- `kubernetes` — [`kubernetes.sh`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dev-support/checks/kubernetes.sh).
- `integration` — [`integration.sh`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dev-support/checks/integration.sh) runs all JUnit tests, regardless of which submodule they live in ([HDDS-9242](https://issues.apache.org/jira/browse/HDDS-9242); often sharded in CI). Older CI had a separate `unit` job; it was removed in favor of this.
- `coverage` — [`coverage.sh`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dev-support/checks/coverage.sh) merges code coverage results from earlier jobs.

The RocksDB native library is built and used as part of the normal workflow across jobs ([HDDS-12734](https://issues.apache.org/jira/browse/HDDS-12734)); you do not need a separate “native-only” check to exercise it.

Matrix jobs (for example multiple Java versions) are configured without fail-fast ([HDDS-6464](https://issues.apache.org/jira/browse/HDDS-6464)) so that other matrix legs keep running and failed legs can be re-run individually in the GitHub UI.

## Other workflows

The [workflows directory](https://github.com/apache/ozone/tree/master/.github/workflows) also contains jobs for caches, labeling, Ratis builds, repeating tests, generated docs, and more. The folder on `master` is the up-to-date list.

### Stale pull requests

[`close-stale-prs.yaml`](https://github.com/apache/ozone/blob/master/.github/workflows/close-stale-prs.yaml) runs on a timer and uses [actions/stale](https://github.com/actions/stale) to nudge and eventually close very inactive PRs. Exact timings are in that file.

## If something fails

:::note Green CI is a team norm

A red check does not mean you did something wrong—it means the run found something to fix. It happens to everyone.

:::

1. Open the failed `build-branch` run → click the red job → read the log from the bottom upward for the first error.
2. If the job uploaded artifacts, download them from the run summary while they are still available.
3. Try the same check script locally if you have the environment set up ([Run checks on your machine](#run-checks-on-your-machine)).
4. For transient failures or flaky tests only: committers can use GitHub’s Re-run failed jobs on the workflow run. Other contributors should wait for a committer to do that, or ask on the PR if it does not happen within a reasonable time (which varies with time of day, weekends, holidays, and so on). Avoid empty commits or re-running the entire workflow when only a subset failed.

A maintained mirror of build results from `apache/ozone` default-branch runs is [adoroszlai/ozone-build-results](https://github.com/adoroszlai/ozone-build-results/).

### Get help

- Ask on your pull request—reviewers can interpret unfamiliar failures quickly.
- Email [dev@ozone.apache.org](mailto:dev@ozone.apache.org) for broader questions.
- [GitHub Discussions](https://github.com/apache/ozone/discussions) and the [#ozone](http://s.apache.org/slack-invite) Slack channel (ASF Slack) are listed in [`CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#who-to-contact).

## Advanced: flaky tests and debugging on a fork

For repeat failures or environment-only bugs, use the dedicated workflows on your fork (enable Actions, then run them manually from the Actions tab via workflow_dispatch):

- `flaky-test-check` — defined in [`intermittent-test-check.yml`](https://github.com/apache/ozone/blob/master/.github/workflows/intermittent-test-check.yml); runs a chosen JUnit class or method many times across parallel splits.
- `repeat-acceptance-test` — defined in [`repeat-acceptance.yml`](https://github.com/apache/ozone/blob/master/.github/workflows/repeat-acceptance.yml); repeats acceptance tests concurrently (suite or filter).

You can still use an IDE, extra logging, or interactive debugging (for example [tmate](https://github.com/tmate-io/tmate)) on a fork if you accept the risk on public repos and never expose secrets.

## See also

- [`.github/ci.md`](https://github.com/apache/ozone/blob/master/.github/ci.md) in `apache/ozone`
- [Contributing guide — Check your contribution](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#check-your-contribution)
