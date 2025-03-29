# Write Pipelines

Write pipelines are a fundamental component of Apache Ozone's replication architecture, enabling efficient and reliable data storage across distributed nodes. This document explains the concept of write pipelines, their types, and how they contribute to Ozone's durability and performance.

## What are Write Pipelines?

Write pipelines are groups of datanodes that work together as a unit to store and replicate data in Ozone. They serve as the foundation for Ozone's data replication strategy, providing:

- A coordinated path for write operations across multiple nodes
- Strong consistency guarantees for data replication
- Efficient management of data distribution and storage
- A mechanism to handle node failures and recovery

The Storage Container Manager (SCM) is responsible for creating and managing write pipelines, selecting appropriate datanodes based on factors like availability, capacity, and network topology.

## Pipeline Types

Ozone supports different types of write pipelines to accommodate various durability and storage efficiency requirements:

### 1. Ratis Pipelines (Replicated)

Ratis pipelines use the [Apache Ratis](https://ratis.apache.org/) implementation of the Raft consensus protocol for strongly consistent replication.

- **Structure**: Typically consists of three datanodes (one leader, multiple followers)
- **Consistency**: Provides strong consistency through synchronous replication
- **Durability**: Data is fully replicated on all nodes in the pipeline
- **Use Case**: Default replication strategy for most Ozone deployments

![Ratis Replication Pipeline](../../../static/img/replication/ratis.svg)

### 2. Erasure Coded Pipelines

Erasure coded (EC) pipelines use mathematical techniques to achieve data durability with lower storage overhead than full replication.

- **Structure**: Distributes data chunks and parity chunks across multiple datanodes
- **Efficiency**: Requires less storage space than full replication (e.g., 1.5x instead of 3x)
- **Recovery**: Can reconstruct data from a subset of available chunks
- **Use Case**: Optimized for large data sets where storage efficiency is critical

![Erasure Coded Pipeline](../../../static/img/replication/erasure-coding.svg)

## Pipeline Lifecycle

Write pipelines follow a well-defined lifecycle, managed by the Storage Container Manager:

1. **Creation**: SCM selects appropriate datanodes and creates a pipeline
2. **Active**: Pipeline accepts write operations and manages replication
3. **Closing**: Pipeline stops accepting new writes when it reaches capacity limits
4. **Closed**: Pipeline becomes read-only after all write operations complete
5. **Recovery/Reconstruction**: If a node fails, SCM may initiate recovery procedures

## How Write Pipelines Work

The write operation in Ozone follows these steps through the pipeline:

1. **Client Request**: Client contacts the Ozone Manager (OM) to create or write to a key
2. **Block Allocation**: OM requests block allocation from SCM
3. **Pipeline Selection**: SCM selects an appropriate pipeline for the write operation
4. **Data Transfer**: Client streams data directly to the leader datanode in the pipeline
5. **Replication**: For Ratis pipelines, the leader replicates data to followers using the Raft protocol
6. **Acknowledgment**: Once all replicas are written, the client receives confirmation

![Write Pipeline Flow](../../../static/img/replication/pipelines.svg)

## Containers and Pipelines

Containers are the fundamental storage units in Ozone, and their relationship with pipelines is essential to understand:

- Each container (typically 5GB) is associated with a specific pipeline
- Multiple containers can exist within a single pipeline
- When a container is in the OPEN state, it actively receives data via its pipeline
- Once a container is CLOSED, its data can be accessed via any replica node

## Benefits of Write Pipelines

The pipeline architecture in Ozone provides several key benefits:

1. **Reliability**: Automatic failure detection and recovery mechanisms
2. **Consistency**: Strong consistency guarantees for data replication
3. **Scalability**: Efficient management of write operations across thousands of nodes
4. **Flexibility**: Support for different replication strategies depending on needs
5. **Performance**: Optimized data flow paths that minimize network overhead

## Conclusion

Write pipelines form the backbone of Apache Ozone's data replication architecture, ensuring data is reliably stored and replicated across the cluster. By understanding how write pipelines work, administrators and users can better leverage Ozone's capabilities for their storage needs.