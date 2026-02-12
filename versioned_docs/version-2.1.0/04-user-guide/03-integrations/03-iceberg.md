---
sidebar_label: Iceberg
---

# Apache Iceberg

[Apache Iceberg](https://iceberg.apache.org/) is an open table format for huge analytic datasets. It is designed to improve on the limitations of traditional table formats like Hive and provides features such as schema evolution, hidden partitioning, and time travel.

Iceberg uses Ozone storage layer to build scalable data lakehouses, acting as the durable system of record for table data and metadata. Ozone’s native atomic rename capability supports Iceberg’s atomic commit requirements, providing strong consistency for data management without external locking services. Ozone's ability to handle high object counts and its strong consistency model (via Ratis) make it a suitable, reliable backend for Iceberg's transactional, snapshot-based structure.

## Key Integration Details

- **Storage and Metadata Management:** Iceberg stores data files and metadata files (manifests, snapshots) directly on Ozone.
- **Atomic Operations:** Ozone supports necessary atomic operations for Iceberg’s commit process, ensuring data consistency during concurrent writes.
- **Performance:** The combination allows for petabyte-scale analytics and fast query planning, overcoming the scalability bottlenecks of traditional HDFS Namenodes.
- **Compatibility:** Iceberg interacts with Ozone using S3-compatible APIs or Hadoop FileSystem interfaces, allowing for seamless integration.

## Quickstart

This tutorial shows how to get started with Apache Iceberg to Apache Ozone using the S3 Gateway, with Docker Compose.

### Quickstart environment

- Unsecure Ozone and Iceberg clusters.
- Ozone S3G enables virtual-host style addressing with a subdomain `s3.ozone`.
  - The subdomain and the subdomain with the bucket name `warehouse.s3.ozone` are mapped to the S3 Gateway.
- Iceberg accesses Ozone via S3 Gateway.

### Step 1 — Create `docker-compose.yaml` for Ozone services

Create a `docker-compose.yaml` file with the following content to

- Spin up a single Datanode Ozone cluster
- Start the S3 Gateway with the required configurations for Iceberg
  - Wait for OM to be ready before starting
  - Create the bucket `warehouse` on startup
  - Mark the S3 Gateway as healthy only after the bucket is created because this is a pre-requisite for Iceberg containers.
  - Define and map the bucket subdomain to the S3 Gateway.

```yaml
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

x-image:
  &image
  image: ${OZONE_IMAGE:-apache/ozone}:${OZONE_IMAGE_VERSION:-2.1.0}${OZONE_IMAGE_FLAVOR:-}

x-common-config:
  &common-config
  OZONE-SITE.XML_hdds.datanode.dir: "/data/hdds"
  OZONE-SITE.XML_ozone.metadata.dirs: "/data/metadata"
  OZONE-SITE.XML_ozone.om.address: "om"
  OZONE-SITE.XML_ozone.om.http-address: "om:9874"
  OZONE-SITE.XML_ozone.recon.address: "recon:9891"
  OZONE-SITE.XML_ozone.recon.db.dir: "/data/metadata/recon"
  OZONE-SITE.XML_ozone.replication: "1"
  OZONE-SITE.XML_ozone.scm.block.client.address: "scm"
  OZONE-SITE.XML_ozone.scm.client.address: "scm"
  OZONE-SITE.XML_ozone.scm.datanode.id.dir: "/data/metadata"
  OZONE-SITE.XML_ozone.scm.names: "scm"
  no_proxy: "om,recon,scm,s3g,localhost,127.0.0.1"
  OZONE-SITE.XML_hdds.scm.safemode.min.datanode: "1"
  OZONE-SITE.XML_hdds.scm.safemode.healthy.pipeline.pct: "0"
  OZONE-SITE.XML_ozone.s3g.domain.name: "s3.ozone"

version: "3"
services:
  datanode:
    <<: *image
    ports:
      - 9864
    command: ["ozone","datanode"]
    environment:
      <<: *common-config
    networks:
      iceberg_net:
  om:
    <<: *image
    ports:
      - 9874:9874
    environment:
      <<: *common-config
      CORE-SITE.XML_hadoop.proxyuser.hadoop.hosts: "*"
      CORE-SITE.XML_hadoop.proxyuser.hadoop.groups: "*"
      ENSURE_OM_INITIALIZED: /data/metadata/om/current/VERSION
      WAITFOR: scm:9876
    command: ["ozone","om"]
    networks:
      iceberg_net:
  scm:
    <<: *image
    ports:
      - 9876:9876
    environment:
      <<: *common-config
      ENSURE_SCM_INITIALIZED: /data/metadata/scm/current/VERSION
    command: ["ozone","scm"]
    networks:
      iceberg_net:
  recon:
    <<: *image
    ports:
      - 9888:9888
    environment:
      <<: *common-config
    command: ["ozone","recon"]
    networks:
      iceberg_net:
  s3g:
    <<: *image
    ports:
      - 9878:9878
    environment:
      <<: *common-config
      WAITFOR: om:9874
    command:
      - sh
      - -c
      - |
        set -e
        ozone s3g &
        s3g_pid=$$!
        until ozone sh volume list >/dev/null 2>&1; do echo '...waiting...' && sleep 1; done;
        ozone sh bucket delete /s3v/warehouse || true
        ozone sh bucket create /s3v/warehouse
        wait "$$s3g_pid"
    healthcheck:
      test: [ "CMD", "ozone", "sh", "bucket", "info", "/s3v/warehouse" ]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 30s
    networks:
      iceberg_net:
        aliases:
          - s3.ozone
          - warehouse.s3.ozone
```

### Step 2 — Create `iceberg-spark.yml` for Iceberg services

```yaml
services:
  spark-iceberg:
    image: tabulario/spark-iceberg
    container_name: spark-iceberg
    build: spark/
    networks:
      iceberg_net:
    depends_on:
      rest:
        condition: service_started
      s3g:
        condition: service_healthy
    volumes:
      - ./warehouse:/home/iceberg/warehouse
    environment:
      - AWS_ACCESS_KEY_ID=admin
      - AWS_SECRET_ACCESS_KEY=password
      - AWS_REGION=us-east-1
    ports:
      - 8888:8888
      - 8080:8080
      - 10000:10000
      - 10001:10001
  rest:
    image: apache/iceberg-rest-fixture
    container_name: iceberg-rest
    networks:
      iceberg_net:
    ports:
      - 8181:8181
    environment:
      - AWS_ACCESS_KEY_ID=admin
      - AWS_SECRET_ACCESS_KEY=password
      - AWS_REGION=us-east-1
      - CATALOG_WAREHOUSE=s3://warehouse/
      - CATALOG_IO__IMPL=org.apache.iceberg.aws.s3.S3FileIO
      - CATALOG_S3_ENDPOINT=http://s3.ozone:9878

networks:
  iceberg_net:
```

### Step 3 — Start Iceberg and Ozone together

With both `docker-compose.yaml` (for Ozone) and `docker-compose-flink.yml` (for Flink) in the same directory,
you can start both services together, sharing the same network, using:

```bash
export COMPOSE_FILE=docker-compose.yaml:iceberg-spark.yml
docker compose up -d
```

Verify containers are running:

```bash
docker ps
```

### Step 4 — Start a Spark SQL client

```bash
docker exec -it spark-iceberg spark-sql
```

You should now be in:

```text
spark-sql ()>
```

### Step 5 — Create and Query a table backed by Ozone S3

Create an Iceberg table stored in Ozone S3:

```sql
    CREATE NAMESPACE IF NOT EXISTS demo.nyc;
    CREATE TABLE demo.nyc.taxis
    (
      vendor_id bigint,
      trip_id bigint,
      trip_distance float,
      fare_amount double,
      store_and_fwd_flag string
    )
    PARTITIONED BY (vendor_id);
```

Insert data into the table:

```sql
    INSERT INTO demo.nyc.taxis
    VALUES (1, 1000371, 1.8, 15.32, 'N'), (2, 1000372, 2.5, 22.15, 'N'), (2, 1000373, 0.9, 9.01, 'N'), (1, 1000374, 8.4, 42.13, 'Y');
```

Query the table:

```sql
    SELECT * FROM demo.nyc.taxis;
```

Verify data files are stored in Ozone S3:

```bash
docker compose exec -it s3g ozone fs -ls -R ofs://om/s3v/warehouse
```

Spark UI is available at `http://localhost:8080`. You can monitor the Spark jobs here.
