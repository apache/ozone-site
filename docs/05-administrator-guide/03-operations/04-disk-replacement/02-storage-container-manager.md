---
sidebar_label: Storage Container Manager
---

# Replacing Storage Container Manager Disks

**Audience:** Cluster Administrators

**Prerequisites:** Familiarity with Ozone cluster administration, especially SCM and its HA configuration.

---

## 1. Overview

When a disk containing the Storage Container Manager (SCM) metadata directory fails, proper recovery procedures are critical to maintain cluster availability and prevent data loss.

If the disk containing SCM metadata directory (`ozone.scm.db.dirs`) needs to be replaced for whatever reason, the SCM metadata directory will need to be reconstructed by running `ozone scm --bootstrap` (assuming SCM HA is configured).

- **Purpose :**
This guide details the procedure for replacing a failed disk on an SCM node.

- **Impact of SCM Disk Failure :**
The SCM disk is critical, as it stores the RocksDB database containing the state of the entire cluster's physical storage, including:
  - Pipeline information and states.
  - Container locations and replica information.
  - A failure of this disk without a proper recovery plan can render the cluster unable to manage storage or allocate new blocks.

- **Crucial Distinction: HA vs. Non-HA :**
The procedure depends entirely on whether your SCM is a single, standalone instance or part of a High-Availability (HA) Ratis-based quorum. Running a standalone SCM is a single point of failure and is not recommended for production environments.

---

## 2. Pre-flight Checks

Before starting, the administrator should:

1. **Identify the Failed Disk:** Use system tools (`dmesg`, `smartctl`, etc.) to confirm which disk has failed and its mount point.

2. **Identify SCM Directories:** Check your `ozone-site.xml` to confirm which Ozone directories are on the failed disk. The most important properties are:
   - `ozone.scm.db.dirs`: The primary SCM metadata database (RocksDB). This directory stores the entire cluster's block management metadata.
   - `ozone.scm.ha.ratis.storage.dir`: The location for SCM's internal HA Ratis logs (in an HA setup). This directory stores Ratis metadata like logs. If not explicitly configured, it falls back to `ozone.metadata.dirs`. For production environments, it is recommended to configure this on a separate, fast disk (preferably SSD) for better performance.
   - `ozone.scm.ha.ratis.snapshot.dir`: The directory where SCM stores snapshot tarballs downloaded from the leader during recovery. If not explicitly configured, it defaults to a component-specific location under `ozone.metadata.dirs`.

3. **Prepare the Replacement Disk:** Physically install a new, healthy disk. Format it and mount it at the same path as the failed disk. Ensure it has the correct ownership and permissions for the user that runs the SCM process. The default permissions for SCM metadata directories are **750** (configurable via `ozone.scm.db.dirs.permissions`).

---

## 3. Procedure for a Standalone (Non-HA) SCM

This procedure is a critical disaster recovery event that requires full cluster downtime and a valid backup.

1. **STOP THE ENTIRE CLUSTER:** Shut down all clients, Datanodes, OMs, and the SCM. Without a functional SCM, Datanodes cannot heartbeat and new block allocations will fail.

2. **Attempt Data Recovery:** If possible, make a best-effort attempt to copy the contents of the `ozone.scm.db.dirs` directory from the failing disk to a safe, temporary location.

3. **If Recovery Fails, Restore from Backup:** If the SCM database is unrecoverable, you must restore it from your most recent backup. Without a backup, you risk permanent data loss or a lengthy, complex, and potentially incomplete state reconstruction from Datanode reports.

4. **Replace and Configure Disk:** Physically replace the hardware and ensure the new, empty disk is mounted at the correct path defined in `ozone.scm.db.dirs`.

5. **Restore Metadata:** Copy the recovered data **(from Step 2)** or the restored backup data **(from Step 3)** to the `ozone.scm.db.dirs` path on the new disk.

6. **Restart and Verify:**
   - Start the SCM service first.
   - Once the SCM is fully initialized and running, start the OMs and then the Datanodes.
   - Check the SCM Web UI to confirm that Datanodes are sending heartbeats and that pipelines are healthy. Run client I/O tests to ensure the cluster is fully operational.

---

## 4. Procedure for an HA (Ratis-based) SCM

This is the recommended production procedure. It leverages the HA quorum for recovery, requires no cluster downtime, and is much safer.

### Bootstrap Procedure

1. **STOP THE FAILED SCM INSTANCE:** On the node with the failed disk, stop only the SCM process. The other SCMs will continue to operate, and one of them will remain the leader, managing the cluster.

2. **Replace and Configure Disk:** Physically replace the hardware. Mount the new, empty disk at the path(s) defined in `ozone.scm.db.dirs` and `ozone.scm.ha.ratis.storage.dir`. Ensure correct ownership and permissions. If `ozone.scm.ha.ratis.snapshot.dir` was also on the failed disk, ensure it is properly configured on the new disk as well.

3. **Verify Configuration:** Before proceeding, ensure that all existing SCMs have their `ozone-site.xml` configuration files updated with the configuration details of the SCM being recovered (nodeId, address, ports, etc.). The bootstrap process will verify connectivity to existing SCM instances.

4. **RE-INITIALIZE THE SCM VIA BOOTSTRAP:** The failed SCM has lost its state and must rejoin the HA cluster by getting a full copy of the latest state from the current leader. This is done using the `scm --bootstrap` command.
   - Run the bootstrap command:

     ```shell
     bin/ozone scm --bootstrap
     ```

   - The bootstrap command will:
     1. Connect to the existing SCM HA ring.
     2. Fetch the cluster ID from the current leader.
     3. Initialize the local SCM storage configuration with the cluster ID.
     4. Set up security certificates if security is enabled.

   :::note
   The bootstrap command does NOT start the SCM daemon. It only prepares the configuration and storage state. You must start the SCM service separately after bootstrap completes.
   :::

5. **START THE SCM AND MONITOR:**
   - Start the SCM service on the repaired node:

     ```shell
     ozone --daemon start scm
     ```

   - Monitor the console output and the SCM's log files (`.log` and `.out`). You will see messages indicating that:
     1. The SCM is connecting to the existing SCM HA ring.
     2. The leader SCM is creating a database checkpoint (snapshot).
     3. The checkpoint is being downloaded and installed locally.
     4. The SCM is joining the Ratis ring as a follower.
   - This process can take some time, depending on the size of your metadata and network bandwidth.

6. **VERIFY:**
   - Once the snapshot installation is complete and the SCM has joined the ring, check the **SCM Web UI** from any of the SCM nodes. The list of peers should now show all SCMs as healthy.
   - Alternatively, use the command `ozone admin scm roles -id <SCM_SERVICE_ID>` to verify that all SCMs are showing as LEADER or FOLLOWER.
   - The cluster is back at full redundancy and the procedure is complete.

---

## 5. Additional Considerations

### 5.1 Primordial SCM Node

- In an HA setup, the first SCM started with `scm --init` is the "primordial" node, which generates the cluster's unique ID.
- If the primordial node's disk fails, the recovery procedure is the same (`scm --bootstrap`).
- The cluster ID is preserved by the surviving SCMs and will be replicated to the repaired node during the bootstrap process.
- If you have configured `ozone.scm.primordial.node.id` in your configuration, the bootstrap command will automatically detect if it's being run on the primordial node and skip the bootstrap operation (since primordial nodes should use `scm --init`).
- However, after a disk replacement, even the primordial node should use `scm --bootstrap` to recover from the surviving SCMs.

### 5.2 Disk Space Requirements for Snapshots

- **Critical:** When an SCM acts as a follower in an HA setup and needs to recover, it downloads snapshot tarballs from the leader to its local snapshot directory (`ozone.scm.ha.ratis.snapshot.dir`).
- Always ensure your SCM disks have **at least 2x the current SCM database size** to accommodate the existing data and incoming snapshots.
- This prevents disk space issues and maintains cluster stability.

### 5.3 Backups are Still Essential

- Even in a robust HA configuration, maintaining regular, off-site backups of the SCM database is a critical best practice.
- Backups are essential for recovering from catastrophic multi-node failures or logical data corruption.

### 5.4 Bootstrap vs. Init

- The `scm --bootstrap` command is different from `scm --init`:
  - `scm --init`: Used only for the first SCM node (primordial node) to initialize a new cluster. Creates a new cluster ID.
  - `scm --bootstrap`: Used for additional SCM nodes joining an existing HA cluster, or for recovering a failed SCM node. Fetches the cluster ID from existing SCM instances.
- After a disk replacement, always use `scm --bootstrap`, even if the node was originally the primordial node.
