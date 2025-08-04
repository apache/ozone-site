# Upgrading and Downgrading Ozone

Ozone supports a non-rolling upgrade process, which requires stopping the cluster, replacing software binaries, and restarting the components. It also includes a finalization step that commits the cluster to the new version and enables new features, after which downgrading is no longer possible.

## Key Concepts

*   **Layout Version:** An internal version number representing the on-disk format used by Ozone components (OM, SCM, Datanodes). Each component maintains its own layout version.
*   **Layout Feature:** A named, backward-incompatible change introduced in a specific software version. Each layout feature is associated with a layout version.
*   **Software Version:** The released version of Ozone (e.g., 1.4.0, 1.5.0).
*   **Non-Rolling Upgrade:** A cluster upgrade method where all components are stopped, binaries are replaced, and then components are restarted. This contrasts with rolling upgrades where components are upgraded one by one without full cluster downtime (Note: Rolling upgrades are not currently the standard supported method for layout version changes).
*   **Pre-finalized State:** After restarting components with new binaries (and the OM with the `--upgrade` flag), the cluster operates in a pre-finalized state. It functions using the new software but operates at the older layout version, disabling any new layout features. Downgrading is possible from this state.
*   **Finalization:** An explicit administrative action using `finalizeupgrade` commands. This transitions the cluster components to the new layout version associated with the new software, enables all new layout features, and permanently prevents downgrading to the previous version.

## Prerequisites

1.  **Backup:** Before starting any upgrade, ensure you have a reliable backup of your Ozone metadata (OM DB, SCM DB) and configuration files.
2.  **Version Compatibility:** Consult the Ozone release notes for the target version to understand compatibility requirements and any specific steps or considerations.
3.  **Software Binaries:** Download and distribute the new Ozone software binaries to all nodes in the cluster.

## Upgrade Procedure (Non-Rolling)

Follow these steps to perform a non-rolling upgrade:

1.  **Prepare Ozone Manager (Optional, for OM HA):**
    *   If you are running Ozone 1.2.0+ with Ozone Manager High Availability (HA), prepare the OMs for the upgrade. This step takes a database snapshot and blocks write requests to ensure consistency. Run this on one OM node:
        ```bash
        ozone admin om prepare -id=<om-service-id>
        ```
        Replace `<om-service-id>` with your configured OM Service ID. Monitor the prepare status if needed. If you need to cancel the preparation, use `ozone admin om cancelprepare`.

2.  **Stop All Ozone Services:**
    *   Stop services in the recommended order: Recon, S3 Gateway, Datanodes, Ozone Manager(s), Storage Container Manager(s).
        ```bash
        # On respective nodes
        ozone --daemon stop recon
        ozone --daemon stop s3g
        ozone --daemon stop datanode
        ozone --daemon stop om
        ozone --daemon stop scm
        ```

3.  **Replace Software Binaries:**
    *   On each node, replace the old Ozone binaries and libraries with the downloaded binaries of the new version. Ensure file permissions and ownership are correct.

4.  **Start SCM and Datanodes:**
    *   Start the Storage Container Manager(s) and Datanodes using the standard start command. They will start with the new software but operate using their existing layout version.
        ```bash
        # On respective nodes
        ozone --daemon start scm
        ozone --daemon start datanode
        ```

5.  **Start Ozone Manager with `--upgrade` Flag:**
    *   Start the Ozone Manager(s) using the `--upgrade` flag. This flag signals the OM to perform any necessary metadata transformations for the new version while remaining compatible with the previous layout version initially.
        ```bash
        # On OM nodes
        ozone --daemon start om --upgrade
        ```
    *   **Important:** All OMs must be started with the `--upgrade` flag during this process. Starting some without it can lead to an inconsistent state.

6.  **Cluster Enters Pre-Finalized State:**
    *   At this point, the cluster is running the new software version but is "pre-finalized." It operates based on the layout version of the *previous* software version. New features requiring layout changes are disabled.
    *   Verify cluster health and basic operations.
    *   **Downgrade Option:** You can still downgrade from this state by stopping the cluster, replacing the binaries with the *previous* version, and restarting the components (using `ozone --daemon start om --upgrade` again when starting the OMs, which works for both upgrade and downgrade startup).

7.  **Finalize the Upgrade (Permanent):**
    *   Once you are confident in the stability of the upgraded cluster and wish to enable all new features, finalize the upgrade. **This step is irreversible and prevents future downgrading.**
    *   **a. Finalize SCM:** Run this on one SCM node.
        ```bash
        ozone admin scm finalizeupgrade
        ```
    *   **b. Finalize OM:** Run this on one OM node.
        ```bash
        ozone admin om finalizeupgrade -id=<om-service-id>
        ```
    *   Monitor the finalization status:
        ```bash
        ozone admin scm finalizationstatus
        ozone admin om finalizationstatus -id=<om-service-id>
        ```

8.  **Upgrade Complete:**
    *   The cluster is now fully upgraded and finalized to the new version, running with the new layout version. All features of the new version are enabled.

## Downgrade Procedure

Downgrading is **only possible** when the cluster is in the **pre-finalized state** (after step 5 and before step 7 of the upgrade procedure).

1.  **Stop All Ozone Services:** Stop services as described in Step 2 of the upgrade procedure.
2.  **Replace Software Binaries:** On each node, replace the *new* Ozone binaries with the binaries of the *previous* version you want to downgrade to.
3.  **Start SCM and Datanodes:** Start SCM(s) and Datanodes normally.
4.  **Start Ozone Manager with `--upgrade` Flag:** Start the Ozone Manager(s) using the `--upgrade` flag. Even though it's a downgrade, this flag handles the necessary startup logic for version transitions.
    ```bash
    # On OM nodes
    ozone --daemon start om --upgrade
    ```
5.  **Downgrade Complete:** The cluster is now running the previous software version. Since finalization for the newer version was never performed, it operates normally on its original layout version.

**Important:** You cannot downgrade after the `finalizeupgrade` commands (Step 7) have been successfully executed.
