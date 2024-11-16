---
sidebar_label: Docker Compose
---

<!-- cspell:words xzf -->

# Running Ozone From Docker Compose

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide explains how to run Apache Ozone using Docker Compose, either with locally built sources or pre-built images.

## Prerequisites

- [Docker Engine](https://www.docker.com/products/docker-desktop/) 20.10.0 or higher
- [Docker Compose](https://docs.docker.com/compose/install/) V2
- Built Ozone distribution (if running from local build)

## Running Ozone

1. Obtain the Docker Compose configurations

<Tabs groupId="source-based-instructions">
  <TabItem value="Tarball" label="Tarball" default>
    With this option, the Docker Compose cluster will automatically fetch the required images from Docker Hub.
    <br/>Obtain the Ozone sources from the [download](/download) page.
    <br/>Next, unpack the tarball
    ```bash
    tar xzf ozone-<version>-src.tar.gz
    ```
  </TabItem>
  <TabItem value="Building from Source" label="Building from Source" default>
  With this option, the `ozone-docker-runner` image will use the compiled Ozone binaries to run the Docker Compose cluster.
  <br/> Follow the steps listed in the [Build with Maven](/docs/08-developer-guide/01-build/02-maven.md) page to obtain the sources and compile them.
  </TabItem>
</Tabs>
2. Navigate to the compose directory in your build output:
<Tabs groupId="source-based-instructions">
  <TabItem value="Tarball" label="Tarball" default>
    ```bash
    cd ozone-<version>-src/compose/ozone
    ```
  </TabItem>
  <TabItem value="Building from Source" label="Building from Source" default>
    ```bash
    cd ./hadoop-ozone/dist/target/ozone-*-SNAPSHOT/compose/ozone
    ```
  </TabItem>
</Tabs>
3. Modify the configurations for Ozone (Optional)
The configurations are stored in the `docker-config` file.
<Tabs groupId="source-based-instructions">
   <TabItem value="Tarball" label="Tarball" default>

   ```bash
   ozone-<version>-src/compose/ozone/docker-config
   ```

   </TabItem>
   <TabItem value="Building from Source" label="Building from Source" default>

   ```bash
   ./hadoop-ozone/dist/target/ozone-*-SNAPSHOT/compose/ozone/docker-config
   ```

</TabItem>
</Tabs>
4. Start the cluster:

 ```bash
 docker compose up -d
 ```

## Container Diagram

This image shows the containers that will be created by the `docker compose up -d` command.

<!-- cspell:word DN -->

```mermaid
graph TB
    subgraph "Apache Ozone Containers"
        scm["SCM<br/>Storage Container Manager<br/>(Port: 9876, 9860)"]
        om["OM<br/>Ozone Manager<br/>(Port: 9874, 9862)"]
        s3g["S3G<br/>S3 Gateway<br/>(Port: 9878)"]
        recon["Recon<br/>Monitoring Service<br/>(Port: 9888)"]
        httpfs["HttpFS<br/>HTTP FileSystem<br/>(Port: 14000)"]
        
        subgraph "Data Nodes"
            dn1["DataNode 1<br/>(Port: 19864, 9882)"]
            dnN["DataNode N<br/>(Port: 19864, 9882)"]
        end
        
        %% Connections
        scm --> dn1
        scm --> dnN
        om --> dn1
        om --> dnN
        s3g --> om
        s3g --> scm
        httpfs --> om
        httpfs --> scm
        recon --> scm
        recon --> om
    end

    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef datanode fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef manager fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    
    class dn1,dnN datanode;
    class scm,om manager;
```

## Cluster Configuration

### Default Services

The default Docker Compose configuration includes:

- Storage Container Manager (SCM)
- Ozone Manager (OM)
- S3 Gateway
- Recon (Monitoring Service)
- Datanodes
- HttpFS

## Cluster Management

Common Docker Compose commands:

```bash
# Start the cluster
docker compose up -d

# Stop the cluster
docker compose down

# View service logs
docker compose logs -f [service_name]

# Scale data nodes
docker compose up -d --scale datanode=3

# Check service status
docker compose ps
```

# Next Steps

This page explains the Docker Compose configuration for a basic Ozone cluster.
You can next explore some of the other Docker Compose configurations that are available under the compose directory.

```bash
cd hadoop-ozone/dist/target/ozone-*-SNAPSHOT/compose/
```

| Docker Compose configuration | Description |
|--------------|-------------|
| ozone-ha     | Explore Ozone high availability with this configuration |
| ozone-secure | Explore various SSL certificate and Kerberos configurations |
| topology     | Explore the rack-aware configuration |
| upgrade      | Explore the non-rolling upgrade configuration |
