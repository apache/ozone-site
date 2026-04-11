---
sidebar_label: Container Scanner
---

# Ozone container scanner

The **container scanner** is a Datanode background service that helps protect against **silent data corruption** (“bit rot”) by verifying [storage containers](../../../core-concepts/replication/storage-containers) before clients read them. This page summarizes how it works, how failures propagate to [Storage Container Manager (SCM)](../../../core-concepts/architecture/storage-container-manager), and which settings operators tune.

For authoritative defaults and descriptions, use the [configuration appendix](../appendix) (search for `hdds.container.scrub` and `hdds.datanode`). Main scanner implementations in [`apache/ozone`](https://github.com/apache/ozone) are linked under [Scanner types](#scanner-types) below.

## Overview

Storage can corrupt data **without** an immediate I/O error. The container scanner **periodically validates** containers on each Datanode so problems surface **early**, while healthy replicas may still exist.

**Why it matters**

- **Early detection** — Bad replicas are flagged before a client depends on them.
- **Replication health** — SCM can keep the intended replica count by treating unhealthy copies as needing repair.
- **Automated recovery** — The Datanode reports container state to SCM; SCM’s replication machinery can schedule work using healthy copies (see also the [replication manager report](../../operations/container-replication-report)).

## Scanner types

Three paths balance coverage and cost:

| Type | What it does | Footprint |
| --- | --- | --- |
| **Background metadata scanner** | Validates **container metadata** and internal metadata structures. | One thread **across all volumes** on the Datanode; relatively light. |
| **Background data scanner** | Reads **payload** data and checks it against **stored checksums**. | **One thread per volume**, heavily **throttled** (bandwidth limit). |
| **On-demand scanner** | Runs when a container is **opened** or when corruption is **suspected** during normal I/O. | Uses its own throttle (`hdds.container.scrub.on.demand.volume.bytes.per.second` in the [appendix](../appendix)). |

Developer-only toggles `hdds.container.scrub.dev.metadata.scan.enabled` and `hdds.container.scrub.dev.data.scan.enabled` can turn off background metadata/data scanning for testing; do not use that in production clusters.

**Reference implementations** in [`apache/ozone`](https://github.com/apache/ozone) (`hadoop-hdds/container-service/.../ozoneimpl/`): [`AbstractBackgroundContainerScanner`](https://github.com/apache/ozone/blob/master/hadoop-hdds/container-service/src/main/java/org/apache/hadoop/ozone/container/ozoneimpl/AbstractBackgroundContainerScanner.java), [`BackgroundContainerMetadataScanner`](https://github.com/apache/ozone/blob/master/hadoop-hdds/container-service/src/main/java/org/apache/hadoop/ozone/container/ozoneimpl/BackgroundContainerMetadataScanner.java), [`BackgroundContainerDataScanner`](https://github.com/apache/ozone/blob/master/hadoop-hdds/container-service/src/main/java/org/apache/hadoop/ozone/container/ozoneimpl/BackgroundContainerDataScanner.java), [`OnDemandContainerScanner`](https://github.com/apache/ozone/blob/master/hadoop-hdds/container-service/src/main/java/org/apache/hadoop/ozone/container/ozoneimpl/OnDemandContainerScanner.java).

## Error handling and volume health

When a scanner finds corruption in a container:

1. **Mark unhealthy** — The Datanode marks the container **UNHEALTHY**.
2. **Tell SCM** — The next **heartbeat** carries that state so SCM can treat the replica as bad and plan **re-replication** from good copies.
3. **Volume check** — Because corruption may indicate **failing media**, the Datanode can trigger a **volume-level health check** on the underlying disk.

### Volume scanner (`StorageVolumeChecker`)

The **volume scanner** (see [`StorageVolumeChecker.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/container-service/src/main/java/org/apache/hadoop/ozone/container/common/volume/StorageVolumeChecker.java) in `apache/ozone`) probes **physical** volume health:

- Runs on a fixed cadence (default **60 minutes** — `hdds.datanode.periodic.disk.check.interval.minutes`).
- Performs small **read/write** checks to see whether the volume responds reliably.
- If the volume fails, it is marked **FAILED**; containers on it are treated as **lost** to SCM so the cluster can recover elsewhere.

Related keys: `hdds.datanode.disk.check.io.test.count`, `hdds.datanode.disk.check.io.failures.tolerated`, `hdds.datanode.disk.check.timeout`, `hdds.datanode.disk.check.min.gap` ([appendix](../appendix)). Setting `hdds.datanode.disk.check.io.test.count` to **0** disables disk I/O checks.

### When a Datanode exits

If **too many volumes fail**, the Datanode **stops** rather than staying in the cluster with no usable storage. Thresholds are per **volume category** (data, metadata, DB):

- **`hdds.datanode.failed.data.volumes.tolerated`**
- **`hdds.datanode.failed.metadata.volumes.tolerated`**
- **`hdds.datanode.failed.db.volumes.tolerated`**

Default **`-1`** means “no fixed cap” in that dimension, but Ozone still expects **at least one healthy volume of each type** the node uses. If **all** volumes of a required type fail, the Datanode treats that as **fatal** and shuts down.

For Datanode volume and directory layout, see `hdds.datanode.dir`, `hdds.datanode.container.db.dir`, and related keys in the [configuration appendix](../appendix).

## Configuration reference

### Container scrub (`hdds.container.scrub.*`)

| Key | Default | Description |
| --- | --- | --- |
| `hdds.container.scrub.enabled` | `true` | Master switch for container scanners. |
| `hdds.container.scrub.metadata.scan.interval` | `3h` | Time between **metadata** scan passes. |
| `hdds.container.scrub.data.scan.interval` | `7d` | Minimum time between **full data** scan **iterations** (if a pass finishes sooner, the scanner waits). |
| `hdds.container.scrub.volume.bytes.per.second` | `5242880` (~**5&nbsp;MiB/s**) | Per-volume **bandwidth cap** for **background** data scanning. |
| `hdds.container.scrub.min.gap` | `15m` | Minimum time before the **same** container is scanned again. |

### Datanode volume failure and disk checks (`hdds.datanode.*`)

| Key | Default | Description |
| --- | --- | --- |
| `hdds.datanode.failed.data.volumes.tolerated` | `-1` | Data volumes that may fail before the Datanode stops (`-1` = unlimited count, but at least one good volume must remain). |
| `hdds.datanode.failed.metadata.volumes.tolerated` | `-1` | Same for **metadata** volumes. |
| `hdds.datanode.failed.db.volumes.tolerated` | `-1` | Same for **RocksDB** volumes. |
| `hdds.datanode.periodic.disk.check.interval.minutes` | `60` | Interval for **volume scanner** runs. |
| `hdds.datanode.disk.check.io.test.count` | `3` | Number of recent I/O tests used to judge disk health. |
| `hdds.datanode.disk.check.timeout` | `10m` | Max time for one disk check before the disk is considered failed. |

## Tuning tips

- **Large disks** — If a full data pass cannot finish within your `data.scan.interval` at the default throttle, **raise** `hdds.container.scrub.volume.bytes.per.second` cautiously.
- **Latency-sensitive workloads** — If background scanning competes with foreground I/O, **lower** the per-volume byte limit.
- **Fail-fast nodes** — Tighten **`failed.*.volumes.tolerated`** (non-negative values) if you prefer the process to exit once a few volumes are bad, instead of running degraded.

## See also

- [Configuration appendix](../appendix) — authoritative defaults and descriptions.
- [Storage containers](../../../core-concepts/replication/storage-containers) — what a container is.
- [Replication manager report](../../operations/container-replication-report) — operational view of container replication.
