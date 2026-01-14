---
sidebar_label: Spark
---

# Using Apache Spark with Ozone

Apache Spark is a widely used unified analytics engine for large-scale data processing. Ozone can serve as a scalable storage layer for Spark applications, allowing you to read and write data directly from/to Ozone clusters using familiar Spark APIs.

## Overview

Spark interacts with Ozone primarily through the OzoneFileSystem (ofs) connector, which allows access using the `ofs://` URI scheme. You can also use the older `o3fs://` scheme, though `ofs://` is generally recommended, especially in CDP environments.

Key benefits include:

- Storing large datasets generated or consumed by Spark jobs directly in Ozone.
- Leveraging Ozone's scalability and object storage features for Spark workloads.
- Using standard Spark DataFrame and RDD APIs to interact with Ozone data.

## Prerequisites

1. **Ozone Cluster:** A running Ozone cluster.
2. **Ozone Client JARs:** The `hadoop-ozone-filesystem-hadoop3.jar` must be available on the Spark driver and executor classpath.
3. **Configuration:** Spark needs access to Ozone configuration (`core-site.xml`and potentially`ozone-site.xml`) to connect to the Ozone cluster.

## Configuration

### 1. Core Site (`core-site.xml`)

For `core-site.xml` configuration, refer to the [Ozone File System (ofs) Configuration section](../01-client-interfaces/02-ofs.md#configuration).

### 2. Spark Configuration (`spark-defaults.conf` or `--conf`)

While Spark often picks up settings from `core-site.xml` on the classpath, explicitly setting the implementation can sometimes be necessary:

```properties
spark.hadoop.fs.ofs.impl=org.apache.hadoop.fs.ozone.RootedOzoneFileSystem
spark.hadoop.fs.o3fs.impl=org.apache.hadoop.fs.ozone.OzoneFileSystem
```

### 3. Client JAR Placement

Copy the `hadoop-ozone-filesystem-*.jar` to the `$SPARK_HOME/jars/` directory on all nodes where Spark driver and executors run. Alternatively, provide it using the `--jars` option in `Spark-submit`.

### 4. Security (Kerberos)

If your Ozone and Spark clusters are Kerberos-enabled, Spark needs permission to obtain delegation tokens for Ozone. Configure the following property in `spark-defaults.conf`or via`--conf`, specifying your Ozone filesystem URI:

```properties
# For YARN deployments
spark.yarn.access.hadoopFileSystems=ofs://ozone1/
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

To run Spark jobs on Kubernetes accessing Ozone:

1. **Build a Custom Spark Image:** Create a Docker image based on your desired Spark version. Add the `hadoop-ozone-filesystem-*.jar` and the necessary Ozone configuration files (`core-site.xml`, `ozone-site.xml`) into the image (e.g., under `/opt/hadoop/conf`).
2. **Configure `Spark-submit`:**
    - Set `--master k8s://<kubernetes-api-server>`.
    - Specify the custom image: `--conf spark.kubernetes.container.image=<your-repo>/spark-ozone:latest`.
    - Point to the config directory: `--conf spark.kubernetes.hadoop.configMapName=<configmap-name>` (if using ConfigMap) or ensure the image has the files and potentially set`HADOOP_CONF_DIR`.
    - Include the JAR path if not baked into the default classpath: `--jars local:///path/in/container/to/hadoop-ozone-filesystem.jar`.
    - Add necessary Kubernetes configurations (`namespace`, `serviceAccountName`, etc.).

   Example using `o3fs`(adapt for`ofs`):

    ```bash
    ./bin/Spark-submit \
      --master k8s://https://<KUBERNETES_MASTER_IP>:<PORT> \
      --deploy-mode cluster \
      --name Spark-Ozone-Test \
      --class org.apache.spark.examples.SparkPi \
      --conf spark.executor.instances=1 \
      --conf spark.kubernetes.container.image=<your-docker-repo>/spark-ozone:latest \
      --conf spark.kubernetes.authenticate.driver.serviceAccountName=spark \
      --conf spark.kubernetes.namespace=your-namespace \
      --conf spark.hadoop.fs.o3fs.impl=org.apache.hadoop.fs.ozone.OzoneFileSystem \
      --conf spark.driver.extraJavaOptions="-Dsun.security.krb5.rcache=/tmp/krb5cc_spark -Dsun.security.krb5.debug=true" \
      --conf spark.executor.extraJavaOptions="-Dsun.security.krb5.rcache=/tmp/krb5cc_spark -Dsun.security.krb5.debug=true" \
      local:///opt/spark/examples/jars/spark-examples_*.jar \
      o3fs://bucket1.volume1.ozone-om-host:9862/testoutput \
      10
    ```

   (Adapt the `o3fs`path and configuration for`ofs` scheme as needed.)