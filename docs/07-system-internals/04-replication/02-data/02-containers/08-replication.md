---
sidebar_label: Replication
---

# Container Replication

## Overview

Container replication is a critical mechanism in Apache Ozone that ensures data availability and durability by copying containers from source Datanodes to destination Datanodes. This document provides a comprehensive description of the replication process, including the detailed steps involved, advantages of push replication, and scenarios where EC (Erasure Coded) containers can be replicated.

## Replication Mode

Apache Ozone supports **Push Replication** by **default**, where the source Datanode actively pushes the container to the target Datanode. The replication mode is controlled by the configuration property `hdds.scm.replication.push` (default: `true`). When set to `false`, the system uses pull replication where the target Datanode pulls from source Datanodes.

**Push Replication :** `PushReplicator` class handles push replication by:

- Using `OnDemandContainerReplicationSource` to prepare the container
- Using `GrpcContainerUploader` to upload the container via gRPC stream
- Streaming the container data directly to the target Datanode

:::note

Both regular container replication and EC container replication respect the same `hdds.scm.replication.push` configuration setting. EC container replication scenarios (decommissioning, under-replication, maintenance mode, mis-replication) will use push mode when the configuration is `true` (default) or pull mode when set to `false`.

:::

---

## Detailed Replication Process

The container replication process involves several well-defined steps.

### Step 1: Source Datanode Prepares Container Tarball

The source Datanode creates a tarball containing:

- Container descriptor file (`container.yaml`) with metadata
- RocksDB metadata files (database files)
- Container chunk files (actual data)
- Container checksum file (if exists)

**Compression:** This tarball is not compressed by default. Optional compression can be enabled via `hdds.container.replication.compression` (values: `NO_COMPRESSION`(default), `GZIP`, `SNAPPY`, `LZ4`, `ZSTD`).

### Step 2: Destination Datanode Receives Tarball

The source Datanode streams the tarball to the destination via gRPC:

- Establishes gRPC stream connection
- Streams data in chunks via `SendContainerRequest` messages
- Destination writes chunks to temporary file in the temp dir of the volume: `/tmp/container-copy/`

Before receiving, the destination selects a volume, **reserves space (2x container size)**, and creates the temporary directory.

### Step 3: Untar and Store Container Files

The destination Datanode extracts the tarball:

- Reads and verifies container descriptor (`container.yaml`)
- Extracts RocksDB metadata to metadata directory
- Extracts chunk files to chunks directory
- Extracts checksum file (if present) to metadata directory

Files are extracted to a temporary directory first, then moved atomically to final locations: `<volume-root>/containerID/`, `<volume-root>/containerID/metadata/`, and `<volume-root>/containerID/chunks/`.

### Step 4: Import Container

The container is imported into the Datanode's container set:

- Creates container object from metadata
- Sets container state to `RECOVERING`
- Associates container with selected volume
- Adds container to `ContainerSet`
- Updates volume usage with container size
- Schedules on-demand scan

Import progress is tracked to prevent concurrent imports. If import fails or container already exists, appropriate error handling is performed.

### Step 5: Delete Temporary Files

After successful import, all temporary files are cleaned up:

1. **Delete Tarball**: The downloaded tarball file is deleted from the temporary directory
2. **Release Reserved Space**: The reserved space on the volume is released
3. **Cleanup on Failure**: If any step fails, temporary files are deleted and reserved space is released

---

## Advantages of Push Replication

Push replication offers several advantages:

- **Better Load Distribution**: Source Datanode controls transfer rate and timing, managing its own load while simplifying target operations
- **Improved Network Efficiency**: Direct streaming with gRPC flow control adapts to network conditions, reducing latency
- **Simplified Failure Handling**: Source handles retries and error recovery, while targets only process incoming streams
- **Better Resource Management**: Source can throttle transfers based on its own capacity (disk I/O, CPU, network), preventing overload

---

## EC Container Replication Scenarios

Erasure Coded (EC) containers have specific replication requirements and scenarios where replication is necessary.

### Scenario 1: Decommissioning

**When it occurs:**
When a Datanode enters the decommissioning state, all EC container replicas stored on that Datanode must be replicated to other Datanodes before the Datanode can be safely removed from the cluster.

**How it works:**

1. **Detection**: `ECUnderReplicationHandler` detects containers with replicas on decommissioning Datanodes
2. **Index Identification**: The handler identifies which EC indexes are only present on decommissioning Datanodes (`decommissioningOnlyIndexes()`)
3. **One-to-One Replication**: For each decommissioning index, a replication command is created to copy that specific index to a new Datanode
4. **Target Selection**: New target Datanodes are selected based on placement policies
5. **Replication Execution**: Each index is replicated independently using the configured replication mode (push by default, configurable to pull via `hdds.scm.replication.push`)

**Example:**

For an EC container with replication config `RS-6-3-1024k`:

- 6 data blocks + 3 parity blocks = 9 total indexes
- If index 2 is only on a decommissioning Datanode, only index 2 needs to be replicated
- The replication command includes `replicaIndex=2` to specify which index to copy

### Scenario 2: Under-Replication

**When it occurs:**
When an EC container has fewer replicas than required for a specific index, that index needs to be replicated.

**How it works:**

1. **Replica Count Analysis**: `ECContainerReplicaCount` analyzes the current replica distribution
2. **Missing Index Detection**: Identifies indexes that have fewer replicas than required
3. **Source Selection**: Selects healthy source replicas for the missing indexes
4. **Replication Commands**: Creates replication commands to restore redundancy using the configured replication mode (push by default)

### Scenario 3: Maintenance Mode

**When it occurs:**
When Datanodes enter maintenance mode, EC container replicas on those Datanodes may need additional copies to maintain redundancy during maintenance.

**How it works:**

Similar to decommissioning, but with different redundancy requirements:

- Maintenance mode allows for reduced redundancy (`maintenanceRemainingRedundancy` config)
- Replication ensures minimum redundancy is maintained during maintenance using the configured replication mode (push by default)

### Scenario 4: Mis-Replication

**When it occurs:**
When EC container replicas are placed on Datanodes that violate placement policies (e.g., too many replicas in the same rack).

**How it works:**

1. **Placement Validation**: `ECMisReplicationHandler` validates replica placement against policies
2. **Violation Detection**: Identifies replicas that violate placement constraints
3. **Replication to Correct Placement**: Creates replication commands to move replicas to compliant locations using the configured replication mode (push by default)
4. **Old Replica Deletion**: After successful replication, old replicas are deleted
