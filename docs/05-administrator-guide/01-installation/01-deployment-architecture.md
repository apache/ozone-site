# Deployment Architecture

Apache Ozone is a distributed, scalable object store designed for modern data workloads. It follows a separation of metadata and data services architecture that enables independent scaling and operational flexibility. This document outlines the recommended deployment architecture for production Ozone clusters.

## Core Architectural Principles

Ozone's design is built on several key principles that influence deployment architecture:

1. **Separation of Metadata and Data Services**: Metadata operations (managed by OM and SCM) are separated from data storage operations (handled by Datanodes).

2. **Strong Consistency**: All metadata operations use consensus protocols (Ratis) to provide strong consistency guarantees.

3. **Independent Scaling**: Control plane (OM, SCM) and data plane (Datanodes) can scale independently based on different workload demands.

4. **Resilient Storage**: Data is protected through replication or erasure coding across datanodes.

5. **High Availability**: All critical services can be deployed in HA configurations.

## Component Architecture Overview

Ozone deployment consists of several core components, each with distinct resource requirements and scaling characteristics:

![Ozone Architecture Diagram](/img/ozone/ozone-client-interaction.svg)

### Metadata Service Nodes

Metadata services form the control plane of Ozone and require careful planning for performance and availability.

#### 1. Ozone Manager (OM)

The Ozone Manager handles namespace operations (volumes, buckets, keys) and manages metadata in RocksDB.

- **Deployment Pattern**: 
  - 3-node HA deployment using Ratis consensus protocol (minimum recommendation for production)
  - Single node for development/testing environments

- **Hardware Recommendations**:
  - CPU: 16+ cores (modern processors)
  - Memory: 32GB+ RAM (at least 16GB heap size)
  - Storage: SSD or NVMe drive(s) for metadata (minimum 100GB, scale with namespace size)
  - Network: 10GbE or better, low latency

- **Scaling Characteristics**:
  - Scales with namespace operations (create/delete/list)
  - Limited by metadata size and operation rate
  - Vertical scaling preferred (more CPU/memory on same nodes)

#### 2. Storage Container Manager (SCM)

The SCM orchestrates container lifecycle and coordinates datanodes.

- **Deployment Pattern**:
  - 3-node HA deployment using Ratis consensus protocol (minimum recommendation for production)
  - Single node for development/testing environments

- **Hardware Recommendations**:
  - CPU: 16+ cores (modern processors)
  - Memory: 32GB+ RAM (at least 16GB heap size)
  - Storage: SSD or NVMe drive(s) for metadata (minimum 100GB)
  - Network: 10GbE or better, low latency

- **Scaling Characteristics**:
  - Scales with cluster size (number of datanodes/containers)
  - Vertical scaling preferred (more CPU/memory on same nodes)

### Data Service Nodes

Data services store and serve actual content and can scale horizontally to meet capacity and throughput demands.

#### 3. Datanodes

Datanodes store the actual data in containers on local disks.

- **Deployment Pattern**:
  - Horizontal scaling from few to thousands of nodes
  - Distributed across racks for fault tolerance
  - Rack awareness enabled for topology-aware placement

- **Hardware Recommendations**:
  - CPU: 8+ cores per node
  - Memory: 16-64GB RAM (at least 8GB heap)
  - Storage: 
    - Multiple HDDs for data storage
    - One dedicated SSD or NVMe drive for container metadata and transaction logs (~100GB)
    - Support for JBOD configurations (Just a Bunch Of Disks)
  - Network: 10GbE or better, preferably with RDMA support for performance

- **Scaling Characteristics**:
  - Horizontal scaling to increase capacity and throughput
  - Scales to thousands of nodes across multiple racks

### Optional Service Nodes

These services provide additional functionality but aren't required for basic Ozone operation.

#### 4. Recon

Recon provides analytics and monitoring for the cluster.

- **Deployment Pattern**:
  - Single node deployment is typically sufficient
  - Can be deployed alongside other components on smaller clusters

- **Hardware Recommendations**:
  - CPU: 8+ cores
  - Memory: 16GB+ RAM
  - Storage: SSD/NVMe for database (50GB+)
  - Network: Same network as metadata services

#### 5. S3 Gateway

S3 Gateway provides S3-compatible API access.

- **Deployment Pattern**:
  - Deploy on each Datanode for distributed access
  - Alternatively, deploy on dedicated gateway nodes
  - Use a load balancer to distribute client requests

- **Hardware Recommendations**:
  - When co-located with Datanodes: Additional 4+ cores and 8GB+ RAM
  - When on dedicated nodes: 8+ cores, 16GB+ RAM
  - Network: Same as Datanodes or closer to clients

## Consolidated vs. Dedicated Node Deployments

Ozone supports both consolidated and dedicated node deployment patterns, depending on cluster size and resource availability.

### Small to Medium Clusters (Up to ~50 Datanodes)

For smaller clusters, consolidation of services can be efficient:

- **Consolidated Metadata Nodes**:
  - OM and SCM can be co-located on the same three physical nodes
  - Each machine runs both OM and SCM processes
  - Requires more powerful machines (32+ cores, 64GB+ RAM, multiple SSDs)
  - Example: 3 physical servers each running both OM and SCM instances
  
  ```
  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
  │ Metadata Node 1   │ │ Metadata Node 2   │ │ Metadata Node 3   │
  │                   │ │                   │ │                   │
  │ • Ozone Manager   │ │ • Ozone Manager   │ │ • Ozone Manager   │
  │ • SCM             │ │ • SCM             │ │ • SCM             │
  │ • Recon (opt.)    │ │                   │ │                   │
  └───────────────────┘ └───────────────────┘ └───────────────────┘
  ```

- **Datanodes with Co-located Services**:
  - S3 Gateway on all or select Datanodes
  - Load balancer distributing S3 traffic

### Large Clusters (50+ Datanodes)

For larger production environments, dedicated nodes are recommended:

- **Dedicated Metadata Nodes**:
  - 3 nodes running only OM instances
  - 3 nodes running only SCM instances
  - Separate dedicated node for Recon
  
  ```
  ┌───────────┐ ┌───────────┐ ┌───────────┐   ┌───────────┐ ┌───────────┐ ┌───────────┐   ┌───────────┐
  │ OM Node 1 │ │ OM Node 2 │ │ OM Node 3 │   │ SCM Node 1│ │ SCM Node 2│ │ SCM Node 3│   │   Recon   │
  └───────────┘ └───────────┘ └───────────┘   └───────────┘ └───────────┘ └───────────┘   └───────────┘
  ```

- **Dedicated Gateway Nodes**:
  - Separate nodes for S3 Gateway (and potentially HttpFS)
  - Load balancers in front of gateway services
  - Example: 3+ dedicated S3 Gateway nodes behind a load balancer

- **Pure Datanodes**:
  - Datanodes running only datanode services
  - Optimized for storage and data throughput

## Network Design Considerations

Network architecture significantly impacts Ozone performance and reliability:

1. **Network Topology**:
   - All nodes must be reachable from each other
   - Metadata services should have low-latency connectivity to each other (ideally same rack)
   - Clients typically connect to S3 Gateway or directly to OMs

2. **Network Requirements**:
   - Metadata Service Traffic:
     - OM-OM Ratis: Port 9872
     - SCM-SCM Ratis: Port 9891
     - Ensure low latency between metadata nodes for consensus
   
   - Client-to-Service Traffic:
     - Client to OM (RPC): Port 9862
     - Client to SCM (RPC): Port 9860
     - Client to S3 Gateway: Port 9878 (HTTP) or 9879 (HTTPS)
   
   - Inter-Service Traffic:
     - OM to SCM communication
     - Datanode to SCM registration and heartbeats
     - Client to Datanode data transfers

3. **Bandwidth Recommendations**:
   - Metadata nodes: 10GbE or better
   - Datanodes: 10GbE minimum, 25/40/100GbE for high-throughput workloads
   - Consider network oversubscription ratios in rack design

## Deployment Examples

### Example 1: Consolidated 6-Node Production Cluster

A minimal production deployment with consolidated services:

```
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ Metadata Node 1         │ │ Metadata Node 2         │ │ Metadata Node 3         │
│                         │ │                         │ │                         │
│ • Ozone Manager (om1)   │ │ • Ozone Manager (om2)   │ │ • Ozone Manager (om3)   │
│ • SCM (scm1)            │ │ • SCM (scm2)            │ │ • SCM (scm3)            │
│ • Recon                 │ │                         │ │                         │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘

┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ Datanode 1              │ │ Datanode 2              │ │ Datanode 3              │
│                         │ │                         │ │                         │
│ • Datanode service      │ │ • Datanode service      │ │ • Datanode service      │
│ • S3 Gateway            │ │ • S3 Gateway            │ │ • S3 Gateway            │
│                         │ │                         │ │                         │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

- **Hardware**:
  - Metadata Nodes: 32 cores, 64GB RAM, 2x NVMe drives
  - Datanodes: 16 cores, 32GB RAM, 12x HDDs + 1x SSD
  - All nodes: 10GbE networking

### Example 2: Large-Scale Production Cluster

A larger deployment with dedicated service nodes:

```
┌────────────┐ ┌────────────┐ ┌────────────┐   ┌────────────┐ ┌────────────┐ ┌────────────┐
│ OM Node 1  │ │ OM Node 2  │ │ OM Node 3  │   │ SCM Node 1 │ │ SCM Node 2 │ │ SCM Node 3 │
└────────────┘ └────────────┘ └────────────┘   └────────────┘ └────────────┘ └────────────┘

┌────────────┐   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ┌─────────────┐
│ Recon Node │   │ Gateway Node │ │ Gateway Node │ │ Gateway Node │   │ Load        │
│            │   │ (S3G/HttpFS) │ │ (S3G/HttpFS) │ │ (S3G/HttpFS) │ → │ Balancer    │ → Clients
└────────────┘   └──────────────┘ └──────────────┘ └──────────────┘   └─────────────┘

┌────────┐ ┌────────┐ ┌────────┐     ┌────────┐
│ DN 1   │ │ DN 2   │ │ DN 3   │ ... │ DN 100+│  // Multiple racks with many datanodes
└────────┘ └────────┘ └────────┘     └────────┘
```

- **Hardware Specifications**:
  - OM Nodes: 24 cores, 64GB RAM, NVMe drives
  - SCM Nodes: 24 cores, 64GB RAM, NVMe drives
  - Gateway Nodes: 16 cores, 32GB RAM
  - Datanodes: 8-16 cores, 32-64GB RAM, 12-24 HDDs + 1 SSD per node
  - Network: 25GbE for metadata nodes, 10GbE for datanodes

## Load Balancer Configuration

For production deployments with S3 Gateway services, a load balancer is essential:

1. **S3 Gateway Load Balancing**:
   - Deploy a load balancer (e.g., HAProxy, NGINX, hardware-based) in front of S3 Gateway instances
   - Configure health checks to monitor gateway availability
   - Example simple NGINX configuration:

```nginx
upstream ozone_s3_backend {
    server datanode1.example.com:9878;
    server datanode2.example.com:9878;
    server datanode3.example.com:9878;
    # Add more S3 Gateway instances as needed
}

server {
    listen 80;
    server_name s3.ozone.example.com;

    location / {
        proxy_pass http://ozone_s3_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **OM Load Balancing** (for client HA):
   - Clients can directly use the OM HA service ID
   - For advanced scenarios, a load balancer can distribute initial client connections

## Summary of Deployment Recommendations

1. **Metadata Services**:
   - Deploy OM and SCM in 3-node HA configurations
   - Use high-performance hardware with SSD/NVMe storage
   - For smaller clusters, consolidate OM and SCM on the same nodes
   - For larger clusters, use dedicated nodes for each service

2. **Datanodes**:
   - Scale horizontally based on capacity and performance needs
   - Each node should have dedicated SSD for metadata
   - S3 Gateway can be co-located with datanodes or deployed separately

3. **Network Configuration**:
   - Ensure low latency between metadata nodes
   - Use sufficient bandwidth for expected workload
   - Configure proper security and firewall rules

4. **Load Balancing**:
   - Use load balancers for S3 Gateway services
   - Configure health checks and failover

By following these deployment architecture recommendations, you can build a robust, high-performance Ozone cluster that meets your production requirements for durability, performance, and availability.