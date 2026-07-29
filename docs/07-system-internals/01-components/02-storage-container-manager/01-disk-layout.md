---
sidebar_label: Disk Layout
---

# Storage Container Manager Disk Layout

## **Overview**

The Storage Container Manager (SCM) is responsible for managing the containers and pipelines. To perform these tasks reliably, SCM persists its state in a set of local directories.

## **Core Metadata Configurations**

The following configuration keys define where the Storage Container Manager stores its persistent data. For production environments, it is recommended to host these directories on NVMe/SSDs to ensure high performance.

- **`ozone.scm.db.dirs`**: Specifies the dedicated location for the Storage Container Manager RocksDB.
- **`ozone.scm.ratis.storage.dir`**: Defines the storage location for Ratis (Raft) logs, which are essential for Storage Container Manager High Availability (HA).
- **`ozone.metadata.dirs`**: Serves as the default location for security-related metadata (keys and certificates) and is often used as a fallback if specific DB directories are not defined.

Ozone uses a hierarchical fallback system for configurations. Example the SCM looks for its CA location in this order:

- `hdds.scm.ca.location`: The most specific: if this is set, it wins.
- `hdds.scm.metadata.dirs`: SCM-wide metadata path.
- `ozone.metadata.dirs`: Global fallback for all services.

## **On-Disk Directory Structure**

A typical SCM metadata directory structure looks like the following:

```text
/var/lib/hadoop-ozone/scm/
├── data/                            # Primary Metadata (ozone.scm.db.dirs)
│   ├── db.checkpoints/              # Point-in-time snapshots of SCM DB for external tools (e.g., Recon, HA)
│   ├── scm/
│   │   └── current/
│   │       └── VERSION              # SCM identity and clusterID
│   ├── scm.db/                      # Main RocksDB (Containers, Pipelines, etc.)
│   │   ├── *.sst                    # Sorted String Table data files
│   │   ├── CURRENT                  # Current manifest pointer
│   │   ├── IDENTITY                 # DB Instance ID
│   │   ├── MANIFEST-XXXXXX          # Database journal
│   │   └── OPTIONS-XXXXXX           # RocksDB runtime configuration
│   └── snapshot/                    # Ephemeral DB snapshots
├── ozone-metadata/                  # Security Metadata (ozone.metadata.dirs)
│   └── scm/
│       ├── ca/                      # Root/Primary CA credentials
│       │   ├── certs/
│       │   │   └── certificate.crt  # Primary CA certificate
│       │   └── keys/
│       │       ├── private.pem      # CA Private key (keep secure)
│       │       └── public.pem
│       └── sub-ca/                  # Sub-CA credentials for SCM HA
│           ├── certs/
│           │   ├── <serial>.crt
│           │   └── CA-1.crt         # Linked Primary CA cert
│           └── keys/
│               ├── private.pem
│               └── public.pem
└── scm-ha/                          # Raft Logs (ozone.scm.ratis.storage.dir)
    └── <ratis-group-uuid>/          # Unique Ratis Ring ID
        └── current/
            ├── log_0-0              # Closed Raft log segments
            ├── log_inprogress_271   # Active Raft log segment
            ├── raft-meta            # Raft persistence state
            └── raft-meta.conf       # Quorum membership info
```

## **Detailed Component Breakdown**

### **1. RocksDB (`scm.db`)**

SCM uses an embedded RocksDB to store all mapping and state information. This database consists of several column families (tables):

- **Pipelines:** Maps pipeline IDs to the list of Datanodes forming the pipeline.  
- **Containers:** Maps container IDs to their state (Open/Closed), replication type, and owner.  
- **Deleted Blocks:** A queue of blocks that have been marked for deletion and need to be cleaned up from Datanodes.  
- **Valid Certificates:** Stores certificates issued by the SCM Certificate Authority (CA).  
- **Datanodes:** Tracks the registration and heartbeat status of all Datanodes in the cluster.

### **2. The VERSION File**

The VERSION file is created during `scm --init`. The VERSION file serves as the SCM's "identity card" and is used to enforce cluster-wide consistency during the handshake process. When the SCM starts, it reads its `clusterID` and `scmUuid` from this file to verify it is authorized to manage the metadata in its local directory; subsequently, when Datanodes attempt to register, the SCM cross-references its own `clusterID` and `cTime` with the information provided by the Datanodes to prevent nodes from different clusters from accidentally joining and causing data corruption. Furthermore, the layoutVersion inside the file is critical for software upgrades, as it tells the SCM which on-disk metadata features are currently active, ensuring that the service doesn't attempt to process data formats it doesn't recognize or support.

Key fields include:

- **nodeType**: Always SCM for this component.  
- **clusterID**: The unique identifier for the entire Ozone cluster.  
- **scmUuid**: The unique identifier for the SCM node.  
- **layoutVersion**: The software-specific data layout version.
- **cTime**: To track when different components were formatted or upgraded. This prevents older versions of the software from accidentally trying to manage data created by a newer version (Layout Versioning).

A sample SCM version file looks like this

```text
#Fri Feb 13 10:58:02 PDT 2020
nodeType=SCM
scmUuid=fa1376f0-23ad-4cda-93d6-0c9fd79c7ae3
clusterID=CID-2a3f36e8-506f-40eb-986e-bb79d188fd55
cTime=1771013425196
layoutVersion=0
```

### **3. Certificate Authority (CA)**

The `ozone-metadata/scm/ca` directory contains key and certs sub-directory, which are used to persist the certificate and the public/private key pairs of SCM. The SCM private key is used to sign the issued certificates and tokens. In the context of SCM HA, the SCM can be either Root CA that issues certificates for SCM instances (a.k.a Sub SCM) that issues certificates to Ozone Manager and Datanodes.

The issuing of certificates will be handled by SCM Ratis leader and the persistence of certificates into RocksDB will be replicated to SCM follower instances consistently.

Among the SCM CA instances, there will be one designated as Primary SCM which acts as Root CA during SCM init. All the other SCM instances will be running bootstrap to get the Primary SCM issued SCM instance certificate.

The SCM metadata above below use the all-in-one `ozone.metadata.dirs` without metadata DB on different drives.  As a result of that, the Primary SCM will have its metadata saved under `<The path of ozone.metadata.dirs>/scm/ca`.

All the Sub SCM instances (including the one running on the primary SCM) security metadata are stored at `<The path of ozone.metadata.dir>/scm/sub-ca`, with keys and certs under it, respectively. Here is an example of Sub SCM security metadata layout.

### **4. Ratis Logs**

When SCM High Availability (HA) is enabled, SCM uses **Apache Ratis** to replicate its state across the SCM quorum.

- The `ratis/` directory contains the Raft log segments.  
- Every write request (e.g., container allocation) is first appended to this log and replicated to followers before being applied to the local `scm.db`.

### **5. `db.checkpoints`**

The db.checkpoints directory serves as a dedicated storage area for point-in-time snapshots of the active SCM RocksDB. These snapshots are primarily used for Recon integration and High Availability (HA) synchronization; when the Recon service or a lagging SCM follower needs to catch up to the current cluster state, SCM creates a consistent checkpoint here using filesystem hard links. This allows the system to export the database state without pausing write operations or duplicating large data files, ensuring that metadata can be transferred across the network while the main service remains online and performant.

### Recommended Storage Configuration Mapping

The following properties in `ozone-site.xml` control the disk layout:

| Path Description | Configuration Key | Storage Type Recommendation | Purpose |
| :---- | :---- | :---- | :---- |
| **SCM Metadata Database** | `ozone.scm.db.dirs` | **NVMe (strongly recommended)** | Primary directory for SCM RocksDB and version files. |
| **SCM Ratis Logs** | `ozone.scm.ratis.storage.dir` | **NVMe or very fast SSD** | Holds the Raft write-ahead log (WAL) for SCM consensus. Every metadata mutation must be fsynced before commit. Slow disks increase write latency across the entire cluster because clients wait for quorum commit. |
| **General Ozone Metadata / Security Material** | `ozone.metadata.dirs` | **SSD preferred (HDD acceptable for small clusters)** | If `hdds.scm.ca.location` or `hdds.scm.metadata.dirs` not configured, it will fallback to this configuration to create SCM CA certificates are stored. |

## **Layout Implementation for Different Environments**

### **Development/Test Environments**

For simplicity, a single "All-in-One" location can be used by setting `ozone.metadata.dirs`. All services (OM, SCM, DN) will store their metadata in sub-folders under this single path.

### **Production Environments**

It is strictly recommended to separate these directories. The `scm.db` and Ratis logs should reside on high-IOPS storage (SSDs/NVMe) to minimize latency for namespace operations, while security certificates can remain on standard persistent storage.

- **Storage Type:** It is highly recommended to host the `scm.db` and `ratis/` directories on **NVMe or SAS SSDs** to minimize latency for block and container allocations.  
- **Redundancy:** Use **RAID 1+0** (or **RAID 1**) (mirroring) for metadata disks to protect against local disk failure, even if SCM HA is enabled at the software layer. (Note: Typically **RAID 1+0** disks provide better performance compared to **RAID 1**)
