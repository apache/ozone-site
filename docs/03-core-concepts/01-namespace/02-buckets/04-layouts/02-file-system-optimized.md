---
sidebar_label: File System Optimized (FSO)
---

# File System Optimized (FSO) Layout

The **File System Optimized (FSO)** layout is one of the modern bucket layouts in Apache Ozone, designed to provide **Hadoop Compatible File System (HCFS)** semantics, similar to HDFS. It enables Ozone to function effectively as a replacement for HDFS, particularly for traditional big data analytics workloads, while also allowing access via the S3 protocol.

## Key Characteristics

*   **Hierarchical Namespace:** FSO buckets maintain an internal directory hierarchy, allowing for efficient directory-level operations like listing, renaming, and deleting when accessed via HCFS protocols (`ofs://`, `o3fs://`). This contrasts with the flat namespace of the [Object Store (OBS)](../object-store) layout.
*   **HCFS Compatibility:** FSO is the recommended layout for seamless integration with Hadoop ecosystem tools like Apache Spark, Hive, Impala, and YARN. These tools often rely on HCFS semantics for operations like job commits and temporary file management.
*   **Atomic Operations (via OFS/o3fs):** When accessed using `ofs://` or `o3fs://`, directory renames and deletes are atomic and fast operations performed server-side within the Ozone Manager. This ensures consistency, especially for operations like `DROP TABLE` in Hive/Impala or job committer patterns.
*   **Trash Support (via OFS/o3fs):** The HCFS trash mechanism is supported for FSO buckets accessed via `ofs://` or `o3fs://`, providing a safety net against accidental deletions.
*   **Use Cases:** Ideal for data warehousing, ETL jobs, interactive SQL queries (Hive, Impala), Spark processing, and general HDFS replacement scenarios.

## Multi-Protocol Access Considerations

FSO buckets showcase Ozone's multi-protocol capabilities:

*   **OFS/o3fs Access:** This is the primary access method for leveraging full HCFS semantics, including atomic operations and trash support. Recommended for analytics workloads.
*   **S3 Access:** FSO buckets can also be accessed via the S3 protocol (e.g., using `s3a://` connector or AWS SDKs).
    *   **Important:** When accessed via S3, directory renames and deletes are **not atomic**. Operations like renaming a directory are translated client-side (e.g., by `s3a`) into individual object copy-and-delete operations, which is slower and lacks atomicity guarantees.
    *   This interoperability allows scenarios like ingesting data via S3 into an FSO bucket and then processing it efficiently using Spark/Hive via `ofs://`, or vice-versa.

## Creating FSO Buckets

FSO is one of the recommended layouts for new deployments, alongside OBS.

You can specify the FSO layout during bucket creation using the Ozone CLI:

```bash
ozone sh bucket create --layout FILE_SYSTEM_OPTIMIZED /volumeName/bucketName
```

Alternatively, you can set FSO as the default layout for all new buckets in the Ozone Manager configuration (`ozone-site.xml`):

```xml
<property>
  <name>ozone.default.bucket.layout</name>
  <value>FILE_SYSTEM_OPTIMIZED</value>
  <description>
    Default bucket layout used when creating new buckets.
    Supported values are OBJECT_STORE, FILE_SYSTEM_OPTIMIZED, LEGACY.
  </description>
</property>
```

## Choosing FSO vs. OBS

*   Choose **FSO** if your primary need is **HCFS/OFS compatibility**, filesystem semantics (atomic renames/deletes via OFS), and integration with traditional Hadoop ecosystem tools.
*   Choose **OBS** if your primary need is **strict S3 compatibility** and a flat object namespace, typically for cloud-native applications or pure object storage.

See the [OBS documentation](../object-store) for more details on the alternative layout.
