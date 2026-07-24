---
sidebar_label: Storage Capacity Planning
---

# Storage Capacity Planning

In Apache Ozone, managing disk capacity is critical for maintaining high availability. Ozone uses a multi-layered approach to ensure that Datanodes do not run out of physical space, which could lead to data corruption or service hangs.

For background on Datanode volumes and related settings, see [Datanodes](../../../core-concepts/architecture/datanodes). Full property descriptions are in the [configuration appendix](../appendix).

## When is a Disk Considered "Full"?

A disk (or "Volume" in Ozone terminology) is considered **Full** for new data allocations and replication targets when the available physical space falls below a specific threshold.

This threshold is the sum of two "Reserved Space" configurations plus a safety buffer for the operation itself:

`Failure Threshold = (Volume Min Free Space) + (DU Reserved Space) + (Operation Buffer)`

If a volume's free space is less than this threshold, SCM will stop selecting this volume for new containers or as a destination for re-replication (including decommission and maintenance moves).

## Reserved Space Concepts

Ozone provides two types of reserved space to protect the system:

### 1. Volume Min Free Space

This is a safety margin managed by the Datanode to prevent the disk from ever reaching 100% capacity. It is the most important setting for capacity planning.

- **Purpose**: Protects the Datanode from OS-level disk-full errors and gives SCM headroom for placement decisions.
- **Configuration**:
  - `hdds.datanode.volume.min.free.space`: A fixed byte value (e.g., `20GB`) used together with the percent settings below. For each tier, the effective value is the **maximum** of this bytes setting and `capacity × ratio`.
  - **Soft limit** (`hdds.datanode.volume.min.free.space.percent`, default `0.02` or 2%): Reported to SCM in heartbeats as `freeSpaceToSpare`. SCM uses this for placement—new containers and re-replication targets avoid volumes below this headroom.
  - **Hard limit** (`hdds.datanode.volume.min.free.space.hard.limit.percent`, default `0.015` or 1.5%): Enforced locally on the Datanode. Writes are rejected when available space would drop below `max(capacity × hard limit percent, min.free.space bytes)`. Set the hard limit to be **less than or equal to** the soft limit so SCM plans with more headroom than the Datanode enforces for writes.
- **Soft band**: The gap between soft and hard limits (for example, on a 2 TB disk: 2% ≈ 40 GB reported to SCM vs 1.5% ≈ 30 GB hard limit → ~10 GB) is where the Datanode may close containers while writes can still succeed.

### 2. DU Reserved Space

This reserves space for non-Ozone files on the same disk (e.g., OS logs, system tools, or other services).

- **Purpose**: Prevents Ozone from consuming space that is intended for other uses on the host.
- **Configuration**:
  - `hdds.datanode.dir.du.reserved`: Fixed bytes per volume (e.g., `/data1:500MB`).
  - `hdds.datanode.dir.du.reserved.percent`: Percentage per volume (default is `0.0001` or 0.01%).

### 3. Operation Buffer (2x Container Size)

When Ozone replicates a container (e.g., during decommissioning), it requires space to hold the incoming data in a temporary directory before importing it.

- **Requirement**: Ozone requires free space equal to **2x the Container Size**.
- **Example**: For a default 5 GB container, this is **10 GB**.

## Configuration Parameters

| Property | Default | Description |
| :--- | :--- | :--- |
| `hdds.datanode.volume.min.free.space` | `-1` (often set to `20GB`) | Fixed minimum free space (bytes) combined with the percent settings; effective value is `max(bytes, capacity × ratio)` per tier. |
| `hdds.datanode.volume.min.free.space.percent` | `0.02` (2%) | Soft limit: minimum free-space fraction reported to SCM as `freeSpaceToSpare` for placement decisions. |
| `hdds.datanode.volume.min.free.space.hard.limit.percent` | `0.015` (1.5%) | Hard limit: minimum free-space fraction enforced locally for write rejection. Should be ≤ `min.free.space.percent`. |
| `hdds.datanode.dir.du.reserved` | (unset) | Fixed bytes reserved for non-Ozone use. |
| `ozone.scm.container.size` | `5GB` | The target size for containers. |
| `hdds.datanode.storage.utilization.warning.threshold` | `0.75` (75%) | Datanode-wide utilization above which SCM logs a warning while processing the node report. |
| `hdds.datanode.storage.utilization.critical.threshold` | `0.95` (95%) | Datanode-wide utilization above which SCM marks the Datanode out of space. |

## Inspecting Storage Usage

Administrators can inspect the actual and "SCM-usable" space using the Ozone CLI or the Recon Web UI.

### 1. Recon Web UI

The [Recon cluster capacity guide](../../operations/observability/recon/recon-web-ui/capacity) describes how to monitor cluster-wide storage:

- **Dashboards**: View aggregated capacity, used space, and remaining space for the entire cluster.
- **Datanodes Page**: Sort Datanodes by utilization to quickly identify nodes that are approaching their "Full" threshold.

### 2. Node Usage Summary (CLI)

To see a high-level view of how much space is used across the cluster:

```bash
ozone admin datanode usageinfo
```

This command shows the capacity, SCM used, and remaining space for each Datanode.

### 3. Per-Datanode Usage Summary

To see the aggregated capacity, usage, and remaining space for a specific Datanode:

```bash
ozone admin datanode usageinfo --node-id <datanode-uuid>
```

For per-volume breakdown on a node, use the **Datanodes** view in the Recon Web UI (see above).

## Concrete Examples

### Example 1: 1 TB Disk (Standard)

- **Capacity**: 1,024 GB
- **Min Free Space**: Max(20GB, 2% of 1TB) = **20.48 GB**
- **DU Reserved**: ~0.1 GB
- **Replication Buffer**: 10 GB
- **Full Threshold**: ~30.6 GB
- **Usable Capacity**: ~993 GB (**97% Full**)

### Example 2: 10.7 TB Disk (Large)

- **Capacity**: 10,956 GB
- **Min Free Space**: Max(20GB, 2% of 10.7TB) = **219.1 GB**
- **DU Reserved**: ~1.1 GB
- **Replication Buffer**: 10 GB
- **Full Threshold**: **~230.2 GB**
- **Usable Capacity**: ~10,725 GB (**97.9% Full**)

## What Happens When a Disk is Full?

From a user or client perspective, Ozone is designed to handle "Disk Full" conditions gracefully without data loss or system hangs.

### 1. Automatic Write Rejection

If a write request is sent to a Datanode that has reached its "Full" threshold, the Datanode will proactively reject the request. The client will receive a `DISK_OUT_OF_SPACE` error.

### 2. Client-Side Retries

The Ozone client is intelligent. When it encounters a disk-full error on one node, it will:

- **Failover**: Attempt to write the data to a different pipeline or Datanode that has available space.
- **Transparency**: In most cases, this retry happens automatically in the background, and the application (like Spark or Hive) continues to run without interruption.
- **Performance Impact**: However, if many Datanodes in the cluster are full, writes may feel significantly **slower**. This is because the client must sequentially experience rejections and perform retries until it successfully finds a Datanode with available space.

### 3. Automatic Container Sealing

When a Datanode detects that its volume is full, it informs the Storage Container Manager (SCM). The SCM then:

- **Closes the Containers**: Marks all "Open" containers on that full disk as "Closed."
- **Prevents Future Writes**: Stops directing any new write traffic to those specific containers.
- **Maintains Readability**: The data already stored on a full disk remains fully accessible for **Read** operations.

### 4. Preservation of System Stability

Because Ozone stops writing *before* the physical disk is 100% full (thanks to the **Reserved Space**), the Datanode remains healthy. It can still perform background tasks, report metrics, and serve read requests even when it can no longer accept new data.

---

**Tip for Users**: If you see `DISK_OUT_OF_SPACE` errors in your application logs, it is a signal that your cluster is reaching its usable capacity. While Ozone will try to find other nodes, you should contact your administrator to add more storage or delete unnecessary data.

When disks are unevenly utilized, use [Container Balancer](../../operations/data-balancing/container-balancer) and [Disk Balancer](../../operations/data-balancing/disk-balancer) to redistribute data. For hardware sizing guidance, see [Hardware and Sizing](../../installation/hardware-and-sizing).
