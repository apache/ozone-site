---
sidebar_label: Upgrade and Downgrade
---

# Upgrade and Downgrade

Ozone supports two ways to move a cluster between software versions:

- **Rolling (zero downtime) upgrade (ZDU)**: components are restarted with the new
  version one service at a time, in a fixed order, so the cluster remains fully
  operational throughout the upgrade. This is the recommended approach for
  clusters that are already running a ZDU-capable release.
- **Non-rolling upgrade**: all components are stopped first, and then restarted
  with the upgraded (or downgraded) versions. This is simpler, but the cluster is
  unavailable while the components are stopped.

Both approaches share the same [upgrade states](#upgrade-states) and the same
[finalization](#finalization) commands.

## Upgrade States

After starting components with a newer version, the upgrade process is divided
into two states:

1. **Pre-finalized**: When components are started with a new version, they see
   that the data on disk was written by a previous version of Ozone and enter a
   pre-finalized state. Internally, each component's *apparent version* (the
   version persisted on disk, which determines the API it exposes and the format
   it writes) is lower than its *software version* (the version of the running
   bits). In the pre-finalized state:
    - The cluster can be downgraded at any time by restarting components with the
      old versions.
    - Backwards incompatible features introduced in the new version will be
      disallowed by the cluster.
    - The cluster will remain fully operational with all functionality present in
      the old version still allowed.
    - Any data created while pre-finalized will remain readable after downgrade.

2. **Finalized**: When a finalize command is given to the cluster, the components
   move their apparent version up to match their software version and enter a
   finalized state. In the finalized state:
    - The cluster can no longer be downgraded.
    - All new features of the cluster introduced in the new version can be used.

### Querying upgrade status

Use a single command to query the finalization status of the whole cluster:

```bash
ozone admin upgrade status
```

This command is sent to OM, which gathers the HDDS (SCM and Datanode) status from
SCM and reports the combined result, for example:

```text
Upgrade finalization status:
    Cluster: FINALIZED
    OM: FINALIZED
    SCM: FINALIZED
    Datanodes finalized: 3/3
```

- Add `-v` / `--verbose` to also show the apparent versions of OM, SCM, and the
  Datanodes.
- Add `--json` to format the output as JSON.

`ozone admin datanode list` lists all Datanodes and their health state (`HEALTHY`, `STALE`, or `DEAD`) as seen by SCM. Pre-finalized Datanodes are not placed in a separate read-only state: during a rolling upgrade, every reachable Datanode stays `HEALTHY` and fully participates in reads and writes, while SCM ensures a consistent write version is used across mixed-version Datanodes. To track how far Datanode finalization has progressed, use `ozone admin upgrade status` (the `Datanodes finalized: N/M` line, or `-v` for per-Datanode apparent versions) rather than the Datanode health state. `STALE` or `DEAD` Datanodes will be told to finalize by SCM once they are reachable again.

## Rolling upgrade (ZDU)

A rolling upgrade keeps the cluster available by restarting components with the
new version one at a time, relying on Ozone's existing fault tolerance so that
service continues while individual nodes restart.

### Prerequisites

A rolling upgrade requires an HA deployment. Because components are restarted one
at a time while the rest continue to serve traffic, both OM and SCM must be
running in HA, so a quorum stays available throughout. A non-HA
deployment (a single OM or SCM) cannot be upgraded without downtime and must use
the [non-rolling upgrade](#non-rolling-upgrade) procedure instead.

The cluster must also already be running a ZDU-capable Ozone release. To move from
an earlier release to the first ZDU-capable release, use the
[non-rolling upgrade](#non-rolling-upgrade) procedure. Once the cluster is on a
ZDU-capable release, all subsequent upgrades can be done as a rolling upgrade or as
a non-rolling upgrade.

### Component upgrade order

Components must be upgraded in the following order:

1. All SCMs
2. Recon
3. All Datanodes
4. All OMs
5. Client-facing processes: S3 Gateway, HttpFS, etc.

This order ensures that for every internal client/server relationship inside
Ozone, the server is always running the same or a newer version than its clients
and is finalized first, so servers only need to remain backwards compatible.
Recon is upgraded together with SCM because it shares SCM's Datanode report
processing code.

### Steps

1. Deploy the new software to all SCMs and restart them one at a time.
2. Deploy the new software to Recon and restart it.
3. Deploy the new software to the Datanodes and restart them. Restarting
   Datanodes one at a time keeps data continuously available but takes the
   longest. If temporary unavailability is acceptable, or data placement makes it
   safe (for example, EC or rack-scatter placement), Datanodes can be restarted in
   larger groups such as one rack at a time.
4. Deploy the new software to all OMs and restart them one at a time. Unlike
   earlier versions, there is no "prepare for upgrade" step and no `--upgrade`
   flag — OMs are started normally.
5. Deploy the new software and restart the client-facing processes (S3 Gateway,
   HttpFS, etc.).

Throughout the upgrade, keep a quorum available: with three OMs or SCMs, at least
two must be up at all times. If a node fails to start on the new version, resolve
the issue or downgrade that node before restarting others.

At this point the cluster is running the new software in a pre-finalized state and
is fully operational, but it is still "acting as" the old version — no data is
written in a new format and new features are unavailable. Regression testing can
be performed here, and a [downgrade](#downgrade) is still possible.

To finalize the cluster and enable the new features, continue with
[Finalization](#finalization).

## Non-rolling upgrade

In a non-rolling upgrade, all components are stopped and restarted together. The
cluster is unavailable while the components are stopped, but the procedure is
simpler than a rolling upgrade.

1. Stop all components.

2. Replace the artifacts of all components with the newer versions.

3. Start the components:

    ```bash
    ozone --daemon start scm
    ozone --daemon start datanode
    ozone --daemon start om
    ```

    There is no longer a "prepare for upgrade" step, and the `--upgrade` /
    `--downgrade` start flags are no longer required (they are deprecated no-ops).
    Components are started normally.

At this point, the cluster is upgraded to a pre-finalized state and fully
operational. It can still be [downgraded](#downgrade). To finalize the cluster
and use the new features, continue with [Finalization](#finalization).

## Downgrade

Before the cluster is finalized, it can be downgraded by restarting the
components with the old software. No data in a new format has been persisted, so
the old software will be able to read everything. The restart with the
downgraded software can be done either non-rolling (stop all components, restore
the old artifacts, and start them again) or rolling (restart the components in
the **reverse** of the upgrade order: client-facing processes, then OMs, then
Datanodes, then Recon, then SCMs).

**Once the cluster is [finalized](#finalization), downgrading is not possible.**

## Finalization

Finalization is the same for both rolling and non-rolling upgrades. A single
command finalizes the whole cluster:

```bash
ozone admin upgrade finalize
```

- The command is sent to OM, which orchestrates finalization across the cluster:
  SCM finalizes first, then the Datanodes, and finally the OMs. Because
  finalization is asynchronous, the command returns as soon as the process has
  been started.
- Add `--wait` to have the command poll and block until the entire cluster is
  finalized (interruptible with Ctrl-C).

Monitor progress with [`ozone admin upgrade status`](#querying-upgrade-status).
The command is idempotent, so finalization continues after OM restarts or leader
changes and can be safely re-issued.

**After finalization, the cluster cannot be downgraded.** If a component sees a
version on disk that is newer than its own software version, it will refuse to
start.

### Finalizing a cluster upgraded from a pre-ZDU release

`ozone admin upgrade finalize` and `ozone admin upgrade status` require an OM that
supports ZDU. If they are run against a cluster whose OM predates ZDU support, they
will report that the OM does not support zero downtime upgrade and direct you to
the older, now-deprecated commands that are retained for this case
(`ozone admin scm finalizeupgrade` followed by `ozone admin om finalizeupgrade`).
