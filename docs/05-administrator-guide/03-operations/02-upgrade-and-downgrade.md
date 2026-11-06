---
sidebar_label: Upgrade and Downgrade
---

# Upgrade and Downgrade

Ozone supports non-rolling upgrades and downgrades, where all components are stopped first, and then restarted with the upgraded or downgraded versions.

## Upgrade States

After upgrading components, the upgrade process is divided into two states:

1. **Pre-finalized**: When the current components are stopped and the new versions are started, they will see that the data on disk was written by a previous version of Ozone and enter a pre-finalized state. In the pre-finalized state:
    - The cluster can be downgraded at any time by stopping all components and restarting with the old versions.
    - Backwards incompatible features introduced in the new version will be disallowed by the cluster.
    - The cluster will remain fully operational with all functionality present in the old version still allowed.
    - Any data created while pre-finalized will remain readable after downgrade.

2. **Finalized**: When a finalize command is given to the cluster, the components will enter a finalized state.  In the finalized state:
    - The cluster can no longer be downgraded.
    - All new features of the cluster introduced in the new version can be used.

### Querying finalization status

Use a single command to query the finalization status of the whole cluster:

```bash
ozone admin upgrade status
```

This command is sent to OM, which gathers the SCM and Datanode status and reports the combined result, for example:

```text
Upgrade finalization status:
    Cluster: FINALIZED
    OM: FINALIZED
    SCM: FINALIZED
    Datanodes finalized: 3/3
```

- Add `--verbose` to also show the apparent versions of OM, SCM and the Datanodes.
- Add `--json` to format the output as JSON.

`ozone admin datanode list` lists all Datanodes and their health state (`HEALTHY`, `STALE`, or `DEAD`) as seen by SCM. `STALE` or `DEAD` Datanodes will be told to finalize by SCM once they are reachable.

## Steps to upgrade and downgrade

Starting with your current version of Ozone, complete the following steps to upgrade to a newer version of Ozone.

1. If using OM HA and currently running Ozone 1.2.0 or greater, prepare the Ozone Manager. If OM HA is not being used, this step can be skipped.

    ```bash
    ozone admin om prepare -id=<om-sevice-id>
    ```

    The `prepare` command will block the Ozone Managers from receiving all write requests. See [Ozone Manager Prepare For Upgrade](https://ozone.apache.org/docs/edge/design/omprepare.html) for more information

2. Stop all components.

3. Replace artifacts of all components with the newer versions.

4. Start the components
    1. Start the SCM and Datanodes as usual:

        ```bash
        ozone --daemon start scm
        ozone --daemon start datanode
        ```

    2. Start the Ozone Manager using the `--upgrade` flag to take it out of prepare mode.

        ```bash
        ozone --daemon start om --upgrade
        ```

        - There also exists a `--downgrade` flag which is an alias of `--upgrade`. The name used does not matter.
        - **IMPORTANT**: All OMs must be started with the `--upgrade`  or `--downgrade` flag in this step. If some of the OMs are not started with this flag by mistake, run `ozone admin om cancelprepare -id=<om-sevice-id>` to make sure all OMs leave prepare mode.

    At this point, the cluster is upgraded to a pre-finalized state and fully operational. The cluster can be downgraded by repeating the above steps, but restoring the older versions of components in step 3, instead of the newer versions. To finalize the cluster to use new features, continue on with the following steps.

    **Once the following steps are performed, downgrading will not be possible.**

5. Finalize the cluster

    ```bash
    ozone admin upgrade finalize
    ```

    - The command is sent to OM, which orchestrates finalization across the cluster: SCM finalizes first, then the Datanodes, and finally the OMs.
    - Finalization is asynchronous: the command returns as soon as the process has been started. Monitor progress with [`ozone admin upgrade status`](#querying-finalization-status), or add `--wait` to have the command poll and block until the entire cluster is finalized. Interrupting `--wait` with Ctrl-C only stops waiting; finalization continues on the server.
    - The command is idempotent, so it can be safely re-issued at any time, for example to resume waiting with `--wait`.

At this point, the cluster is finalized and the upgrade is complete.
