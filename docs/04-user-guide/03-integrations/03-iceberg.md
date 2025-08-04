# Apache Iceberg 
Apache Iceberg is an open table format for huge analytic datasets that provides high-performance format for large data tables built on top of distributed storage systems such as Apache Ozone. This integration allows users to combine Iceberg's powerful table management capabilities with Ozone's scalable and resilient storage.

## How Iceberg Works with Storage

Iceberg's architecture relies on storage systems for several key components:

- **Data Files**: The actual data content stored in file formats like Parquet, ORC, or Avro
- **Metadata Files**: JSON files containing table schemas, partitioning information, and snapshots
- **Manifest Files**: Lists of data files that belong to a table snapshot
- **Manifest Lists**: Files that track table snapshots and their corresponding manifests

Iceberg requires storage systems to provide:
- File-level operations (create, read, update, delete)
- Atomic operations for metadata updates
- Consistent reads for reliable table access
- Support for both small metadata files and large data files

## How Ozone Enables Iceberg Integration

Ozone provides native compatibility with Iceberg through the Ozone File System (OFS) interface, which implements the Hadoop Compatible File System (HCFS) API. This enables Iceberg to work with Ozone without code modifications.

The key enabler is the `ofs://` protocol, which:
- Provides HDFS-like file system semantics
- Supports atomic directory operations with File System Optimized (FSO) buckets
- Maintains hierarchical namespace required by Iceberg's table structure
- Delivers consistent reads and writes for reliable metadata operations

## Configuration Requirements

### 1. Add Ozone File System JAR to Classpath

Ensure the Ozone filesystem JAR is added to the classpath of all services that will use Iceberg with Ozone:

```bash
export HADOOP_CLASSPATH=/opt/ozone/share/ozone/lib/ozone-filesystem-hadoop3-*.jar:$HADOOP_CLASSPATH
```

### 2. Configure Hadoop Core Site

Add Ozone filesystem implementation to your Hadoop configuration:

```xml
<property>
  <n>fs.ofs.impl</n>
  <value>org.apache.hadoop.fs.ozone.RootedOzoneFileSystem</value>
</property>

<!-- For OM HA (Recommended for Production) -->
<property>
  <n>ozone.om.service.ids</n>
  <value>ozone1</value>
</property>
<property>
  <n>ozone.om.nodes.ozone1</n>
  <value>om1.host:9862,om2.host:9862,om3.host:9862</value>
</property>
```

### 3. Configure Iceberg Catalog

Set up an Iceberg catalog to use Ozone as the storage backend. Here's an example for a Hadoop catalog:

#### Spark Configuration

```scala
// In Spark
spark.sql.catalog.ozone_catalog = org.apache.iceberg.spark.SparkCatalog
spark.sql.catalog.ozone_catalog.type = hadoop
spark.sql.catalog.ozone_catalog.warehouse = ofs://ozone1/vol1/bucket1/warehouse/iceberg

// Optional: set as default catalog
spark.sql.defaultCatalog = ozone_catalog
```

#### Flink Configuration

```yaml
catalogs:
  - name: ozone_catalog
    type: iceberg
    catalog-type: hadoop
    warehouse: ofs://ozone1/vol1/bucket1/warehouse/iceberg
```

#### Trino Configuration

```properties
connector.name=iceberg
iceberg.catalog.type=hadoop
iceberg.catalog.warehouse=ofs://ozone1/vol1/bucket1/warehouse/iceberg
```

## Bucket Layout Considerations

For Iceberg workloads, use **File System Optimized (FSO)** bucket layout, which:
- Maintains a hierarchical directory structure in Ozone
- Enables atomic operations needed for reliable metadata updates
- Provides optimal performance for table operations

To create an FSO bucket for Iceberg:

```bash
ozone sh bucket create --layout FILE_SYSTEM_OPTIMIZED /vol1/bucket1
```

## Working with Iceberg Tables in Ozone

### Creating Tables

```sql
-- Spark SQL example
CREATE TABLE ozone_catalog.db.table (
  id bigint,
  data string,
  ts timestamp)
USING iceberg
PARTITIONED BY (days(ts));
```

### Reading and Writing Data

```sql
-- Write data to the table
INSERT INTO ozone_catalog.db.table VALUES (1, 'a', timestamp('2022-01-01 00:00:00'));

-- Read data from the table
SELECT * FROM ozone_catalog.db.table;
```

### Using Iceberg Table Features

Iceberg tables in Ozone support all Iceberg features, including:

```sql
-- Time travel queries
SELECT * FROM ozone_catalog.db.table VERSION AS OF 1234;

-- Incremental queries
SELECT * FROM ozone_catalog.db.table INCREMENTAL FROM 1234 TO 5678;

-- Metadata queries
SELECT * FROM ozone_catalog.db.table.snapshots;
```

## Performance Optimizations

### Optimizing Read Performance

1. **Utilize Metadata Pruning**: Iceberg's metadata pruning works effectively with Ozone.
   ```sql
   -- Efficient pruning using partition and filter pushdown
   SELECT * FROM ozone_catalog.db.table 
   WHERE ts > timestamp('2022-01-01') AND ts < timestamp('2022-02-01');
   ```

2. **Optimize for Concurrent Reads**: Ozone's distributed nature supports high concurrency.
   ```scala
   // Set higher parallelism for reads
   spark.read
     .option("read.split.target-size", "134217728") // 128 MB
     .format("iceberg")
     .load("ozone_catalog.db.table")
   ```

### Optimizing Write Performance

1. **Tuning File Sizes**: Optimize file sizes for Ozone's block size.
   ```sql
   ALTER TABLE ozone_catalog.db.table SET 
   TBLPROPERTIES ('write.target-file-size-bytes'='134217728');
   ```

2. **Optimizing Partitioning**: Choose partitioning schemes appropriate for your query patterns and Ozone's characteristics.
   ```sql
   -- Partitioning by date with proper cardinality
   CREATE TABLE ozone_catalog.db.table (
     id bigint,
     data string,
     ts timestamp)
   USING iceberg
   PARTITIONED BY (days(ts));
   ```

## Table Maintenance Operations

Regular table maintenance ensures optimal performance:

```sql
-- Compact small files
CALL ozone_catalog.system.rewrite_data_files('db.table');

-- Remove old snapshots
CALL ozone_catalog.system.expire_snapshots('db.table', TIMESTAMP '2022-01-01 00:00:00');

-- Run full vacuum
CALL ozone_catalog.system.remove_orphan_files('db.table');
```

## Best Practices for Iceberg with Ozone

1. **Use File System Optimized (FSO) buckets** for Iceberg workloads to enable atomic operations needed for metadata consistency.

2. **Choose appropriate partition schemes** to balance query performance with Ozone's data placement.

3. **Regularly maintain tables** by compacting small files and expiring old snapshots to optimize read performance and storage usage.

4. **Configure catalog for high availability** by using Ozone's HA features with the `ofs://` protocol.

5. **Tune file sizes** based on your workload patterns and Ozone's block size.

6. **Use Ozone Recon** to monitor storage usage and performance metrics.

7. **Ensure proper JAR inclusion** in all services that interact with Iceberg tables in Ozone.

## Limitations and Considerations

- Iceberg tables in Ozone require FSO bucket layout for atomic operations
- Performance characteristics may differ from HDFS or S3, particularly for metadata-heavy operations
- Thoroughly test table maintenance operations in your environment
- Ensure network connectivity between compute and storage is optimized

## Open Data Lakehouse with Iceberg on Ozone

Apache Ozone with Iceberg provides an ideal foundation for building an open data lakehouse architecture that combines the best of data lakes and data warehouses.

### Architecture Overview

![Data Lakehouse Architecture](https://placeholder-for-architecture-diagram.com)

A typical data lakehouse architecture with Iceberg on Ozone consists of:

1. **Storage Layer**: Apache Ozone provides the scalable, reliable storage foundation
   - Multi-protocol access (S3, HDFS-compatible)
   - High durability through replication or erasure coding
   - Cost-effective compared to public cloud object stores

2. **Table Format Layer**: Apache Iceberg manages table structure and metadata
   - Schema evolution
   - Partition evolution
   - Snapshot isolation
   - Time travel capabilities

3. **Compute Layer**: Multiple engines can work on the same data
   - Apache Spark for batch and streaming
   - Apache Flink for streaming
   - Trino/Presto for interactive queries
   - Hive for batch processing

### Implementation Patterns

A common pattern is building a multi-zone data lakehouse using Iceberg tables stored in Ozone:

1. **Landing Zone**: Store raw data as-is in Ozone using the S3 API
   ```bash
   # Ingest data through the S3 gateway
   aws s3 cp --endpoint-url http://ozone-s3g:9878 data.csv s3://landing-bucket/data/
   
   # Or using the OFS interface for direct ingestion
   hadoop fs -put data.csv ofs://ozone1/vol1/landing-bucket/data/
   ```

2. **Bronze/Silver/Gold Architecture**: Create Iceberg tables for different data refinement stages

   ```sql
   -- Bronze: Raw data with minimal schema enforcement and validation
   CREATE TABLE ozone_catalog.bronze.sales (
     transaction_id STRING,
     data STRING, -- JSON or raw format
     ingest_time TIMESTAMP
   ) USING iceberg
   PARTITIONED BY (days(ingest_time))
   LOCATION 'ofs://ozone1/vol1/lakehouse/bronze/sales';
   
   -- Silver: Cleansed and transformed data with proper schema
   CREATE TABLE ozone_catalog.silver.sales (
     transaction_id STRING,
     product_id STRING,
     customer_id STRING,
     quantity INT,
     price DECIMAL(10,2),
     transaction_time TIMESTAMP,
     process_time TIMESTAMP
   ) USING iceberg
   PARTITIONED BY (days(transaction_time))
   LOCATION 'ofs://ozone1/vol1/lakehouse/silver/sales';
   
   -- Gold: Business-ready, aggregated data for analytics
   CREATE TABLE ozone_catalog.gold.daily_sales_by_region (
     date DATE,
     region STRING,
     product_category STRING,
     total_sales DECIMAL(20,2),
     transaction_count BIGINT
   ) USING iceberg
   PARTITIONED BY (date)
   LOCATION 'ofs://ozone1/vol1/lakehouse/gold/daily_sales_by_region';
   ```

3. **ETL Processes**: Implement data transformation pipelines between zones

   ```scala
   // Spark example: Bronze to Silver transformation
   spark.sql("""
     INSERT INTO ozone_catalog.silver.sales
     SELECT 
       CAST(get_json_object(data, '$.transaction_id') AS STRING) as transaction_id,
       CAST(get_json_object(data, '$.product_id') AS STRING) as product_id,
       CAST(get_json_object(data, '$.customer_id') AS STRING) as customer_id,
       CAST(get_json_object(data, '$.quantity') AS INT) as quantity,
       CAST(get_json_object(data, '$.price') AS DECIMAL(10,2)) as price,
       CAST(get_json_object(data, '$.transaction_time') AS TIMESTAMP) as transaction_time,
       current_timestamp() as process_time
     FROM ozone_catalog.bronze.sales
     WHERE ingest_time > (SELECT max(process_time) FROM ozone_catalog.silver.sales)
   """)
   ```

4. **Analytics and BI Tools**: Use SQL engines to query the data

   ```sql
   -- Business analytics on gold layer
   SELECT 
     region,
     SUM(total_sales) as quarterly_sales,
     SUM(transaction_count) as quarterly_transactions
   FROM ozone_catalog.gold.daily_sales_by_region
   WHERE date BETWEEN '2023-01-01' AND '2023-03-31'
   GROUP BY region
   ORDER BY quarterly_sales DESC;
   ```

### Advantages of This Architecture

This open data lakehouse approach with Iceberg on Ozone provides several key benefits:

1. **Open Format**: No vendor lock-in; data stored in open formats (Parquet, Avro, ORC)
2. **Schema Evolution**: Add, remove, or change columns without impacting operations
3. **ACID Transactions**: Reliable concurrent reads and writes with consistent snapshots
4. **Time Travel**: Query data as it existed at a specific point in time
5. **Cost Efficiency**: Ozone provides cost-effective storage compared to cloud alternatives
6. **Multi-Engine Support**: Use the right tool for each job (Spark, Flink, Trino, etc.)
7. **Separation of Storage and Compute**: Scale each independently

### Infrastructure Considerations

For optimal performance in a production environment:

1. **Network Topology**: Ensure Ozone datanodes are on the same network as compute nodes
2. **Storage Configuration**: Use high-performance storage (NVMe SSDs) for Ozone metadata (OM and SCM)
3. **Memory Allocation**: Provide sufficient memory for RocksDB caches in Ozone Manager
4. **Compute Resources**: Size Spark/Trino clusters appropriately for your workloads
5. **Data Placement**: Consider rack awareness configuration to optimize data locality

This pattern leverages Ozone's scalability and multi-protocol access with Iceberg's table management capabilities for a complete, open data lakehouse solution that avoids vendor lock-in while providing advanced data management features.

---

**Have questions about using Apache Iceberg with Ozone?** Ask in the [Apache Ozone GitHub Discussions](https://github.com/apache/ozone/discussions/new?category=faq).
