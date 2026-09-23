---
sidebar_label: Decommissioning and Maintenance
---

# Troubleshooting Decommissioning and Maintenance

A Datanode moves from `DECOMMISSIONING` to `DECOMMISSIONED` only after every container it holds is sufficiently replicated on other nodes.
On a dense Datanode this takes hours, and on a large or busy cluster it can take days.
Slow is normal; stuck is not.
This page shows how to tell the two apart and what to do in each case.

SCM re-checks every decommissioning node each `ozone.scm.datanode.admin.monitor.interval` (default `30s`), and completes it once:

1. All pipelines on the node, Ratis and EC, have closed.
2. The node is alive and has reported its new operational state in a heartbeat.
3. Every container on the node is `CLOSED` or `QUASI_CLOSED` and has enough healthy replicas on other nodes. Containers in `DELETING` or `DELETED` state are ignored.

:::note Maintenance
A node entering maintenance goes through the same checks with a lower replica threshold: a Ratis container needs `hdds.scm.replication.maintenance.replica.minimum` (default `2`) replicas on other nodes, and an EC container needs its data replicas plus `hdds.scm.replication.maintenance.remaining.redundancy` (default `1`).
The status command below only lists `DECOMMISSIONING` nodes, so for a node stuck in `ENTERING_MAINTENANCE` use the [SCM log](#scm-log) and [metrics](#metrics) instead.
See [Datanode Maintenance Mode](../administrator-guide/operations/node-decommissioning-and-maintenance/datanodes/datanode-maintenance) for details.
:::

## Check the progress

### Decommission status command

Run the status command a few times, some minutes apart:

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

| What you see | Next step |
| --- | --- |
| `No. of UnderReplicated Containers` keeps decreasing | The decommission is progressing. If it is too slow, see [Make it faster](#make-it-faster). |
| `No. of Unclosed Pipelines` stays above zero | See [Pipelines do not close](#pipelines-do-not-close). |
| `No. of Unclosed Containers` stays above zero | See [Containers do not close](#containers-do-not-close). |
| `No. of UnderReplicated Containers` stays flat for several monitor intervals | See [Replication is stalled](#replication-is-stalled). |

### SCM log

On every monitor run SCM logs one line per node.
Compare consecutive lines to see whether `underReplicated` moves:

```text
<datanode> has 12405 sufficientlyReplicated, 17 deleting, 1834 underReplicated and 3 unclosed containers
```

While pipelines are still open, the line is `Waiting for pipelines to close for <datanode>. There are N pipelines` instead.
Each blocking container is logged as `Under Replicated Container <id> ...` or `Unclosed Container <id> ...`, with the state and location of its replicas, up to `ozone.scm.datanode.admin.monitor.logging.limit` (default `1000`) lines per node and category.

### Metrics

Import the [Ozone Datanode Decommission and Maintenance dashboard](https://github.com/apache/ozone/blob/master/hadoop-ozone/dist/src/main/compose/common/grafana/dashboards/Ozone%20-%20Datanode%20Decommission%20and%20Maintenance.json) into [Grafana](../administrator-guide/operations/observability/grafana).
It graphs the same counters as the status command, per node and in total, next to the SCM Replication Manager and Datanode replication metrics used on the rest of this page.
In a healthy decommission, under-replicated containers trend down and sufficiently replicated containers trend up.
Each metric is described in the [Datanode decommission guide](../administrator-guide/operations/node-decommissioning-and-maintenance/datanodes/datanode-decommission#metrics).

## Pipelines do not close

A small non-zero count during the first few minutes is expected: a closed pipeline is only removed from the node by the pipeline scrubber (`ozone.scm.pipeline.scrub.interval`, default `5m`) after it has stayed `CLOSED` for `ozone.scm.pipeline.destroy.timeout` (default `66s`).
If the count stays above zero for longer:

1. Run `ozone admin pipeline list` and find the pipelines that still include the node.
2. Check that the other Datanodes in those pipelines are healthy.

## Containers do not close

A container blocks the workflow while it is `OPEN` or `CLOSING`, and should close within a few heartbeats after its pipeline closes.
If it does not:

1. Take the container IDs from the `UnClosed` list of the status command, or from the `Unclosed Container` lines in the SCM log.
2. Run `ozone admin container info <containerID>` to see its state and replicas.
3. Check the Datanode logs on the replica nodes for errors closing that container.

A `QUASI_CLOSED` container does not block the workflow by itself, as long as its healthy replicas on `IN_SERVICE` nodes are also `QUASI_CLOSED`.

## Replication is stalled

Take a few IDs from the `UnderReplicated` list, search the SCM log for them, and match the message:

- **`Cannot replicate container <id> because no suitable targets were found`**: no Datanode can take a new replica.
  A target must be `IN_SERVICE`, healthy, have enough free space, not already hold a replica, and satisfy the rack placement policy.
  Add capacity, or recommission some nodes with `ozone admin datanode recommission` and decommission them in smaller batches.
- **`No sources with capacity available for replication of container <id>`**: every node that could serve as source is at its replication limit, and `ReplicateContainerCmdsDeferredTotal` climbs.
  Raise the per-Datanode limits, see [Make it faster](#make-it-faster).
- **`Datanode <dn> is dead and the admin workflow cannot continue`**: the decommissioning node died, and SCM put it back to `IN_SERVICE`.
  Its containers are re-replicated as ordinary under-replicated containers; if the node comes back, decommission it again.

If there is no such message but `ReplicationCmdsSentTotal` grows much faster than `ReplicasCreatedTotal`, the copies are failing or timing out.
Check `numFailureReplications` and `numTimeoutReplications` in the Datanode `ReplicationSupervisorMetrics`.
Each copy must finish within `hdds.scm.replication.event.timeout` (default `12m`), otherwise SCM retries it; for large containers on a slow link, raise the timeout or lower the replication limits so that each copy gets more bandwidth.

## Make it faster

Replication is throttled per Datanode and cluster-wide, and those throttles set the pace of the decommission.
Raise the one that is limiting you, in steps, and watch client latency, since every step adds replication load to the cluster.

| Symptom | Property to raise |
| --- | --- |
| `ReplicateContainerCmdsDeferredTotal` climbs | `hdds.scm.replication.datanode.replication.limit`, or `hdds.datanode.replication.outofservice.limit.factor` to raise it only for decommissioning nodes |
| SCM logs `The maximum number of pending replicas (<n>) are scheduled`, and `PendingReplicationLimitReachedTotal` climbs | `hdds.scm.replication.inflight.limit.factor` |
| `queueTime` of the `MeasuredReplicator` metrics is high on the decommissioning node | `hdds.datanode.replication.streams.limit`, or `hdds.datanode.replication.per.volume.streams.limit` if per-volume replication is enabled |

| Property | Default | Set on | Effect |
| --- | --- | --- | --- |
| `hdds.scm.replication.datanode.replication.limit` | `20` | SCM | Replication load that can be queued on one Datanode, counted as replication commands plus EC reconstruction commands × `hdds.scm.replication.datanode.reconstruction.weight` (default `3`). Reconfigurable. |
| `hdds.datanode.replication.outofservice.limit.factor` | `2.0` (`1`-`10`) | SCM **and** Datanodes | Multiplies the limit above, and the Datanode replication queue and thread pools, on decommissioning and maintenance nodes. Needs a restart. |
| `hdds.scm.replication.inflight.limit.factor` | `0.75` | SCM | Scales the cluster-wide cap of *healthy nodes × replication limit* replicas pending creation. `0` disables the cap. Reconfigurable. |
| `hdds.datanode.replication.streams.limit` | `10` | Datanodes | Replication threads on a Datanode. Limits outgoing copies only while `hdds.datanode.replication.per.volume.enabled` is `false` (default). Reconfigurable. |
| `hdds.datanode.replication.per.volume.streams.limit` | `2` | Datanodes | Outgoing copies per data volume when `hdds.datanode.replication.per.volume.enabled` is `true`. Reconfigurable. |

With the defaults, a decommissioning node can have 20 × 2 = 40 replication commands queued (each EC reconstruction command counts as 3), and all decommissioning nodes share a cluster-wide cap of *healthy nodes × 20 × 0.75* replicas pending creation.
Reconfigurable properties can be changed without a restart, see [Dynamic Property Reload](../administrator-guide/operations/dynamic-property-reload).

:::note
Raising the limits only helps if replication is slowly progressing.
If the under-replicated count is flat, go back to [Replication is stalled](#replication-is-stalled) first.
:::
