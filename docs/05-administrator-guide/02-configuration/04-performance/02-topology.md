---
sidebar_label: Topology
---

# Configuring Network Topology

Apache Ozone uses topology information (e.g., rack placement) to optimize data access and improve resilience. A fully rack-aware cluster needs:

1. Configured network topology.
2. Topology-aware Datanode selection for container replica placement (write path).
3. Prioritized reads from topologically closest Datanodes (read path).

## Applicability to Container Types

Ozone's topology-aware strategies apply differently depending on the operation:

- **Write Path (Open Containers):** When a client writes data, topology awareness is used during **pipeline creation** to ensure the set of Datanodes forming the pipeline are on different racks. This provides fault tolerance for the initial write.
- **Re-replication Path (Closed Containers):** When a replica of a **closed** container is needed (due to node failure, decommissioning, or balancing), a topology-aware policy is used to select the best Datanode for the new replica.

See the [page about Containers](../../../core-concepts/replication/storage-containers) for more information related to Open vs Closed containers.

## Configuring Topology Hierarchy

Ozone determines Datanode network locations (e.g., racks) using Hadoop's rack awareness, configured via `net.topology.node.switch.mapping.impl` in `ozone-site.xml`. This key specifies a `org.apache.hadoop.net.CachedDNSToSwitchMapping` implementation. [1]

:::note
Both Ozone Manager (OM) and Storage Container Manager (SCM) use network topology information. It is critical to maintain a consistent topology assignment across all OM and SCM instances in the cluster.
:::

Two primary methods exist:

### 1. Static List: `TableMapping` (Default)

This is the default implementation. It maps IPs/hostnames to racks using a predefined file. If no mapping file is specified, or if a Datanode is not found in the file, it is assigned to `/default-rack`.

- **Configuration:** Set `net.topology.node.switch.mapping.impl` to `org.apache.hadoop.net.TableMapping` and `net.topology.table.file.name` to the mapping file's path. [1]

  ```xml
  <property>
    <name>net.topology.node.switch.mapping.impl</name>
    <value>org.apache.hadoop.net.TableMapping</value>
  </property>
  <property>
    <name>net.topology.table.file.name</name>
    <value>/etc/ozone/topology.map</value>
  </property>
  ```

- **File Format:** A two-column text file (IP/hostname, rack path per line). [1]
  Example `topology.map`:

  ```text
  192.168.1.100 /rack1
  datanode101.example.com /rack1
  192.168.1.102 /rack2
  datanode103.example.com /rack2
  ```

### 2. Dynamic List: `ScriptBasedMapping`

Uses an external script to resolve rack locations for IPs.

- **Configuration:** Set `net.topology.node.switch.mapping.impl` to `org.apache.hadoop.net.ScriptBasedMapping` and `net.topology.script.file.name` to the script's path. [1]

  ```xml
  <property>
    <name>net.topology.node.switch.mapping.impl</name>
    <value>org.apache.hadoop.net.ScriptBasedMapping</value>
  </property>
  <property>
    <name>net.topology.script.file.name</name>
    <value>/etc/ozone/determine_rack.sh</value>
  </property>
  ```

- **Script:** Admin-provided, executable script. Ozone passes IPs (up to `net.topology.script.number.args`, default 100) as arguments; script outputs rack paths (one per line).
  Example `determine_rack.sh`:

  ```bash
  #!/bin/bash
  # This is a simplified example. A real script might query a CMDB or use other logic.
  while [ $# -gt 0 ] ; do
    nodeAddress=$1
    if [[ "$nodeAddress" == "192.168.1.100" || "$nodeAddress" == "datanode101.example.com" ]]; then
      echo "/rack1"
    elif [[ "$nodeAddress" == "192.168.1.102" || "$nodeAddress" == "datanode103.example.com" ]]; then
      echo "/rack2"
    else
      echo "/default-rack"
    fi
    shift
  done
  ```

Ensure the script is executable (`chmod +x /etc/ozone/determine_rack.sh`).

**Note:** For production environments, implement robust error handling and validation in your script. This should include handling network timeouts, invalid inputs, CMDB query failures, and logging errors appropriately. The example above is simplified for illustration purposes only.

**Topology Mapping Best Practices:**

- **Accuracy:** Mappings must be accurate and current.
- **Static Mapping:** Simpler for small, stable clusters; requires manual updates.
- **Dynamic Mapping:** Flexible for large/dynamic clusters. Script performance, correctness, and reliability are vital; ensure it's idempotent and handles batch lookups efficiently.

## Placement and Selection Policies

Ozone uses three distinct types of policies to manage how and where data is written.

### 1. Pipeline Creation Policy

This policy selects a set of Datanodes to form a new pipeline. Its purpose is to ensure new pipelines are internally fault-tolerant by spreading their nodes across racks, while also balancing the number of pipelines across the Datanodes. This is the primary mechanism for topology awareness on the write path for open containers.

The policy is configured by the `ozone.scm.pipeline.placement.impl` property in `ozone-site.xml`.

- **`PipelinePlacementPolicy` (Default)**

  - **Function:** This is the default and only supported policy for pipeline creation. It chooses Datanodes based on load balancing (pipeline count per node) and network topology. It filters out nodes that are too heavily engaged in other pipelines and then selects nodes to ensure rack diversity. This policy is recommended for most production environments.
  - **Use Cases:** General purpose pipeline creation in a rack-aware cluster.

### 2. Pipeline Selection (Load Balancing) Policy

After a pool of healthy, open, and rack-aware pipelines has been created, this policy is used to **select one** of them to handle a client's write request. Its purpose is **load balancing**, not topology awareness, as the topology has already been handled during pipeline creation.

The policy is configured by `hdds.scm.pipeline.choose.policy.impl` in `ozone-site.xml` for Ratis containers, and `hdds.scm.ec.pipeline.choose.policy.impl` for EC containers. All of the following policies are supported by both Ratis and EC containers.

- **`RandomPipelineChoosePolicy` (Default):** Selects a pipeline at random from the available list. This policy is simple and distributes load without considering other metrics.
- **`CapacityPipelineChoosePolicy`:** Picks two random pipelines and selects the one with lower utilization, favoring pipelines with more available capacity.
- **`RoundRobinPipelineChoosePolicy`:** Selects pipelines in a round-robin order. This is mainly for debugging and testing.
- **`HealthyPipelineChoosePolicy`:** Randomly selects pipelines but only returns a healthy one.

Note: When configuring these values, include the full class name prefix: for example, `org.apache.hadoop.hdds.scm.pipeline.choose.algorithms.CapacityPipelineChoosePolicy`

### 3. Closed Container Replication Policy

#### Ratis containers

This is configured using the `ozone.scm.container.placement.impl` property in `ozone-site.xml` for Ratis containers. The available policies are:

- **`SCMContainerPlacementRackAware` (Default)**

  - **Function:** Distributes the Datanodes of a pipeline across racks for fault tolerance (e.g., for a 3-node pipeline, it aims for at least two racks). Similar to HDFS placement. [1]
  - **Use Cases:** Production clusters needing rack-level fault tolerance.
  - **Limitations:** Designed for single-layer rack topologies (e.g., `/rack/node`). Not recommended for multi-layer hierarchies (e.g., `/dc/row/rack/node`) as it may not interpret deeper levels correctly. [1]

- **`SCMContainerPlacementRandom`**

  - **Function:** Randomly selects healthy, available Datanodes, ignoring rack topology. [3]
  - **Use Cases:** Small/dev/test clusters where rack fault tolerance is not critical.

- **`SCMContainerPlacementCapacity`**
  
  - **Function:** Selects Datanodes by available capacity (favors lower disk utilization) to balance disk usage across the cluster. [4]
  - **Use Cases:** Heterogeneous storage clusters or where even disk utilization is key.

Note: When configuring these values, include the full class name prefix: for example, `org.apache.hadoop.hdds.scm.container.placement.algorithms.SCMContainerPlacementCapacity`

#### EC containers

For Erasure Coded (EC) containers, SCM employs a specialized placement policy to ensure data resilience and availability by distributing data and parity blocks across multiple racks. This is configured using the `ozone.scm.container.placement.ec.impl.key` property in `ozone-site.xml`.

- **`SCMContainerPlacementRackScatter` (Default)**

  - **Function:** This is the default policy for EC containers. It attempts to place each block (both data and parity) of an EC container on a different rack. For example, for an RS-6-3-1024k container (6 data blocks + 3 parity blocks), this policy will try to place the 9 blocks on 9 different racks. This "scatter" approach maximizes the fault tolerance, as the loss of a single rack will not impact more than one block of the container. [5]
  - **Use Cases:** This policy is highly recommended for production clusters using Erasure Coding to protect against rack-level failures.
  - **Configuration:**

    ```xml
    <property>
      <name>ozone.scm.container.placement.ec.impl.key</name>
      <value>org.apache.hadoop.hdds.scm.container.placement.algorithms.SCMContainerPlacementRackScatter</value>
    </property>
    ```

  - **Behavior:** If the number of available racks is less than the number of blocks in the EC group, the policy will start placing more than one block on the same rack, while trying to keep the distribution as even as possible.
  - **Limitations:** Similar to `SCMContainerPlacementRackAware`, this policy is designed for single-layer rack topologies (e.g., `/rack/node`) and is not recommended for multi-layer hierarchies.

## Optimizing Read Paths

This feature, enabled by default since Ozone 1.4.0 (HDDS-8300), directs clients to read from the topologically closest Datanodes for replicated data, reducing latency and cross-rack traffic. It is recommended to keep this enabled when you have an accurate topology configuration.

If you need to disable it, set `ozone.network.topology.aware.read` to `false` in `ozone-site.xml`:

```xml
<property>
  <name>ozone.network.topology.aware.read</name>
  <value>false</value>
</property>
```

## Summary of Best Practices

- **Accurate Topology:** Maintain an accurate, up-to-date topology map (static or dynamic script); this is foundational.
- **Pipeline Creation:** For production environments, use the default `PipelinePlacementPolicy` for `ozone.scm.pipeline.placement.impl` to ensure both rack fault tolerance and pipeline load balancing.
- **Pipeline Selection:** The default `RandomPipelineChoosePolicy` for `hdds.scm.pipeline.choose.policy.impl` is suitable for general load balancing.
- **Replicated (RATIS) Containers:** For production, use `SCMContainerPlacementRackAware` (mindful of its single-layer topology limitation) or `SCMContainerPlacementCapacity` (balanced disk usage) over `SCMContainerPlacementRandom`.
- **Erasure Coded (EC) Containers:** For production rack fault tolerance, use `SCMContainerPlacementRackScatter`.
- **Read Operations:** Enable `ozone.network.topology.aware.read` with accurate topology.
- **Monitor & Validate:** Regularly monitor placement and balance; use tools like Recon to verify topology awareness.

## References

1. [Hadoop Documentation: Rack Awareness](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/RackAwareness.html).
2. [Ozone Source Code: container placement policies](https://github.com/apache/ozone/tree/master/hadoop-hdds/server-scm/src/main/java/org/apache/hadoop/hdds/scm/container/placement/algorithms). (For implementations of pluggable placement policies).
3. [Ozone Source Code: `SCMContainerPlacementRandom.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/server-scm/src/main/java/org/apache/hadoop/hdds/scm/container/placement/algorithms/SCMContainerPlacementRandom.java).
4. [Ozone Source Code: `SCMContainerPlacementCapacity.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/server-scm/src/main/java/org/apache/hadoop/hdds/scm/container/placement/algorithms/SCMContainerPlacementCapacity.java).
5. [Ozone Source Code: `SCMContainerPlacementRackScatter.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/server-scm/src/main/java/org/apache/hadoop/hdds/scm/container/placement/algorithms/SCMContainerPlacementRackScatter.java).
