---
sidebar_label: Trino
---

# Trino with Ozone (Hive connector) and Ranger

[Trino](https://trino.io/) can query tables whose data lives in Apache Ozone when you use the **Hive connector** and a **Hive Metastore (HMS)** that already understands Ozone paths (`ofs://`, `o3fs://`, or `s3a://`, depending on how tables were created). [Apache Ranger](https://ranger.apache.org/) can enforce access control for Trino through Trino’s Ranger integration.

This page describes a **Docker-based lab-style setup**: build the standard Ozone **Hadoop 3 filesystem** JAR (`ozonefs-hadoop3` / `ozone-filesystem-hadoop3-*.jar`), join Trino to the same Docker network as Ozone, Ranger, Hadoop, and Hive, then configure a Hive catalog and Ranger access control.

:::note
This is an **advanced** integration. Names (`ranger-hive`, `rangernw`), compose file names, and paths come from typical Ranger `dev-support/ranger-docker` layouts and **will differ** if you change compose projects or image tags. Treat hostnames and file names as examples and align them with your environment.
:::

For how Hive uses Ozone (warehouse paths, `ofs://` URIs, and the filesystem JAR), see the [Hive](./hive) integration page.

## Prerequisites

- Docker and Docker Compose, with enough memory for Ranger, Hive, Ozone, and Trino.
- Source tree for **Apache Ozone** and a JDK / Maven build able to run `mvn package` for the **`ozonefs-hadoop3`** module (or a release download of `ozone-filesystem-hadoop3`).
- A running **Hive Metastore** that Trino can reach on `thrift://<host>:9083`.
- **Hadoop `core-site.xml`** (and related config) that defines the Ozone filesystem implementation and service addresses, mounted or copied into the Trino container where `hive.config.resources` points.
- If you use Ranger: Trino **Ranger plugin** configuration files (`ranger-trino-security.xml`, `ranger-trino-audit.xml`, `ranger-policymgr-ssl.xml`, and policies synced from Ranger Admin). See the [Trino Ranger access control](https://trino.io/docs/current/security/ranger-access-control.html) documentation.

## Ozone JAR and Trino

Trino bundles its own Hadoop libraries. For the Hive connector to read and write `ofs://` / `o3fs://` paths, the **`ozone-filesystem-hadoop3-*.jar`** from the **`ozonefs-hadoop3`** Maven module must be on the Hive plugin classpath (see below).

The older **`ozonefs-hadoop3-client`** artifact and the **`proto.shaded.prefix`** Maven option are **no longer used** in current Ozone; build or download the standard **`ozonefs-hadoop3`** output only.

:::warning
Pair **Ozone and Trino releases** that agree on a compatible Hadoop 3.x line. If Trino fails to load the Ozone filesystem or you see class or protobuf conflicts, align versions or ask on the Ozone dev list.
:::

## 1. Build the Ozone filesystem JAR

From your Ozone source checkout, build the Hadoop 3 filesystem module (and its dependencies):

```bash
mvn clean package -DskipTests -pl hadoop-ozone/ozonefs-hadoop3 -am
```

When the build succeeds, copy the artifact from the module output directory:

```bash
cd hadoop-ozone/ozonefs-hadoop3/target/
cp ozone-filesystem-hadoop3-*.jar /tmp/
```

The version in the file name (`*-SNAPSHOT.jar` or a release version) **depends on your Ozone branch**. You can also use the same artifact from Maven Central (coordinates `org.apache.ozone:ozone-filesystem-hadoop3`) at the version that matches your cluster instead of building from source.

:::note Historical note
An older lab used [Ozone at commit fc89ba6a](https://github.com/apache/ozone/tree/fc89ba6aef9bd01562f76ef19888a56950bc6939); layout and Maven modules have changed since then. Prefer a **maintained release tag** that matches your cluster.
:::

## 2. Bring up Ozone, Ranger, Hive, and Hadoop in Docker

### Option A: Ranger project compose stacks (recommended for a single lab network)

The Apache Ranger repo ships Docker Compose files under `dev-support/ranger-docker`.

1. Clone Ranger: [https://github.com/apache/ranger](https://github.com/apache/ranger).
2. Open `dev-support/ranger-docker` and follow the **README** there (prerequisites, passwords, profiles).
3. Build and start the stack that includes Ranger, Hadoop, Hive, and Ozone. The README and file names on `master` **change over time**; your commands may look like the following pattern (verify against the current README):

```bash
docker compose \
  -f docker-compose.ranger.yml \
  -f docker-compose.ranger-hadoop.yml \
  -f docker-compose.ranger-hive.yml \
  -f docker-compose.ranger-ozone.yml \
  build

docker compose \
  -f docker-compose.ranger.yml \
  -f docker-compose.ranger-hadoop.yml \
  -f docker-compose.ranger-hive.yml \
  -f docker-compose.ranger-ozone.yml \
  up -d
```

### Option B: Assemble containers yourself

Alternatively, run compatible images (for example [Apache Ranger](https://hub.docker.com/r/apache/ranger), [Apache Ozone](https://hub.docker.com/r/apache/ozone), and Hive/Hadoop images you trust) and attach them to **one user-defined Docker network** so Trino can resolve HMS and Ozone by container name.

:::warning Network and hostnames
Trino’s catalog must use the **same Docker network** as HMS and the hosts named in `core-site.xml`. If Trino cannot resolve `ranger-hive` (or your HMS hostname), `thrift://` connections will fail. Replace example names with `docker network inspect` output from your stack.
:::

## 3. Run Trino and install the Ozone JAR

Start a Trino container on the Ranger/Ozone network. The example uses image [trinodb/trino](https://hub.docker.com/r/trinodb/trino) and assumes the network is named `rangernw` (adjust to your setup):

```bash
docker run -d -p 8080:8080 --name trino --network rangernw trinodb/trino
```

Copy the Ozone filesystem JAR into the Hive HDFS plugin directory inside the container (paths match common Trino image layouts):

```bash
docker cp /tmp/ozone-filesystem-hadoop3-*.jar \
  trino:/usr/lib/trino/plugin/hive/hdfs/
```

If your Trino image uses a different install root, locate `plugin/hive/hdfs` under that root.

The **`ozone-filesystem-hadoop3`** module normally produces a **self-contained (shaded) JAR** meant to be dropped in as a **single** file. If you see `NoClassDefFoundError` for Ozone or gRPC classes, you may have the wrong artifact or a partial copy—use the primary `ozone-filesystem-hadoop3-*.jar` from this module’s `target/` directory, or the matching artifact from Maven Central.

**Restart Trino** after adding the JAR so the plugin class loader picks it up.

### Hadoop and Ozone configuration inside Trino

`hive.config.resources` must point to **real files** inside the container (comma-separated list if you need more than one). Those files must define the Ozone filesystem (for example `fs.ofs.impl`) and OM/SCM addresses the same way your Hive/Hadoop stack does—usually by reusing `core-site.xml` (and sometimes additional config such as `ozone-site.xml` or keys merged into `core-site.xml`) from the Ranger/Hadoop/Ozone compose setup.

The doc does **not** copy those files for you. Typical approaches:

- **`docker cp`** from a Hadoop or edge container that already has the right XMLs, into a path such as `/tmp/hadoop/conf/`, or  
- **`docker run -v`** to bind-mount a host directory of config into the Trino container.

Until this matches your live Ozone cluster, Trino will fail when it tries to open `ofs://` paths even if the Hive catalog and Metastore connection work.

## 4. Hive catalog properties (`hive.properties`)

Create a catalog file for the Hive connector. The HMS URI and config paths **must match your deployment**.

Example `hive.properties`:

```properties
connector.name=hive
hive.metastore.uri=thrift://ranger-hive:9083
fs.hadoop.enabled=true
hive.config.resources=/tmp/hadoop/conf/core-site.xml
hive.non-managed-table-writes-enabled=true
hive.hdfs.impersonation.enabled=true
```

Copy it into the container:

```bash
docker cp hive.properties trino:/etc/trino/catalog/
```

:::warning Possible configuration gaps
- **`hive.config.resources`**: Must list real files inside the container (often you mount a host directory of Hadoop config at `/tmp/hadoop/conf` or another path you choose).
- **`hive.hdfs.impersonation.enabled=true`**: Requires a secure setup where Trino can impersonate end users; in minimal Docker demos this can fail if Hadoop/Ozone security is not aligned with Trino. Disable or adjust only if you understand the security trade-offs.
- **Managed vs external tables**: Behavior depends on HMS metadata and Ozone paths; see [Hive](./hive).
:::

## 5. Ranger access control (`access-control.properties`)

Ranger authorization for Trino depends on your **Trino version** and distribution: you need the Ranger access-control integration Trino expects (plugin JARs and native libraries, if any), **not** only the properties and XML files below. Follow [Trino Ranger access control](https://trino.io/docs/current/security/ranger-access-control.html) end to end, including how to install Ranger’s Trino artifacts into the container image if required.

If you enable Ranger for Trino, add an `access-control.properties` (location depends on Trino version; often `/etc/trino/`):

```properties
access-control.name=ranger
ranger.service.name=dev_trino
ranger.plugin.config.resource=/etc/trino/ranger-trino-security.xml,/etc/trino/ranger-trino-audit.xml,/etc/trino/ranger-policymgr-ssl.xml
ranger.hadoop.config.resource=
```

Copy it in:

```bash
docker cp access-control.properties trino:/etc/trino/
```

You must also install the XML files referenced above (and any TLS trust stores or policy cache settings Ranger expects). Follow [Trino Ranger access control](https://trino.io/docs/current/security/ranger-access-control.html) and your Ranger Admin deployment.

:::warning Empty `ranger.hadoop.config.resource`
The draft setup left **`ranger.hadoop.config.resource` blank**. That may be intentional for a minimal demo or it may be **incomplete** for your Ranger or Hadoop layout. Confirm with Trino and Ranger documentation whether Hadoop config must be passed to the Ranger plugin in your environment.
:::

## 6. Restart Trino and verify

Restart the Trino container after configuration changes.

1. Open the Trino web UI (port `8080` in the example) or use `trino-cli`.
2. `SHOW CATALOGS` should list `hive` (or whatever you named the properties file without `.properties`).
3. Run a simple query against a table you know is stored on Ozone (path visible in HMS).

If initialization fails, check Trino logs for:

- Class loading or **protobuf** errors (often an Ozone / Hadoop / Trino **version mismatch** or a wrong JAR on the plugin classpath).
- **Metastore** connection errors (wrong host, port, or network).
- **Filesystem** errors (missing `core-site.xml` properties for `ofs` / `o3fs`).

## Summary of risks and open checks

| Area | What to verify |
| ---- | -------------- |
| Ozone JAR vs Trino | Use **`ozone-filesystem-hadoop3-*.jar`** from **`ozonefs-hadoop3`**; Ozone version and Hadoop line must match Trino and your cluster. |
| Versions | Pinned Git commits and `*-SNAPSHOT` JARs are for **development**, not production baselines. |
| Docker compose | File names and services come from the Ranger repo; they **drift** on `master`. |
| Ranger | All `ranger-*.xml` files, service definitions, and `ranger.hadoop.config.resource` must match Ranger Admin and your Hadoop/Ozone config. |
| Impersonation | `hive.hdfs.impersonation.enabled` requires a coherent security story across Trino, Hadoop, and Ozone. |

For work tracked around this integration on the Ozone side, see [HDDS-12321](https://issues.apache.org/jira/browse/HDDS-12321).
