---
sidebar_label: Datanode Decommission
---

# Datanode Decommission

The Datanode decommission is the process that removes the existing Datanode from the Ozone cluster while ensuring that the new data should not be written to the decommissioned Datanode. When you initiate the process of decommissioning a Datanode, Ozone automatically ensures that all the storage containers on that Datanode have an additional copy created on another Datanode before the decommission completes. So, Datanode will keep running after it has been decommissioned and may be used for reads, but not for writes until it is stopped manually.

When we initiate the process of decommissioning, first we check the current state of the node, ideally it should be `IN_SERVICE`, then we change it's state to `DECOMMISSIONING` and start the process of decommissioning, it goes through a workflow where the following happens:

1. First an event is fired to close any pipelines on the node, which will also close any containers.
2. Next the containers on the node are obtained and checked to see if new replicas are needed. If so, the new replicas are scheduled.
3. After scheduling replication, the node remains pending until replication has completed.
4. At this stage the node will complete the decommission process and the state of the node will be changed to `DECOMMISSIONED`.

To check the current state of the Datanodes we can execute the following command,

```shell
ozone admin datanode list
```

To decommission a Datanode you can execute the following command in CLI,

```shell
ozone admin datanode decommission [-hV] [-id=<scmServiceId>]
       [--scm=<scm>] [<hosts>...]
```

You can enter multiple hosts to decommission multiple Datanodes together.

To view the status of a decommissioning Datanode, you can execute the following command:

```shell
ozone admin datanode status decommission [-hV] [-id=<scmServiceId>] [--scm=<scm>] [--id=<uuid>] [--ip=<ipAddress>]
```

You can pass the IP address or UUID of one Datanode to view only the details related to that Datanode.

**Note:** To recommission a Datanode you may execute the below command in CLI,

```shell
ozone admin datanode recommission [-hV] [-id=<scmServiceId>]
       [--scm=<scm>] [<hosts>...]
```

## Tuning and Monitoring Decommissioning

The process of decommissioning a Datanode involves replicating all its containers to other Datanodes in the cluster. The speed of this process can be tuned, and its progress can be monitored using several configuration properties and metrics.

### Configuration Properties

Administrators can adjust the following properties in `ozone-site.xml` to control the container replication speed during decommissioning. They are grouped by the component where they are primarily configured.

#### SCM-Side Properties

- `hdds.scm.replication.datanode.replication.limit`
  - **Purpose**: Defines the base limit for concurrent replication commands that the SCM will *send* to a single Datanode.
  - **Default**: `20`.
  - **Details**: The effective limit for a decommissioning Datanode is this value multiplied by `hdds.datanode.replication.outofservice.limit.factor`.

#### Datanode-Side Properties

- `hdds.datanode.replication.outofservice.limit.factor`
  - **Purpose**: A multiplier to increase replication capacity for `DECOMMISSIONING` or `MAINTENANCE` nodes. This is a key property for tuning decommission speed.
  - **Default**: `2.0`.
  - **Details**: Although this is a Datanode property, it must also be set in the SCM's configuration. The SCM uses it to send more replication commands, and the Datanode uses it to increase its internal resources (threads and queues) to handle the increased load.

- `hdds.datanode.replication.queue.limit`
  - **Purpose**: Sets the base size of the queue for incoming replication requests on a Datanode.
  - **Default**: `4096`.
  - **Details**: For decommissioning nodes, this limit is scaled by `hdds.datanode.replication.outofservice.limit.factor`.

- `hdds.datanode.replication.streams.limit`
  - **Purpose**: Sets the base number of threads for the replication thread pool on a Datanode.
  - **Default**: `10`.
  - **Details**: For decommissioning nodes, this limit is also scaled by `hdds.datanode.replication.outofservice.limit.factor`.

By tuning these properties, administrators can balance the decommissioning speed against the impact on the cluster's performance.

### Metrics

The following metrics can be used to monitor the progress of Datanode decommissioning. The names in parentheses are the corresponding Prometheus metric names, which may vary slightly depending on the metrics sink configuration.

#### SCM-side Metrics (`ReplicationManagerMetrics`)

These metrics are available on the SCM and provide a cluster-wide view of the replication process. During decommissioning, you should see an increase in these metrics. The name in parentheses is the corresponding Prometheus metric name.

- `InflightReplication` (`replication_manager_metrics_inflight_replication`): The number of container replication requests currently in progress.
- `replicationCmdsSentTotal` (`replication_manager_metrics_replication_cmds_sent_total`): The total number of replication commands sent to Datanodes.
- `replicasCreatedTotal` (`replication_manager_metrics_replicas_created_total`): The total number of container replicas successfully created.
- `replicateContainerCmdsDeferredTotal` (`replication_manager_metrics_replicate_container_cmds_deferred_total`): The number of replication commands deferred because source Datanodes were overloaded. If this value is high, it might indicate that the source Datanodes (including the decommissioning one) are too busy.

#### Datanode-side Metrics (`MeasuredReplicator` metrics)

These metrics are available on each Datanode. For a decommissioning node, they show its activity as a source of replicas. For other nodes, they show their activity as targets. The name in parentheses is the corresponding Prometheus metric name.

- `success` (`measured_replicator_success`): The number of successful replication tasks.
- `successTime` (`measured_replicator_success_time`): The total time spent on successful replication tasks.
- `transferredBytes` (`measured_replicator_transferred_bytes`): The total bytes transferred for successful replications.
- `failure` (`measured_replicator_failure`): The number of failed replication tasks.
- `failureTime` (`measured_replicator_failure_time`): The total time spent on failed replication tasks.
- `failureBytes` (`measured_replicator_failure_bytes`): The total bytes that failed to be transferred.
- `queueTime` (`measured_replicator_queue_time`): The total time tasks spend in the replication queue. A high value might indicate the Datanode is overloaded.

By monitoring these metrics, administrators can get a clear picture of the decommissioning progress and identify potential bottlenecks.
