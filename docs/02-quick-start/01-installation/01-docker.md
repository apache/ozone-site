---
sidebar_label: Docker
---

# Try Ozone With Docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Apache Ozone can be quickly deployed using Docker Compose, making it ideal for development, testing, and evaluation purposes. This guide walks you through setting up a multi-node Ozone cluster using either pre-built Docker images or locally built sources.

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) - Latest stable version
- [Docker Compose V2](https://docs.docker.com/compose/install/) - Latest stable version

## Quick Start Guide

### Step 1: Set Up Docker Compose Configuration

First, obtain the official Ozone Docker Compose configuration:

```bash
# Download the latest Docker Compose configuration file
curl -O https://raw.githubusercontent.com/apache/ozone-docker/refs/heads/latest/docker-compose.yaml
```

### Step 2: Launch the Cluster

Start your Ozone cluster with three Datanodes using the following command:

```bash
docker compose up -d --scale datanode=3
```

This command will:

- Automatically pull the required Ozone images from Docker Hub
- Create a multi-node cluster with the core Ozone services
- Start all components in detached mode

### Step 3: Verify Deployment

Check the status of your Ozone cluster components:

```bash
docker compose ps
```

You should see output similar to this:

```bash
NAME               IMAGE                                    COMMAND                  SERVICE    STATUS         PORTS
ozone-datanode-1   apache/ozone-runner:20241216-1-jdk21   "/usr/local/bin/dumb…"   datanode   Up             0.0.0.0:61896->9882/tcp, 0.0.0.0:61897->19864/tcp
ozone-datanode-2   apache/ozone-runner:20241216-1-jdk21   "/usr/local/bin/dumb…"   datanode   Up             0.0.0.0:61895->9882/tcp, 0.0.0.0:61894->19864/tcp
ozone-datanode-3   apache/ozone-runner:20241216-1-jdk21   "/usr/local/bin/dumb…"   datanode   Up             0.0.0.0:61892->9882/tcp, 0.0.0.0:61893->19864/tcp
ozone-httpfs-1     apache/ozone-runner:20241216-1-jdk21   "/usr/local/bin/dumb…"   httpfs     Up             0.0.0.0:14000->14000/tcp
ozone-om-1         apache/ozone-runner:20241216-1-jdk21   "/usr/local/bin/dumb…"   om         Up             0.0.0.0:9862->9862/tcp, 0.0.0.0:9874->9874/tcp
ozone-recon-1      apache/ozone-runner:20241216-1-jdk21   "/usr/local/bin/dumb…"   recon      Up             0.0.0.0:9888->9888/tcp
ozone-s3g-1        apache/ozone-runner:20241216-1-jdk21   "/usr/local/bin/dumb…"   s3g        Up             0.0.0.0:9878->9878/tcp
ozone-scm-1        apache/ozone-runner:20241216-1-jdk21   "/usr/local/bin/dumb…"   scm        Up             0.0.0.0:9860->9860/tcp, 0.0.0.0:9876->9876/tcp
```

### Step 4: Access the Management Console

Once your cluster is running, you can access the Ozone Recon web interface, which provides monitoring and management capabilities:

- Open your web browser
- Navigate to the [Recon server home page](http://localhost:9888)

## Advanced Configuration

### Customizing Ozone Settings

You can customize your Ozone deployment by modifying the configuration parameters in the `docker-compose.yaml` file:

1. **Common Configurations**: Located under the `x-common-config` section
2. **Service-Specific Settings**: Found under the `environment` section of individual services

Example configuration modification:

```yaml
x-common-config:
  environment:
    OZONE-SITE.XML_ozone.scm.container.size: 1GB
    OZONE-SITE.XML_ozone.scm.block.size: 256MB
```

## Next Steps

Now that your Ozone cluster is up and running, you can enter any container and try the Ozone CLI.

```bash
docker compose exec om bash

ozone 
```

Next, learn how to [read and write data](/docs/quick-start/reading-writing-data) into Ozone.
