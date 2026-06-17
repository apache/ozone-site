---
sidebar_label: Heterogeneous deployments
---

# Heterogeneous deployments

<!--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

As production clusters grow, adding new capacity periodically is inevitable. Newer hardware batches typically introduce heterogeneous configurations, such as:

1. **Node-level heterogeneity:** Datanodes with different disk counts (e.g., 12 drives vs. 24 drives), larger disk capacities (e.g., 8TB drives vs. 16TB drives), or beefier CPU/RAM.
2. **Rack-level heterogeneity:** Racks of different storage densities (e.g., an older rack with 1PB total capacity next to a newer rack with 10PB).

The goal of a cluster administrator is to keep both storage usage and network/IO traffic balanced across all disks, Datanodes, and racks. Doing so ensures even wear on drives, high throughput, and easy maintenance.

This guide explains how Apache Ozone behaves in heterogeneous environments, outlines current capabilities and limitations, and provides concrete deployment recommendations. For step-by-step procedures to add nodes, disks, or memory, see [Cluster expansion](./cluster-expansion).

## Capabilities and limitations in Apache Ozone

Ozone provides several native mechanisms to balance storage across heterogeneous hardware, but also has key limitations regarding rack-level density.

### 1. Datanode-level balancing (capabilities)

Ozone handles different capacities and disk counts at the individual Datanode level very well:

- **Utilization-ratio balancing:** Ozone's write-path selection (for example, [`SCMContainerPlacementCapacity`](../configuration/performance/topology)) and background [Container Balancer](./data-balancing/container-balancer) evaluate storage in terms of **utilization ratio** (`used_space / capacity`) rather than raw byte count.
  - *Example:* If the cluster average utilization is 50%, a 100TB node will be balanced to ~50TB, and a 200TB node will be balanced to ~100TB.
- **DiskBalancer:** At the single-node level, if disks within the same Datanode have uneven utilization (e.g., after replacing a failed disk or adding new disks to empty slots), run the [Disk Balancer](./data-balancing/disk-balancer) to distribute containers evenly across local volumes.

### 2. Rack-level placement (limitations)

The primary limitation in Ozone's current architecture is the lack of rack capacity awareness:

- **Homogeneous rack assumption:** The default replication and placement policies—[`SCMContainerPlacementRackAware`](../configuration/performance/topology) (for Ratis 3-replica containers) and [`SCMContainerPlacementRackScatter`](../configuration/performance/topology) (for Erasure Coding)—do not factor in rack storage density or aggregate rack capacity.
- **Uniform topology selection:** SCM selects racks uniformly at random or round-robin using network topology mapping (`NetworkTopologyImpl#chooseRandom()`).
  - *Example:* If Rack A has 1PB capacity and Rack B has 10PB, the placement policy directs equal write traffic to both racks. Consequently, Rack A (1PB) will reach capacity **10 times faster** than Rack B (10PB).
- **Fault-tolerance fallback:** Once a lower-capacity rack is fully exhausted, SCM cannot satisfy the rack-safety policy for new writes. It must either fail the write allocation or fallback to placing multiple replicas on the remaining high-capacity racks, degrading rack-level fault tolerance.
- **No storage policies:** Advanced tiered storage policies (e.g., directory-based or bucket-based automatic tiering mapped to distinct rack topologies) are still under active development and not yet fully supported.

## Deployment strategies

When scaling a cluster with a new batch of denser or beefier hardware, administrators have several strategies to consider.

### Strategy 1: Add new disks to existing nodes

Upgrading the storage density of existing servers by replacing older drives or filling empty drive bays.

- **Pros:**
  - No additional rack space, power allocation, or switch ports are required.
  - Preserves the existing network topology mapping.
- **Cons:**
  - **Network and I/O saturation:** Older servers typically have slower CPU, RAM, and network interfaces (e.g., 10GbE). Tripling or quadrupling their storage capacity without upgrading the network interface will result in network choke points during high write or recovery cycles.
  - **JVM/GC overhead:** Datanodes with significantly larger capacities require more memory to manage local container metadata, which can lead to GC pauses and instability on older servers.
- **Recommendation:** **Avoid for major scaling.** Only use this to replace failed drives or to populate drive bays up to the server's original design specifications. See [Add a disk to an existing Datanode](./cluster-expansion#add-a-disk-to-an-existing-datanode) for the procedure.

### Strategy 2: Add new denser nodes to existing racks (recommended)

Installing new, high-capacity servers and distributing them evenly across your existing racks.

```text
Existing Rack 1                  Existing Rack 2
+-----------------------+        +-----------------------+
|  [Old Node] (100TB)   |        |  [Old Node] (100TB)   |
|  [Old Node] (100TB)   |        |  [Old Node] (100TB)   |
|  [New Node] (300TB)   | <New   |  [New Node] (300TB)   | <New
+-----------------------+        +-----------------------+
```

- **Pros:**
  - **Balances rack-level capacity:** The aggregate capacity of all racks increases proportionally, keeping the density difference between Rack 1 and Rack 2 minimal.
  - **Sidesteps placement limitations:** Because rack capacities stay relatively balanced, Ozone's uniform rack-aware placement policies will not cause any single rack to fill up prematurely.
  - **Resource-sized nodes:** New nodes bring newer CPUs, larger RAM, and faster network interfaces (25GbE/100GbE) sized to support their higher disk density.
- **Cons:**
  - Requires available rack space (U space), power budget, and switch ports within each existing rack.
- **Recommendation:** **Preferred strategy.** This is the easiest way to scale storage while ensuring the cluster remains balanced and maintenance-friendly. See [Add a new Datanode](./cluster-expansion#add-a-new-datanode) for the procedure.

### Strategy 3: Add new denser nodes as new racks

Rolling in new server racks populated entirely with the new dense hardware.

```text
Existing Rack 1 (1.2PB)          New Rack 2 (10PB)
+-----------------------+        +-----------------------+
|  [Old Node] (100TB)   |        |  [New Node] (1PB)     |
|  [Old Node] (100TB)   |        |  [New Node] (1PB)     |
|  ...                  |        |  ...                  |
+-----------------------+        +-----------------------+
```

- **Pros:**
  - Simplifies physical cabling and datacenter logistics.
  - Bypasses power or port limits on older rack switches.
- **Cons:**
  - **Causes severe data imbalance:** SCM's write-path allocation will send equal traffic to the 1.2PB rack and the 10PB rack, causing the 1.2PB rack to exhaust its space immediately.
  - **SPOF risk:** A single network switch failure on the new 10PB rack will temporarily offline a much larger percentage of the cluster's total data compared to an older rack failure.
- **Recommendation:** **Use only when physically required.** If you must add dense racks, actively configure and run the [Container Balancer](./data-balancing/container-balancer) to migrate data post-write from the old racks to the new racks, and plan to [decommission](./node-decommissioning-and-maintenance/datanodes/datanode-decommission) the older racks over time.

## Recommendations and best practices

To ensure easy maintenance, traffic balance, and seamless capacity expansion, follow these guidelines:

1. **Keep racks homogeneous in total capacity:** Always aim to keep the *total storage capacity* of your racks as close to equal as possible. It is perfectly fine to mix old (small) nodes and new (large) nodes within the same rack.
2. **Enable and configure Container Balancer:** Ensure [Container Balancer](./data-balancing/container-balancer) is active in `ozone-site.xml` to rebalance nodes when new hardware is added:

   ```xml
   <property>
     <name>hdds.container.balancer.utilization.threshold</name>
     <value>10</value> <!-- Target node utilization within 10% of cluster average -->
   </property>
   ```

3. **Run Disk Balancer on new nodes:** If you add new disks to existing nodes, trigger the [Disk Balancer](./data-balancing/disk-balancer) to ensure the new volumes are utilized.
4. **Plan for decommissioning:** When adding a new batch of hardware as a new rack, plan to [decommission](./node-decommissioning-and-maintenance/datanodes/datanode-decommission) an equivalent amount of older hardware (either entire old racks or older nodes in existing racks) to keep the rack-level density skew minimal.
