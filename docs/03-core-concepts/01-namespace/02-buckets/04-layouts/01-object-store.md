---
sidebar_label: Object Store (OBS)
---

# Object Store (OBS) Layout

The **Object Store (OBS)** layout is one of the modern bucket layouts in Apache Ozone, specifically designed to provide **strict S3 compatibility** and behavior. It treats the bucket as a flat keyspace, optimized for object storage use cases and cloud-native applications built for the S3 API.

## Key Characteristics

*   **Flat Namespace:** Unlike the [File System Optimized (FSO)](../file-system-optimized) layout, OBS does not simulate a hierarchical directory structure internally. Keys are stored directly within the bucket. While delimiters like `/` can be used in key names (e.g., `images/archive/photo.jpg`) for organizational purposes (as commonly interpreted by S3 clients), Ozone treats the entire string as the unique object key. There are no separate directory entries maintained by Ozone itself.
*   **Strict S3 Compatibility:** OBS is the recommended layout for workloads demanding the highest fidelity with the Amazon S3 API and its object storage semantics. Cloud-native applications built using AWS SDKs, Boto3, or other S3 client libraries can interact with OBS buckets seamlessly.
*   **OFS/HCFS Incompatibility:** Buckets created with the OBS layout **cannot** be accessed using Hadoop Compatible File System (HCFS) protocols like `ofs://` or `o3fs://`. Attempting filesystem operations (like creating directories or listing files using Hadoop FS APIs) on an OBS bucket will fail.
*   **Use Cases:** Ideal for:
    *   **Cloud-Native Applications:** Applications built using S3 SDKs (AWS SDK, Boto3, etc.) expecting standard S3 behavior.
    *   **Unstructured Data:** Storing large amounts of unstructured or semi-structured data like images, videos, audio files, sensor data, logs, backups, and archives where hierarchical filesystem access is not the primary requirement.
    *   **S3 Compatibility:** Workloads requiring the highest fidelity with the S3 API and object storage semantics.
    *   **Data Exploration:** Enabling exploration of unstructured data using S3-compatible tools.
    *   It's the preferred choice when filesystem semantics (like atomic directory renames) are not required.
*   **Performance:** Optimized for typical object storage operations.

## Multi-Protocol Access Considerations

*   **S3 Access:** This is the primary and intended access method for OBS buckets.
*   **OFS/o3fs Access:** Not supported.

## Creating OBS Buckets

OBS is one of the recommended layouts for new deployments, alongside FSO.

You can specify the OBS layout during bucket creation using the Ozone CLI:

```bash
ozone sh bucket create --layout OBJECT_STORE /volumeName/bucketName
```

Alternatively, you can set OBS as the default layout for all new buckets in the Ozone Manager configuration (`ozone-site.xml`):

```xml
<property>
  <name>ozone.default.bucket.layout</name>
  <value>OBJECT_STORE</value>
  <description>
    Default bucket layout used when creating new buckets.
    Supported values are OBJECT_STORE, FILE_SYSTEM_OPTIMIZED, LEGACY.
  </description>
</property>
```

## Choosing OBS vs. FSO

*   Choose **OBS** if your primary need is **S3 compatibility** and a flat object namespace.
*   Choose **FSO** if your primary need is **HCFS/OFS compatibility**, filesystem semantics (atomic renames/deletes via OFS), and integration with traditional Hadoop ecosystem tools (Spark, Hive, Impala).

See the [FSO documentation](../file-system-optimized) for more details on the alternative layout.
