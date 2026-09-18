---
sidebar_label: Safemode
---

# Troubleshooting Storage Container Manager safemode

Use this page when the **Storage Container Manager (SCM)** stays in safemode longer than expected after startup or a restart, and client writes fail.

This page covers **SCM safemode only**. Ozone Manager (OM) and Recon have separate HA and warmup behavior. If OM metadata works but data writes fail, SCM safemode is a likely cause.

Under normal conditions, SCM exits safemode automatically once its exit rules are satisfied. This guide helps you find which rule is blocking exit and what to do about it.

For background on what safemode is, how it works, and the full list of exit rules, see [Core Concepts → Architecture → Storage Container Manager](../core-concepts/architecture/storage-container-manager) (Safe Mode section).

## When to use this page

- After a **cluster restart** or **rolling restart**, writes fail but the cluster otherwise looks up.
- After **Datanode or SCM node failures**, SCM restarted and has not left safemode.
- During **initial cluster startup**, `ozone admin safemode wait` times out.
- Client or SCM logs mention **SafeModePrecheck** failures.

## Symptoms

- Client writes fail. OM or S3 may return errors that mention SCM safemode.
- SCM logs or client stack traces include either:

  ```text
  SafeModePrecheck failed for allocateBlock
  ```

  or:

  ```text
  SafeModePrecheck failed for allocateContainer
  ```

  SCM blocks **block allocation** and **container allocation** while in safemode, so create and append operations that need new blocks or containers cannot proceed.

- Reads may still work for existing data, depending on pipeline and container state.

## Check safemode status

Run against the **SCM leader**. In an SCM HA cluster, identify the leader with:

```bash
ozone admin scm roles --service-id=<scm_service_id>
```

On a single-SCM cluster, run the commands below against that SCM host.

```bash
ozone admin safemode status --verbose
```

When SCM is in safemode, `--verbose` prints each exit rule and whether it has passed, for example:

```text
SCM is in safe mode.
validated:false, DataNodeSafeModeRule, ...
validated:false, ContainerSafeModeRule, ...
```

`ContainerSafeModeRule` status text reports Ratis and EC container progress on separate lines.

You can also open the **leader SCM web UI** (default port `9876`, see `ozone.scm.http-address`) and review the safemode rule status shown on the page.

To wait until safemode clears (for example during startup):

```bash
ozone admin safemode wait -t 240
```

If rules are close to passing, wait before forcing exit. SCM refreshes rule state every `hdds.scm.safemode.rule.refresh.interval` (default `5s`). While in safemode, SCM also logs status periodically at `hdds.scm.safemode.log.interval` (default `1m`) — useful when CLI output is inconclusive.

## How automatic exit works

SCM enters safemode on startup and stays there until **all** configured exit rules pass.

`DataNodeSafeModeRule` is both one of the five exit rules and the **pre-check** gate: SCM will not evaluate container or pipeline rules until enough Datanodes have registered.

SCM evaluates five main exit rules before leaving safemode (documented in [Core Concepts → Architecture → Storage Container Manager](../core-concepts/architecture/storage-container-manager#safe-mode)):

| Rule | What it checks | Default threshold (`ozone-site.xml`) |
| --- | --- | --- |
| `DataNodeSafeModeRule` | Minimum Datanodes registered with SCM | `hdds.scm.safemode.min.datanode` = `3` |
| `RatisContainerSafeModeRule` | Percentage of Ratis containers with at least one reported replica | `hdds.scm.safemode.threshold.pct` = `0.99` |
| `ECContainerSafeModeRule` | Percentage of EC containers with enough reported replicas (at least the data-node count for the EC layout) | `hdds.scm.safemode.threshold.pct` = `0.99` |
| `HealthyPipelineSafeModeRule` | Percentage of pipelines where all Datanodes are reported healthy | `hdds.scm.safemode.healthy.pipeline.pct` = `0.10` |
| `OneReplicaPipelineSafeModeRule` | Percentage of pipelines with at least one Datanode reported | `hdds.scm.safemode.atleast.one.node.reported.pipeline.pct` = `0.90` |

| Failing rule (in `--verbose` output) | Start here |
| --- | --- |
| No progress; cannot reach SCM or no leader elected | [§1 SCM HA quorum](#1-scm-ha-quorum-is-not-healthy) |
| `DataNodeSafeModeRule` | [§2 Datanodes](#2-not-enough-datanodes-are-registered) |
| `ContainerSafeModeRule` (Ratis or EC lines in status text) | [§3 Containers and pipelines](#3-container-or-pipeline-thresholds-are-not-met) |
| `HealthyPipelineSafeModeRule` or `AtleastOneDatanodeReportedRule` | [§3 Containers and pipelines](#3-container-or-pipeline-thresholds-are-not-met) |

:::note Rule names in CLI output
`ozone admin safemode status --verbose` groups the two container checks under a single `ContainerSafeModeRule` entry. Its status text reports Ratis and EC progress separately. The pipeline rule appears as `AtleastOneDatanodeReportedRule` (the implementation class is `OneReplicaPipelineSafeModeRule`).
:::

Pipeline rules apply only when `hdds.scm.safemode.pipeline.availability.check` is `true` (the default).

If any rule shows `validated:false` in the verbose output, SCM remains in safemode.

:::note Disabling safemode (dev/test only)
Setting `hdds.scm.safemode.enabled` to `false` skips SCM safemode entirely. Use only in development or test environments, not in production.
:::

## Common causes and fixes

### 1. SCM HA quorum is not healthy

In an SCM HA cluster, only the **leader** SCM processes Datanode reports and drives safemode exit. Followers are expected to be running but inactive as leader.

If too many SCM processes are down, Raft cannot elect or keep a leader. Datanode reports may not be processed and safemode will not clear.

#### What to check

- All SCM processes configured in `ozone.scm.nodes` are running.
- A majority of SCM nodes are available (for example, at least 2 of 3 in a three-node SCM HA setup).
- `ozone admin scm roles` shows a `LEADER` and reachable followers.
- The current leader is reachable from clients and Datanodes.

#### What to do

- Start any stopped SCM processes.
- Resolve leader election or network issues before investigating Datanode or container rules.

See [SCM High Availability](../core-concepts/high-availability/scm-ha).

### 2. Not enough Datanodes are registered

`DataNodeSafeModeRule` must pass before SCM evaluates container or pipeline rules.

#### What to check

```bash
ozone admin datanode list
```

Look for Datanodes that are `DEAD`, `STALE`, or missing from the list.

#### Common reasons

- Datanode processes are not running.
- Datanodes are still starting up — for example, verifying containers and volumes on a large deployment can take time after restart.
- Network, certificate, or configuration problems prevent registration with SCM.

#### What to do

- Start missing Datanodes and wait for registration.
- Check Datanode logs for registration or TLS errors.
- Follow the startup order in [Starting and stopping the cluster](../administrator-guide/operations/start-and-stop) (SCM, then OM, then Datanodes).
- If you intentionally run a small cluster (for example, a single-node test), lower `hdds.scm.safemode.min.datanode` — see the [Flink integration guide](../user-guide/integrations/flink) for an example.

### 3. Container or pipeline thresholds are not met

Even with enough Datanodes online, SCM stays in safemode until enough **Ratis containers**, **EC containers**, and **pipelines** satisfy their thresholds.

- **Containers:** Ratis containers need at least one reported replica; EC containers need enough replicas for the EC data-node layout.
- **Pipelines:** `HealthyPipelineSafeModeRule` requires all Datanodes in a pipeline to be reported healthy. `OneReplicaPipelineSafeModeRule` requires at least one Datanode reported per pipeline.

#### What to check

```bash
ozone admin container report
ozone admin pipeline list
```

The container report shows replication health (`UNDER_REPLICATED`, `MISSING`, `UNHEALTHY`, and related states). See [Container Replication Report](../administrator-guide/operations/container-replication-report) for how to interpret it.

#### Common reasons

- Many Datanodes were down and container reports have not caught up yet. Datanodes send container reports on `hdds.container.report.interval` (default `60m`), so thresholds can take time to clear after a large restart.
- Containers are under-replicated, missing, or corrupt after disk or node failures.
- Pipelines have not been created or reported yet (`hdds.scm.safemode.pipeline.creation` controls background pipeline creation during safemode, default `true`).
- On clusters whose default replication is EC, SCM may also require `RATIS/THREE` pipelines during safemode when `ozone.scm.pipeline.creation.ratis.three` is `true` (the default).

#### What to do

- Restore failed Datanodes and disks, then wait for container reports and replication to progress.
- Investigate `MISSING` or persistent `UNDER_REPLICATED` containers before forcing safemode exit.
- For pipeline-related rules, confirm Datanodes are healthy and pipeline creation is enabled.
- On EC-default clusters, confirm `RATIS/THREE` pipelines exist if `ozone.scm.pipeline.creation.ratis.three` is enabled.

## Force exit (last resort)

If you are confident the cluster is healthy and safemode is stuck due to a transient reporting delay, you can force SCM out of safemode:

```bash
ozone admin safemode exit
```

:::caution
Forcing exit skips the automatic health checks. Do this only when you understand which rule is failing and have verified that the underlying problem is resolved or acceptable. Exiting safemode with missing replicas or too few Datanodes can cause write failures or data availability issues.
:::

After a forced exit, SCM waits `hdds.scm.wait.time.after.safemode.exit` (default `5m`) before starting some background recovery work.

## Verify

After safemode clears (automatically or manually):

```bash
ozone admin safemode status
```

Expected output:

```text
SCM is out of safe mode.
```

Then retry a write from your client application or:

```bash
ozone sh key put <volume>/<bucket>/safemode-test -f <local-file>
```

## Still stuck?

- Confirm you checked safemode on the **SCM leader**, not a follower (see `ozone admin scm roles`).
- Review SCM logs around safemode status lines (emitted every `hdds.scm.safemode.log.interval`).
- If safemode is clear but writes still fail, the problem is likely elsewhere — for example write pipelines or client connectivity. See [Troubleshooting client connectivity](./client-connectivity).

## See also

- [Core Concepts → Architecture → Storage Container Manager](../core-concepts/architecture/storage-container-manager) — safemode overview and exit rules
- [Starting and stopping the cluster](../administrator-guide/operations/start-and-stop) — includes `ozone admin safemode wait`
- [Ozone Admin tools](../administrator-guide/operations/tools/ozone-admin) — `ozone admin safemode` subcommands
- [Configuration appendix](../administrator-guide/configuration/appendix) — safemode-related settings
