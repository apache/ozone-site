---
sidebar_label: Impala
---

# Impala

Starting with version **4.2.0**, Apache Impala provides full support for querying data stored in Apache Ozone. To utilize this functionality, ensure that your Ozone version is **1.4.0** or later.

## Supported Access Protocols

Impala supports the following protocols for accessing Ozone data:

  * `ofs`
  * `s3a`

> **Note:**
> The `o3fs` protocol is **NOT** supported by Impala.

## Supported Replication Types

Impala is compatible with Ozone buckets configured with either:

  * **RATIS** (Replication)
  * **Erasure Coding**

## Querying Ozone Data with Impala

Impala provides two approaches to interact with Ozone:

1.  Managed Tables
2.  External Tables

### Managed Tables

If the Hive Warehouse Directory is located in Ozone, you can execute Impala queries without any changes, treating the Ozone file system like HDFS.

**Example:**

```sql
CREATE DATABASE d1;

CREATE TABLE t1 (x INT, s STRING);
```

The data will be stored under the Hive Warehouse Directory path in Ozone.

#### Specifying a Custom Ozone Path

You can create managed databases, tables, or partitions at a specific Ozone path using the `LOCATION` clause.

**Example:**

```sql
CREATE DATABASE d1 LOCATION 'ofs://ozone1/vol1/bucket1/d1.db';

CREATE TABLE t1 LOCATION 'ofs://ozone1/vol1/bucket1/table1';
```

### External Tables

You can create an external table in Impala to query Ozone data.

**Example:**

```sql
CREATE EXTERNAL TABLE external_table (
  id INT,
  name STRING
) LOCATION 'ofs://ozone1/vol1/bucket1/table1';
```

With external tables:

  * The data is expected to be created and managed by another tool.
  * Impala queries the data as-is.
  * The metadata is stored under the external warehouse directory.

> **Note:**
> Dropping an external table in Impala does not delete the associated data.

### Using the S3A Protocol

In addition to `ofs`, Impala can access Ozone via the S3 Gateway using the S3A file system. For more details, refer to:

  * [The S3 Protocol](https://www.google.com/search?q=../01-client-interfaces/03-s3.md)
  * The [Hadoop S3A documentation](https://hadoop.apache.org/docs/stable/hadoop-aws/tools/hadoop-aws/index.html)

For additional information, consult the Apache Impala User Documentation on [Using Impala with Apache Ozone Storage](https://impala.apache.org/docs/build/html/topics/impala_ozone.html).
