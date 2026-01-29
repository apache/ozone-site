---
title: "No More Hotspots: Introducing the Automatic Disk Balancer in Apache Ozone"
authors: ["apache-ozone-community","jojochuang", "0lai0","Gargi-jais11"]
date: 2026-01-29
tags: [Ozone, Disk Balancer, Ozone 2.2, Datanode]
---

Ever replaced a drive on a Datanode only to watch it become an I/O hotspot?
Or seen one disk hit 95% usage while others on the same machine sit idle?
These imbalances create performance bottlenecks and increase failure risk.
Apache Ozone's new intra-node Disk Balancer is designed to fix this—automatically.

<!-- truncate -->

Cluster-wide balancing in Ozone already ensures replicas are evenly spread across Datanodes. But inside a single Datanode, disks can still drift out of balance over time — for example after adding new disks, replacing hardware, or performing large deletions. This leads to I/O hotspots and uneven wear.

Disk Balancer closes that gap.

## Why Disk Balancer?

- **Disks fill unevenly** when nodes gain or lose volumes.

- **Large deletes** can empty some disks disproportionately.

- **Hot disks degrade performance** and become failure risks.

Even if the cluster is balanced, the node itself may not be. Disk Balancer fixes this automatically.

## How it works

The design ([HDDS-5713](https://issues.apache.org/jira/browse/HDDS-5713)) introduces a simple metric: **Volume Data Density** — how much a disk's utilization deviates from the node's average. If the deviation exceeds a threshold, the node begins balancing.

Balancing is local and safe:

- Only **closed containers** are moved.
- Moves happen entirely **within the same Datanode.**
- A scheduler periodically checks for imbalance and dispatches copy-and-import tasks.
- Bandwidth and concurrency are **operator-tunable** to avoid interfering with production I/O.

This runs independently on each Datanode. To use it, first enable the feature by setting `hdds.datanode.disk.balancer.enabled = true` in `ozone-site.xml` on your Datanodes. Once enabled, clients use `ozone admin datanode diskbalancer` commands to talk directly to Datanodes, with SCM only used to discover IN_SERVICE datanodes when running batch operations with `--in-service-datanodes`.

### Disk Balancing Policies

DiskBalancer uses simple but robust policies to decide **which disks to balance** and **which containers to move** (see the design doc for details: `diskbalancer.md` in [HDDS-5713](https://issues.apache.org/jira/browse/HDDS-5713)).

- **Default Volume Choosing Policy**: Picks the most over‑utilized volume as the source and the most under‑utilized volume as the destination, based on each disk’s **Volume Data Density** and the Datanode’s average utilization.
- **Default Container Choosing Policy**: Scans containers on the source volume and moves only **CLOSED** containers that are not already being moved. To avoid repeatedly scanning the same list, it caches container metadata with automatic expiry.

These defaults aim to make safe, incremental moves that converge the disks toward an even utilization state.

### Container Move Process

When DiskBalancer moves a container from one disk to another on the **same Datanode**, it follows a careful **"Copy-Validate-Replace"** flow (summarized from the design doc for [HDDS-5713](https://issues.apache.org/jira/browse/HDDS-5713)):

1. Create a temporary copy of the CLOSED container on the destination disk.
2. Transition that copy into a **RECOVERING** state and import it as a new container on the destination.
3. Once import and metadata updates succeed, delete the original CLOSED container from the source disk.

This ensures that data is always consistent: the destination copy is fully validated before the original is removed, minimizing risk during balancing.

## Using Disk Balancer

First, enable the Disk Balancer feature on each Datanode by setting the following in `ozone-site.xml`:

- `hdds.datanode.disk.balancer.enabled = true`

The Disk Balancer CLI supports two command patterns:

- `ozone admin datanode diskbalancer <command> --in-service-datanodes` - Operate on all **IN_SERVICE and HEALTHY** datanodes
- `ozone admin datanode diskbalancer <command> <dn-hostname/dn-ipaddress:port>` - Operate on a specific datanode

Available commands:

- **start** - Start the Disk Balancer on the target datanode(s)
- **stop** - Stop the Disk Balancer on the target datanode(s)
- **status** - Check the current Disk Balancer status
- **report** - Get a volume density report showing imbalance across disks
- **update** - Update Disk Balancer configuration settings

Examples:

```bash
# Start Disk Balancer
ozone admin datanode diskbalancer start --in-service-datanodes
or
ozone admin datanode diskbalancer start ozone-datanode-1 ozone-datanode-5

# user can also specifiy configuration parameters during start
ozone admin datanode diskbalancer start -t <value> -b <value> -p <value> -s <value> --in-service-datanodes
or
ozone admin datanode diskbalancer start -t <value> -b <value> -p <value> -s <value> ozone-datanode-1

# Stop Disk Balancer
ozone admin datanode diskbalancer stop --in-service-datanodes
or
ozone admin datanode diskbalancer stop 192.168.1.100:9860

# Check status
ozone admin datanode diskbalancer status --in-service-datanodes
or
ozone admin datanode diskbalancer status ozone-datanode-1

# Get volume density report
ozone admin datanode diskbalancer report --in-service-datanodes
or
ozone admin datanode diskbalancer report 192.168.1.100:9860

# Update configuration
ozone admin datanode diskbalancer update -t <value> -b <value> -p <value> -s <value> --in-service-datanodes
or
ozone admin datanode diskbalancer update -t <value> -b <value> -p <value> -s <value> ozone-datanode-1

### Configuration Parameters

The following parameters can be specified during **start** or **update configuration** Disk Balancer:

| Parameter | Short Flag | Default Value | Description |
| --------- | ---------- |---------------| ----------- |
| `--threshold` | `-t` | `10.0`        | Percentage deviation from average utilization of the disks after which a datanode will be rebalanced. |
| `--bandwidth-in-mb` | `-b` | `10`          | Maximum bandwidth for DiskBalancer per second. |
| `--parallel-thread` | `-p` | `5`           | Max parallel thread count for DiskBalancer. |
| `--stop-after-disk-even` | `-s` | `true`        | Stop DiskBalancer automatically after disk utilization is even. |

## Benefits for operators

- **Even I/O load** across disks → more stable performance.
- **Smooth ops after hardware changes** (new or replaced disks).
- **Hands-off balancing** once enabled.
- **Clear metrics** for observability and troubleshooting.

It complements the existing Container Balancer: one works across nodes, the other within nodes.

## Closing Thoughts

Disk Balancer is small but impactful. It brings Ozone closer to being a fully self-healing, self-balancing object store — reducing hotspots, simplifying maintenance, and improving cluster longevity.

Ozone 2.2 will ship with this feature available via simple CLI controls and safe defaults. If you run long-lived clusters, this is a feature to watch.

For more information, check out [HDDS-5713](https://issues.apache.org/jira/browse/HDDS-5713).
