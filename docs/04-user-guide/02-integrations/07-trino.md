---
sidebar_label: Trino
---

# Trino with Ozone

[Trino](https://trino.io/) reads and writes Ozone data through the **Hive connector** and a **Hive Metastore (HMS)**. The recommended path uses native Ozone **`ofs://`** URIs; an alternative uses Ozone's **S3 Gateway** with **`s3a://`** URIs (HMS creates paths through Hadoop S3A). For background on Hive warehouse paths and the Ozone filesystem JAR, see [Hive](./hive).

This page walks through a **Docker lab** verified with **Ozone 2.2.0** and **`trinodb/trino:483`**. The **`ofs://`** flow (including **`INSERT` / `SELECT`**) was verified end-to-end; the **S3 Gateway** flow was verified for creating schemas/tables and reads, but not writes (see [Alternative: Ozone S3 Gateway](#alternative-ozone-s3-gateway-s3a)).

## What you need

- Docker Compose with enough memory for Ozone (three Datanodes), Hive Metastore, and Trino.
- **`ozone-filesystem-hadoop3-*.jar`** at the **same version as your cluster** ([HDDS-14056](https://issues.apache.org/jira/browse/HDDS-14056): use this JAR only; the old **`ozone-filesystem-hadoop3-client`** artifact was removed in Ozone 2.2+).
- HMS on `thrift://<host>:9083`. For the **`ofs://`** path, HMS needs the Ozone JAR and **`ofs`** Hadoop XML. If you also use the S3 Gateway path, HMS additionally needs S3A JARs and `fs.s3a.*` settings (see [Alternative: Ozone S3 Gateway](#alternative-ozone-s3-gateway-s3a)).
- **`core-site.xml`** and **`ozone-site.xml`** inside the Trino container for the **`ozone`** catalog, referenced from `hive.config.resources`.

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
Three Datanodes are **required** for the verified **`INSERT`** path: Trino staging blocks still use **`RATIS/THREE`** in this lab, and a single Datanode cannot satisfy that pipeline. If Docker disk space is tight, set smaller SCM container defaults in compose (for example `ozone.scm.container.size: "1GB"`) rather than scaling Datanodes below three.
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

:::warning Keep S3A settings out of Trino's `core-site.xml`
Use the **`ofs`-only** `core-site.xml` above inside the Trino container for the **`ozone`** catalog. Do **not** add `fs.s3a.*` properties there—Trino's Hive plugin does not ship `hadoop-aws`, and mixed XML causes `ClassNotFoundException: org.apache.hadoop.fs.s3a.S3AFileSystem` when Trino touches `s3a://` paths. HMS can use a **separate** `core-site.xml` (for example under `hive-conf/`) that adds S3A settings when you also run the S3 Gateway path (see below).
:::

## 4. Start Hive Metastore and Trino

Prepare a host directory for lab files (example **`/tmp/trino-lab/`**) with:

- **`hive-conf/`** — `core-site.xml`, `ozone-site.xml`, `hive-site.xml` for HMS
- **`hadoop-conf/`** — **`ofs`-only** `core-site.xml` and `ozone-site.xml` for Trino (step 3)
- **`ozone.properties`** — Trino catalog file (contents below)

Example **`hive-site.xml`** (embedded Derby is fine for the lab):

```xml
<?xml version="1.0"?>
<configuration>
  <property>
    <name>javax.jdo.option.ConnectionURL</name>
    <value>jdbc:derby:;databaseName=/tmp/metastore_db;create=true</value>
  </property>
  <property>
    <name>javax.jdo.option.ConnectionDriverName</name>
    <value>org.apache.derby.jdbc.EmbeddedDriver</value>
  </property>
  <property>
    <name>hive.metastore.warehouse.dir</name>
    <value>ofs://om/s3v/trino-lab/warehouse</value>
  </property>
  <property>
    <name>hive.metastore.schema.verification</name>
    <value>false</value>
  </property>
</configuration>
```

For HMS, you can merge **`ofs`** and **`fs.s3a.*`** properties into one `core-site.xml` under `hive-conf/` when running both paths. Keep Trino's copy **`ofs`-only** (see step 3).

Start HMS on the **same Docker network** as Ozone (example network: `ozone-trino_default`), copy configuration and the Ozone JAR in, then restart:

```bash
docker run -d --name hive-metastore \
  --network ozone-trino_default \
  -p 9083:9083 \
  -e SERVICE_NAME=metastore \
  apache/hive:4.0.1

docker cp /tmp/trino-lab/hive-conf/core-site.xml hive-metastore:/opt/hive/conf/
docker cp /tmp/trino-lab/hive-conf/ozone-site.xml hive-metastore:/opt/hive/conf/
docker cp /tmp/trino-lab/hive-conf/hive-site.xml hive-metastore:/opt/hive/conf/
docker cp /tmp/ozone-filesystem-hadoop3-2.2.0.jar \
  hive-metastore:/opt/hive/lib/ozone-filesystem-hadoop3.jar
docker restart hive-metastore
```

Start Trino on the same network, copy Hadoop XML, JARs, and the catalog file in, then restart:

```bash
docker run -d --name trino \
  --network ozone-trino_default \
  -p 8080:8080 \
  --memory=2g \
  -e JAVA_TOOL_OPTIONS="-Xmx1024m -XX:+UseSerialGC" \
  trinodb/trino

docker exec trino mkdir -p /tmp/hadoop/conf
docker cp /tmp/trino-lab/hadoop-conf/core-site.xml trino:/tmp/hadoop/conf/
docker cp /tmp/trino-lab/hadoop-conf/ozone-site.xml trino:/tmp/hadoop/conf/
docker cp /tmp/ozone-filesystem-hadoop3-2.2.0.jar \
  trino:/usr/lib/trino/plugin/hive/hdfs/
docker cp /tmp/hadoop34-interfaces.jar \
  trino:/usr/lib/trino/plugin/hive/hdfs/
docker cp /tmp/trino-lab/ozone.properties trino:/etc/trino/catalog/ozone.properties
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

Set **`hive.temporary-staging-directory-path`** to your **`RATIS/ONE`** bucket. Trino otherwise stages under an auto-created `tmp` volume with default **`RATIS/THREE`**, which fails when the compose stack has fewer than three healthy Datanodes.

:::tip Docker Desktop on macOS
Bind mounts into these containers often appear **empty** (including `-v .../hive-conf:/opt/hive/conf`). Use the **`docker cp`** workflow above for HMS and Trino configuration and JARs. Run SQL from the Trino Web UI at `http://localhost:8080` or with a host-installed Trino CLI—avoid `docker exec trino trino ...` on memory-constrained hosts, because it starts a second JVM inside the container.
:::

## 5. Verify

Use the **`ozone`** catalog and **`ofs://`** for the steps below. Do **not** run these writes on **`ozone_s3a`**—S3 Gateway inserts fail in this lab (see [Troubleshooting](#troubleshooting)). Open the Trino Web UI at `http://localhost:8080` and run the SQL there (or use a host-installed Trino CLI).

```sql
SHOW CATALOGS;
SHOW SCHEMAS FROM ozone;

CREATE SCHEMA ozone.ofslab WITH (location = 'ofs://om/s3v/trino-lab/ofslab');

CREATE TABLE ozone.ofslab.demo (
  id bigint,
  name varchar
) WITH (format = 'PARQUET');

INSERT INTO ozone.ofslab.demo VALUES (1, 'alice'), (2, 'bob');

SELECT * FROM ozone.ofslab.demo ORDER BY id;
```

:::note One HMS, two catalogs
The optional **`ozone_s3a`** catalog uses the same Hive Metastore. Use **different schema names** for each path (`ofslab` above vs `lab` in the S3 section) so locations do not collide. Query each table through the catalog that matches its location: **`ofs://…`** → **`ozone`**, **`s3a://…`** → **`ozone_s3a`**. Using **`ozone.lab.demo`** after creating `lab` via S3 fails with `ClassNotFoundException: S3AFileSystem` because that table's location is `s3a://…`.
:::

## Alternative: Ozone S3 Gateway (`s3a://`)

Use this when you prefer the Hadoop **S3A** bucket layout (`s3a://bucket/path`) or Ozone's **S3 Gateway** (`s3g`) instead of the Ozone filesystem JAR on **Trino**. Trino reads and writes through its native **`s3.*`** client; **HMS** still uses Hadoop S3A to create and validate `s3a://` paths. See also [s3a and Ozone](../client-interfaces/s3a).

The Ozone bucket created in step 2 (`s3v/trino-lab`) is exposed to S3 clients as bucket **`trino-lab`**—that is why **`ofs://`** paths include the volume (`s3v/trino-lab/...`) while **`s3a://`** paths use the bucket name alone (`s3a://trino-lab/...`).

:::note Trino 483 uses native S3, not Hadoop S3A JARs
Trino **483** removed legacy `hive.s3.*` settings. Configure **`fs.s3.enabled=true`** and **`s3.*`** catalog properties instead. Do **not** add `hadoop-aws` to Trino's classpath—HMS still needs the Hadoop S3A client to validate `s3a://` paths when creating schemas and tables.
:::

### Extra setup

#### Start S3 Gateway

Ensure the **S3 Gateway** service is running (included in [Apache Ozone Docker](https://github.com/apache/ozone-docker); service name **`s3g`**, port **9878**).

#### HMS `core-site.xml` S3A settings

Add S3A client settings to **`core-site.xml`** (insecure lab example; adjust hostnames and keys for production):

```xml
  <property>
    <name>fs.s3a.impl</name>
    <value>org.apache.hadoop.fs.s3a.S3AFileSystem</value>
  </property>
  <property>
    <name>fs.s3a.endpoint</name>
    <value>http://s3g:9878</value>
  </property>
  <property>
    <name>fs.s3a.endpoint.region</name>
    <value>us-east-1</value>
  </property>
  <property>
    <name>fs.s3a.path.style.access</name>
    <value>true</value>
  </property>
  <property>
    <name>fs.s3a.bucket.probe</name>
    <value>0</value>
  </property>
  <property>
    <name>fs.s3a.change.detection.mode</name>
    <value>none</value>
  </property>
  <property>
    <name>fs.s3a.access.key</name>
    <value>test</value>
  </property>
  <property>
    <name>fs.s3a.secret.key</name>
    <value>test</value>
  </property>
```

#### HMS S3A JARs

Copy **`hadoop-aws-3.3.5.jar`** (match Trino's Hadoop **3.3.x** line) plus its AWS SDK v1 dependencies into HMS with **`docker cp`**, then restart HMS—for example `aws-java-sdk-core`, `aws-java-sdk-s3`, `aws-java-sdk-dynamodb`, `joda-time`, and Jackson JARs at the same SDK version:

```bash
docker cp /path/to/hadoop-aws-3.3.5.jar hive-metastore:/opt/hive/lib/hadoop-aws.jar
docker cp /path/to/aws-java-sdk-core.jar hive-metastore:/opt/hive/lib/
# ... other S3A dependency JARs ...
docker restart hive-metastore
```

### Trino catalog for S3

Create **`ozone_s3a.properties`** on the host, copy it into Trino, and restart (same pattern as **`ozone.properties`** in step 4):

```bash
docker cp /path/to/ozone_s3a.properties trino:/etc/trino/catalog/ozone_s3a.properties
docker restart trino
```

Example catalog file:

```properties
connector.name=hive
hive.metastore.uri=thrift://hive-metastore:9083
fs.s3.enabled=true
s3.endpoint=http://s3g:9878
s3.region=us-east-1
s3.path-style-access=true
s3.aws-access-key=test
s3.aws-secret-key=test
hive.non-managed-table-writes-enabled=true
```

Use **`s3a://`** (not `s3://`) in **`CREATE SCHEMA ... WITH (location = ...)`** so HMS can create the path through its S3A client.

### Verify (S3 Gateway)

:::warning No writes in the Docker lab
Do **not** run `INSERT` (or `CREATE TABLE AS`) on **`ozone_s3a`** in this lab. Trino commits through the native S3 client; Ozone S3 Gateway returns HTTP **500** on multi-part puts, which surfaces as **`HIVE_WRITER_CLOSE_ERROR`** after several minutes. Use the **`ozone`** catalog and **`ofs://`** for verified writes.
:::

```sql
CREATE SCHEMA ozone_s3a.lab WITH (location = 's3a://trino-lab/s3-lab');

CREATE TABLE ozone_s3a.lab.demo (
  id bigint,
  name varchar
) WITH (format = 'TEXTFILE');

-- Optional read check: upload objects under s3-read/ first (for example with aws s3 cp against s3g:9878)
CREATE TABLE ozone_s3a.readlab.demo (
  id varchar,
  name varchar
)
WITH (
  format = 'CSV',
  external_location = 's3a://trino-lab/s3-read'
);

SELECT * FROM ozone_s3a.readlab.demo;
```

Docker lab verification with **`fs.s3.enabled=true`** and Ozone S3G:

| Step | Result |
| ---- | ------ |
| `CREATE SCHEMA` / `CREATE TABLE` with `s3a://` | OK |
| `SELECT` from external data in the bucket | OK |
| `INSERT` into managed tables | Failed (`HIVE_WRITER_CLOSE_ERROR` after long commit timeout) |

Use **`ofs://`** (above) when you need verified writes from Trino. Re-test the S3 **`INSERT`** path when upgrading Trino or Ozone.

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| `NoClassDefFoundError: LeaseRecoverable` | Trino Hadoop **3.3** vs Ozone **3.4** interfaces; build and copy `hadoop34-interfaces.jar` (step 1) or upgrade Trino. |
| `ClassNotFoundException: S3AFileSystem` on **`ozone`** reads/writes | Table or schema location is `s3a://…` but you queried the **`ozone`** catalog, or `fs.s3a.*` is in Trino's `core-site.xml`. Use **`ozone_s3a`** for `s3a://` tables, **`ozone`** + `ofs://` locations for native Ozone, and ofs-only XML in Trino. |
| `UnsupportedFileSystemException: ofs` | HMS missing Ozone JAR/XML (often empty bind mounts on Docker Desktop—use **`docker cp`** and restart HMS), or Trino `hive.config.resources` paths wrong. |
| INSERT fails moving staged files / `RATIS/THREE` pipeline error | Staging path not set to the lab bucket, or fewer than **three** healthy Datanodes for default **`RATIS/THREE`** staging blocks. |
| Writes hang | SCM safe mode; not enough healthy Datanodes or disk for pipelines. |
| Metastore connection errors | Trino not on the same Docker network as HMS, or wrong hostname in `hive.metastore.uri`. |
| S3 `CREATE SCHEMA` fails on HMS | HMS missing S3A JARs or `fs.s3a.*` settings in `core-site.xml`; use `s3a://` locations. |
| S3 `INSERT` → `HIVE_WRITER_CLOSE_ERROR` (HTTP 500 from S3G) | Expected in the Docker lab with Trino **483** native S3 on **`ozone_s3a`**; use **`ozone`** + **`ofs://`** for writes. |

## Ranger (optional)

To enforce access control with [Apache Ranger](https://ranger.apache.org/), install the Trino Ranger plugin per [Trino Ranger access control](https://trino.io/docs/current/security/ranger-access-control.html). The Ranger project’s `dev-support/ranger-docker` compose stacks can provide Ozone, Hive, and Ranger on one network if you need a combined lab.
