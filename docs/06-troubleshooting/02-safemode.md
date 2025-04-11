---
sidebar_label: SCM Safe Mode
---

# Troubleshooting SCM Safe Mode

The Storage Container Manager (SCM) in Apache Ozone has a "Safe Mode," similar to the HDFS NameNode Safe Mode. It's a protective state SCM enters during startup to ensure the cluster is healthy and stable before allowing operations that modify data placement or state.

Understanding SCM Safe Mode is crucial for administrators and developers when diagnosing startup issues or apparent unresponsiveness of the cluster to write operations.

## What is SCM Safe Mode?

When SCM starts (or restarts), it needs to gather information from the DataNodes about the state of containers, pipelines, and the overall cluster topology. Until SCM has received enough information to have a reasonably complete and consistent view of the cluster, it operates in Safe Mode.

**Purpose:**

*   **Prevent Data Loss:** Avoid allocating blocks to potentially unavailable pipelines or making replication decisions based on incomplete container replica information.
*   **Ensure Consistency:** Allow DataNodes to register and report their container and pipeline status, enabling SCM to rebuild its internal state accurately.
*   **Stabilize Cluster:** Wait for a minimum number of nodes and resources to be available before enabling full cluster operation.

## Safe Mode Lifecycle

### Initialization and State Tracking

SCM automatically enters Safe Mode upon startup. The `SCMSafeModeManager` initializes and tracks the state using internal flags:

*   `inSafeMode`: Indicates if SCM is currently in safe mode.
*   `preCheckComplete`: Indicates if initial pre-checks (primarily DataNode registration) have completed.
*   `forceExitSafeMode`: Indicates if safe mode was exited manually by an administrator.

### Pre-Check Phase

The `DataNodeSafeModeRule` acts as a pre-check. Once the minimum number of required DataNodes have registered:

1.  The `preCheckComplete` flag is set to `true`.
2.  Safe mode status is updated internally.
3.  The `SCMServiceManager` is notified, potentially allowing some background services to start or prepare.
4.  Pipeline creation *might* be enabled if `hdds.scm.safemode.pipeline.creation` is set to `true` (default is `false`), even if SCM is still technically in Safe Mode waiting for other rules.

### Exit Process

SCM exits Safe Mode when **all** configured exit rules are satisfied.

*   **Automatic Exit:** When the last pending rule validates successfully, the `SCMSafeModeManager` transitions SCM out of Safe Mode.
*   **Manual Exit:** An administrator can force SCM out of Safe Mode using the CLI command `ozone admin scm safemode exit`. This sets `forceExitSafeMode` to `true`.

Upon exiting Safe Mode:
*   The `inSafeMode` flag is set to `false`.
*   The SCM context (`SCMContext`) is updated.
*   The `SCMServiceManager` notifies all background services (Replication Manager, Deletion Service, Balancer, etc.) that they can resume or begin full operation (potentially after an additional delay configured by `hdds.scm.wait.time.after.safemode.exit`).
*   SCM starts accepting all operations, including block allocation.

## Safe Mode Exit Rules

SCM uses a rule-based system (`SafeModeExitRule`) to determine when it's safe to exit. All configured rules must be satisfied.

### 1. DataNode Availability Rule (`DataNodeSafeModeRule`)

*   **Purpose:** Ensures a minimum number of DataNodes are registered and considered healthy.
*   **Condition:** The number of registered, healthy DataNodes meets the configured threshold.
*   **Events:** Processes `NODE_REGISTRATION_CONT_REPORT` events.
*   **Configuration:** `hdds.scm.safemode.min.datanode` (Default: `1`)
*   **Status Text Example:** `registered datanodes (=3) >= required datanodes (=1)`

### 2. Container Availability Rule (`ContainerSafeModeRule`)

*   **Purpose:** Ensures a high percentage of containers have at least one reported replica, indicating data availability.
*   **Condition:** The percentage of containers (both Ratis and EC) with at least one reported replica reaches the configured threshold. For EC containers, it checks if enough replicas are reported to meet the minimum required for reconstruction (data + parity).
*   **Events:** Processes `CONTAINER_REGISTRATION_REPORT` events.
*   **Configuration:** `hdds.scm.safemode.threshold.pct` (Default: `0.99`)
*   **Status Text Example:** `99.5% of [Ratis] Containers(195 / 196) with at least one reported replica (=0.99) >= safeModeCutoff (=0.99);`

### 3. Healthy Pipeline Rule (`HealthyPipelineSafeModeRule`)

*   **Purpose:** Ensures a sufficient percentage of pipelines are healthy (OPEN state) and ready to serve writes.
*   **Condition:** The percentage of healthy (OPEN) Ratis/THREE pipelines reaches the configured threshold.
*   **Events:** Processes `OPEN_PIPELINE` events (fired internally when a pipeline becomes healthy).
*   **Configuration:** `hdds.scm.safemode.healthy.pipeline.threshold.pct` (Default: `0.90`)
*   **Status Text Example:** `healthy Ratis/THREE pipelines (=4) >= healthyPipelineThresholdCount (=2)`

### 4. One-Replica Pipeline Rule (`OneReplicaPipelineSafeModeRule`)

*   **Purpose:** Ensures SCM is aware of the existence and location of most pipelines.
*   **Condition:** The percentage of existing OPEN Ratis/THREE pipelines for which at least one DataNode has sent a `PIPELINE_REPORT` reaches the configured threshold.
*   **Events:** Processes `PIPELINE_REPORT` events.
*   **Configuration:** `hdds.scm.safemode.one.node.reported.pipeline.pct` (Default: `0.80`)
*   **Status Text Example:** `reported Ratis/THREE pipelines with at least one datanode (=20) >= threshold (=18)`

### Rule Processing and Refresh

*   Rules listen for specific events (e.g., DataNode registration, pipeline reports) triggered by the `EventQueue`.
*   Upon receiving a relevant event, a rule updates its internal state (e.g., increments a counter).
*   It then checks if its validation condition (`validate()`) is met.
*   If a rule becomes satisfied, it notifies the `SCMSafeModeManager`.
*   The `SCMSafeModeManager` checks if *all* rules are now satisfied. If so, it initiates the Safe Mode exit process.
*   Rules can also be periodically refreshed (`refresh()`) to re-evaluate their status based on the current state of the `NodeManager`, `PipelineManager`, etc., ensuring eventual consistency even if events are missed.

## Impact of Safe Mode

While SCM is in Safe Mode:

*   **Block Allocation:** Client requests to allocate new blocks (part of writing data) will **fail**, typically with a `SCMException` indicating Safe Mode (`ResultCodes.SAFE_MODE_EXCEPTION`). This is the most common user-facing symptom.
*   **Pipeline Creation:** Usually **disabled** (unless `hdds.scm.safemode.pipeline.creation=true` and the pre-check phase is complete).
*   **Block Deletion:** The `SCMBlockDeletingService` is **paused**. Deleted blocks are queued but not sent to DataNodes for purging.
*   **Replication & Reconstruction:** The `ReplicationManager` is **paused**. Under-replicated or unhealthy containers/EC blocks are not repaired.
*   **Container Balancing:** The `ContainerBalancer` service is **paused** or its start is delayed.
*   **Node Decommissioning:** Progress might be stalled as replication cannot occur.
*   **Read Operations:** Generally **unaffected**. Clients can still read existing data provided the necessary DataNodes are available.
*   **Metadata Operations:** Operations handled solely by the Ozone Manager (e.g., listing keys, creating buckets) are generally **unaffected**.

## Monitoring Safe Mode Status

Administrators and developers can check SCM's Safe Mode status using several methods:

1.  **SCM Logs:** SCM logs messages upon entering Safe Mode and provides periodic updates on the status of the exit rules, indicating which rules are met and which are still pending. Look for messages from `SCMSafeModeManager` and specific rules like `ContainerSafeModeRule`.
    ```
    INFO scm.SCMSafeModeManager: SCM entering safe mode.
    INFO scm.SafeModeExitRule: SCM in safe mode. Rule DataNodeSafeModeRule requires 1 more datanodes. Current registered count is 0, required is 1.
    INFO scm.SafeModeExitRule: SCM in safe mode. Rule ContainerSafeModeRule requires 99.00% containers to have at least one reported replica. Current percentage is 0.00% (0/100).
    ...
    INFO scm.SCMSafeModeManager: SCM exiting safe mode.
    ```

2.  **SCM Web UI:** The SCM UI typically displays the current Safe Mode status prominently on its main page.

3.  **JMX Metrics:** The `SCMSafeModeManager` exposes metrics under the `Hadoop:service=SCM,name=SCMSafeModeManager` MBean via the `SafeModeMetrics` class. Key metrics include:
    *   `InSafeMode` (boolean)
    *   Metrics for each rule showing current counts vs. thresholds (e.g., `NumContainersWithOneReplicaReportedThreshold`, `CurrentContainersWithOneReplicaReportedCount`, `NumHealthyPipelinesThreshold`, `CurrentHealthyPipelinesCount`).

4.  **Ozone CLI:**
    *   **Check Status:**
        ```bash
        ozone admin scm safemode status [--scm <scm-host:port> | --scm-service-id <service-id>]
        ```
        Returns `SCM is in safe mode.` or `SCM is out of safe mode.`

    *   **Check Rule Details:**
        ```bash
        ozone admin scm safemode status --verbose [--scm <scm-host:port> | --scm-service-id <service-id>]
        ```
        Provides detailed status for each rule:
        ```
        SCM is in safe mode.
        Status of safe mode rules:
        DataNodeSafeModeRule = true (Registered datanodes = 3, required = 1)
        ContainerSafeModeRule = false (95.00% containers have at least one reported replica (190/200), required = 99.00%)
        HealthyPipelineSafeModeRule = true (100.00% pipelines are healthy (10/10), required = 90.00%)
        OneReplicaPipelineSafeModeRule = true (100.00% pipelines have at least one reported replica (10/10), required = 80.00%)
        ```

## Troubleshooting: Why is SCM Stuck in Safe Mode?

If SCM remains in Safe Mode for an extended period after startup, investigate the following:

1.  **Check Rule Status:** Use `ozone admin scm safemode status --verbose` to identify which specific rule(s) are not being met (`false`).
2.  **DataNode Issues:**
    *   **Rule:** `DataNodeSafeModeRule` is `false`.
    *   **Cause:** Not enough DataNodes are starting up or successfully registering with SCM.
    *   **Troubleshooting:** Check DataNode logs for startup errors, network connectivity issues between DataNodes and SCM, configuration mismatches (e.g., incorrect `ozone.scm.names`), or Kerberos authentication problems. Ensure `hdds.scm.safemode.min.datanode` is set appropriately for your cluster size.
3.  **Container Report Issues:**
    *   **Rule:** `ContainerSafeModeRule` is `false`.
    *   **Cause:** DataNodes are registered but haven't reported enough of their containers back to SCM yet, or a significant number of containers have zero reported replicas (potentially indicating widespread DataNode failures or data loss).
    *   **Troubleshooting:** Check DataNode logs for errors related to container scanning or reporting (`ContainerReport`). Verify DataNode disk health. Allow sufficient time after startup for reports to arrive (especially in large clusters). Check the `hdds.scm.safemode.threshold.pct` value – lowering it might allow exiting safe mode but could mask underlying data availability issues. Investigate why containers might be missing all replicas.
4.  **Pipeline Health/Reporting Issues:**
    *   **Rule:** `HealthyPipelineSafeModeRule` or `OneReplicaPipelineSafeModeRule` is `false`.
    *   **Cause:** DataNodes haven't reported the status of enough pipelines (`PipelineReport`), or too many pipelines are unhealthy (not OPEN). This often correlates with DataNode registration/heartbeat issues.
    *   **Troubleshooting:** Focus on DataNode health and connectivity. Check SCM logs for pipeline creation or closing errors. Ensure the thresholds (`hdds.scm.safemode.healthy.pipeline.threshold.pct`, `hdds.scm.safemode.one.node.reported.pipeline.pct`) are reasonable.

## Manually Exiting Safe Mode (Use with Caution!)

In rare emergency situations, an administrator can force SCM to exit Safe Mode even if the rules are not met.

**Command:**

```bash
ozone admin scm safemode exit [--scm <scm-host:port> | --scm-service-id <service-id>]
```
Upon successful execution, the command outputs: `SCM exit safe mode successfully.`

**WARNING:** Forcing exit bypasses the safety checks. If done prematurely (e.g., before enough container replicas are reported), SCM might make incorrect decisions leading to:
*   **Data Unavailability:** Trying to read data whose replicas haven't been reported yet.
*   **Potential Data Loss:** Deleting the last replica of a block because SCM wasn't aware of other replicas, or allocating blocks to unhealthy pipelines.

**Only use `forceExit` if you fully understand the state of the cluster and the risks involved.** It's generally better to diagnose and fix the underlying reason why SCM is stuck in Safe Mode.

### Waiting for Safe Mode Exit

For scripting or automation, you can wait for SCM to exit Safe Mode:

```bash
ozone admin scm safemode wait [--timeout <seconds>] [--scm <scm-host:port> | --scm-service-id <service-id>]
```
*   This command polls SCM periodically.
*   It exits with code 0 if SCM exits Safe Mode within the timeout.
*   It exits with code 1 if the timeout (default: 30 seconds) is reached before SCM exits.

## Configuration Options (`hdfs-site.xml` or `ozone-site.xml`)

| Parameter                                       | Default | Description                                                                 | Rule Affected                     |
| :---------------------------------------------- | :------ | :-------------------------------------------------------------------------- | :-------------------------------- |
| `hdds.scm.safemode.enabled`                     | `true`  | Enables/disables SCM Safe Mode entirely.                                    | All                               |
| `hdds.scm.safemode.min.datanode`                | `1`     | Minimum number of registered DataNodes required.                            | `DataNodeSafeModeRule`            |
| `hdds.scm.safemode.threshold.pct`               | `0.99`  | Percentage of containers needing at least one reported replica.             | `ContainerSafeModeRule`           |
| `hdds.scm.safemode.healthy.pipeline.threshold.pct`| `0.90`  | Percentage of OPEN pipelines that must be reported as healthy.              | `HealthyPipelineSafeModeRule`     |
| `hdds.scm.safemode.one.node.reported.pipeline.pct`| `0.80`  | Percentage of OPEN pipelines needing at least one DataNode report.          | `OneReplicaPipelineSafeModeRule`  |
| `hdds.scm.safemode.pipeline.creation`           | `false` | Allow pipeline creation after pre-check but before full Safe Mode exit?     | (Operation Impact)                |
| `hdds.scm.wait.time.after.safemode.exit`        | `5m`    | Delay after exiting Safe Mode before starting certain background services. | (Background Services)             |

## Best Practices

*   **Configuration:** For production, set `hdds.scm.safemode.min.datanode` appropriately (e.g., >= 3). Keep `hdds.scm.safemode.threshold.pct` high (e.g., 0.99 or 1.0) unless specific recovery scenarios demand otherwise. Adjust pipeline thresholds based on cluster size and reliability needs.
*   **Startup Order:** Start DataNodes before SCM to allow quicker registration and reporting, potentially reducing the time spent in Safe Mode.
*   **Monitoring:** Actively monitor Safe Mode status during startup and upgrades using logs, UI, metrics, or CLI commands. Alert if SCM remains in Safe Mode longer than expected.
*   **Avoid Force Exit:** Use `forceExit` only as a last resort in controlled situations. Prioritize diagnosing the root cause of delayed exit.
