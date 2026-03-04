---
sidebar_label: Spark
---

# Using Apache Spark with Ozone

Apache Spark is a widely used unified analytics engine for large-scale data processing. Ozone can serve as a scalable storage layer for Spark applications, allowing you to read and write data directly from/to Ozone clusters using familiar Spark APIs.

:::note
This guide covers Apache Spark 3.x. Examples were tested with Spark 3.5.x and Apache Ozone 2.1.0.
:::

## Overview

Spark interacts with Ozone primarily through the OzoneFileSystem (ofs) connector, which allows access using the `ofs://` URI scheme. You can also use the older `o3fs://` scheme, though `ofs://` is generally recommended.

Key benefits include:

- Storing large datasets generated or consumed by Spark jobs directly in Ozone.
- Leveraging Ozone's scalability and object storage features for Spark workloads.
- Using standard Spark DataFrame and `RDD` APIs to interact with Ozone data.

## Prerequisites

1. **Ozone Cluster:** A running Ozone cluster.
2. **Ozone Client JARs:** The `ozone-filesystem-hadoop3.jar` must be available on the Spark driver and executor classpath.
3. **Hadoop 3.4.x runtime (Ozone 2.1.0+):** Ozone 2.1.0 removed bundled copies of several Hadoop classes (`LeaseRecoverable`, `SafeMode`, `SafeModeAction`) and now requires them from the runtime classpath ([HDDS-13574](https://issues.apache.org/jira/browse/HDDS-13574)). Since Spark 3.5.x ships with Hadoop 3.3.4, you must add `hadoop-common-3.4.x.jar` to the Spark classpath alongside the existing Hadoop JARs.
4. **Configuration:** Spark needs access to Ozone configuration (`core-site.xml` and potentially `ozone-site.xml`) to connect to the Ozone cluster.

## Configuration

### 1. Core Site (`core-site.xml`)

For `core-site.xml` configuration, refer to the [Ozone File System (ofs) Configuration section](../01-client-interfaces/02-ofs.md#configuration).

### 2. Spark Configuration (`spark-defaults.conf` or `--conf`)

While Spark often picks up settings from `core-site.xml` on the classpath, explicitly setting the implementation can sometimes be necessary:

```properties
spark.hadoop.fs.ofs.impl=org.apache.hadoop.fs.ozone.RootedOzoneFileSystem
spark.hadoop.fs.o3fs.impl=org.apache.hadoop.fs.ozone.OzoneFileSystem
```

### 3. Security (Kerberos)

If your Ozone and Spark clusters are Kerberos-enabled, Spark needs permission to obtain delegation tokens for Ozone. Configure the following property in `spark-defaults.conf`or via`--conf`, specifying your Ozone filesystem URI:

```properties
# For YARN deployments in spark3+
spark.kerberos.access.hadoopFileSystems=ofs://ozone1/
```

Replace `ozone1` with your OM Service ID. Ensure the user running the Spark job has a valid Kerberos ticket (`kinit`).

## Usage Examples

You can read and write data using `ofs://` URIs like any other Hadoop-compatible filesystem.

**URI Format:** `ofs://<om-service-id>/<volume>/<bucket>/path/to/key>`

### Reading Data (Scala)

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder.appName("Ozone Spark Read Example").getOrCreate()

// Read a CSV file from Ozone
val df = spark.read.format("csv")
  .option("header", "true")
  .option("inferSchema", "true")
  .load("ofs://ozone1/volume1/bucket1/input/data.csv")

df.show()

spark.stop()
```

### Writing Data (Scala)

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder.appName("Ozone Spark Write Example").getOrCreate()

// Assume 'df' is a DataFrame you want to write
val data = Seq(("Alice", 1), ("Bob", 2), ("Charlie", 3))
val df = spark.createDataFrame(data).toDF("name", "id")

// Write DataFrame to Ozone as Parquet files
df.write.mode("overwrite")
  .parquet("ofs://ozone1/volume1/bucket1/output/users.parquet")

spark.stop()
```

### Reading Data (Python)

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("Ozone Spark Read Example").getOrCreate()

# Read a CSV file from Ozone
df = spark.read.format("csv") \
    .option("header", "true") \
    .option("inferSchema", "true") \
    .load("ofs://ozone1/volume1/bucket1/input/data.csv")

df.show()

spark.stop()
```

### Writing Data (Python)

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("Ozone Spark Write Example").getOrCreate()

# Assume 'df' is a DataFrame you want to write
data = [("Alice", 1), ("Bob", 2), ("Charlie", 3)]
columns = ["name", "id"]
df = spark.createDataFrame(data, columns)

# Write DataFrame to Ozone as Parquet files
df.write.mode("overwrite") \
    .parquet("ofs://ozone1/volume1/bucket1/output/users.parquet")

spark.stop()
```

## Spark on Kubernetes

The recommended approach for running Spark on Kubernetes with Ozone is to bake the `ozone-filesystem-hadoop3-client-*.jar` JAR, the `hadoop-common-3.4.x.jar` JAR (if using Ozone 2.1.0+), and core-site.xml directly into a custom Spark image.

### Build a Custom Spark Image

Place the Ozone client JAR and Hadoop compatibility JAR in /opt/spark/jars/, which is on the default Spark classpath, and core-site.xml in /opt/spark/conf/:

```dockerfile
FROM apache/spark:3.5.8-scala2.12-java11-python3-ubuntu

USER root

ADD https://repo1.maven.org/maven2/org/apache/ozone/ozone-filesystem-hadoop3-client/2.1.0/ozone-filesystem-hadoop3-client-2.1.0.jar \
    /opt/spark/jars/

# Ozone 2.1.0+ requires Hadoop 3.4.x classes (HDDS-13574).
# Add alongside (not replacing) Spark's bundled hadoop-common-3.3.4.jar.
ADD https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-common/3.4.2/hadoop-common-3.4.2.jar \
    /opt/spark/jars/

COPY core-site.xml /opt/spark/conf/core-site.xml
COPY ozone_write.py /opt/spark/work-dir/ozone_write.py

USER spark
```

Where core-site.xml contains at minimum:

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>fs.ofs.impl</name>
    <value>org.apache.hadoop.fs.ozone.RootedOzoneFileSystem</value>
  </property>
  <property>
    <name>fs.o3fs.impl</name>
    <value>org.apache.hadoop.fs.ozone.OzoneFileSystem</value>
  </property>
  <property>
    <name>ozone.om.address</name>
    <value>om-host.example.com:9862</value>
  </property>
</configuration>
```

### Submit `Spark-submit`

```bash
./bin/spark-submit \
  --master k8s://https://YOUR_KUBERNETES_API_SERVER:6443 \
  --deploy-mode cluster \
  --name spark-ozone-example \
  --conf spark.executor.instances=2 \
  --conf spark.kubernetes.container.image=YOUR_REPO/spark-ozone:latest \
  --conf spark.kubernetes.authenticate.driver.serviceAccountName=spark \
  --conf spark.kubernetes.namespace=YOUR_NAMESPACE \
  local:///opt/spark/work-dir/ozone_example.py
```

Replace `YOUR_KUBERNETES_API_SERVER`, `YOUR_REPO`, and `YOUR_NAMESPACE` with your environment values.
