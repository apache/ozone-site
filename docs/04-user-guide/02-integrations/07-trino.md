---
sidebar_label: Trino
---

# Trino with Ozone

[Trino](https://trino.io/) reads and writes Ozone data through the **Hive connector** and a **Hive Metastore (HMS)** that understands `ofs://` paths. For background on Hive warehouse paths and the Ozone filesystem JAR, see [Hive](./01-hive).

This page walks through a **Docker lab** verified with **Ozone 2.2.0**, **`ozone-filesystem-hadoop3-2.2.0.jar`**, and **`trinodb/trino:483`**.

## What you need

- Docker Compose with enough memory for Ozone (three Datanodes), Hive Metastore, and Trino.
- **`ozone-filesystem-hadoop3-*.jar`** at the **same version as your cluster** ([HDDS-14056](https://issues.apache.org/jira/browse/HDDS-14056): use this JAR only; the old **`ozone-filesystem-hadoop3-client`** artifact was removed in Ozone 2.2+).
- HMS on `thrift://<host>:9083`, with the same Ozone JAR and Hadoop XML as Trino.
- **`core-site.xml`** and **`ozone-site.xml`** inside the Trino container, referenced from the catalog.

:::warning Trino 483 and Hadoop 3.4 interfaces
Ozone **2.2.0** targets Hadoop **3.4** APIs. Trino **483** ships Hadoop **3.3.x**, which can cause `NoClassDefFoundError: org/apache/hadoop/fs/LeaseRecoverable` on the first `ofs://` write. This is a **Trino classpath gap**, not an Ozone build step—see [Build the Hadoop 3.4 interface stub](#build-the-hadoop-34-interface-stub-trino-483-lab) below. Prefer a Trino release that bundles Hadoop **3.4+** when one is available for your deployment.
:::

## 1. Download the Ozone filesystem JAR

```bash
OZONE_VERSION=2.2.0
curl -L -o /tmp/ozone-filesystem-hadoop3-${OZONE_VERSION}.jar \
  "https://repo1.maven.org/maven2/org/apache/ozone/ozone-filesystem-hadoop3/${OZONE_VERSION}/ozone-filesystem-hadoop3-${OZONE_VERSION}.jar"
```

You can also copy the JAR from a running Ozone container under `/opt/hadoop/share/ozone/lib/`.

### Build the Hadoop 3.4 interface stub (Trino 483 lab)

Ozone 2.1+ expects Hadoop **3.4** interface types on the client classpath ([HDDS-13574](https://issues.apache.org/jira/browse/HDDS-13574)). Trino **483** does not ship them. For a lab, build a **small stub JAR** from Apache **`hadoop-common` 3.4** on Maven Central—do **not** rebuild Ozone, and avoid dropping the full `hadoop-common` JAR onto Trino (Trino already embeds Hadoop 3.3 and duplicate JARs can cause other conflicts).

```bash
HADOOP34=/tmp/hadoop-common-3.4.0.jar
curl -L -o "$HADOOP34" \
  "https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-common/3.4.0/hadoop-common-3.4.0.jar"

mkdir -p /tmp/hadoop34-stub && cd /tmp/hadoop34-stub
jar xf "$HADOOP34" \
  org/apache/hadoop/fs/LeaseRecoverable.class \
  org/apache/hadoop/fs/SafeMode.class \
  org/apache/hadoop/fs/SafeModeAction.class
jar cf /tmp/hadoop34-interfaces.jar \
  org/apache/hadoop/fs/LeaseRecoverable.class \
  org/apache/hadoop/fs/SafeMode.class \
  org/apache/hadoop/fs/SafeModeAction.class
```

Copy **both** JARs into Trino’s Hive HDFS plugin directory (see step 4). Skip this stub if your Trino release already bundles Hadoop **3.4+**.

## 2. Start Ozone and create a bucket

Using [Apache Ozone Docker](https://github.com/apache/ozone-docker):

```bash
git clone https://github.com/apache/ozone-docker.git
cd ozone-docker
docker compose -p ozone-trino up -d --scale datanode=3
```

Create an FSO bucket with **`RATIS/ONE`** replication for the lab:

```bash
docker compose -p ozone-trino exec om \
  ozone sh bucket create s3v/trino-lab -l fso -t RATIS -r ONE
```

If writes hang, check SCM safe mode and exit when pipelines are ready:

```bash
docker compose -p ozone-trino exec scm ozone admin safemode status
docker compose -p ozone-trino exec scm ozone admin safemode exit
```

:::note Docker lab sizing
Three Datanodes avoid replication and pipeline issues on a small compose stack. If Docker disk space is tight, set smaller SCM container defaults in compose (for example `ozone.scm.container.size: "1GB"`).
:::

## 3. Prepare Hadoop XML

Author **`core-site.xml`** and **`ozone-site.xml`** on the host. Use the compose service names (`om`, `scm`) as hostnames. List **both files separately** in `hive.config.resources` (a single merged file is unreliable in this setup).

**`core-site.xml`:**

```xml
<?xml version="1.0"?>
<configuration>
  <property>
    <name>fs.ofs.impl</name>
    <value>org.apache.hadoop.fs.ozone.RootedOzoneFileSystem</value>
  </property>
  <property>
    <name>fs.AbstractFileSystem.ofs.impl</name>
    <value>org.apache.hadoop.fs.ozone.RootedOzFs</value>
  </property>
  <property>
    <name>fs.defaultFS</name>
    <value>ofs://om/</value>
  </property>
</configuration>
```

**`ozone-site.xml`:**

```xml
<?xml version="1.0"?>
<configuration>
  <property>
    <name>ozone.om.address</name>
    <value>om</value>
  </property>
  <property>
    <name>ozone.om.service.ids</name>
    <value>om</value>
  </property>
  <property>
    <name>ozone.om.nodes.om</name>
    <value>om</value>
  </property>
  <property>
    <name>ozone.om.address.om.om</name>
    <value>om</value>
  </property>
  <property>
    <name>ozone.scm.names</name>
    <value>scm</value>
  </property>
  <property>
    <name>ozone.scm.client.address</name>
    <value>scm</value>
  </property>
</configuration>
```

## 4. Start Hive Metastore and Trino

Start HMS on the **same Docker network** as Ozone (example network: `ozone-trino_default`). Mount the Ozone JAR plus the XML files:

```bash
docker run -d --name hive-metastore \
  --network ozone-trino_default \
  -p 9083:9083 \
  -e SERVICE_NAME=metastore \
  -v /path/to/hive-conf:/opt/hive/conf:ro \
  -v /tmp/ozone-filesystem-hadoop3-2.2.0.jar:/opt/hive/lib/ozone-filesystem-hadoop3.jar:ro \
  apache/hive:4.0.1
```

Include `hive-site.xml` in `hive-conf` with a warehouse path on Ozone, for example `ofs://om/s3v/trino-lab/warehouse`.

Start Trino on the same network and mount the Hadoop XML directory:

```bash
docker run -d --name trino \
  --network ozone-trino_default \
  -p 8080:8080 \
  --memory=1536m \
  -e JAVA_TOOL_OPTIONS="-Xmx768m -XX:+UseSerialGC" \
  -v /path/to/hadoop-conf:/tmp/hadoop/conf:ro \
  trinodb/trino
```

Copy the Ozone JAR, the Hadoop 3.4 interface stub (Trino 483), and the catalog into Trino, then restart:

```bash
docker cp /tmp/ozone-filesystem-hadoop3-2.2.0.jar \
  trino:/usr/lib/trino/plugin/hive/hdfs/
docker cp /tmp/hadoop34-interfaces.jar \
  trino:/usr/lib/trino/plugin/hive/hdfs/
docker cp ozone.properties trino:/etc/trino/catalog/ozone.properties
docker restart trino
```

**`ozone.properties`** (the file name becomes the catalog name):

```properties
connector.name=hive
hive.metastore.uri=thrift://hive-metastore:9083
fs.hadoop.enabled=true
hive.config.resources=/tmp/hadoop/conf/core-site.xml,/tmp/hadoop/conf/ozone-site.xml
hive.non-managed-table-writes-enabled=true
hive.hdfs.impersonation.enabled=false
hive.dfs.replication=1
hive.temporary-staging-directory-path=ofs://om/s3v/trino-lab/.staging
```

Set **`hive.temporary-staging-directory-path`** to your **`RATIS/ONE`** bucket. Trino otherwise stages under an auto-created `tmp` volume with default **`RATIS/THREE`**, which breaks moves into a one-replica lab bucket.

:::tip Docker Desktop on macOS
Use **`docker cp`** for catalog files and JARs. Bind-mount a directory for config, not a single file under `/tmp` (mounts can appear empty in the container).
:::

## 5. Verify

```sql
SHOW CATALOGS;
SHOW SCHEMAS FROM ozone;

CREATE SCHEMA ozone.lab WITH (location = 'ofs://om/s3v/trino-lab/lab');

CREATE TABLE ozone.lab.demo (
  id bigint,
  name varchar
) WITH (format = 'PARQUET');

INSERT INTO ozone.lab.demo VALUES (1, 'alice'), (2, 'bob');

SELECT * FROM ozone.lab.demo ORDER BY id;
```

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| `NoClassDefFoundError: LeaseRecoverable` | Trino Hadoop **3.3** vs Ozone **3.4** interfaces; build and copy `hadoop34-interfaces.jar` (step 1) or upgrade Trino. |
| `UnsupportedFileSystemException: ofs` | Missing or wrong `hive.config.resources`, or HMS missing Ozone JAR/XML. |
| INSERT fails moving staged files | Staging path not set to a **`RATIS/ONE`** bucket. |
| Writes hang | SCM safe mode; not enough healthy Datanodes or disk for pipelines. |
| Metastore connection errors | Trino not on the same Docker network as HMS, or wrong hostname in `hive.metastore.uri`. |

## Ranger (optional)

To enforce access control with [Apache Ranger](https://ranger.apache.org/), install the Trino Ranger plugin per [Trino Ranger access control](https://trino.io/docs/current/security/ranger-access-control.html). The Ranger project’s `dev-support/ranger-docker` compose stacks can provide Ozone, Hive, and Ranger on one network if you need a combined lab.
