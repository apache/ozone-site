---
sidebar_label: Ozone Manager
---

# Replacing Ozone Manager Disks

**Audience:** Cluster Administrators

**Prerequisites:** Familiarity with Ozone cluster administration and Linux system administration.

---

## 1. Overview

When a disk containing the Ozone Manager (OM) metadata directory fails, proper recovery procedures are critical to maintain cluster availability and prevent data loss. This document provides comprehensive, step-by-step guidance for safely replacing failed disks on OM nodes, with distinct procedures for standalone and High-Availability (HA) configurations. Following these procedures correctly ensures minimal downtime and maintains the integrity of your Ozone cluster's metadata.

- **Purpose**
This guide provides the steps required to safely replace a failed disk on an Ozone Manager (OM) node.

- **Impact of OM Disk Failure**
The OM disk is critical as it stores the RocksDB database containing the entire object store namespace (volumes, buckets, keys) and block locations. A failure of this disk can lead to metadata loss if not handled correctly.

- **Crucial Distinction: HA vs. Non-HA**
The recovery procedure depends entirely on whether your OM is a single, standalone instance or part of a High-Availability (HA) Ratis-based quorum. The HA procedure is significantly safer and results in no cluster downtime. Running a standalone OM is not recommended for production environments.

---

## 2. Pre-flight Checks

Before starting, the administrator should:

1. **Identify the Failed Disk:** Use system tools (`dmesg`, `smartctl`, etc.) to confirm which disk has failed and its mount point.

2. **Identify OM Directories:** Check your `ozone-site.xml` to confirm which Ozone directories are on the failed disk. The most important ones are:
   - `ozone.om.db.dirs`: The primary OM metadata database (RocksDB). This directory stores the entire object store namespace.
   - `ozone.om.ratis.storage.dir`: The Ratis storage directory (if configured on a separate disk). This directory stores Ratis metadata like logs. If not explicitly configured, it falls back to `ozone.metadata.dirs`. For production environments, it is recommended to configure this on a separate, fast disk (preferably SSD) for better performance.

3. **Prepare the Replacement Disk:** Have a new, healthy disk physically installed, formatted, and mounted on the system at the same path as the failed disk. Ensure it has the correct ownership and permissions for the user that runs the OM process. The default permissions for OM metadata directories are **750** (configurable via `ozone.om.db.dirs.permissions`).

---

## 3. Procedure for a Standalone (Non-HA) Ozone Manager

This is a high-risk, manual disaster recovery process that will require cluster downtime.

1. **STOP THE ENTIRE CLUSTER:** Shut down all clients, Datanodes, SCM, and the Ozone Manager to prevent any further state changes.

2. **Attempt Data Recovery:** If the failed disk is still partially readable, make a best-effort attempt to copy the contents of the `ozone.om.db.dirs` directory to a safe, temporary location.

3. **If Recovery Fails, Restore from Backup:** If the OM database files are unrecoverable, you must restore from your most recent backup. This document does not cover the backup process itself, but it is the only path to recovery in this scenario.

4. **Replace and Configure Disk:** Physically replace the hardware and ensure the new, empty disk is mounted at the correct path defined in `ozone.om.db.dirs`.

5. **Restore Metadata:** Copy the recovered data **(from Step 2)** or the restored backup data **(from Step 3)** to the `ozone.om.db.dirs` path on the new disk.

6. **Restart and Verify:**
   - Start the SCM and Ozone Manager services.
   - Once the OM is running, start the Datanodes.
   - Run `ozone sh volume list` and other basic commands to verify that the namespace is intact and the cluster is operational.

---

## 4. Procedure for an HA (Ratis-based) Ozone Manager

This procedure is much safer, leverages the built-in redundancy of the OM HA cluster, and does not require full cluster downtime.

### Bootstrap Procedure

1. **STOP THE FAILED OM INSTANCE:** On the node with the failed disk, stop only the Ozone Manager process. The other OMs will continue operating, and one of them will remain the leader, serving client requests.

2. **Replace and Configure Disk:** Physically replace the hardware. Mount the new, empty disk at the path defined in `ozone.om.db.dirs` and ensure it has the correct ownership and permissions. If `ozone.om.ratis.storage.dir` was also on the failed disk, ensure it is properly configured on the new disk as well.

3. **Verify Configuration:** Before proceeding, ensure that all existing OMs have their `ozone-site.xml` configuration files updated with the configuration details of the OM being recovered (nodeId, address, port, etc.). The bootstrap process will verify this by checking all OMs' on-disk configurations. If an existing OM does not have updated configs, it can crash when bootstrap is initiated.

4. **RE-INITIALIZE THE OM:**
   - This is the key step. Since the local database is gone, the OM needs to be "reborn" by getting a complete copy of the latest state from the current OM leader.
   - Simply starting the OM process on the repaired node with an empty DB directory will trigger this process automatically. The OM process is designed
     to detect that it belongs to an existing Ratis ring but has no local state.

5. **START THE OM AND MONITOR:**
   - Start the Ozone Manager service on the repaired node (if not already started by the bootstrap command).
   - Tail the OM's log file (`.log` and `.out`). You should see messages indicating that it is connecting to the OM HA ring and that a "snapshot" is being installed. This means the current OM leader is streaming the entire metadata database to this new follower.
   - This process can take some time, depending on the size of your metadata.

6. **VERIFY:** Once the snapshot installation is complete, the OM will finish starting, join the Ratis ring as a follower, and begin receiving live updates.
   - You can check the OM Web UI on any of the OM nodes. The list of peers should now show all OMs as healthy.
   - Alternatively, use the command `ozone admin om roles -id <OM_SERVICE_ID>` to verify that all OMs are showing as LEADER or FOLLOWER.
   - The cluster is now back at full redundancy and the procedure is complete.

---

## 5. Additional Considerations

1. **Disk Space Requirements for Snapshots**
   - **Critical:** When an Ozone Manager (OM) acts as a follower in an HA setup, it downloads snapshot tarballs from the leader to its local metadata directory.
   - Always ensure your OM disks have **at least 2x the current OM database size** to accommodate the existing data and incoming snapshots.
   - This prevents disk space issues and maintains cluster stability during recovery operations.

2. **Separating Ratis Logs**
   - If you have configured `ozone.om.ratis.storage.dir` on a separate, dedicated disk (recommended for performance), a failure of that disk would follow the same HA recovery procedure.
   - The OM would automatically rebuild its Ratis logs from the other members of the ring when it starts.

3. **Disk Monitoring**
   - This procedure highlights the importance of actively monitoring disk health (`smartd`, etc.) to replace disks proactively before a catastrophic failure.
