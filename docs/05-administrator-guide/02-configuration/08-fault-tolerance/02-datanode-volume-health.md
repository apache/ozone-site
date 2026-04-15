---
sidebar_label: Datanode Volume Health
---

# Datanode volume health

Ozone separates container scrubbing (checksum validation of container metadata and data) from volume health checks that probe whether the underlying disks are reliable. This page describes how the Datanode evaluates storage volumes, how failures are reported to SCM, and when the Datanode process chooses to exit.

For container checksum scanning, see [Container scanner](./container-scanner).

## Volume health checker

The Datanode runs a periodic volume health process that exercises the physical volumes used for data, metadata, or local databases:

- It runs on a configurable interval (see `hdds.datanode.periodic.disk.check.interval.minutes` below).
- It performs small read/write probes to see whether each volume responds reliably.
- If a volume fails the configured tolerance for these checks, it is marked FAILED. Containers on that volume are treated as lost to SCM so the cluster can recover using replicas elsewhere.

This does not replace the [container scanner](./container-scanner): volume checks answer “is the disk behaving?” while the container scanner answers “does this container’s data still match its checksums?”

## When a Datanode exits

If too many volumes fail, the Datanode stops rather than staying in the cluster without usable storage. Limits are defined per category of volume:

- Data volumes (`hdds.datanode.failed.data.volumes.tolerated`)
- Metadata volumes (`hdds.datanode.failed.metadata.volumes.tolerated`)
- RocksDB / local DB volumes (`hdds.datanode.failed.db.volumes.tolerated`)

Default `-1` means there is no fixed numeric cap in that category, but Ozone still expects at least one healthy volume of each type the node uses. If all volumes of a required type fail, the Datanode treats that as fatal and shuts down.

For how data, metadata, and DB directories are laid out on the node (`hdds.datanode.dir`, `hdds.datanode.container.db.dir`, and related keys), see the [configuration appendix](../appendix).

## Configuration reference

### Volume failure and disk checks (`hdds.datanode.*`)

| Key | Default | Description |
| --- | --- | --- |
| `hdds.datanode.failed.data.volumes.tolerated` | `-1` | Data volumes that may fail before the Datanode stops (`-1` = no fixed cap, but at least one good volume must remain). |
| `hdds.datanode.failed.metadata.volumes.tolerated` | `-1` | Same for metadata volumes. |
| `hdds.datanode.failed.db.volumes.tolerated` | `-1` | Same for RocksDB / local DB volumes. |
| `hdds.datanode.periodic.disk.check.interval.minutes` | `60` | How often the volume health checker runs. |
| `hdds.datanode.disk.check.io.test.count` | `3` | Number of recent I/O tests used to judge disk health. Set to `0` to disable disk I/O checks. |
| `hdds.datanode.disk.check.io.failures.tolerated` | `1` | How many of the last `io.test.count` checks may fail before the volume is marked failed. |
| `hdds.datanode.disk.check.io.file.size` | `100` (bytes) | Size of the temporary file used for read/write probes during a check. |
| `hdds.datanode.disk.check.timeout` | `10m` | Maximum time for one disk check before the disk is considered failed. |
| `hdds.datanode.disk.check.min.gap` | `10m` | Minimum time between two checks of the same volume. |

## See also

- [Configuration appendix](../appendix) — full defaults and advanced keys.
- [Container scanner](./container-scanner) — checksum scanning of containers.
