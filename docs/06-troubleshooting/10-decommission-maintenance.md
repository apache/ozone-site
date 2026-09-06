---
sidebar_label: Decommissioning and Maintenance
---

# Troubleshooting Decommissioning and Maintenance

A Datanode moves from `DECOMMISSIONING` to `DECOMMISSIONED` only after every container it holds is sufficiently replicated on other nodes.
On a dense Datanode this takes hours, and on a large or busy cluster it can take days: the whole node has to be copied over the network while the cluster keeps serving normal traffic.
Slow is normal; stuck is not.
This page shows how to tell the two apart, what usually blocks the workflow, and which settings make it faster.

The same workflow (close pipelines, replicate containers, change state) is used when a Datanode enters maintenance, so the checks below apply to a node stuck in `ENTERING_MAINTENANCE` as well.

## How the workflow progresses

SCM's Datanode admin monitor re-checks every decommissioning node each `ozone.scm.datanode.admin.monitor.interval` (default `30s`).
A node completes only once all of the following hold:

1. All Ratis pipelines on the node have closed.
2. The Datanode has reported the new operational state in a heartbeat, so it must be alive.
3. Every container on the node is `CLOSED` or `QUASI_CLOSED`, its healthy replicas on `IN_SERVICE` nodes are in that same state, and there are enough of them. Containers in `DELETING` or `DELETED` state are ignored.

The copying itself is done by the SCM Replication Manager, which sends replicate-container commands to Datanodes.
Those commands are throttled per Datanode and cluster-wide.
SCM copies each container from whichever of its healthy replicas has the fewest replication commands queued.
The decommissioning node is allowed more queued commands than an in-service node, so it stays eligible as a source for longer.
Either way, the throttles set the pace of the whole decommission.

## Check the progress

### Decommission status command

```shell
ozone admin datanode status decommission [--node-id=<uuid> | --ip=<ipAddress>] [--json]
```

```text
Decommission Status: DECOMMISSIONING - 1 node(s)

Datanode: 6f1c...-...-... (/default-rack/10.0.0.12/dn12.example.com)
Decommission Started At : 01/09/2026 02:14:05 UTC
No. of Unclosed Pipelines: 0
No. of UnderReplicated Containers: 1834
No. of Unclosed Containers: 3
{UnderReplicated=[#1001, #1002, ...], UnClosed=[#1200, #1201, #1202]}
```

Run the command a few times, some minutes apart:

- `No. of UnderReplicated Containers` keeps decreasing: the decommission is progressing and just needs time. See [Making it faster](#making-it-faster).
- `No. of Unclosed Pipelines` stays above zero: see [Pipelines that do not close](#pipelines-that-do-not-close).
- `No. of Unclosed Containers` stays above zero while the under-replicated count reaches zero: see [Containers that do not close](#containers-that-do-not-close).
- `No. of UnderReplicated Containers` stays flat across several monitor intervals: replication is not happening. See [Replication is not making progress](#replication-is-not-making-progress).

### SCM log

On every monitor run SCM logs one summary line per tracked node:

```text
<datanode> has 12405 sufficientlyReplicated, 17 deleting, 1834 underReplicated and 3 unclosed containers
```

Compare consecutive lines to see whether `underReplicated` moves.
While pipelines are still open the line is `Waiting for pipelines to close for <datanode>. There are N pipelines` instead.
Each blocking container is also logged as `Under Replicated Container <id> <replicas>; <replica details>` or `Unclosed Container <id> <replicas>; <replica details>`, with the state and location of its replicas.
The number of such lines per node and per category is capped by `ozone.scm.datanode.admin.monitor.logging.limit` (default `1000`) unless DEBUG logging is enabled.

### Metrics

The SCM `NodeDecommissionMetrics` source (JMX bean `Hadoop:service=StorageContainerManager,name=NodeDecommissionMetrics`) exposes the same counters the status command prints, so they can be graphed in Grafana:

- `ContainersUnderReplicatedTotal`, `ContainersUnClosedTotal`, `ContainersSufficientlyReplicatedTotal` and `PipelinesWaitingToCloseTotal` across all tracked nodes.
- Per node, tagged with the `datanode` host name: `UnderReplicatedDN`, `UnclosedContainersDN`, `SufficientlyReplicatedDN` and `PipelinesWaitingToCloseDN`, plus `StartTimeDN`, the time the workflow started.

A healthy decommission shows `ContainersUnderReplicatedTotal` trending down and `ContainersSufficientlyReplicatedTotal` trending up.
To see how hard the cluster is replicating, pair them with the SCM `ReplicationManagerMetrics` (`InflightReplication`, `ReplicationCmdsSentTotal`, `ReplicasCreatedTotal`, `ReplicateContainerCmdsDeferredTotal`) and the Datanode-side replication metrics described in the [Datanode decommission guide](../administrator-guide/operations/node-decommissioning-and-maintenance/datanodes/datanode-decommission#metrics).

## Common causes

### Pipelines that do not close

The workflow does not look at containers until every pipeline on the node is gone.
SCM closes the node's pipelines and the containers in them right away, but a closed pipeline is only removed from the node by the pipeline scrubber (`ozone.scm.pipeline.scrub.interval`, default `5m`) once it has stayed `CLOSED` for `ozone.scm.pipeline.destroy.timeout` (default `66s`), so a small non-zero count during the first few minutes of the decommission is expected.
If `No. of Unclosed Pipelines` stays above zero for longer than that, look at `ozone admin pipeline list` for the pipelines still `CLOSED` with the node in them, and check that their other Datanodes are healthy.

### Containers that do not close

A container blocks the decommission while it is `OPEN` or `CLOSING`.
Once its pipeline is closed the container should close within a few heartbeats.
If it does not, look up its state and replicas with `ozone admin container info <containerID>`, and check the Datanode logs on the replica nodes for errors closing that container.
A `QUASI_CLOSED` container does not block the decommission by itself, as long as its healthy replicas on `IN_SERVICE` nodes are also `QUASI_CLOSED`; it then only needs enough replicas.

### Replication is not making progress

If the under-replicated count is flat, the Replication Manager cannot schedule copies, or the copies it schedules fail.
Look at the SCM log for the container IDs listed under `UnderReplicated` and check which of these applies:

- **No suitable target Datanodes.** SCM logs `Cannot replicate container <id> because no suitable targets were found`, and the placement policy reports `No enough datanodes to choose` or `Placement Policy: <policy> did not return any nodes`.
  A target must be `IN_SERVICE`, healthy, must not already hold a replica, must have enough free space for the container, and must satisfy the rack placement policy.
  This usually means too many nodes are decommissioning at the same time, the remaining nodes or racks are too few, or the remaining nodes are running out of space.
  Add capacity, or recommission some nodes with `ozone admin datanode recommission` and decommission them in smaller batches.
- **No source with capacity.** `ReplicateContainerCmdsDeferredTotal` climbs and SCM logs `No sources with capacity available for replication of container <id>`.
  Every node that could serve as source already has as many queued replication commands as it is allowed.
  This is the throttle described in [Making it faster](#making-it-faster).
- **Commands time out.** `ReplicationCmdsSentTotal` grows much faster than `ReplicasCreatedTotal`, and the Datanodes report replication failures or timeouts in their `ReplicationSupervisorMetrics` (`numFailureReplications`, `numTimeoutReplications`).
  Each command must finish within `hdds.scm.replication.event.timeout` (default `12m`), otherwise SCM retries it.
  Very large containers over a slow or congested link can miss that deadline every time; raise the timeout or reduce the concurrency so that each copy gets more bandwidth.
- **The decommissioning node is not heartbeating.** The node must confirm its new state, and its replicas are among the sources SCM copies from.
  If the node dies during the workflow, SCM logs `Datanode <dn> is dead and the admin workflow cannot continue` and puts it back to `IN_SERVICE`, after which the containers are handled as ordinary under-replicated containers.

## Making it faster

Replication is throttled in three places.
All of the values below can be raised, at the cost of more replication load on the cluster while the decommission runs; do it in steps and watch the Datanode replication metrics and client latency.

| Property | Default | Where | Effect |
| --- | --- | --- | --- |
| `hdds.scm.replication.datanode.replication.limit` | `20` | SCM | Maximum replication commands queued on one Datanode. Reconfigurable at runtime. |
| `hdds.datanode.replication.outofservice.limit.factor` | `2.0` (clamped to `1`-`10`) | SCM **and** Datanodes | Multiplier applied to the limit above, and to the Datanode replication queue and thread pool, for nodes that are decommissioning or in maintenance. |
| `hdds.scm.replication.inflight.limit.factor` | `0.75` | SCM | Scales the cluster-wide cap of *healthy nodes × replication limit*. `1` disables the extra scaling, `0` disables the cap. Reconfigurable at runtime. |
| `hdds.datanode.replication.streams.limit` | `10` | Datanodes | Replication threads on a Datanode, scaled by the out-of-service factor on decommissioning nodes. Raise it if the `MeasuredReplicator` `queueTime` metric is high on the decommissioning node. |

With the defaults, a decommissioning node is allowed 20 × 2 = 40 queued replication commands, and the whole cluster is capped at *healthy nodes × 20 × 0.75* in-flight replications.
If that cap is what limits you, several nodes decommissioning at once share it.

`hdds.datanode.replication.outofservice.limit.factor` has to be set on SCM as well as on the Datanodes: SCM uses it to decide how many commands to send, the Datanode uses it to size its queue and thread pool.
It is not reconfigurable, so a restart is needed for it to take effect.
The two SCM `hdds.scm.replication.*` properties marked reconfigurable can be changed without a restart, see [Dynamic Property Reload](../administrator-guide/operations/dynamic-property-reload).

:::note
Raising the limits only helps if the replication itself is the bottleneck.
If the under-replicated count is flat rather than slowly decreasing, go back to [Replication is not making progress](#replication-is-not-making-progress) first.
:::

A full description of every replication-related property and metric is in the [Datanode decommission guide](../administrator-guide/operations/node-decommissioning-and-maintenance/datanodes/datanode-decommission#tuning-and-monitoring-decommissioning).
