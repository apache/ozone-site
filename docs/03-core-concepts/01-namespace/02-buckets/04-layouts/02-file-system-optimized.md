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
*   **Use Cases:** Ideal for:
    *   **Analytics Workloads:** Seamless integration with Apache Spark, Hive, Impala, Tez, etc., that rely on HCFS APIs.
    *   **HDFS Replacement:** Providing a scalable alternative to HDFS with familiar filesystem semantics.
    *   **Workloads Requiring Atomic Directory Operations:** Critical for operations like Hive/Impala `DROP TABLE`, recursive directory deletion (`rm -r`), and job committers (like Spark's `FileOutputCommitter` v2) that rename temporary output directories to final locations atomically.
    *   **Data Warehousing & ETL:** Efficient handling of structured data layouts and transformations.

## Multi-Protocol Access Considerations

FSO buckets showcase Ozone's multi-protocol capabilities, but accessing them via S3 has significant implications compared to the native OFS/o3fs interface:

*   **OFS/o3fs Access (Native & Recommended):**
    *   **Semantics:** Provides full HCFS (Hadoop Compatible File System) semantics, leveraging Ozone's internal hierarchical namespace structure for directories. Operations like renames and deletes are atomic for both files and directories.
    *   **Performance:** Directory operations (create, rename, delete) are fast, server-side metadata operations handled efficiently by the Ozone Manager, especially critical for large directories or frequent operations.
    *   **Features:** Supports HCFS-specific features like trash functionality (if enabled).
    *   **Ideal Use Cases:** Analytics workloads using Spark, Hive, Impala, etc., especially those involving:
        *   `INSERT OVERWRITE` statements in Hive/Spark SQL.
        *   Job commit phases requiring atomic directory renames (e.g., Spark's `FileOutputCommitter` V2).
        *   Recursive directory deletes (`rm -r` equivalent).
        *   Frequent creation/deletion of temporary directories.
        *   Workloads migrating directly from HDFS seeking similar performance and semantics.

*   **S3 Access (Simulated & Potential Issues):**
    *   **Emulation:** FSO buckets can be accessed via the S3 protocol (e.g., using Ozone's S3 Gateway or S3A connector). However, S3 treats objects as independent entities within a flat keyspace, lacking inherent directory structure. Operations *appearing* directory-based are simulated client-side or by the gateway.
    *   **Non-Atomic Directory Operations:** Renaming or deleting a "directory" via the S3 API is **not atomic** and involves multiple underlying object operations.
        *   **Rename (`mv`):** Simulates the move by listing all objects under the source prefix, copying each object individually to the new prefix (potentially many S3 `CopyObject` calls), and then deleting each original object (potentially many S3 `DeleteObject` calls). Interruption can leave the directory in an inconsistent, partially moved state.
        *   **Delete (`rm -r` equivalent):** Simulates the delete by listing all objects under the prefix and deleting each object individually (potentially many S3 `DeleteObject` calls). Interruption can leave the directory partially deleted.
    *   **Performance Impact:** These multi-step, object-by-object simulations are significantly slower and less efficient than the single, atomic metadata operations performed by the native `ofs://` or `o3fs://` interfaces, especially for directories containing thousands or millions of files. The overhead of numerous S3 API calls can become a major bottleneck.
    *   **Consistency Risks:** The lack of atomicity means that failures during S3-based directory operations can lead to inconsistent states that are difficult and complex to recover from, potentially requiring manual intervention. Native OFS/OzoneFS operations are atomic, ensuring transactional integrity.
    *   **Use Case Suitability:** While S3 access enables interoperability (e.g., ingesting S3 data into FSO for processing), it's **strongly discouraged** for frequent or large-scale directory manipulations (renames, deletes) on FSO buckets due to performance and consistency risks. Use S3 access primarily for object-level GET/PUT/DELETE operations or when the specific limitations are well-understood and acceptable for the specific use case (e.g., infrequent, small directory operations where atomicity is less critical).

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

*   **Choose FSO (File System Optimized) when:**
    *   Your primary access pattern involves **HCFS/OFS compatible tools** like Spark, Hive, Impala, Presto, Flink, etc.
    *   You require **fast, atomic directory operations** (renames, deletes) for tasks like `INSERT OVERWRITE`, job commit phases, or large-scale directory restructuring.
    *   You need **strong consistency** for directory modifications, especially in concurrent environments.
    *   You are migrating workloads from HDFS and want similar directory semantics and performance characteristics.
    *   Workloads involve frequent metadata operations or operations on large directories (thousands/millions of files).

*   **Choose OBS (Object Store) when:**
    *   Your primary access pattern is through the **S3 API** using S3-native tools, SDKs, or applications.
    *   You prioritize **strict S3 compatibility** and behavior (e.g., for cloud-native applications).
    *   Your workload involves mostly **object-level GET/PUT/DELETE** operations rather than frequent directory manipulations.
    *   You are storing large amounts of unstructured data like media files, backups, or logs where filesystem hierarchy is less important than S3 API access.
    *   You need features specific to object storage paradigms, such as object versioning or complex bucket policies managed via S3 APIs.

See the [OBS documentation](../object-store) for more details on the alternative layout.
