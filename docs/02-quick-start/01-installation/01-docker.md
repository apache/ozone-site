---
sidebar_label: Docker
---

<!-- cspell:words xzf -->

# Try Ozone With Docker

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
 docker compose up -d --scale datanode=3
 ```

At this stage, a functional Apache Ozone cluster is available.

## Next Steps

You can enter the Ozone Manager container and try the [Ozone CLI](docs/04-user-guide/02-clients/01-ozone.md)  commands

```bash
docker compose exec om bash

ozone 
```
