---
sidebar_label: Ozone
---

The Ozone client is the software that applications and operators use to read and write data in an Ozone cluster. It is not a standalone daemon; it runs inside the `ozone` command-line tools, Hadoop-compatible filesystem drivers, or embedded in Java applications through the Ozone client library.

This page describes how to install, configure, and run the client, and how the three primary access interfaces relate to each other.

## Installation

### Binary distribution

Download an official release tarball from the [Apache Ozone download page](https://dlcdn.apache.org/ozone) and extract it on every machine that will run client commands or applications:

```bash
curl -L -O https://dlcdn.apache.org/ozone/<version>/ozone-<version>.tar.gz
tar -xzf ozone-<version>.tar.gz
cd ozone-<version>
export OZONE_HOME=$(pwd)
export PATH=$OZONE_HOME/bin:$PATH
```

The distribution layout relevant to clients:

| Path | Purpose |
|------|---------|
| `bin/ozone` | Main entry point for CLI and client subcommands |
| `etc/hadoop/` | Configuration directory (`OZONE_CONF_DIR`) |
| `share/ozone/lib/` | Client and filesystem JARs |
| `share/ozone/lib/ozone-filesystem-hadoop3-*.jar` | Hadoop-compatible filesystem driver |

### Docker

For development and testing, the official `apache/ozone` image includes a preconfigured client. From inside a running container:

```bash
docker compose exec om ozone version
docker compose exec om ozone sh volume list /
```

See the [Docker installation guide](../../quick-start/installation/docker) for a full quick-start.

### Build from source

To build the distribution locally:

```bash
mvn clean package -DskipTests=true -Pdist
```

The tarball is produced under `hadoop-ozone/dist/target/`.

## Configuration

Before using the client, point it at a running Ozone cluster by placing configuration files in `OZONE_CONF_DIR` (defaults to `$OZONE_HOME/etc/hadoop`).

### Generate a starting configuration

Use `ozone genconf` to create a template `ozone-site.xml`:

```bash
ozone genconf /path/to/output
cp /path/to/output/ozone-site.xml $OZONE_HOME/etc/hadoop/
```

Edit the generated file and set at minimum the client-relevant properties:

| Property | Description | Default port |
|----------|-------------|--------------|
| `ozone.om.address` | Ozone Manager address used by the client and filesystem | 9862 |
| `ozone.scm.client.address` | SCM client service address | 9860 |

### Verify configuration

```bash
# Show resolved environment
ozone envvars

# Read a specific config value
ozone getconf -confKey ozone.om.address
```

Use `--config /path/to/conf` on any `ozone` command to override `OZONE_CONF_DIR` for a single invocation:

```bash
ozone --config /etc/ozone sh volume list /
```

## Running the client

All client operations are invoked through the `ozone` script. Common client subcommands:

| Command | Description |
|---------|-------------|
| `ozone sh` | Object-store shell (volumes, buckets, keys) via the native RPC protocol |
| `ozone fs` | Hadoop-compatible filesystem shell (equivalent to `hadoop fs`) |
| `ozone s3` | S3-related CLI operations |
| `ozone getconf` | Print configuration values |
| `ozone version` | Print the Ozone version |

Example workflow after configuration:

```bash
# Admin: create volumne and bucket
ozone sh volume create /vol1
ozone sh bucket create /vol1/bucket1
```

By default, CLI tools suppress logging output. Pass `--loglevel DEBUG` (or any Log4j level) to enable verbose client logging:

```bash
ozone --loglevel DEBUG sh volume info /vol1
```

### Client log4j configuration

Client-side logging is controlled by `log4j.properties` in `$OZONE_CONF_DIR`. The distribution ships a template at `etc/hadoop/log4j.properties`.

Key settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `hadoop.root.logger` | `INFO,console` | Root Log4j logger and appenders |
| `hadoop.log.dir` | Set via JVM property | Directory for log files |
| `hadoop.log.file` | `hadoop.log` | Log file name |

The `ozone` script injects these as JVM system properties at runtime:

```
-Dhadoop.log.dir=${OZONE_LOG_DIR}
-Dhadoop.log.file=${OZONE_LOGFILE}
-Dhadoop.root.logger=${OZONE_ROOT_LOGGER}
```

For CLI subcommands (`ozone sh`, `ozone fs`, etc.), logging defaults to **OFF** unless you pass `--loglevel` or set `OZONE_ROOT_LOGGER` / `OZONE_LOGLEVEL` explicitly. This keeps routine command output clean.

To enable debug logging for a single command:

```bash
ozone --loglevel DEBUG sh bucket list /vol1
```

To persistently enable client logging, edit `etc/hadoop/ozone-env.sh`:

```bash
export OZONE_ROOT_LOGGER=DEBUG,console
```

Or override per command family:

```bash
export OZONE_SH_OPTS="-Dhadoop.root.logger=DEBUG,console"
export OZONE_FS_OPTS="-Dhadoop.root.logger=DEBUG,console"
```

Daemon processes (OM, SCM, DataNode) use additional Log4j2 audit configuration files (`om-audit-log4j2.properties`, etc.). Those apply to server-side components, not to client CLI tools.

## Environment variables

Environment variables are processed by `bin/ozone` via `ozone-env.sh` in `$OZONE_CONF_DIR`. Copy and customize the template from the distribution or edit the file in place.

### Required and commonly used variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JAVA_HOME` | Path to the JDK | Platform-specific; required on Linux |
| `OZONE_HOME` | Ozone installation directory | Derived from script location |
| `OZONE_CONF_DIR` | Configuration directory | `$OZONE_HOME/etc/hadoop` |
| `OZONE_LOG_DIR` | Log output directory | `$OZONE_HOME/logs` |

`HADOOP_CONF_DIR` is deprecated; use `OZONE_CONF_DIR` instead. If only `HADOOP_CONF_DIR` is set, the shell maps it to `OZONE_CONF_DIR` with a deprecation warning.

Verify effective values:

```bash
ozone envvars
```
