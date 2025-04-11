---
sidebar_label: Replication
---

# Bucket Replication

Apache Ozone ensures data durability and availability through **replication**. When data is written to Ozone, it's broken down into smaller units called **blocks** (or chunks). Ozone then creates multiple copies (replicas) of these blocks and distributes them across different DataNodes in the cluster.

## Replication Factor and Type

The replication settings determine how many copies of each block are stored and how they are managed. These settings are configured at the **bucket level** and apply to all objects within that bucket unless overridden at the object level.

1.  **Replication Type:**
    *   **`RATIS`:** The default and recommended replication type for most use cases. It uses the RAFT consensus protocol to manage replicas, ensuring strong consistency. Typically configured with a replication factor of **THREE**.
    *   **`EC` (Erasure Coding):** An advanced technique that provides high durability with lower storage overhead compared to simple replication. It breaks data into smaller fragments and adds parity fragments. The original data can be reconstructed even if some fragments are lost. Requires careful configuration of data and parity block counts (e.g., `rs-6-3-1024k`).
    *   **`STAND_ALONE`:** Primarily used for specific scenarios like high-frequency writes to object storage or temporary data. It offers lower consistency guarantees than `RATIS`.

2.  **Replication Factor:**
    *   Applicable primarily to `RATIS` replication.
    *   Specifies the number of copies (replicas) of each block to maintain.
    *   The default and recommended factor for `RATIS` is **3**. This means each block is stored on three different DataNodes.
    *   For `EC`, the "factor" is implicitly determined by the number of data and parity blocks defined in the EC policy (e.g., `rs-6-3-1024k` means 6 data blocks + 3 parity blocks = 9 total blocks distributed).

## Setting Replication Configuration

Replication settings are typically defined when creating a bucket.

**CLI Examples:**

```bash
# Create a bucket with default replication (RATIS, factor=3)
ozone sh bucket create /volumeName/bucketName

# Explicitly set RATIS replication with factor 3 (default)
ozone sh bucket create --replication=RATIS --replication-factor=THREE /volumeName/bucketName-ratis

# Explicitly set Erasure Coding (assuming 'rs-6-3-1024k' codec is configured)
ozone sh bucket create --replication=EC --replication-config=rs-6-3-1024k /volumeName/bucketName-ec
```

*   The `--replication` flag specifies the type (`RATIS` or `EC`).
*   For `RATIS`, the `--replication-factor` flag sets the number of replicas (e.g., `THREE`, `ONE`).
*   For `EC`, the `--replication-config` flag specifies the Erasure Coding policy name (e.g., `rs-6-3-1024k`, `rs-10-4-1024k`). These policies must be pre-defined in the Ozone configuration.

## Viewing Replication Configuration

You can view the replication configuration of a bucket using the `info` command:

```bash
ozone sh bucket info /volumeName/bucketName
```

The output will show the `replicationType` and `replicationFactor` (for `RATIS`) or the specific `ecReplicationConfig` (for `EC`).

## Importance

Choosing the correct replication type and factor is crucial for balancing data durability, storage efficiency, and performance requirements for the data stored within a bucket. `RATIS` with a factor of 3 is generally recommended for most general-purpose use cases, while `EC` offers better storage efficiency for large, less frequently accessed data.