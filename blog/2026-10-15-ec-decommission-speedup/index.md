---
title: "The Datanode That Wouldn't Leave: Speeding Up EC Decommission in Apache Ozone"
authors: ["apache-ozone-community", "jojochuang", "smengcl"]
date: 2026-10-15
tags: [Ozone, EC, Decommission, SCM, Observability]
# cspell:ignore decom HOL smengcl
---

You run `ozone admin datanode decommission`. The node flips to **DECOMMISSIONING**. You expect a few hours of background copying, then a clean shutdown.

Instead you get **days**.

Recon and the admin CLI show the same stubborn picture: hundreds or thousands of **under-replicated EC containers** still tied to that host. The count moves, but glacially. Other Datanodes look bored. The cluster is big; the decommission is not.

So you ask the obvious question: *We added nodes. Why doesn't decommission get faster?*

That question has a precise answer for EC—and **Apache Ozone 2.3.0** (upcoming) adds SCM behavior that addresses both bottlenecks.

<!-- truncate -->

## Two traps, one slow decommission

EC decommission felt stuck for **two separate reasons**. Fixing it meant addressing **both**.

### Trap 1: The decommissioning node is always the source

For EC during decommission, SCM's classic recovery path is **1:1 container replication**: copy the replica that lives on the leaving node to a new home.

For a given EC stripe, the replica on the decommissioning Datanode is the one that must be replaced. A **ReplicateContainer** job for that index reads **from that node**. It does not matter whether you have ten Datanodes or a thousand: **every such copy still pulls bytes off the host you are trying to drain**.

Adding Datanodes gives you more **targets** and more **placement** options. It does **not** give you more **sources** for copying each stripe off the `decom` node. The decommissioning Datanode remains the **choke point** for that work.

![EC decommission replicate source bottleneck](ec-decommission-replicate-bottleneck.svg)

### Trap 2: Head-of-line blocking on that choke point

The second trap is queueing on the same machine.

Thousands of EC containers may need copies before decommission can finish. Each 1:1 replicate consumes queue slots, disk concurrency, and network on **one** source. New work waits behind work already scheduled: classic **head-of-line (`HOL`) blocking**.

![Head-of-line blocking on decommissioning Datanode](ec-decommission-head-of-line.svg)

You get a double bind:

1. **Architectural:** replication tasks are anchored to the `decom` node as source.
2. **Operational:** those tasks stack up on that node's pipeline and disk.

More Datanodes do not break either lock by themselves.

## The way out: reconstruct across the cluster

Starting in **2.3.0**, SCM can change **what** it schedules when the `decom` node is saturated, instead of treating fleet growth as extra read bandwidth off the node you are draining.

**Shift work from replicate to reconstruct.** **EC reconstruction** rebuilds missing indexes from **several surviving fragments on other Datanodes**. SCM **offloads** the decommissioning node as a reconstruction source when enough healthy **IN_SERVICE** fragments exist elsewhere. That eases Trap 1: recovery no longer means reading every stripe from the node we are evicting.

**Break head-of-line on the hot path.** When the `decom` Datanode's replication **load** crosses a threshold, SCM may switch decommission-only indexes from 1:1 replicate to reconstruction. Parallel reconstruction across the fleet replaces a long **single-source** queue with work that does not all wait on one outbound pipe, targeting Trap 2.

If reconstruction is not viable (insufficient sources, overloaded targets, placement failure, or a **global reconstruction cap**), SCM **falls back to 1:1 replication**. Safety stays; you only take the fast path when the cluster can support it.

The feature is **off by default** until you enable it on SCM. Even when enabled, SCM uses reconstruction only after the decom Datanode's combined replicate/reconstruct queue crosses the load factor. It ships with reconfigurable limits and metrics so operators can confirm reconstruction is actually running during decommission.

![EC decommission reconstruction solution](ec-decommission-reconstruction.svg)

## Configuration

All keys are on SCM Replication Manager configuration, **reconfigurable**, and conservative by default:

| Property | Default | Role |
|----------|---------|------|
| `hdds.scm.replication.decommission.ec.reconstruction.enabled` | `false` | Enable load-based switch from replicate to reconstruct for EC decommission. |
| `hdds.scm.replication.decommission.ec.reconstruction.load.factor` | `0.9` | Treat `decom` source as hot when queue is at least this fraction of its effective replication limit. |
| `hdds.scm.replication.reconstruction.global.limit` | `0` | Cluster-wide inflight EC reconstruction cap (`0` = unlimited). |

**Rollout:** deploy metrics, set a sensible global limit, enable on a canary decommission, then watch whether reconstruction is actually triggered or you live in fallback counters.

## Metrics

On SCM (JMX / Prometheus metrics):

**Gauges:** `InflightEcReconstruction`, `EcReconstructionGlobalLimit`

**Decommission path:** `EcReconstructionDecommissionTriggeredTotal`, `EcReconstructionGlobalLimitReachedTotal`

**Fallback (why 1:1 replicate won):** `EcDecommissionReconstructionFallbackInsufficientSourcesTotal`, `EcDecommissionReconstructionFallbackTargetOverloadedTotal`, `EcDecommissionReconstructionFallbackNoOpTotal`

**Related:** `EcReconstructionCmdsSentTotal`, `EcReconstructionCmdsDeferredTotal` (global send-time deferral)

If `EcReconstructionDecommissionTriggeredTotal` stays flat while fallbacks climb, you are still in the replicate-from-`decom` world. Tune limits and load factor; do not assume fleet growth alone fixes decommission.

## Bottom line

EC decommission was slow because **every stripe copy was tied to the leaving node as source**, and **those copies piled up in one queue**. **Apache Ozone 2.3.0** lets SCM **move some recovery to reconstruction** (multi-source, off the `decom` node) when that node is the head of the line, with caps and safe fallback to 1:1 replicate when the cluster cannot support reconstruction.
