---
title: "No More Hotspots: Introducing the Automatic Disk Balancer in Apache Ozone"
authors: ["apache-ozone-community"]
date: 2025-12-09
tags: [Ozone, Disk Balancer, Ozone 2.2, Datanode]
---

**Disk Balancer** — a lightweight, automatic way to keep disk usage within each Datanode evenly distributed.

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

This runs independently on each Datanode; SCM just receives reports.

## Using Disk Balancer

CLI examples:

```bash
# Start on all datanodes
ozone admin datanode diskbalancer start -a

# Check status
ozone admin datanode diskbalancer status
```

Key settings include the density threshold, per-task throughput cap, parallel thread count, and whether to auto-stop once balanced.

## Benefits for operators

- **Even I/O load** across disks → more stable performance.
- **Smooth ops after hardware changes** (new or replaced disks).
- **Hands-off balancing** once enabled.
- **Clear metrics** for observability and troubleshooting.

It complements the existing Container Balancer: one works across nodes, the other within nodes.

## Closing Thoughts

Disk Balancer is small but impactful. It brings Ozone closer to being a fully self-healing, self-balancing object store — reducing hotspots, simplifying maintenance, and improving cluster longevity.

Ozone 2.2 will ship with this feature enabled via simple CLI controls and safe defaults. If you run long-lived clusters, this is a feature to watch.

For more information, check out [HDDS-5713](https://issues.apache.org/jira/browse/HDDS-5713).
