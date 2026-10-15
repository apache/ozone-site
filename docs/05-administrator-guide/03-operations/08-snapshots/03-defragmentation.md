---
sidebar_label: Defragmentation
---

# Snapshot Defragmentation

Snapshot defragmentation reduces the disk space occupied by snapshot metadata on
Ozone Manager (OM). Long-lived snapshots can retain different RocksDB SST files
as the live OM database changes. Defragmentation rewrites snapshot metadata so
consecutive snapshots of a bucket share unchanged SST files and store changes
separately. The first snapshot in a bucket's snapshot chain requires full
defragmentation; later snapshots use incremental defragmentation.

This saves OM metadata space, not Datanode space occupied by snapshotted data
blocks. Snapshot names, contents, read operations, and SnapshotDiff commands
remain unchanged. For implementation details, see the
[snapshot defragmentation internals](../../../system-internals/features/snapshot-defragmentation).

## Prerequisites

- Use an Ozone version that supports snapshot defragmentation. After upgrading,
  complete [OM upgrade finalization](../upgrade-and-downgrade) before
  enabling the service.
- Keep snapshots enabled on OM (`ozone.filesystem.snapshot.enabled=true`, the
  default).
- The native rocks-tools library must be available on each OM. The service
  cannot defragment snapshots without it; check the OM logs for native library
  loading failures.
- Allow disk space for temporary rewritten snapshot metadata in the OM metadata
  directory. Defragmentation creates a new checkpoint before removing old
  versions, so disk usage can temporarily increase. Monitor OM CPU and disk I/O
  while the service runs.
- When OM admin authorization is enabled, run manual triggers as an Ozone administrator.
  On a secure cluster, authenticate with Kerberos before running the command.

Defragmentation runs locally on each OM, including both leaders and followers.
Enabling or triggering it on one OM does not defragment the other OMs' local
snapshot databases.

## Enable Periodic Defragmentation

Set the following properties in `ozone-site.xml` on every OM where
defragmentation should run:

| Property | Default | Purpose |
| :--- | :--- | :--- |
| `ozone.snapshot.defrag.service.interval` | `-1` | Interval between periodic runs. A positive duration enables the service; a value less than or equal to zero disables it. |
| `ozone.snapshot.defrag.limit.per.task` | `1` | Maximum number of snapshots to defragment in one task, including a manually triggered task. |
| `ozone.snapshot.defrag.service.timeout` | `300s` | Timeout for a background task run. |

For example, this configuration enables a periodic task every minute and keeps
the default limit of one snapshot per task:

```xml
<property>
  <name>ozone.snapshot.defrag.service.interval</name>
  <value>1m</value>
</property>
```

Restart the affected OMs after changing these settings. Choose the interval and
a positive task limit according to the snapshot backlog and available OM resources. The
service visits snapshots in creation order, skipping deleted snapshots and
snapshots that do not need defragmentation. Later runs continue processing the
remaining eligible snapshots.

To disable the service, set `ozone.snapshot.defrag.service.interval` back to
`-1` and restart the affected OMs. This also disables manual triggering;
snapshots that have already been defragmented remain usable.

## Trigger a Task Manually

The service must already be enabled with a positive interval on the target OM.
A manual trigger requests a task without waiting for the next periodic run.
Tasks on the same OM run one at a time, so a trigger can wait for an ongoing task.

Manual triggering is supported for an HA OM service. Specify both the service ID
and the target OM node ID:

```shell
ozone admin om snapshot defrag --service-id=omservice --node-id=om1
```

Replace `omservice` and `om1` with the IDs configured in `ozone.om.service.ids`
and `ozone.om.nodes.<service-id>`. Either a leader or a follower can be selected.
Repeat the command with the other OM node IDs if they also need a manual run.

By default, the command waits for the task to return. To return immediately
after submitting the task, add `--no-wait`:

```shell
ozone admin om snapshot defrag --service-id=omservice --node-id=om1 --no-wait
```

The command processes eligible snapshots on the selected OM, up to
`ozone.snapshot.defrag.limit.per.task`; it does not select a specific bucket or
snapshot. A successful command response does not mean all snapshots have been
defragmented, and `--no-wait` only confirms that the task was submitted. Check
the target OM's logs and metrics for progress and individual snapshot failures.

## Monitor Progress and Troubleshoot

In each OM's log, look for `Defragmenting snapshot:` followed by
`Completed defragmentation for snapshot:`. These messages include the snapshot
name and ID, and the completion message includes the elapsed time. Failures are
logged as `Exception while defragmenting snapshot:` with the snapshot ID and
exception details.

The `OmSnapshotInternalMetrics` source exposes these counters through OM
[metrics endpoints](../observability/prometheus). The Prometheus metric names are:

- `om_snapshot_internal_metrics_num_snapshot_defrag`: completed snapshot
  defragmentation operations.
- `om_snapshot_internal_metrics_num_snapshot_full_defrag` and
  `om_snapshot_internal_metrics_num_snapshot_inc_defrag`: completed full and
  incremental operations.
- `om_snapshot_internal_metrics_num_snapshot_defrag_fails`: failed snapshot
  defragmentation attempts.
- `om_snapshot_internal_metrics_num_snapshot_defrag_snapshot_skipped`: snapshots
  skipped because they are deleted or do not currently need defragmentation.

These counters are local to each OM and reset when it restarts. They count
operations, not distinct snapshots or the number of snapshots remaining. The
OM Snapshot Grafana dashboard also includes defragmentation metrics.

| Symptom | What to check |
| :--- | :--- |
| `Snapshot defragmentation service is not initialized` | Set a positive service interval on the target OM, restart it, and check for service startup errors. |
| `This is an HA OM cluster; specify --node-id` | Supply the configured OM node ID as well as the service ID. |
| `Only Ozone admins are allowed to trigger snapshot defragmentation manually` | When OM admin authorization is enabled, use an authenticated identity configured as an Ozone administrator. |
| `Rocks-tools native library is not available` | Check the target OM's native library loading errors and installation. |
| No snapshots are processed | Check upgrade finalization, snapshot availability, a positive task limit, and whether all eligible snapshots have already been defragmented. Review the OM logs even if the CLI returns successfully. |

Measure space savings using OM metadata filesystem usage. The referenced and
exclusive sizes shown by `ozone sh snapshot info` describe data blocks and do
not measure the snapshot metadata space reclaimed by defragmentation.
