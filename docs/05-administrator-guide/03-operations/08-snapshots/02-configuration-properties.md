# Snapshot Configuration Properties

Key configurations for Ozone snapshots.

## Snapshot-Related Configuration Parameters

These parameters, defined in `ozone-site.xml`, control how Ozone manages snapshots.

### General Snapshot Management

| Property                                                 | Default Value                  | Description                                                                                                 |
| -------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `ozone.om.fs.snapshot.max.limit`                         | 10000                          | Max snapshots per bucket. Safety limit.                                                                     |
| `ozone.om.ratis.snapshot.dir`                            | ratis-snapshot under OM DB dir | The directory where OM Ratis snapshots are stored.                                                          |
| `ozone.om.ratis.snapshot.max.total.sst.size`             | 100000000                      | The maximum total size of SST files to be included in a Ratis snapshot.                                     |
| `ozone.om.snapshot.load.native.lib`                      | true                           | Use native RocksDB library for snapshot operations. Set to false as a workaround for native library issues. |
| `ozone.om.snapshot.checkpoint.dir.creation.poll.timeout` | 20s                            | Timeout for polling the creation of the snapshot checkpoint directory.                                      |

### SnapshotDiff Service

| Property                                                  | Default Value   | Description                                                                   |
| --------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------- |
| `ozone.om.snapshot.diff.db.dir`                           | OM metadata dir | Directory for SnapshotDiff job data. Use a spacious location for large diffs. |
| `ozone.om.snapshot.force.full.diff`                       | false           | Force a full diff for all snapshot diff jobs.                                 |
| `ozone.om.snapshot.diff.disable.native.libs`              | false           | Disable native libraries for snapshot diff.                                   |
| `ozone.om.snapshot.diff.max.page.size`                    | 1000            | Maximum page size for snapshot diff.                                          |
| `ozone.om.snapshot.diff.thread.pool.size`                 | 10              | Thread pool size for snapshot diff.                                           |
| `ozone.om.snapshot.diff.job.default.wait.time`            | 1m              | Default wait time for a snapshot diff job.                                    |
| `ozone.om.snapshot.diff.max.allowed.keys.changed.per.job` | 10000000        | Maximum number of keys allowed to be changed per snapshot diff job.           |

### Snapshot Compaction and Cleanup

| Property                                                     | Default Value | Description                                                                                                         |
| ------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| `ozone.snapshot.key.deleting.limit.per.task`                 | 20000         | The maximum number of keys scanned by the snapshot deleting service in a single run.                                |
| `ozone.om.snapshot.compact.non.snapshot.diff.tables`         | false         | When enabled, allows compaction of tables not tracked by snapshot diffs after snapshots are evicted from the cache. |
| `ozone.om.snapshot.compaction.dag.max.time.allowed`          | 30 days       | Window for efficient SnapshotDiff. Older diffs may be slower.                                                       |
| `ozone.om.snapshot.prune.compaction.backup.batch.size`       | 2000          | Batch size for pruning compaction backups.                                                                          |
| `ozone.om.snapshot.compaction.dag.prune.daemon.run.interval` | 10m           | Interval for the compaction DAG pruning daemon.                                                                     |
| `ozone.om.snapshot.diff.max.jobs.purge.per.task`             | 100           | Maximum number of snapshot diff jobs to purge per task.                                                             |
| `ozone.om.snapshot.diff.job.report.persistent.time`          | 7d            | Persistence time for snapshot diff job reports.                                                                     |
| `ozone.om.snapshot.diff.cleanup.service.run.interval`        | 1m            | Interval for the snapshot diff cleanup service.                                                                     |
| `ozone.om.snapshot.diff.cleanup.service.timeout`             | 5m            | Timeout for the snapshot diff cleanup service.                                                                      |
| `ozone.om.snapshot.cache.cleanup.service.run.interval`       | 1m            | Interval for the snapshot cache cleanup service.                                                                    |
| `ozone.snapshot.filtering.limit.per.task`                    | 2             | The maximum number of snapshots to be filtered in a single run of the snapshot filtering service.                   |
| `ozone.snapshot.deleting.limit.per.task`                     | 10            | The maximum number of snapshots to be deleted in a single run of the snapshot deleting service.                     |
| `ozone.snapshot.filtering.service.interval`                  | 60s           | Interval for the snapshot filtering service.                                                                        |
| `ozone.snapshot.deleting.service.timeout`                    | 300s          | Timeout for the snapshot deleting service.                                                                          |
| `ozone.snapshot.deleting.service.interval`                   | 30s           | Interval for the snapshot deleting service.                                                                         |
| `ozone.snapshot.deep.cleaning.enabled`                       | false         | Enable deep cleaning of snapshots.                                                                                  |

### Performance and Resource Management

| Property                                    | Default Value | Description                                                                  |
| ------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `ozone.om.snapshot.rocksdb.metrics.enabled` | false         | Enable detailed RocksDB metrics for snapshots. Use for debugging/monitoring. |
| `ozone.om.snapshot.cache.max.size`          | 10            | Maximum size of the snapshot cache soft limit.                               |
| `ozone.om.snapshot.db.max.open.files`       | 100           | Maximum number of open files for the snapshot database.                      |

### Snapshot Provider (Internal)

| Property                                        | Default Value | Description                                   |
| ----------------------------------------------- | ------------- | --------------------------------------------- |
| `ozone.om.snapshot.provider.socket.timeout`     | 5000s         | Socket timeout for the snapshot provider.     |
| `ozone.om.snapshot.provider.connection.timeout` | 5000s         | Connection timeout for the snapshot provider. |
| `ozone.om.snapshot.provider.request.timeout`    | 5m            | Request timeout for the snapshot provider.    |

## Recon-Specific Settings

These settings, defined in `ozone-default.xml`, apply specifically to Recon.

| Property                                      | Default Value | Description                                        |
| --------------------------------------------- | ------------- | -------------------------------------------------- |
| `ozone.recon.om.snapshot.task.initial.delay`  | 1m            | Initial delay for the OM snapshot task in Recon.   |
| `ozone.recon.om.snapshot.task.interval.delay` | 5s            | Interval for the OM snapshot task in Recon.        |
| `ozone.recon.om.snapshot.task.flush.param`    | false         | Flush parameter for the OM snapshot task in Recon. |
