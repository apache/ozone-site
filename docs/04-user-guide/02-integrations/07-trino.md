---
sidebar_label: Trino
---

# Trino with Ozone (Hive connector) and Ranger

[Trino](https://trino.io/) can query tables whose data lives in Apache Ozone when you use the **Hive connector** and a **Hive Metastore (HMS)** that already understands Ozone paths (`ofs://`, `o3fs://`, or `s3a://`, depending on how tables were created). [Apache Ranger](https://ranger.apache.org/) can enforce access control for Trino through Trino’s Ranger integration.

This page describes a **Docker-based lab-style setup**: obtain the standard Ozone **Hadoop 3 filesystem** JAR (`ozone-filesystem-hadoop3-*.jar`), join Trino to the same Docker network as Ozone and Hive, configure a Hive catalog, and optionally Ranger access control.

:::note
This is an **advanced** integration. Names (`ranger-hive`, `rangernw`), compose file names, and paths come from typical Ranger `dev-support/ranger-docker` layouts and **will differ** if you change compose projects or image tags. Treat hostnames and file names as examples and align them with your environment.
:::

For how Hive uses Ozone (warehouse paths, `ofs://` URIs, and the filesystem JAR), see the [Hive](./hive) integration page.

## Prerequisites

- Docker and Docker Compose, with enough memory for Ozone, Hive, Trino, and (optionally) Ranger.
- The **`ozone-filesystem-hadoop3-*.jar`** artifact at the **same Ozone version as your cluster** (see [Ozone JAR and Trino](#ozone-jar-and-trino)).
- A running **Hive Metastore** that Trino can reach on `thrift://<host>:9083`.
- **Hadoop XML configuration** inside the Trino container that defines the Ozone filesystem (`fs.ofs.impl`, OM/SCM addresses) and is referenced by `hive.config.resources`.
- If you use Ranger: Trino **Ranger plugin** configuration files and policies synced from Ranger Admin. See [Trino Ranger access control](https://trino.io/docs/current/security/ranger-access-control.html).

## Ozone JAR and Trino

Trino bundles its own Hadoop libraries (currently Hadoop **3.3.x** in recent `trinodb/trino` images). For the Hive connector to read and write `ofs://` / `o3fs://` paths, the **`ozone-filesystem-hadoop3-*.jar`** from the **`ozonefs-hadoop3`** Maven module must be on the Hive HDFS plugin classpath (see below).

Since [HDDS-14056](https://issues.apache.org/jira/browse/HDDS-14056) (Ozone 2.2+), use **`ozone-filesystem-hadoop3` only**. The separate **`ozone-filesystem-hadoop3-client`** artifact was removed; protobuf is relocated inside the main JAR to `org.apache.ozone.shaded.com.google.protobuf`. Do **not** look for or build the old client JAR.

If you hit protobuf class-cast errors at runtime with a specific Trino release, see [Trino discussion #18026](https://github.com/trinodb/trino/discussions/18026).

:::warning Hadoop line compatibility (Ozone 2.x + Trino 483)
Ozone **2.x** filesystem classes implement Hadoop **3.4** interfaces such as `org.apache.hadoop.fs.LeaseRecoverable`. Trino **483** still ships Hadoop **3.3.x**, which causes `NoClassDefFoundError: org/apache/hadoop/fs/LeaseRecoverable` on the first `ofs://` write unless you align versions. Options for a lab:

- Use a Trino release that bundles Hadoop **3.4+** when available, or
- Add a small supplemental JAR with the missing Hadoop 3.4 interface classes (`LeaseRecoverable`, `SafeMode`, `SafeModeAction`) to `plugin/hive/hdfs/` alongside the Ozone JAR (lab use only).

This was verified with `ozone-filesystem-hadoop3-2.2.0.jar` from Maven Central and `trinodb/trino:483`.
:::

## 1. Obtain the Ozone filesystem JAR

### Download from Maven Central (recommended for labs)

Match the JAR version to your cluster (example: Ozone **2.2.0**):

```bash
OZONE_VERSION=2.2.0
curl -L -o /tmp/ozone-filesystem-hadoop3-${OZONE_VERSION}.jar \
  "https://repo1.maven.org/maven2/org/apache/ozone/ozone-filesystem-hadoop3/${OZONE_VERSION}/ozone-filesystem-hadoop3-${OZONE_VERSION}.jar"
```

You can also copy the JAR from a running Ozone container:

```bash
docker cp <ozone-om-container>:/opt/hadoop/share/ozone/lib/ozone-filesystem-hadoop3-*.jar /tmp/
```

### Build from source

From your Ozone source checkout:

```bash
mvn clean package -DskipTests -pl hadoop-ozone/ozonefs-hadoop3 -am
cd hadoop-ozone/ozonefs-hadoop3/target/
cp ozone-filesystem-hadoop3-*.jar /tmp/
```

## 2. Bring up Ozone, Hive, and (optionally) Ranger in Docker

### Option A: Ranger project compose stacks

The Apache Ranger repo ships Docker Compose files under `dev-support/ranger-docker`.

1. Clone Ranger: [Apache Ranger](https://github.com/apache/ranger).
2. Open `dev-support/ranger-docker` and follow the **README** there.
3. Build and start the stack (verify file names against the current README):

```bash
docker compose \
  -f docker-compose.ranger.yml \
  -f docker-compose.ranger-hadoop.yml \
  -f docker-compose.ranger-hive.yml \
  -f docker-compose.ranger-ozone.yml \
  up -d
```

Use `docker network inspect` to find the compose network name (often `rangernw`) and HMS hostname (often `ranger-hive`).

### Option B: Minimal lab without Ranger (Ozone + Hive Metastore)

Verified against [Apache Ozone Docker](https://github.com/apache/ozone-docker) with `trinodb/trino:483` and `ozone-filesystem-hadoop3-2.2.0.jar`.

1. Start Ozone with **three Datanodes** (recommended for writes; default replication needs healthy Ratis pipelines):

   ```bash
   git clone https://github.com/apache/ozone-docker.git
   cd ozone-docker
   docker compose -p ozone-trino up -d --scale datanode=3
   ```

   On a nearly full Docker disk, add smaller container defaults to compose (for example `ozone.scm.container.size: "1GB"` and `hdds.datanode.volume.min.free.space: "256MB"`) so SCM can allocate pipelines.

2. Find the Docker network (example: `ozone-trino_default`):

   ```bash
   docker network ls | grep ozone-trino
   ```

3. Create an FSO bucket with **`RATIS/ONE`** replication (default `THREE` needs three Datanodes):

   ```bash
   docker compose -p ozone-trino exec om \
     ozone sh bucket create s3v/trino-lab -l fso -t RATIS -r ONE
   ```

4. Prepare Hadoop/Ozone XML on the host (see [Hadoop and Ozone configuration](#hadoop-and-ozone-configuration-inside-trino)). HMS needs the **same** `core-site.xml`, `ozone-site.xml`, and Ozone JAR.

5. Start Hive Metastore on the **same network**:

   ```bash
   docker run -d --name hive-metastore \
     --network ozone-trino_default \
     -p 9083:9083 \
     -e SERVICE_NAME=metastore \
     -v /path/to/hive-conf:/opt/hive/conf:ro \
     -v /tmp/ozone-filesystem-hadoop3-2.2.0.jar:/opt/hive/lib/ozone-filesystem-hadoop3.jar:ro \
     apache/hive:4.0.1
   ```

The `hive-conf` directory must include `hive-site.xml` (warehouse dir on Ozone), `core-site.xml`, and `ozone-site.xml`.

:::warning Network and hostnames
Trino’s catalog must use the **same Docker network** as HMS and the hostnames in `ozone-site.xml` / `core-site.xml` (for example `om`, `scm`). If Trino cannot resolve the HMS hostname, `thrift://` connections fail.
:::

## 3. Run Trino and install the Ozone JAR

Start Trino on the Ozone/Hive network and bind-mount a host directory for Hadoop XML:

```bash
docker run -d -p 8080:8080 --name trino \
  --network ozone-trino_default \
  --memory=1536m \
  -e JAVA_TOOL_OPTIONS="-Xmx768m -XX:+UseSerialGC" \
  -v /path/to/hadoop-conf:/tmp/hadoop/conf:ro \
  trinodb/trino
```

With three Ozone Datanodes plus Hive Metastore, Trino may need a modest heap limit to avoid OOM on a typical Docker Desktop memory budget.

Copy the Ozone filesystem JAR (and, if needed for Ozone 2.x + Trino 483, the Hadoop 3.4 interface supplemental JAR) into the Hive HDFS plugin directory:

```bash
docker cp /tmp/ozone-filesystem-hadoop3-2.2.0.jar \
  trino:/usr/lib/trino/plugin/hive/hdfs/
# Lab only, if you see LeaseRecoverable errors:
# docker cp /tmp/hadoop34-interfaces.jar trino:/usr/lib/trino/plugin/hive/hdfs/
docker restart trino
```

:::tip Docker Desktop on macOS

- Use **`docker cp`** for catalog properties and JARs, or bind-mount a **directory** for `/etc/trino/catalog`—not individual property files (Docker may create a directory instead of a file).
- Bind mounts under `/tmp` can appear empty inside the container; mount from a normal workspace path.

:::

### Hadoop and Ozone configuration inside Trino

`hive.config.resources` must list **separate** `core-site.xml` and `ozone-site.xml` files (comma-separated). Plain **`apache/ozone` Docker images** expose Ozone settings through environment variables; their packaged `core-site.xml` is often empty—author both files yourself.

**`core-site.xml`** (adjust hostnames to match compose service names):

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

**`ozone-site.xml`** (single OM on the `om` service):

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

Mount these under `/tmp/hadoop/conf/` (or another path referenced from the catalog).

## 4. Hive catalog properties (`ozone.properties`)

The **file name** (without `.properties`) becomes the catalog name—for example `ozone.properties` → `SHOW CATALOGS` lists `ozone`.

Example for the minimal lab:

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

Point **`hive.temporary-staging-directory-path`** at a bucket that uses **`RATIS/ONE`**. Trino otherwise stages under an auto-created `tmp` volume with default **`RATIS/THREE`**, which can fail when moving files into a one-replica lab bucket.

Copy the catalog file and restart:

```bash
docker cp ozone.properties trino:/etc/trino/catalog/ozone.properties
docker restart trino
```

:::warning Lab vs production settings

- **`hive.hdfs.impersonation.enabled=false`** is for non-Kerberos labs only.
- **`hive.config.resources`** must point to files that exist inside the container before the catalog starts.

:::

## 5. Ranger access control (optional)

Ranger requires the full Trino Ranger plugin install, not only property files. See [Trino Ranger access control](https://trino.io/docs/current/security/ranger-access-control.html).

## 6. Restart Trino and verify

After JAR, catalog, or XML changes, restart Trino. Then confirm connectivity and Ozone-backed DDL:

```sql
SHOW CATALOGS;
-- expect: ozone

SHOW SCHEMAS FROM ozone;
-- expect: default, information_schema, ...

CREATE SCHEMA ozone.lab WITH (location = 'ofs://om/s3v/trino-lab/lab');

CREATE TABLE ozone.lab.demo (
  id bigint,
  name varchar
) WITH (format = 'PARQUET');

INSERT INTO ozone.lab.demo VALUES (1, 'alice'), (2, 'bob');

SELECT * FROM ozone.lab.demo ORDER BY id;
```

The following were **verified locally** with `ozone-filesystem-hadoop3-2.2.0.jar`, Ozone Docker **2.2.0** (three Datanodes), and Trino **483**:

| Step | Result |
| ---- | ------ |
| `SHOW CATALOGS` / `SHOW SCHEMAS FROM ozone` | OK |
| `CREATE SCHEMA ... WITH (location = 'ofs://...')` | OK |
| `CREATE TABLE ... WITH (format = 'PARQUET')` | OK |
| `INSERT` / `SELECT` with data | OK (with staging path and cluster notes below) |

:::note Docker lab caveats

- Scale compose with **`--scale datanode=3`**; default three-way replication needs three healthy Datanodes.
- If writes hang, check SCM safe mode: `docker exec <scm> ozone admin safemode status` and `ozone admin safemode exit` if pipelines are slow to form.
- On a nearly full Docker disk, lower **`ozone.scm.container.size`** (for example `1GB`) so SCM can allocate containers.
- Set **`hive.temporary-staging-directory-path`** to a **`RATIS/ONE`** bucket path (see catalog example above).

:::

If initialization fails, check Trino logs for:

- **`NoClassDefFoundError: LeaseRecoverable`**: See [Hadoop line compatibility](#ozone-jar-and-trino).
- **`UnsupportedFileSystemException: No FileSystem for scheme "ofs"`**: Missing XML, wrong `hive.config.resources` paths, or HMS missing the Ozone JAR/config.
- **Protobuf / class loading errors**: Ozone–Trino version skew; confirm you use **`ozone-filesystem-hadoop3`** only ([HDDS-14056](https://issues.apache.org/jira/browse/HDDS-14056)).
- **Metastore errors**: Wrong HMS host, port, or network.

### Alternative: S3 Gateway (`s3a://`)

If `ofs://` remains blocked by version skew, some deployments use Ozone’s **S3 Gateway** with Trino S3 settings. See [S3A](../01-client-interfaces/04-s3a) and [Trino discussion #18026](https://github.com/trinodb/trino/discussions/18026).

## Summary

| Area | What to verify |
| ---- | -------------- |
| Ozone JAR | **`ozone-filesystem-hadoop3-*.jar`** only ([HDDS-14056](https://issues.apache.org/jira/browse/HDDS-14056)); match cluster version. |
| Install path | Drop into Trino **`plugin/hive/hdfs/`**; same JAR on HMS classpath. |
| Hadoop XML | **`fs.ofs.impl`**, **`fs.AbstractFileSystem.ofs.impl`**, OM/SCM in separate **`core-site.xml`** + **`ozone-site.xml`**. |
| Trino + Ozone 2.x | Watch for Hadoop **3.3 vs 3.4** (`LeaseRecoverable`) on Trino 483. |
| Docker lab | Same network; **`--scale datanode=3`**; **`RATIS/ONE`** buckets; staging path; exit SCM safe mode before writes. |

For work tracked around this integration on the Ozone side, see [HDDS-12321](https://issues.apache.org/jira/browse/HDDS-12321).
