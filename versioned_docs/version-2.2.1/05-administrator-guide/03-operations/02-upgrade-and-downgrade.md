---
sidebar_label: Upgrade and Downgrade
---

# Upgrade and Downgrade

Ozone supports non-rolling upgrades and downgrades, where all components are stopped first, and then restarted with the upgraded or downgraded versions.

## Upgrade States

OM, SCM, and Datanodes use the following upgrade states:

1. **Pre-finalized**: When the current components are stopped and the new versions are started, they will see that the data on disk was written by a previous version of Ozone and enter a pre-finalized state. In the pre-finalized state:
    - OM, SCM, and Datanodes can be downgraded by stopping them and restarting with the old versions. See the Recon requirements below before downgrading Recon.
    - Backwards incompatible features introduced in the new version will be disallowed by the cluster.
    - The cluster will remain fully operational with all functionality present in the old version still allowed.
    - Any data created while pre-finalized will remain readable after downgrade.

2. **Finalized**: When a finalize command is given to OM or SCM, they will enter a finalized state.  In the finalized state:
    - The cluster can no longer be downgraded.
    - All new features of the cluster introduced in the new version can be used.

### Querying finalization status

**OM**: `ozone admin om finalizationstatus --service-id=<om-service-id>` for HA, or `ozone admin om finalizationstatus --service-host=<om-host>` for non-HA. If using OM HA, finalization status is checked for the quorum, not individual OMs.

**SCM**: `ozone admin scm finalizationstatus`. SCM will report that finalization is complete once it has finalized and is aware of enough finalized Datanodes to form a write pipeline. The remaining Datanodes will finalize asynchronously and be incorporated into write pipelines after informing SCM that they have finalized.

**Datanodes**: `ozone admin datanode list` will list all Datanodes and their health state as seen by SCM. If SCM is finalized, then Datanodes whose health state is `HEALTHY` have informed SCM that they have finalized. Datanodes whose health state is `HEALTHY_READONLY` have not yet informed SCM that they have finished finalization. `HEALTHY_READONLY` (pre-finalized) Datanodes remain readable, so the cluster is operational even if some otherwise healthy Datanodes have not yet finalized. `STALE` or `DEAD` Datanodes will be told to finalize by SCM once they are reachable again.

## Before you start

Check the release notes for your source and target versions for upgrade restrictions and configuration changes. Keep the existing configuration and data directories when replacing binaries; do not initialize OM or SCM again.

Include every deployed service: OM, SCM, Datanodes, Recon, S3 Gateway, and HttpFS Gateway.

Recon upgrades its own metadata automatically on startup, independently of OM and SCM finalization. Back up its configured metadata directories and SQL database while Recon is stopped. Before downgrading Recon, check the release-specific compatibility requirements. If compatibility is not established, restore the pre-upgrade Recon backup before starting the older version. This loses Recon changes made since the backup.

S3 Gateway and HttpFS Gateway do not have a separate layout finalization step. Upgrade or downgrade their binaries with the cluster and restart them normally.

## Steps to upgrade and downgrade

Starting with your current version of Ozone, complete the following steps to upgrade to a newer version of Ozone. For OM HA, use `--service-id=<om-service-id>` with your configured service ID. For non-HA OM finalization and status commands, use `--service-host=<om-host>` instead.

1. If using OM HA and currently running Ozone 1.2.0 or greater, prepare the Ozone Manager. If OM HA is not being used, this step can be skipped.

    ```bash
    ozone admin om prepare --service-id=<om-service-id>
    ```

    The `prepare` command will block the Ozone Managers from receiving all write requests. See [Ozone Manager Prepare For Upgrade](https://ozone.apache.org/docs/edge/design/omprepare.html) for more information

2. Stop all components, including Recon, S3 Gateway, and HttpFS Gateway where deployed. See [Start and Stop](./start-and-stop) for commands. Take the Recon backup described above while Recon is stopped.

3. Replace the binaries of all deployed components with the newer version, preserving configuration and data directories.

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
        - **IMPORTANT**: All OMs must be started with the `--upgrade`  or `--downgrade` flag in this step. If some of the OMs are not started with this flag by mistake, run `ozone admin om cancelprepare --service-id=<om-service-id>` to make sure all OMs leave prepare mode.

    3. Wait for SCM to leave safe mode, then start the optional services where deployed:

        ```bash
        ozone admin safemode wait -t 240
        ozone --daemon start recon
        ozone --daemon start s3g
        ozone --daemon start httpfs
        ```

        Recon, S3 Gateway, and HttpFS Gateway do not need the OM `--upgrade` or `--downgrade` flag.

    4. Before finalizing, verify that existing keys can be read and new keys can be written. Check Recon health and that its metadata is updating. If deployed, test reads and writes through S3 Gateway and HttpFS Gateway too.

    At this point, OM, SCM, and Datanodes are pre-finalized if the upgrade introduced new layout versions. To downgrade before finalization, repeat steps 1–4 with the older binaries and follow the Recon backup and restore requirements above. To enable new features, continue with finalization.

    **Once the following steps are performed, downgrading will not be possible.**

5. Finalize SCM. At least three healthy Datanodes must be available: SCM finalization waits for a Ratis pipeline with three Datanodes, even if the default replication factor is ONE.

    ```bash
    ozone admin scm finalizeupgrade
    ```

    At this point, SCM will tell all of the Datanodes to finalize. Once SCM has finalized enough Datanodes to form a write pipeline, it will return that finalization was successful. The remaining pre-finalized Datanodes will be in a read-only state until they indicate to SCM that they have finalized. Write requests will be directed to finalized Datanodes only.

6. Finalize OM

    ```bash
    ozone admin om finalizeupgrade --service-id=<om-service-id>
    ```

At this point, the cluster is finalized and the upgrade is complete.
