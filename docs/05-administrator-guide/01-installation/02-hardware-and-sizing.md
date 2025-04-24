# Hardware and Sizing

This guide outlines the hardware requirements and sizing recommendations for Apache Ozone clusters of different scales. Proper hardware selection is critical for achieving optimal performance, reliability, and cost-effectiveness.

> **Note:** Apache Ozone can run on a single node inside Kubernetes and serve all functionality for development, testing, and small workloads. The hardware specifications in this guide reflect common configurations for production deployments. Your choice of hardware should depend on your desired scale, performance requirements, and workload characteristics.

## Hardware Selection Principles

When planning an Ozone deployment, consider these key principles:

1. **Separate Metadata and Data Hardware**: Metadata services (OM, SCM) have different requirements than data services (Datanodes).
2. **SSD/NVMe for Metadata**: All metadata services require fast storage for RocksDB.
3. **Scale Metadata Vertically**: Add more resources to existing metadata nodes rather than more nodes.
4. **Scale Datanodes Horizontally**: Add more datanode machines as capacity and throughput needs grow.
5. **Plan for Failure**: Size the cluster to handle expected failures of drives and nodes.

## Metadata Node Hardware

Metadata nodes run the Ozone Manager (OM) and Storage Container Manager (SCM) services, which require careful hardware consideration for performance and reliability.

### Ozone Manager (OM) Node Requirements

| Component | Minimum (Dev/Test) | Recommended (Production) | Enterprise Scale |
|-----------|-------------------|-------------------------|------------------|
| CPU | 8 cores | 16+ cores | 20-40 cores |
| Memory | 16GB | 32-64GB | 128-256GB |
| Java Heap | 8GB | 16-32GB | 48-96GB |
| Metadata Storage | 100GB SSD | 1-4TB NVMe | 4-8TB NVMe (RAID1) |
| Network | 1GbE | 10GbE | 25GbE+ |
| Form Factor | VM or physical | 1U server | 1-2U server |

**Key Considerations:**
- Use enterprise-grade NVMe drives with power loss protection for production
- Configure RAID1 for metadata storage in enterprise deployments
- Avoid JVM heap sizes between 32-47GB due to compressed OOPs optimization cutoff
- For production workloads, consider dedicated systems for OM nodes

### Storage Container Manager (SCM) Node Requirements

| Component | Minimum (Dev/Test) | Recommended (Production) | Enterprise Scale |
|-----------|-------------------|-------------------------|------------------|
| CPU | 8 cores | 16+ cores | 20-40 cores |
| Memory | 16GB | 32-64GB | 128-256GB |
| Java Heap | 8GB | 16-32GB | 48-96GB |
| Metadata Storage | 100GB SSD | 1-4TB NVMe | 4-8TB NVMe (RAID1) |
| Network | 1GbE | 10GbE | 25GbE+ |
| Form Factor | VM or physical | 1U server | 1-2U server |

**Key Considerations:**
- SCM maintains container and pipeline state, requiring fast storage similar to OM
- As the cluster grows, SCM's memory and CPU needs increase with the number of containers and datanodes
- Container database state grows with the total number of containers in the system

### Recon Node Requirements

For Recon, which provides analytics and monitoring capabilities:

| Component | Minimum | Recommended | 
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| Memory | 12GB | 16-32GB |
| Java Heap | 6GB | 8-16GB |
| Storage | 50GB SSD | 200GB+ SSD/NVMe |
| Network | 1GbE | 10GbE |

**Key Considerations:**
- Recon's resource needs grow with cluster size
- For smaller clusters, Recon can be co-located with an OM or SCM node
- For large clusters with extensive monitoring needs, use a dedicated node

## Datanode Hardware

Datanodes store the actual data and can be scaled horizontally based on capacity and performance requirements.

### Standard Datanode Requirements

| Component | Minimum (Dev/Test) | Recommended (Production) | High-Density |
|-----------|-------------------|--------------------------|--------------|
| CPU | 4 cores | 8-16 cores | 12-24 cores |
| Memory | 8GB | 16-32GB | 32-64GB |
| Java Heap | 4GB | 8-16GB | 16-32GB |
| Data Storage | 1TB (any type) | 12x 4-16TB HDDs | 24-90x 16-20TB HDDs |
| Metadata Disk | 50GB SSD | 1x 200GB+ SSD/NVMe | 2x 480GB+ SSD (RAID1) |
| Network | 1GbE | 10GbE | 25/40/100GbE |
| Form Factor | VM or physical | 1-2U server | 2-4U high-density chassis |

**Key Considerations:**
- Each datanode MUST have at least one SSD for container metadata and transaction logs
- The dedicated SSD is not used for data storage but for metadata and operational logs
- Data can be stored on HDDs for cost efficiency or SSDs/NVMe for performance
- Match network capabilities to the storage bandwidth to avoid bottlenecks
- JBOD (Just a Bunch Of Disks) configurations are supported and common
- Consider drive failure rates when sizing total capacity

### Mixed Compute-Storage Datanode

For workloads requiring compute capabilities alongside storage:

| Component | Specifications |
|-----------|---------------|
| CPU | 24-48 cores |
| Memory | 128-512GB |
| Storage | Same as standard datanode |
| Network | 25/40GbE+ |

**Use Cases:**
- Co-located processing frameworks (Spark, Flink, etc.)
- Compute-intensive applications accessing local data

### Storage-Only Datanode

For maximum storage density in large clusters:

| Component | Specifications |
|-----------|---------------|
| CPU | 12-16 cores |
| Memory | 32-64GB |
| Storage | 24-90+ HDDs (up to maximum chassis capacity) |
| Network | 25/40/100GbE |

**Use Cases:**
- Cold/archive storage tiers
- Maximum capacity deployments
- Cost-optimized storage

## Sizing Guidelines

### Minimum Production Deployment

A minimal production-ready deployment should include:
- 3 nodes for OM HA (can be co-located with SCM)
- 3 nodes for SCM HA (can be co-located with OM)
- At least a single Recon instance
- Minimum 9 datanodes for standard erasure coding (RS-6-3)

**Total Hardware (Consolidated):**
- 3 metadata nodes (running both OM and SCM)
- 9+ datanodes

### Capacity Planning

| Logical Capacity | Raw Capacity (3x Replication) | Raw Capacity (RS-6-3 EC) | Approx. Datanode Count (RS-6-3) |
|------------------|-------------------------------|--------------------------|--------------------------------|
| 2 PB | 6 PB | 3 PB | 9 nodes with 12x 16TB HDDs |
| 8 PB | 24 PB | 12 PB | 31 nodes with 12x 16TB HDDs |
| 16 PB | 48 PB | 24 PB | 64 nodes with 12x 16TB HDDs |
| 32 PB | 96 PB | 48 PB | 128 nodes with 12x 16TB HDDs |

**Notes:**
- These estimates assume 1x 16TB HDD provides ~14.5TB of usable capacity
- Erasure coding (RS-6-3) provides better storage efficiency than 3x replication
- Capacity estimates assume sufficient space for container overhead and maintenance operations
- As the cluster scales, consider adding dedicated OM and SCM nodes

### Memory and CPU Sizing

Memory sizing for Java processes should follow these guidelines:

1. **JVM Heap Size**:
   - Avoid heap sizes between 32-47GB due to compressed OOPs threshold
   - Recommended sizes: 8GB, 16GB, 24GB, 48GB, 96GB
   - Allow for at least 20% off-heap memory beyond heap allocation

2. **CPU Allocation**:
   - OM/SCM: At least 1 core per 5GB of heap
   - Datanodes: At least 1 core per 2TB of storage capacity
   - Additional cores for S3 Gateway and other co-located services

### Network Requirements

Proper network planning is essential for Ozone performance:

1. **Bandwidth Sizing**:
   - Plan for full (real-world) bandwidth of drives
   - For HDDs: ~150-200MB/s per drive
   - For SSDs: ~500MB/s+ per drive
   - For NVMe: ~1-3GB/s+ per drive

2. **Network Oversubscription**:
   - Limit oversubscription to 2:1 ratio maximum
   - Ideal: 1:1 subscription for metadata and heavy workloads

3. **Latency Considerations**:
   - Metadata nodes should have low-latency connectivity (less than 1ms) for consensus
   - Consider top-of-rack switching architecture for datanode traffic

## Hardware Configuration Best Practices

1. **Drive Configuration**:
   - Use enterprise-class drives in production environments
   - For NVMe metadata storage in production, use RAID1 for redundancy
   - Leave at least 20% free space on metadata drives for RocksDB compaction
   - Consider drive failure rates in capacity planning (1-5% annual failure rate)

2. **Memory Configuration**:
   - Reserve at least 4-8GB for OS and other services on each node
   - For co-located services (OM+SCM), size heap for both services with overhead
   - Use G1GC collector for production JVMs

3. **System Configuration**:
   - Configure appropriate user limits (nofile, nproc) for Ozone services
   - Use XFS filesystem for both metadata and data storage
   - Tune disk I/O scheduler appropriately (e.g., deadline or noop)
   - Consider disabling memory swapping for performance-critical nodes

4. **Expansion Planning**:
   - Design racks with expansion capacity in mind
   - Datanodes can be added in increments of 1+ nodes
   - Plan for hardware replacement cycles (typically 3-5 years)

## Reference Configurations

### Small Enterprise Deployment (3-4PB)

Consolidated architecture with 3 metadata nodes and 12+ datanodes:

**Metadata Nodes (3x):**
- 2x 16-core CPUs (32 cores total)
- 128GB RAM
- 24GB JVM heap per service (OM and SCM)
- 2x 2TB NVMe in RAID1
- 2x 25GbE network

**Datanodes (12x):**
- 2x 12-core CPUs (24 cores total)
- 64GB RAM
- 16GB JVM heap
- 12x 16TB HDDs
- 1x 480GB SSD (metadata)
- 2x 10GbE network

### Large Enterprise Deployment (20PB+)

Dedicated service architecture:

**OM Nodes (3x):**
- 2x 20-core CPUs (40 cores total)
- 256GB RAM
- 48GB JVM heap
- 2x 4TB NVMe in RAID1
- 2x 25GbE network

**SCM Nodes (3x):**
- 2x 20-core CPUs (40 cores total)
- 256GB RAM
- 48GB JVM heap
- 2x 4TB NVMe in RAID1
- 2x 25GbE network

**Datanodes (80+):**
- 2x 12-core CPUs (24 cores total)
- 64GB RAM
- 16GB JVM heap
- 24x 16TB HDDs
- 2x 480GB SSD in RAID1 (metadata)
- 2x 25GbE network

**Recon Node (1x):**
- 2x 12-core CPUs (24 cores total)
- 128GB RAM
- 32GB JVM heap
- 2x 2TB NVMe in RAID1
- 2x 25GbE network

**S3 Gateway Nodes (3+):**
- 2x 16-core CPUs (32 cores total)
- 128GB RAM
- 24GB JVM heap
- 1TB SSD
- 2x 25GbE network

By following these hardware and sizing guidelines, you can design an Ozone cluster that meets your capacity, performance, and reliability requirements while optimizing for cost efficiency.