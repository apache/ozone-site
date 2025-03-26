---
# Make this the default docs landing page.
slug: /
---

# Overview

## What is Apache Ozone?

Apache Ozone is a scalable, redundant,
and distributed object store optimized for lakehouse workloads, AI/ML, and cloud-native applications.
Born out of the analytics/AI+ML ecosystem, it is designed to handle both small and large files efficiently,
scaling up to billions of objects and exabytes of capacity.
Ozone provides strong consistency guarantees,
multiple protocol support (including S3 compatibility), and flexible durability options,
making it a versatile storage solution for modern data platforms.

## What it does?

Ozone offers a comprehensive set of features designed for demanding storage requirements:

### Scale

Ozone's architecture allows independent scaling of metadata and data storage components. 
The Ozone Manager (OM) and Storage Container Manager (SCM) handle metadata, 
while Datanodes manage the physical storage of data blocks. 
This separation of concerns enables clusters to scale incrementally
and handle massive datasets with varying workloads without performance bottlenecks.

### Flexible Durability

Data durability is crucial.
Ozone provides multiple options on a per object basis or bucket wide basis to protect data against failures:
*   **Replication (RATIS):** Traditional 3-way replication using the [Ratis (Raft)](https://ratis.apache.org) consensus protocol ensures high availability and fault tolerance.
*   **Erasure Coding (EC):** For greater storage efficiency, Ozone supports various EC codecs (e.g., Reed-Solomon) that significantly reduce storage overhead compared to replication while maintaining desired durability levels.

### Secure

Security is built-in at multiple layers:
*   **Authentication:** Integrates seamlessly with Kerberos for robust user and service authentication.
*   **Authorization:** Provides fine-grained access control through Access Control Lists (ACLs) at the volume, bucket, and key levels. Supports Ranger integration for centralized policy management.
*   **Encryption:** Supports TLS/SSL for encrypting data in transit and Transparent Data Encryption (TDE) for data at rest.
*   **Tokens:** Uses delegation tokens and block tokens for secure access in distributed environments.

### Performance

Ozone is engineered for high performance across different access patterns:
*   **High Throughput:** Optimized for streaming reads and writes of large files, typical in big data analytics. Ozone can server data with a single hop in the network to the data at rest.
*   **Low Latency:** Efficient metadata management ensures low-latency access, crucial for interactive queries and applications sensitive to response times.
*   **Small File Optimization:** Addresses the historical challenges of efficiently managing metadata and storage for vast numbers of small files.

### Multiple Protocols

Ozone allows diverse applications to access the same data through various interfaces:
*   **S3 Protocol:** Offers a highly compatible S3 REST API, enabling S3-native applications and tools to use Ozone without modification.
*   **Hadoop Compatible File System (OFS):** Provides `ofs://` scheme, allowing seamless integration with Hadoop ecosystem tools like Iceberg, Spark, Hive, Flink, MapReduce, and many more applications.
*   **Native Java Client API:** A rich client library for programmatic access from Java applications.
*   **Command Line Interface (CLI):** A powerful CLI for administrative tasks and data management.

### Efficient

Ozone optimizes storage utilization and resource usage:
*   **Erasure Coding:** Reduces the storage footprint significantly compared to 3x replication.
*   **Small File Handling:** Efficiently manages metadata and block allocation for small files.
*   **Containerization:** Groups blocks into larger Storage Containers, simplifying operations.

### Storage Management

Ozone provides a familiar hierarchical namespace and management tools:
*   **Namespace:** Organizes data into Volumes (mapping to tenants) and Buckets (similar to directories or S3 buckets), containing Keys (files/objects).
*   **Quotas:** Allows administrators to set storage quotas at the Volume and Bucket levels to manage resource consumption.
*   **Snapshots:** Supports point-in-time, read-only snapshots of buckets for data protection, efficient diffs, and versioning.

### Strong Consistency

Ozone provides strong consistency for both metadata and data operations. 
This simplifies application development as developers do not need to handle eventual consistency complexities, 
ensuring that reads always reflect the latest successful writes.

## Why it matters?

Choosing Ozone provides significant advantages for organizations managing large-scale data:

### Total Cost of Ownership (TCO)

Ozone helps reduce storage costs through:
*   **Storage Efficiency:** Erasure Coding dramatically lowers the physical storage required.
*   **Commodity Hardware:** Runs on standard, cost-effective hardware.
*   **Open Source:** Avoids expensive vendor lock-in and licensing fees.
*   **Cost Efficient:** Ability to add a single node, or a rack or multiple racks without complexity while boosting performance. Efficient rebalancing of optimizing utilization with minimal management overhead. 

### Operational Efficiency

Ozone simplifies storage administration:
*   **Unified Storage:** Can serve as a single storage layer for diverse workloads (big data, AI/ML, cloud-native), reducing the need to manage multiple systems.
*   **Management Tools:** Provides the Recon web UI for cluster monitoring and insights, along with robust CLI tools.
*   **Simplified Operations:** Features like rolling upgrades, node decommissioning, and automatic data balancing streamline maintenance.

### Hybrid Cloud

Ozone's S3 compatibility makes it an excellent foundation for hybrid cloud strategies. 
Applications developed for S3 can run on-premises using Ozone and potentially migrate to or interact with public cloud S3 storage with minimal changes.

## Dive Deeper

Ready to explore Ozone further? Here are some starting points:

*   **New to Ozone?** Try the **[Quick Start Guide](./02-quick-start/README.mdx)** to get a cluster running.
*   **Want to understand the internals?** Read about the **[Core Concepts](./03-core-concepts/README.mdx)** like architecture, replication, and security.
*   **Need to use Ozone?** Check the **[User Guide](./04-user-guide/README.mdx)** for client interfaces and integrations.
*   **Managing a cluster?** Consult the **[Administrator Guide](./05-administrator-guide/README.mdx)** for installation, configuration, and operations.
*   **Running into issues?** The **[Troubleshooting Guide](./06-troubleshooting/README.mdx)** might have answers.
