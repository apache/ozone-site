---
sidebar_label: HBase
---

# HBase

Apache Ozone supports integration with Apache HBase, allowing you to use Ozone as the underlying storage layer for HBase tables. This integration leverages the `ofs://` scheme to provide a scalable and robust filesystem for HBase Region Servers.

## Prerequisites

- An active Apache Ozone cluster.
- Ozone must be configured to use **Ratis replication**. HBase does not currently support Erasure Coded (EC) buckets.

## Configuration Steps

### 1. Ozone Setup

Before configuring HBase, you must prepare the Ozone filesystem:

- **Create Volume and Bucket:** Create a dedicated volume and bucket for HBase. Ensure the bucket is **File System Optimized (FSO)**.
- **Permissions:** If using Apache Ranger, grant the `hbase` user `READ/WRITE` permissions for the specific Ozone volume and bucket.

### 2. Ozone Service Configurations

Update your `ozone-site.xml` (or via your cluster management tool) with the following properties to enable HBase compatibility:

| Property | Value | Description |
| :--- | :--- | :--- |
| `ozone.fs.hsync.enabled` | `true` | Required for HBase WAL (Write Ahead Log) durability. |
| `ozone.hbase.enhancements.allowed` | `true` | Enables Ozone-side optimizations for HBase. |
| `ozone.client.hbase.enhancements.allowed` | `true` | Enables client-side optimizations. |
| `ozone.client.stream.putblock.piggybacking` | `true` | Improves performance for small writes. |
| `ozone.client.incremental.chunk.list` | `true` | Optimizes metadata handling for HBase. |

### 3. HBase Service Configurations

Configure HBase to point to the Ozone filesystem. Update `hbase-site.xml` with the following:

- **Root Directory:** Set `hbase.rootdir` to your Ozone path using the `ofs://` scheme.

    ```xml
    <property>
      <name>hbase.rootdir</name>
      <value>ofs://[service-id]/[volume]/[bucket]/hbase</value>
    </property>
    ```

- **Scheme Support:** Note that only `ofs://` is supported. The older `o3fs://` scheme is not supported for HBase integration.

Now you are ready to start your HBase cluster with Ozone.

## Support Matrix and Restrictions

### Unsupported Features

The following features are currently **not supported** when running HBase on Ozone:

- **HBase Features:** Medium Object Storage (MOB), Favored Nodes, Hedged Read, Storage Policy, and Short Circuit Read.
- **Ozone Features:** Snapshots, Erasure Coded (EC) buckets, and Object Store (OBS) buckets.
- **Phoenix:** Phoenix User Defined Functions (UDF) are not supported on Ozone.
