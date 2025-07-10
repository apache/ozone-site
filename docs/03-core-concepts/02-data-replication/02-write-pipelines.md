# Write Pipelines

Write pipelines are a fundamental component of Apache Ozone's storage architecture, enabling reliable data storage across distributed nodes. This document provides a comprehensive overview of write pipelines, covering both replication and erasure coding approaches, their architecture, implementation details, and usage patterns.

## What are Write Pipelines?

Write pipelines are groups of Datanodes that work together as a unit to store and replicate data in Ozone. They serve as the foundation for Ozone's data redundancy strategy, providing:

- A coordinated path for write operations across multiple nodes
- Consistency guarantees for data replication
- Efficient management of data distribution and storage

The Storage Container Manager (SCM) is responsible for creating and managing write pipelines, selecting appropriate Datanodes based on factors like availability, capacity, and network topology.

## Pipeline Types

Ozone supports different types of write pipelines to accommodate various durability and storage efficiency requirements:

### 1. Ratis Pipelines (Replicated)

Ratis pipelines use the [Apache Ratis](https://ratis.apache.org/) implementation of the Raft consensus protocol for strongly consistent replication.

- **Structure**: Typically consists of three Datanodes (one leader, multiple followers)
- **Consistency**: Provides strong consistency through synchronous replication
- **Durability**: Data is fully replicated on all nodes in the pipeline
- **Use Case**: Default replication strategy for most Ozone deployments

![Ratis Replication Pipeline](../../../static/img/replication/ratis.svg)

#### Ratis Pipeline V1: Async API

The original Ozone replication pipeline (V1) uses the Ratis Async API for data replication across multiple datanodes:

1. Client buffers data locally until a certain threshold is reached
2. Data is sent to the leader datanode in the pipeline
3. Leader replicates data to follower datanodes
4. Once a quorum of datanodes acknowledge the write, the operation is considered successful

This approach ensures data consistency but has some limitations in terms of network topology awareness and buffer handling efficiency.

#### Ratis Pipeline V2: Streaming API

The newer Streaming Write Pipeline (V2) in Ozone leverages the Ratis Streaming API to provide significant performance improvements:

**Key Enhancements:**

- Better network topology awareness
- Elimination of unnecessary buffer copying (Netty zero copy)
- Improved CPU and disk utilization on datanodes
- More efficient parallelism in data processing

The Streaming Write Pipeline introduces a new network protocol that enables direct streaming of data from client to datanodes, reducing overhead and improving throughput.

**Configuration:**

To enable the Streaming Write Pipeline (V2), configure these properties in `ozone-site.xml`:

```xml
<property>
  <name>hdds.container.ratis.datastream.enabled</name>
  <value>true</value>
  <description>Enable data stream of container</description>
</property>

<property>
  <name>hdds.container.ratis.datastream.port</name>
  <value>9855</value>
  <description>The datastream port number of container</description>
</property>

<property>
  <name>ozone.fs.datastream.enabled</name>
  <value>true</value>
  <description>Enable filesystem write via ratis streaming</description>
</property>
```

### 2. Erasure Coded Pipelines

Erasure coded (EC) pipelines use mathematical techniques to achieve data durability with lower storage overhead than full replication.

- **Structure**: Distributes data chunks and parity chunks across multiple Datanodes
- **Efficiency**: Requires less storage space than full replication (e.g., 50% overhead instead of 200%)
- **Recovery**: Can reconstruct data from a subset of available chunks
- **Use Case**: Optimized for large data sets where storage efficiency is critical

![Erasure Coded Pipeline](../../../static/img/replication/erasure-coding.svg)

#### Striping and Data Layout

EC in Ozone uses a striping data model where:

1. Data is divided into fixed-size chunks (typically 1MB)
2. The chunks are organized into stripes
3. For each stripe, parity chunks are computed
4. The chunks are distributed across datanodes

For example, with an RS (Reed-Solomon) 6-3 configuration:
- Data is split into 6 data chunks
- 3 parity chunks are computed
- These 9 chunks together form a "Stripe"
- Multiple stripes using the same set of datanodes form a "BlockGroup"

This approach provides 50% storage overhead compared to 200% with 3x replication, while maintaining similar durability guarantees.

#### EC Configuration

To use Erasure Coding in Ozone, you can configure EC at the bucket level or per key:

**Setting EC at bucket creation:**

```bash
ozone sh bucket create <bucket path> --type EC --replication rs-6-3-1024k
```

**Changing EC configuration for an existing bucket:**

```bash
ozone sh bucket set-replication-config <bucket path> --type EC --replication rs-3-2-1024k
```

**Setting EC when creating a key:**

```bash
ozone sh key put <Ozone Key Object Path> <Local File> --type EC --replication rs-6-3-1024k
```

Supported EC configurations include:
- `RS-3-2-1024k`: Reed-Solomon with 3 data chunks, 2 parity chunks, 1MB chunk size
- `RS-6-3-1024k`: Reed-Solomon with 6 data chunks, 3 parity chunks, 1MB chunk size (recommended)
- `XOR-2-1-1024k`: XOR coding with 2 data chunks, 1 parity chunk, 1MB chunk size

## Pipeline Lifecycle

Write pipelines follow a well-defined lifecycle, managed by the Storage Container Manager:

1. **Creation**: SCM selects appropriate Datanodes and creates a pipeline
2. **Active**: Pipeline accepts write operations and manages replication
3. **Closing**: Pipeline stops accepting new writes when it reaches capacity limits
4. **Closed**: Pipeline becomes read-only after all write operations complete
5. **Recovery/Reconstruction**: If a node fails, SCM may initiate recovery procedures

## How Write Pipelines Work

The write operation in Ozone follows these steps through the pipeline:

1. **Client Request**: Client contacts the Ozone Manager (OM) to create or write to a key
2. **Block Allocation**: OM requests block allocation from SCM
3. **Pipeline Selection**: SCM selects an appropriate pipeline for the write operation
4. **Data Transfer**: Client streams data directly to the leader Datanode in the pipeline
5. **Replication**: For Ratis pipelines, the leader replicates data to followers using the Raft protocol; for EC pipelines, the client distributes different chunks to different datanodes
6. **Acknowledgment**: Once all replicas are written, the client receives confirmation

![Write Pipeline Flow](../../../static/img/replication/pipelines.svg)

### Implementation Details

#### Replication Pipeline Implementation

The replication write pipeline is implemented through several key classes:

- **BlockOutputStream**: Base class that manages the overall write process
- **RatisBlockOutputStream**: Implements the Ratis-specific functionality for replication
- **CommitWatcher**: Tracks commit status across all datanodes in the pipeline
- **XceiverClient**: Handles communication with datanodes

The write process follows these steps:

1. Client creates a `BlockOutputStream` for the allocated block
2. Data is written in chunks, which are buffered locally
3. When buffer fills or flush is triggered, data is written to datanodes
4. Each chunk is assigned a sequential index and checksummed
5. After all data is written, a putBlock operation finalizes the block

#### EC Pipeline Implementation

EC write pipeline implementation involves several key components:

- **ECKeyOutputStream**: Main client-side class that manages EC writes
- **ECChunkBuffers**: Maintains buffers for both data and parity chunks
- **ECBlockOutputStreamEntry**: Manages datanode connections and write operations
- **RawErasureEncoder**: Performs the mathematical encoding to generate parity chunks

The EC write process follows these steps:

1. **Data Buffering**: Client buffers incoming data into chunks
2. **Stripe Formation**: When all data chunks for a stripe are filled, parity is generated
3. **Parallel Write**: Data and parity chunks are written to different datanodes
4. **Commit**: After all chunks are written, the stripe is committed

## Containers and Pipelines

Containers are the fundamental storage units in Ozone, and their relationship with pipelines is essential to understand:

- Each container (typically 5GB) is associated with a specific pipeline
- Multiple containers can exist within a single pipeline
- When a container is in the OPEN state, it actively receives data via its pipeline
- Once a container is CLOSED, its data can be accessed via any replica node

## Comparing Replication and Erasure Coding

| Feature | Replication (RATIS/THREE) | Erasure Coding (RS-6-3) |
|---------|---------------------------|-------------------------|
| Storage Overhead | 200% (3x copies) | 50% (9 chunks for 6 data chunks) |
| Write Performance | Higher throughput for small writes | Better for large sequential writes |
| Read Performance | Consistent performance, any replica can serve | Slightly lower for intact data, reconstruction penalty for lost chunks |
| CPU Usage | Lower | Higher (encoding/decoding overhead) |
| Network Bandwidth | Higher during writes | Lower during writes |
| Minimum Nodes | 3 | Depends on config (9 for RS-6-3) |
| Use Cases | Hot data, random access, small files | Warm/cold data, large files, archival |

**When to use Replication:**
- For frequently accessed "hot" data
- For workloads with small random writes
- When raw write performance is critical
- When CPU resources are limited

**When to use Erasure Coding:**
- For "warm" or "cold" data with lower access frequency
- For large files with sequential access patterns
- To optimize storage costs while maintaining durability
- For archival or backup storage

## Advanced Topics

### Error Handling and Recovery

Both write pipelines implement sophisticated error handling:

**Replication Pipeline:**
- Uses Ratis consensus protocol to handle failures
- Automatically recovers from minority datanode failures
- Supports pipeline reconstruction if leader fails
- Implements idempotent operations for retries

**EC Pipeline:**
- Tracks failures at the individual chunk level
- Can retry specific chunk writes to failed datanodes
- Maintains stripe status to ensure consistency
- Implements checksum validation for data integrity

### Performance Considerations

**Optimizing Replication Write Pipeline:**
- Adjust buffer sizes based on workload (`hdds.client.buffer.size.max`)
- Configure flush periods for write-heavy workloads
- Use Streaming Pipeline (V2) for high-throughput scenarios
- Consider network topology when placing datanodes

**Optimizing EC Write Pipeline:**
- Choose EC configuration based on workload characteristics
- Enable ISA-L hardware acceleration for better performance
- Adjust chunk size for optimal performance
- Balance between parallelism and overhead

### Monitoring and Metrics

Both write pipelines expose metrics that can be monitored through Ozone's Prometheus endpoint or JMX interface:

**Key Metrics for Replication Pipeline:**
- Write throughput
- Average chunk write latency
- Pipeline creation time
- Ratis consensus latency

**Key Metrics for EC Pipeline:**
- Encode time per stripe
- Chunk distribution latency
- Success rate of first-time stripe writes
- Parity calculation overhead

## Benefits of Write Pipelines

The pipeline architecture in Ozone provides several key benefits:

1. **Reliability**: Automatic failure detection and recovery mechanisms
2. **Consistency**: Strong consistency guarantees for data replication
3. **Scalability**: Efficient management of write operations across thousands of nodes
4. **Flexibility**: Support for different replication strategies depending on needs
5. **Performance**: Optimized data flow paths that minimize network overhead

## Conclusion

Write pipelines form the backbone of Apache Ozone's data redundancy architecture, ensuring data is reliably stored and replicated across the cluster. By understanding how write pipelines work, administrators and users can make informed decisions about their Ozone deployment and effectively tune it for specific use cases. Whether you need the raw performance of replication or the storage efficiency of erasure coding, Ozone's write pipelines provide the foundation for durable and consistent data storage.