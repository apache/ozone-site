---
sidebar_label: Impala
---

# Impala

Starting with version **4.2.0**, Apache Impala provides full support for querying data stored in Apache Ozone. To utilize this functionality, ensure that your Ozone version is **1.4.0** or later.

## Supported Access Protocols

Impala supports the following protocols for accessing Ozone data:

- `ofs`
- `s3a`

> **Note:**
> The `o3fs` protocol is **NOT** supported by Impala.

## Supported Replication Types

Impala is compatible with Ozone buckets configured with either:

- **RATIS** (Replication)
- **Erasure Coding**

## Querying Ozone Data with Impala

Impala provides two approaches to interact with Ozone:

1. Managed Tables
2. External Tables

### Managed Tables

If the Hive Warehouse Directory is located in Ozone, you can execute Impala queries without any changes, treating the Ozone file system like HDFS.

**Example:**

```sql
CREATE DATABASE d1;

CREATE TABLE t1 (x INT, s STRING);
