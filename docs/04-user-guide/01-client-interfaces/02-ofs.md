---
sidebar_label: Ozone File System (ofs)
---

# Ozone File System (`ofs`)

The Ozone File System (`ofs`) provides a **Hadoop Compatible File System (HCFS)** interface for Apache Ozone. It allows users and applications to interact with Ozone using familiar filesystem semantics and tools, similar to HDFS.

## Overview

`ofs`enables accessing Ozone data using the`ofs://` URI scheme. It's particularly designed to work seamlessly with File System Optimized (FSO) buckets, which maintain an internal hierarchical directory structure.

**Key Features:**

- **HCFS Compatibility:** Implements the Hadoop `FileSystem` API, making it compatible with a wide range of Hadoop ecosystem tools (Spark, Hive, Impala, MapReduce, YARN, etc.) out-of-the-box.
- **Filesystem Semantics:** Provides standard filesystem operations like creating directories (`mkdir`), listing directories (`ls`), renaming files/directories (`mv`), and deleting files/directories (`rm`).
- **Atomic Operations:** When used with FSO buckets, directory renames and deletes performed via `ofs://` are atomic operations handled efficiently by the Ozone Manager. This is crucial for the correctness of many analytics workloads (e.g., job committers).
- **Trash Support:** Supports the standard Hadoop trash mechanism (`fs.trash.interval`) for safe deletion when enabled in the configuration.
- **Path Format:** Uses a path format like `ofs://<om_service_id>/<volumeName>/<bucketName>/path/to/file`.
- `<om_service_id>`: The logical name configured for the Ozone Manager service (required for HA setups, optional for non-HA where OM host/port can be used).

## Configuration

To use `ofs://`, Hadoop clients need the Ozone filesystem client JARs on their classpath. The `fs.ofs.impl` and `fs.defaultFS` properties are configured in `core-site.xml`, while the remaining Ozone-specific properties are configured in `ozone-site.xml`.

### `core-site.xml` Configuration

```xml
<property>
  <name>fs.ofs.impl</name>
  <value>org.apache.hadoop.fs.ozone.RootedOzoneFileSystem</value>
  <description>The implementation class for the ofs filesystem.</description>
</property>

<property>
  <name>fs.defaultFS</name>
  <value>ofs://<om_service_id></value>
  <description>
    Optional: Set ofs as the default filesystem. Replace <om_service_id>
    with your OM Service ID (e.g., ozonecluster).
  </description>
</property>
```

### `ozone-site.xml` Configuration

#### For OM HA (Recommended)
```xml
<!--
One Ozone configuration (ozone-site.xml) can support multiple Ozone HA clusters. To select between the available HA clusters, a logical name is required for each of the clusters which can be resolved to the IP addresses (and domain names) of the Ozone Managers.

This logical name is called serviceId and can be configured in the ozone-site.xml.
-->
<property>
   <name>ozone.om.service.ids</name>
   <value><om_service_id></value> <!-- e.g., cluster1 -->
   <description>Logical name for the Ozone Manager service.</description>
</property>
<!-- For each of the defined serviceId, a logical configuration name should be defined for each of the servers. -->
<property>
   <name>ozone.om.nodes.<om_service_id></name>
   <value>om1,om2,om3</value> <!-- e.g., for cluster1: om1,om2,om3 -->
   <description>List of logical OM node names for the service ID.</description>
</property>
<!-- The defined prefixes can be used to define the address of each of the OM services: -->
<property>
   <name>ozone.om.address.<om_service_id>.om1</name>
   <value>host1:9862</value> <!-- e.g., for cluster1.om1: host1:9862 -->
   <description>Address of OM node 'om1' for the service ID.</description>
</property>
<property>
   <name>ozone.om.address.<om_service_id>.om2</name>
   <value>host2:9862</value> <!-- e.g., for cluster1.om2: host2:9862 -->
   <description>Address of OM node 'om2' for the service ID.</description>
</property>
<property>
   <name>ozone.om.address.<om_service_id>.om3</name>
   <value>host3:9862</value> <!-- e.g., for cluster1.om3: host3:9862 -->
   <description>Address of OM node 'om3' for the service ID.</description>
</property>
```

#### For Non-HA OM (Simpler setups, not recommended for production)
```xml
<property>
  <name>ozone.om.address</name>
  <value>om.host:9862</value>
  <description>Address of the Ozone Manager.</description>
</property>
```

## Usage Examples

**Hadoop FS CLI:**

```bash
# List contents
hadoop fs -ls ofs://ozonecluster/vol1/bucket1/

# Create a directory
hadoop fs -mkdir ofs://ozonecluster/vol1/bucket1/newdir

# Copy a local file to Ozone
hadoop fs -copyFromLocal /local/path/file.txt ofs://ozonecluster/vol1/bucket1/newdir/

# Rename a directory (atomic on FSO buckets)
hadoop fs -mv ofs://ozonecluster/vol1/bucket1/newdir ofs://ozonecluster/vol1/bucket1/renameddir
```

**Spark/Hive:**

Applications like Spark and Hive can read from and write to Ozone by simply using `ofs://` paths once the configuration is set up correctly.

```sql
-- Example Hive query
CREATE EXTERNAL TABLE my_table (...)
LOCATION 'ofs://ozonecluster/vol1/bucket1/data/my_table';

LOAD DATA LOCAL INPATH '/local/data.csv' INTO TABLE my_table;
```

## When to Use

`ofs://` is the recommended interface when:

- You need **HCFS compatibility** for Hadoop ecosystem tools.
- You require **atomic directory renames and deletes** (use with FSO buckets).
- You are migrating workloads from HDFS to Ozone.
- Filesystem semantics are preferred over object storage semantics.

It provides the most seamless integration for traditional big data analytics workloads running on Ozone.
