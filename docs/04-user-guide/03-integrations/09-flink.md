---
sidebar_label: Flink
---

# Apache Flink

This tutorial shows how to connect Apache Flink to Apache Ozone using the S3 Gateway, with Docker Compose.

First, obtain Ozone's sample Docker Compose configuration and save it as `docker-compose.yaml`:

```bash
curl -O https://raw.githubusercontent.com/apache/ozone-docker/refs/heads/latest/docker-compose.yaml
```

Refer to the [Docker quick start page](../../02-quick-start/01-installation/01-docker.md) for details.

## Assumptions

- Flink accesses Ozone through S3 Gateway instead of ofs.
- Ozone S3G listens on port 9878
- Ozone S3G enables path style access.
- Ozone S3G does not enable security, therefore any S3 access key and secret key is accepted.
- Flink Docker image tag `flink:scala_2.12-java17`

## Step 1 — Create `docker-compose-flink.yml` for Flink

```yaml
services:
  jobmanager:
    image: flink:scala_2.12-java17
    command: jobmanager
    ports:
      - "8081:8081"
    environment:
      AWS_ACCESS_KEY_ID: ozone
      AWS_SECRET_ACCESS_KEY: ozone
      FLINK_PROPERTIES: |
        jobmanager.rpc.address: jobmanager
        fs.s3a.endpoint: http://s3g:9878
        fs.s3a.path.style.access: true
        fs.s3a.connection.ssl.enabled: false
        fs.s3a.access.key: ozone
        fs.s3a.secret.key: ozone

  taskmanager:
    image: flink:scala_2.12-java17
    command: taskmanager
    depends_on:
      - jobmanager
    environment:
      AWS_ACCESS_KEY_ID: ozone
      AWS_SECRET_ACCESS_KEY: ozone
      FLINK_PROPERTIES: |
        jobmanager.rpc.address: jobmanager
        taskmanager.numberOfTaskSlots: 4
        fs.s3a.endpoint: http://s3g:9878
        fs.s3a.path.style.access: true
        fs.s3a.connection.ssl.enabled: false
        fs.s3a.access.key: ozone
        fs.s3a.secret.key: ozone
```

## Step 2 — Start Flink and Ozone together

With both `docker-compose.yaml` (for Ozone) and `docker-compose-flink.yml` (for Flink) in the same directory,
you can start both services together, sharing the same network, using:

```bash
export COMPOSE_FILE=docker-compose.yaml:docker-compose-flink.yml
docker compose up -d
```

Verify containers are running:

```bash
docker ps
```

## Step 3 — Create an Ozone bucket

You need to connect to Ozone (for example, `s3g`) to create a OBS bucket:

```bash
docker compose exec -it s3g ozone sh bucket create s3v/bucket1 -l obs
```

## Step 4 — Copy the Flink S3 filesystem plugin

The official Flink Docker image does not enable S3 by default.
You must copy the plugin JAR into both JobManager and TaskManager.

Copy into JobManager

```bash
docker compose exec -it jobmanager bash -lc \
  "mkdir -p /opt/flink/plugins/s3-fs-hadoop && \\
   cp /opt/flink/opt/flink-s3-fs-hadoop-*.jar /opt/flink/plugins/s3-fs-hadoop/"
```

Copy into TaskManager

```bash
docker compose exec -it taskmanager bash -lc \
  "mkdir -p /opt/flink/plugins/s3-fs-hadoop && \\
   cp /opt/flink/opt/flink-s3-fs-hadoop-*.jar /opt/flink/plugins/s3-fs-hadoop/"
```

Verify:

```bash
docker compose exec -it jobmanager ls /opt/flink/plugins/s3-fs-hadoop
docker compose exec -it taskmanager ls /opt/flink/plugins/s3-fs-hadoop
```

## Step 5 — Restart Flink containers (required)

Plugins are loaded only at startup.

```bash
docker compose restart jobmanager taskmanager
```

## Step 6 — Start Flink SQL client

```bash
docker compose exec -it jobmanager ./bin/sql-client.sh
```

You should now be in:

```text
Flink SQL>
```

## Step 7 — Create a table backed by Ozone S3

Important: Must use BATCH mode otherwise multi-part upload fails.

```sql
SET 'execution.runtime-mode' = 'BATCH';

CREATE TABLE ozone_sink (
  id STRING,
  ts TIMESTAMP(3)
) WITH (
  'connector' = 'filesystem',
  'path' = 's3a://bucket1/ozone_sink/',
  'format' = 'csv'
);
```

Insert data:

```sql
INSERT INTO ozone_sink VALUES ('hello', CURRENT_TIMESTAMP);
```

Query it:

```sql
SELECT * FROM ozone_sink;
```

If this works, Flink is successfully reading/writing Ozone via S3.

## Step 8 — Check Flink job status in the Web UI

Open your browser:

```text
http://localhost:8081/
```

Here you can:

- See running and completed jobs
- Inspect TaskManagers
- Debug failures visually

This is the first place to look if something goes wrong.

## Key takeaways (important)

- Flink Docker images do not ship with S3 enabled
- The S3 plugin must exist in both JM and TM
- Flink and Ozone should be started using a combined Docker Compose file (`COMPOSE_FILE`) to ensure they share the same network.
- Always use `s3a://` with `flink-s3-fs-hadoop`
- Restart Flink after copying plugins
- Check `http://localhost:8081/` to confirm jobs are running
- **Batch mode is required** for Flink SQL to avoid multipart upload failures to Ozone. Use `SET 'execution.runtime-mode' = 'BATCH';`
