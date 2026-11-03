---
sidebar_label: Container Scanner
---

# Ozone container scanner

The container scanner is a Datanode background service that helps protect against silent data corruption (“bit rot”) by verifying [storage containers](../../../core-concepts/replication/storage-containers) even when clients are not reading them. This page summarizes how it works, how failures propagate to [Storage Container Manager (SCM)](../../../core-concepts/architecture/storage-container-manager), and which settings operators tune.

For authoritative defaults and descriptions, use the [configuration appendix](../appendix) (search for `hdds.container.scrub`).

## Overview

Storage can corrupt data without an immediate I/O error. The container scanner periodically validates containers on each Datanode so problems surface early, while healthy replicas may still exist.

Why it matters:

- Early detection — Bad replicas are flagged before a client depends on them.
- Replication health — SCM can keep the intended replica count by treating unhealthy copies as needing repair.
- Automated recovery — The Datanode reports container state to SCM; SCM’s replication manager can schedule work using healthy copies (see also the [replication manager report](../../operations/container-replication-report)).

## Scanner types

Three paths balance coverage and cost:

| Type | What it does | Threads | Bandwidth / throttling |
| --- | --- | --- | --- |
| Background metadata scanner | Validates container metadata and internal metadata structures. | One thread across all volumes on the Datanode. | Lightweight metadata work; not a heavy sequential read of payload data. |
| Background data scanner | Performs checksum validation on every byte of container payload data on the volume. | One thread per volume. | Read bandwidth is capped so scans avoid interfering with foreground workloads. |
| On-demand scanner | Runs metadata and data scans when corruption is suspected during normal I/O (and related cases). | Uses the on-demand scanner path (separate from periodic background scans). | Separate per-volume byte-rate limit from background scanning (see configuration reference below). |

## Error handling and volume health

When a scanner finds corruption in a container:

1. Mark unhealthy — The Datanode marks the container UNHEALTHY.
2. Tell SCM — The next heartbeat carries that state so SCM can treat the replica as bad and plan re-replication from good copies.
3. Volume check — Because corruption may indicate failing media, the Datanode may trigger volume-level health checks on the underlying disk.

Volume-level checks (periodic disk probes, failed-volume limits, and when a Datanode stops) are not container checksum scans; they are covered on [Datanode volume health](./datanode-volume-health).

## Configuration reference

### Container scrub (`hdds.container.scrub.*`)

| Key | Default | Description |
| --- | --- | --- |
| `hdds.container.scrub.enabled` | `true` | Master switch for container scanners. |
| `hdds.container.scrub.metadata.scan.interval` | `3h` | Minimum time between starting metadata scan passes. If a scan takes longer than this, the next scan will begin as soon as the current one finishes. |
| `hdds.container.scrub.data.scan.interval` | `7d` | Minimum time between starting full container data scans of the same volume. If a scan takes longer than this, the next scan will begin as soon as the current one finishes. |
| `hdds.container.scrub.volume.bytes.per.second` | `5242880` (~5&nbsp;MiB/s) | Per-volume bandwidth cap for background data scanning. |
| `hdds.container.scrub.on.demand.volume.bytes.per.second` | `5242880` (~5&nbsp;MiB/s) | Per-volume bandwidth cap for on-demand scanning. |
| `hdds.container.scrub.min.gap` | `15m` | Minimum time before the same container is scanned again. |

## Tuning tips

:::note
The background container data scanner can potentially take weeks to scan all container data on a volume. This pace is expected so that disk bandwidth stays available for foreground workloads.
:::

- Large disks — If a full data pass cannot finish within your desired `data.scan.interval` at the default throttle, raise `hdds.container.scrub.volume.bytes.per.second` cautiously to avoid taking too much disk I/O from foreground workloads.
- Latency-sensitive workloads — If background scanning competes with foreground I/O, lower the per-volume byte limit.
- Fail-fast nodes — On [Datanode volume health](./datanode-volume-health), tightening `failed.*.volumes.tolerated` (non-negative values) can make the process exit once several volumes are bad, instead of running degraded.

## See also

- [Configuration appendix](../appendix) — authoritative defaults and descriptions.
- [Datanode volume health](./datanode-volume-health) — periodic disk checks and shutdown when volumes fail.
- [Storage containers](../../../core-concepts/replication/storage-containers) — what a container is.
- [Replication manager report](../../operations/container-replication-report) — operational view of container replication.
