---
draft: true
sidebar_label: Disk Layout
---
# Ozone Manager Disk Layout

**TODO:** Allow inclusion of the system internals folder by updating the excludes list in `docusaurus.config.js`.

## **Overview**

Apache Ozone separates metadata management across different services to ensure scalability. The Ozone Manager (OM) is responsible for managing the namespace metadata, which includes volumes, buckets, and keys. This document outlines the on-disk configurations, directory structures, and layout for the Ozone Manager based on technical specifications.

## **Core Metadata Configurations**

The following configuration keys define where the Ozone Manager stores its persistent data. For production environments, it is recommended to host these directories on NVMe/SSDs to ensure high performance.

- **`ozone.om.db.dirs`**: Specifies the dedicated location for the Ozone Manager RocksDB.  
- **`ozone.metadata.dirs`**: Serves as the default location for security-related metadata (keys and certificates) and is often used as a fallback if specific DB directories are not defined.  
- **`ozone.om.ratis.storage.dir`**: Defines the storage location for Ratis (Raft) logs, which are essential for Ozone Manager High Availability (HA).

## **On-Disk Directory Structure**

A typical Ozone Manager metadata directory (e.g., `/var/lib/hadoop-ozone/om/`) is organized as follows:

```text
/var/lib/hadoop-ozone/om
├── data                              # The path configured for ozone.om.db.dirs
│   ├── db.checkpoints/               # Point-in-time snapshots of OM DB for external tools (e.g., Recon)
│   ├── om/
│   │   └── current/
│   │       └── VERSION               # Metadata identifying clusterID, omUuid, and layout version
│   ├── om.db/                        # The active RocksDB instance (Namespace State)
│   │   ├── *.sst                     # Static Sorted Table files (immutable data blocks)
│   │   ├── *.log                     # RocksDB Write-Ahead Logs (WAL)
│   │   ├── MANIFEST                  # Records changes to the RocksDB structure
│   │   ├── CURRENT                   # Pointer to the latest manifest file
│   │   └── snapshots/                # Internal Ozone Bucket Snapshots
│   │       ├── om.db-<name1>/        # Hard-linked checkpoint for Snapshot 1
│   │       │   ├── *.sst
│   │       │   ├── CURRENT
│   │       │   └── MANIFEST
│   │       └── om.db-<name2>/        # Hard-linked checkpoint for Snapshot 2
│   └── omMetrics                     # OM-specific performance and operational metrics
├── ozone-metadata                    # The path configured for ozone.metadata.dirs
│   └── om/
│       ├── certs/                    # Public certificates and SCM CA chain
│       └── keys/                     # RSA Private and Public PEM keys
└── ratis/                            # Raft replication logs (HA). The path configured for ozone.om.ratis.storage.dir
    ├── <group-uuid>/                 # Ratis Pipeline Group ID
    │   ├── current/
    │   │   ├── log_inprogress_<id>   # Active transaction logs
    │   │   └── raft-meta.conf        # Ratis membership and configuration metadata
    └── snapshot/                     # Ratis State Machine snapshots (for node synchronization)
```

## **Detailed Component Breakdown**

### **1\. RocksDB (`om.db`)**

The `om.db` directory contains the RocksDB state store. This is the "source of truth" for the namespace. It stores information about every volume, bucket, and key in the system. Because Ozone handles billions of objects, the performance of the underlying storage for this directory is critical.

In Ozone, snapshots are implemented as RocksDB Checkpoints. When a bucket snapshot is created, OM creates a directory under snapshots/ and uses hard links for existing `.sst` files. This allows snapshots to be created nearly instantaneously with zero initial storage overhead.

### **2\. The VERSION File**

The VERSION file is created during the `om --init` process. It ensures that the OM belongs to the correct cluster and identifies the layout version of the data to prevent software version mismatches.

Key fields include:

- **nodeType**: Set to OM.  
- **clusterID**: The unique ID of the Ozone cluster.  
- **omUuid**: The unique identifier for this specific OM instance.  
- **layoutVersion**: The software-specific data layout version.

### **3\. Security Metadata**

Located under `ozone.metadata.dirs`, the security sub-directory contains the identity of the OM.

- **keys/**: Contains private.pem and public.pem.  
- **certs/**: Contains the OM’s certificate (signed by the SCM) and the SCM CA certificate. These are required for secure communication (mTLS) within the cluster.

### **4\. Ratis Logs**

The `ratis/` directory is critical for HA clusters. It stores the transaction logs that must be replicated across the OM quorum.

- **Logs**: Represent "inflight" transactions that haven't been fully compacted into the state machine.
- **Snapshots**: These are Ratis snapshots (not bucket snapshots). They allow a new or lagging OM node to recover its state quickly without replaying the entire history of logs.

### **5\. `db.checkpoints`**

The db.checkpoints directory serves as a dedicated storage area for temporary, read-only snapshots of the active OM RocksDB. These checkpoints are primarily utilized by management and observability tools, such as Ozone Recon, to perform out-of-band analysis without impacting the performance of the live namespace. Unlike the user-facing bucket snapshots that reside within the `om.db` hierarchy, these checkpoints are typically short-lived and represent a full point-in-time state of the entire metadata store. They enable the system to safely export the database state to other services for tasks like reporting, auditing, or cluster-wide health monitoring.

### Recommended Storage Configuration Mapping

| Path Description | Configuration Key | Storage Type Recommendation | Purpose |
| :--- | :--- | :--- | :--- |
| **OM Metadata Database** | `ozone.om.db.dirs` | **NVMe (strongly recommended)** | Stores the OM RocksDB database containing volumes, buckets, keys, and namespace state. This is the most latency-sensitive component in Ozone. Poor IOPS directly impacts client operation latency (PUT/DELETE/LIST). |
| **OM Ratis Logs** | `ozone.om.ratis.storage.dir` | **NVMe or very fast SSD** | Holds the Raft write-ahead log (WAL) for OM consensus. Every metadata mutation must be fsynced before commit. Slow disks increase write latency across the entire cluster because clients wait for quorum commit. |
| **General Ozone Metadata / Security Material** | `ozone.metadata.dirs` | **SSD preferred (HDD acceptable for small clusters)** | Base directory used by multiple Ozone services for certificates, keys, SCM/OM local metadata, and service state. Not on the critical write path like RocksDB or Ratis, but must be reliable and persistent. |

## **Layout Implementation for Different Environments**

### **Development/Test Environments**

For simplicity, a single "All-in-One" location can be used by setting `ozone.metadata.dir`. All services (OM, SCM, DN) will store their metadata in sub-folders under this single path.

### **Production Environments**

It is strictly recommended to separate these directories. The `om.db` and Ratis logs should reside on high-IOPS storage (SSDs/NVMe) to minimize latency for namespace operations, while security certificates can remain on standard persistent storage.
