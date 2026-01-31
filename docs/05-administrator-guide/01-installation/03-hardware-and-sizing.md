# Hardware and Sizing

This guide outlines the hardware requirements and sizing recommendations for Apache Ozone clusters of different scales. Proper hardware selection is critical for achieving optimal performance, reliability, and cost-effectiveness.

> **Note**: Apache Ozone can run on a single node inside Kubernetes and serve all functionality for development, testing, and small workloads. The hardware specifications in this guide reflect common configurations for production deployments. Your choice of hardware should depend on your desired scale, performance requirements, and workload characteristics.

## Principles

When planning an Ozone deployment, consider these key principles:

- **Separate Metadata and Data Hardware**: Metadata services (OM, SCM) have different requirements than data services (Datanodes).
- **SSD/NVMe for Metadata**: All metadata services require fast storage for RocksDB.
- **Scale Metadata Vertically**: Add more resources to existing metadata nodes rather than more nodes.
- **Scale Datanodes Horizontally**: Add more Datanode machines as capacity and throughput needs grow.
- **Plan for Failure**: Size the cluster to handle expected failures of drives and nodes. Do not exceed 400 TB raw Datanode capacity.

## Guidelines

### Hardware Configuration Best Practices

#### Drive Configuration

- Use enterprise-class drives in production environments
- Use SAS HDD drives for data nodes
- Use SSD/NVMe optimized for mixed workloads as system drives
- Use NVMe or SAS SSD optimized for heavy write workloads for metadata and Ratis logs  
- Use hardware RAID1 for system drives and metadata storage
- Leave at least 20% free space on metadata drives for RocksDB compaction
- Factor in drive failure rates (typically 1–5% annually) for capacity planning and use SMART to monitor drive health.

#### Memory Configuration

- Reserve at least 4-8GB for OS and other services on each node
- Budget memory to avoid swap usage but do not disable swap entirely; this prevents the OOM killer from terminating critical processes unpredictably.
- For co-located services (OM+SCM), size the heap to accommodate both services plus overhead
- Use G1GC collector for production JVMs

#### Expansion Planning

- Design racks with expansion capacity in mind
- Datanodes can be added in increments of 1+ nodes
- Plan for hardware replacement cycles (typically 3-5 years)

#### Network Planning

Proper network planning is essential for Ozone performance:

##### Bandwidth Sizing

Ensure network bandwidth matches aggregate disk throughput

- For HDDs: ~150-200MB/s per drive
- For SSDs: ~500MB/s+ per drive
- For NVMe: ~1-3GB/s+ per drive

##### Network Oversubscription

- Limit oversubscription to 2:1 ratio maximum
- Ideal: 1:1 subscription for metadata and heavy workloads

### Minimum Production Deployment

A minimal production-ready deployment should include:

- 3 nodes for OM HA (can be co-located with SCM)
- 3 nodes for SCM HA (can be co-located with OM)
- At least a single Recon instance
- Minimum 10 Datanodes for RS-6-3 encoding, 15 Datanodes for RS-10-4

#### Total Hardware (Consolidated)

- 3 metadata nodes (running both OM and SCM)
- 10+ Datanodes

## Reference Configurations

### Small Enterprise Deployment (3 - 20PB)

Consolidated architecture with 3 metadata nodes and 10+ Datanodes.

#### Metadata Nodes (3x)

- 2x 16-core CPUs (32 cores total)
- 128GB RAM
- 31GB JVM heap per service (OM and SCM)
- 2x 480GB SSD mixed workload drives in RAID1 for OS
- 2x 2TB write optimized NVMe in RAID1
- 2x 25GbE network ports

#### Datanodes (10+)

- 2x 16-core CPUs (32 cores total)
- 128GB RAM
- 31GB JVM heap
- 2x 480GB SSD mixed workload drives in RAID1 for OS
- 6+ SAS HDDs
- 2x 480GB write optimized NVMe in RAID1 (metadata)
- 2x 25GbE network ports

### Large Enterprise Deployment (20PB+)

Dedicated service architecture.

#### OM Nodes (3x)

- 2x 20-core CPUs (40 cores total)
- 256GB RAM
- 48GB JVM heap
- 2x 480GB SSD mixed workload drives in RAID1 for OS
- 2x 4TB write optimized NVMe in RAID1
- 2x 100GbE network ports

#### SCM Nodes (3x)

- 2x 20-core CPUs (40 cores total)
- 256GB RAM
- 48GB JVM heap
- 2x 480GB SSD mixed workload drives in RAID1 for OS
- 2x 4TB write optimized NVMe in RAID1
- 2x 100GbE network ports

#### Datanodes (80+)

- 2x 16-core CPUs (32 cores total)
- 128GB RAM
- 48GB JVM heap
- 2x 480GB SSD mixed workload drives in RAID1 for OS
- 6+ SAS HDDs
- 2x 480GB write optimized NVMe in RAID1 (metadata)
- 2x 100GbE network ports

#### Recon Node (1x)

- 2x 12-core CPUs (24 cores total)
- 128GB RAM
- 48GB JVM heap
- 2x 2TB NVMe in RAID1
- 2x 100GbE network

#### S3 Gateway Nodes (3+)

- 2x 16-core CPUs (32 cores total)
- 128GB RAM
- 48 GB JVM heap
- 2x 480GB SSD mixed workload drives in RAID1 for OS
- 2x 100GbE network ports

#### Load balancer for S3 Gateways

Consider co-locating S3 Gateways with applications that use them or use dedicated hardware or software L7 load balancer for balancing traffic between S3 Gateways.  
