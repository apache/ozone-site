---
sidebar_label: Docker
---

# Try Ozone With Docker

Apache Ozone can be quickly deployed using Docker Compose, making it ideal for development, testing, and evaluation purposes. This guide walks you through setting up a multi-node Ozone cluster using pre-built Docker images.

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) - Latest stable version
- [Docker Compose](https://docs.docker.com/compose/install/) - Latest stable version

## Running Ozone

### Obtain the Docker Compose Configuration

First, obtain Ozone's sample Docker Compose configuration:

```bash
# Download the latest Docker Compose configuration file
curl -O https://raw.githubusercontent.com/apache/ozone-docker/refs/heads/latest/docker-compose.yaml
```

### Start the Cluster

Start your Ozone cluster with three Datanodes using the following command:

```bash
docker compose up -d --scale datanode=3
```

This command will:

- Automatically pull required images from Docker Hub
- Create a multi-node cluster with the core Ozone services
- Start all components in detached mode

### Verify the Deployment

1. Check the status of your Ozone cluster components:

    ```bash
    docker compose ps
    ```

    You should see output similar to this:

    ```bash
    NAME                IMAGE                      COMMAND                  SERVICE    CREATED          STATUS          PORTS
    docker-datanode-1   apache/ozone:1.4.1-rocky   "/usr/local/bin/dumb…"   datanode   14 seconds ago   Up 13 seconds   0.0.0.0:32958->9864/tcp, :::32958->9864/tcp
    docker-datanode-2   apache/ozone:1.4.1-rocky   "/usr/local/bin/dumb…"   datanode   14 seconds ago   Up 13 seconds   0.0.0.0:32957->9864/tcp, :::32957->9864/tcp
    docker-datanode-3   apache/ozone:1.4.1-rocky   "/usr/local/bin/dumb…"   datanode   14 seconds ago   Up 12 seconds   0.0.0.0:32959->9864/tcp, :::32959->9864/tcp
    docker-om-1         apache/ozone:1.4.1-rocky   "/usr/local/bin/dumb…"   om         14 seconds ago   Up 13 seconds   0.0.0.0:9874->9874/tcp, :::9874->9874/tcp
    docker-recon-1      apache/ozone:1.4.1-rocky   "/usr/local/bin/dumb…"   recon      14 seconds ago   Up 13 seconds   0.0.0.0:9888->9888/tcp, :::9888->9888/tcp
    docker-s3g-1        apache/ozone:1.4.1-rocky   "/usr/local/bin/dumb…"   s3g        14 seconds ago   Up 13 seconds   0.0.0.0:9878->9878/tcp, :::9878->9878/tcp
    docker-scm-1        apache/ozone:1.4.1-rocky   "/usr/local/bin/dumb…"   scm        14 seconds ago   Up 13 seconds   0.0.0.0:9876->9876/tcp, :::9876->9876/tcp
    ```

2. Check the Ozone version

    ```bash
    docker compose exec om bash
    ozone version
    ```

3. Access the Ozone Recon server, which provides monitoring and management capabilities by navigating to the [Recon server home page](http://localhost:9888).

## Configuration

You can customize your Ozone deployment by modifying the configuration parameters in the `docker-compose.yaml` file:

1. **Common Configurations**: Located under the `x-common-config` section
2. **Service-Specific Settings**: Found under the `environment` section of individual services

As an example, to update the port on which Recon listens to, append the following configuration:

```yaml
x-common-config:
  ...
  OZONE-SITE.XML_ozone.recon.http-address: 0.0.0.0:9090
```

Refer to the [Configuring Ozone For Production](/docs/quick-start/installation/docker) page for more configuration guidelines.

## Next Steps

Now that your Ozone cluster is up and running, you can enter any container and explore the environment.

```bash
docker compose exec om bash
```

Next, learn how to [read and write data](/docs/quick-start/reading-writing-data) into Ozone.
