---
sidebar_label: Hive
---

# Using Apache Hive with Ozone

Apache Hive can seamlessly use Apache Ozone as its storage layer, replacing HDFS. This integration leverages Ozone's Hadoop Compatible File System (HCFS) interfaces, allowing users to run Hive queries on data stored in Ozone without modifying Hive itself.

## Why Use Ozone with Hive?

- **Scalability:** Ozone offers enhanced scalability for metadata and block storage compared to traditional HDFS, suitable for large data warehouses.
- **Consistency:** Ozone provides strong consistency guarantees.
- **HCFS Compatibility:** Through the Ozone File System (`ofs://`), Ozone provides the necessary filesystem semantics Hive relies on.

## How Hive Relies on Filesystem Semantics

Hive interacts with its underlying storage (traditionally HDFS, now potentially Ozone) for several key operations that depend on filesystem semantics:

- **Data Storage:** Storing table data (files) within a hierarchical directory structure (database/table/partition directories).
- **Atomic Directory Renames:** Crucial for operations like `INSERT OVERWRITE`, where Hive writes data to a temporary directory and then atomically renames it to the final table/partition location upon successful completion. This ensures queries see either the old data or the new data, never an inconsistent intermediate state.
- **Recursive Directory Deletes:** Required for `DROP TABLE` operations on managed tables to efficiently remove all associated data directories and files.
- **Job Committers:** Various commit protocols used by Hive (and underlying engines like MapReduce or Spark) rely on filesystem operations like renames and deletes for managing temporary and final output directories.

## Ozone's Solution: ofs and FSO Buckets

Ozone enables seamless Hive integration primarily through:

1. **Ozone File System (ofs):** An HCFS implementation accessed via the `ofs://`or`o3fs://` URI schemes. It translates Hive's filesystem calls into Ozone operations.
2. **File System Optimized (FSO) Buckets:** A bucket layout specifically designed to provide efficient HDFS-like directory semantics within Ozone. **Using FSO buckets is essential for optimal Hive performance and correctness.**

When Hive uses the `ofs://` protocol to interact with an **FSO bucket**, Ozone can perform directory renames and deletes as fast, atomic, server-side metadata operations, fulfilling Hive's requirements.

:::danger[Bucket Layout Requirement]
**Do not** use Object Store (OBS) or Legacy bucket layouts for Hive tables. These layouts lack the efficient, atomic directory operations required by Hive, which can lead to severe performance degradation and potential data inconsistencies, especially with operations like `INSERT OVERWRITE`or`DROP TABLE`. Always use **File System Optimized (FSO)** buckets for Hive data.
:::

## Configuration

To configure Hive to use Ozone:

### 1. Add Ozone Client JARs to Classpath

The Ozone filesystem client JAR (`ozone-filesystem-hadoop3-*.jar`or`ozone-filesystem-*.jar` depending on the version) and its dependencies must be available on the classpath of all relevant Hive components.

- **HiveServer2**
- **Hive Metastore Server**
- **Hive Clients** (Beeline, Hive CLI)
- **Execution Engines** (Tez, Spark, MapReduce - typically configured via `hive.execution.engine` or job submission classpath)
- **Other Services** interacting with Hive tables on Ozone (e.g., Spark Thrift Server, Presto, Trino).

The exact method depends on your deployment:

- **Manual/Ambari/Cloudera Manager:** Copy the necessary JARs (found in the `share/ozone/lib/`directory of the Ozone distribution) to the Hive library directories (e.g.,`/usr/hdp/current/hive-client/lib/`, `/usr/share/java/`) or configure `hive.aux.jars.path`or`HADOOP_CLASSPATH`.
- **Environment Variable (Example):**

    ```bash
    # Ensure OZONE_HOME points to your Ozone installation
    export HADOOP_CLASSPATH=${OZONE_HOME}/share/ozone/lib/ozone-filesystem-hadoop3-*.jar:${HADOOP_CLASSPATH}
    # Start Hive services with this environment variable set
    ```

### 2. Configure `core-site.xml`

For `core-site.xml` configuration, refer to the [Ozone File System (ofs) Configuration section](../01-client-interfaces/02-ofs.md#configuration).```

- Replace `ozonecluster`, `om1`, etc., with your actual OM service ID and node ID.
- Ensure this `core-site.xml` is accessible to all Hive components.

### 3. Configure `hive-site.xml`

Update Hive's warehouse directories to point to an **FSO bucket** path within Ozone using the `ofs://` scheme.

```xml
<configuration>

  <property>
    <name>hive.metastore.warehouse.dir</name>
    <value>ofs://ozonecluster/warehouse/hive</value> <!-- Path to your FSO bucket for managed tables -->
    <description>Location of default database for managed tables.</description>
  </property>

  <property>
    <name>hive.metastore.warehouse.external.dir</name>
    <value>ofs://ozonecluster/warehouse/hive/external</value> <!-- Path within your FSO bucket for external tables -->
    <description>Location of default database for external tables.</description>
  </property>

  <!-- Recommended for better performance with directory committers -->
  <property>
    <name>hive.exec.stagingdir</name>
    <value>ofs://ozonecluster/tmp/hive/.hive-staging</value> <!-- Temporary staging directory on Ozone -->
    <description>Directory for temporary files used in operations like INSERT OVERWRITE.</description>
  </property>

</configuration>
```

- Replace `ozonecluster` with your OM Service ID.
- Ensure the specified Ozone path (e.g., `/warehouse/hive`) exists within an **FSO bucket** and has appropriate permissions for the Hive user. You might need to create the volume and bucket first using `ozone sh volume create /warehouse`and`ozone sh bucket create --layout FILE_SYSTEM_OPTIMIZED /warehouse/hive`.

## Supported Access Protocols

While multiple protocols *can* interact with Ozone, for Hive, the choice significantly impacts correctness and performance:

| Protocol | URI Format                     | Recommended for Hive? | Key Considerations                                                                                                |
| :------- | :----------------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **ofs**  | `ofs://<om-svc-id>/vol/bucket/path` | **Yes (Strongly)** | Provides global namespace view. **Requires FSO buckets.** Enables atomic directory operations. Best performance. |
| **o3fs** | `o3fs://bucket.vol/path`       | **Yes**          | Limits access to a single bucket. **Requires FSO buckets.** Enables atomic directory operations. Good performance. |
| **s3a**  | `s3a://bucket/path`            | **No (Discouraged)**  | Accesses via S3 Gateway. Directory operations are **NOT atomic** and slow. High risk of inconsistency for Hive.    |

**Always use `ofs://`or`o3fs://` with FSO buckets for Hive.**

## Working with Hive Tables in Ozone

Once configured, standard Hive DDL and DML operations work with Ozone paths.

### Creating FSO Buckets

Ensure the target bucket uses the FSO layout:

```bash
# Create volume if needed
ozone sh volume create /warehouse

# Create FSO bucket
ozone sh bucket create --layout FILE_SYSTEM_OPTIMIZED /warehouse/hive

# Set appropriate permissions (example: allow hive user full control)
ozone sh bucket setacl /warehouse/hive --acl user:hive:a
```

### Managed Tables

Data is stored under `hive.metastore.warehouse.dir`. Hive manages the data lifecycle.

```sql
-- Use the database associated with the warehouse directory
USE default; -- Or CREATE DATABASE sales LOCATION 'ofs://ozonecluster/warehouse/hive/sales.db'; USE sales;

-- Create a managed table
CREATE TABLE customers (id INT, name STRING) STORED AS ORC;

-- Load data
LOAD DATA LOCAL INPATH '/path/to/local/customers.csv' INTO TABLE customers;

-- Insert overwrite (benefits from atomic rename on FSO)
INSERT OVERWRITE TABLE customers SELECT id, name FROM staging_customers;

-- Drop table (benefits from recursive delete on FSO)
DROP TABLE customers; -- Data in Ozone is deleted
```

### External Tables

Data resides in a specified `LOCATION`. Hive does not manage the data lifecycle.

```sql
-- Create an external table pointing to existing data in Ozone
CREATE EXTERNAL TABLE web_logs (
    timestamp STRING,
    ip STRING,
    url STRING
)
STORED AS PARQUET
LOCATION 'ofs://ozonecluster/data/weblogs/'; -- Path must be in an FSO bucket

-- Drop table
DROP TABLE web_logs; -- Data in Ozone remains untouched
```

### Partitioned Tables

Partitioning works as expected. Hive creates subdirectories within the table location in Ozone.

```sql
CREATE TABLE daily_sales (
    product_id INT,
    amount DECIMAL(10,2)
)
PARTITIONED BY (sale_date DATE)
STORED AS ORC
LOCATION 'ofs://ozonecluster/warehouse/hive/daily_sales';

-- Load data into a partition
LOAD DATA LOCAL INPATH '/path/to/sales_20240413.csv'
INTO TABLE daily_sales PARTITION (sale_date='2024-04-13');
```

## Security Considerations

- **Kerberos:** If your Ozone and Hive clusters are Kerberized, ensure Hive services (HiveServer2, Metastore) and clients have valid Kerberos principals and keytabs configured. Hive will use Kerberos to authenticate to Ozone via the `ofs://` filesystem client.
- **Permissions/ACLs:** The user running Hive queries (e.g., the HiveServer2 user or the end-user submitting queries) needs appropriate permissions (ACLs) on the Ozone volumes, buckets, and directories used for warehouse locations and table data. Use `ozone sh volume setacl`, `ozone sh bucket setacl`, etc., to grant necessary rights (e.g., READ, WRITE, LIST, CREATE, DELETE).

## Troubleshooting

- **`ClassNotFoundException`for Ozone classes:** Ensure`ozone-filesystem*.jar` is correctly placed in the classpath for *all* relevant components (HS2, Metastore, clients, execution engines).
- **`FileSystem for schema 'ofs' not found`:** Check `core-site.xml`for the`fs.ofs.impl` property and verify classpath.
- **Permission Denied Errors:** Verify Ozone ACLs grant sufficient permissions to the Hive user for the target paths. Check Kerberos authentication if security is enabled.
- **Slow `INSERT OVERWRITE`or`DROP TABLE`:** Confirm the target bucket is using the **FSO layout**. Using OBS/Legacy layouts will cause severe performance issues for these operations.
- **Connection Refused / Cannot access Ozone Manager:** Check network connectivity, firewalls, and ensure the OM address/service ID in `core-site.xml` is correct and the OM service is running.

---

**Have questions about using Hive with Ozone?** Ask in the [Apache Ozone GitHub Discussions](https://github.com/apache/ozone/discussions/new?category=faq).
