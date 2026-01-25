---
sidebar_label: Recon
---

# Replacing Recon Disks

**Audience:** Cluster Administrators

**Prerequisites:** Familiarity with Ozone services and Linux system administration.

---

## 1. Overview

- **Purpose:**
  This guide provides the straightforward procedure for replacing a failed disk on an Ozone Recon node.

- **Role of Recon:**
  Recon is an auxiliary service that provides insights, visualization, and management for an Ozone cluster. It maintains a copy of metadata from the Ozone Manager (OM) and Storage Container Manager (SCM) to build its own database for analysis.

- **Impact of Recon Disk Failure:**
  A failure of the Recon disk will cause the Recon service to stop functioning. However, because Recon is not in the critical path for data I/O, this failure has **no impact on the core operations of your Ozone cluster**. Client reads and writes will continue normally. All data on the Recon disk can be fully rebuilt from OM and SCM.

:::note
Unlike critical services like OM or SCM, a Recon disk failure does **not impact core cluster operations**. Client reads and writes continue normally because Recon is not in the data I/O path. All data stored on the Recon disk can be fully rebuilt from the active OM and SCM services, making disk replacement a straightforward, low-risk procedure that can be performed without cluster downtime.
:::

When a Recon disk fails, the service will stop functioning, but upon restart with empty directories, Recon automatically detects the missing databases and initiates a complete rebuild by downloading fresh snapshots from the OM leader and syncing with SCM. This automatic recovery process ensures that all Recon databases—including the OM snapshot database, SCM snapshot database (if enabled), and Recon's own aggregated analysis databases—are fully reconstructed without manual intervention.

### Recon Database Directories

Recon uses several database directories that may be affected by disk failure:

- **`ozone.recon.db.dir`**: Stores Recon's primary RocksDB database, which contains aggregated data and analysis results (ContainerKey and ContainerKeyCount tables). This directory also typically contains the SQL database (default Derby) used for storing GlobalStats, FileCountBySize, ReconTaskStatus, ContainerHistory, and UnhealthyContainers tables.
- **`ozone.recon.om.db.dir`**: Stores the copy of the OM database snapshot that Recon uses as its source of truth for the namespace.
- **`ozone.recon.scm.db.dirs`**: Stores the copy of the SCM database snapshot (if SCM snapshot is enabled via `ozone.recon.scm.snapshot.enabled`). This contains information about Datanodes, pipelines, and containers.

If any of these directories are on the failed disk, they will need to be restored to the replacement disk.

---

## 2. Pre-flight Checks

Before starting, the administrator should:

1. **Identify the Failed Disk:** Use system tools (`dmesg`, `smartctl`, etc.) to confirm which disk has failed and its mount point.

2. **Identify Recon Directories:** Check your `ozone-site.xml` to confirm which Recon directories are on the failed disk. The primary properties are:
   - `ozone.recon.db.dir`: Stores Recon's primary RocksDB database, which contains aggregated data and analysis results.
   - `ozone.recon.om.db.dir`: Stores the copy of the OM database snapshot that Recon uses as its source of truth for the namespace.
   - `ozone.recon.scm.db.dirs`: Stores the copy of the SCM database snapshot (if SCM snapshot is enabled).
   - `ozone.recon.sql.db.jdbc.url`: The JDBC URL for the SQL database (defaults to `jdbc:derby:${ozone.recon.db.dir}/ozone_recon_derby.db` if not explicitly configured).

3. **Prepare the Replacement Disk:** Physically install a new, healthy disk. Format it and mount it at the same path as the failed disk. Ensure it has the correct ownership and permissions for the user that runs the Recon process. The default permissions for Recon metadata directories are **750** (configurable via `ozone.recon.db.dirs.permissions`).

---

## 3. Procedure for Replacing a Recon Disk

This is a low-risk recovery procedure that can be performed without any downtime for your main Ozone cluster.

1. **STOP THE Recon SERVICE:** On the Recon node, stop the Recon daemon. The rest of your Ozone cluster remains fully operational.

2. **Replace and Configure Disk:** Physically replace the hardware. Mount the new, empty disk at the path(s) defined in `ozone.recon.db.dir`, `ozone.recon.om.db.dir`, and `ozone.recon.scm.db.dirs` (if configured). Ensure the directories exist and have the correct ownership and permissions for the user that runs the Recon process.

3. **RE-START THE Recon SERVICE:** Simply start the Recon daemon again.

4. **MONITOR THE AUTOMATIC REBUILD PROCESS:**
   - Upon starting with empty directories, Recon will automatically begin to rebuild its state.
   - Check the Recon log files (`.log` and `.out`). You will see messages indicating that it is connecting to the active OM and SCM.

   **OM Snapshot Download:**
   - Recon will detect that its OM database is empty (by checking the sequence number, which will be 0 or negative).
   - When the sequence number is less than or equal to 0, Recon automatically triggers a full snapshot download from the OM leader.
   - This is the most time-consuming part of the process. Recon will download the snapshot as a tar file, extract it, and begin processing it to populate its own namespace database.
   - You will see log messages such as:

     ```shell
     Seq number of Recon's OM DB : 0
     Fetching full snapshot from Ozone Manager
     Obtaining full snapshot from Ozone Manager
     ```

   - The snapshot download happens via HTTP from the OM leader, and the extracted snapshot is stored in the `ozone.recon.om.db.dir` directory.

   **SCM Sync:**
   - Recon will also connect to the SCM to sync information about Datanodes, pipelines, and containers.
   - If SCM snapshot is enabled (`ozone.recon.scm.snapshot.enabled=true`, which is the default), Recon will initialize or download the SCM database snapshot.
   - If SCM snapshot is disabled, Recon will initialize pipeline information directly from SCM via RPC calls.
   - The SCM sync happens periodically (default interval: 24 hours) and also during initial startup.

   **Recon Database Rebuild:**
   - Once the OM snapshot is downloaded and processed, Recon's task framework will automatically process the metadata to rebuild:
     - ContainerKey and ContainerKeyCount tables (stored in RocksDB at `ozone.recon.db.dir`)
     - GlobalStats, FileCountBySize, and other SQL tables (stored in the SQL database)
     - Namespace summary information
   - This processing happens asynchronously and may take additional time depending on the size of your cluster's metadata.

5. **VERIFY:**
   - The initial data ingest and processing can take a significant amount of time, depending on the size of your cluster's metadata.
   - During this period, the Recon Web UI may be accessible but show incomplete or loading data.
   - Monitor the Recon logs for completion messages. Look for:
     - Successful snapshot download and installation
     - Task completion messages for various Recon tasks (NSSummaryTask, ContainerKeyMapperTask, etc.)
     - Sequence number updates indicating sync progress
   - Once the processing is complete, navigate the Recon UI to verify that the dashboard correctly displays cluster health, container information, and allows you to explore the namespace.
   - You can also check the Recon metrics endpoint to verify that sync operations have completed successfully.

---

## 4. Additional Considerations

### 4.1 No Data Loss Risk

- This procedure involves no risk of data loss for your actual stored objects.
- All data on the Recon disk is secondary and can be rebuilt.
- The Recon service is designed to automatically recover from empty or missing databases by fetching fresh snapshots from OM and SCM.

### 4.2 Performance Impact During Rebuild

- The initial OM DB snapshot download and processing can be resource-intensive (CPU, network, disk I/O) on both the Recon node and the OM leader.
- If your cluster is under very heavy load, consider performing this during off-peak hours to minimize any potential performance impact on the OM.
- The default initial delay before the first sync is 1 minute (configurable via `ozone.recon.om.snapshot.task.initial.delay`).

### 4.3 SCM Snapshot Configuration

- By default, SCM snapshot is enabled (`ozone.recon.scm.snapshot.enabled=true`).
- If you have disabled SCM snapshots, Recon will still sync container and pipeline information from SCM, but it will do so via RPC calls rather than downloading a database snapshot.
- The recovery procedure remains the same in both cases.

### 4.4 Disk Monitoring

- As with all services, actively monitoring disk health is a good practice to proactively manage hardware failures and avoid unexpected interruptions to the Recon service.
- Consider setting up monitoring alerts for disk space usage and disk health metrics.
