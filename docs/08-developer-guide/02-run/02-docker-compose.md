---
sidebar_label: Docker Compose
---

# Running Ozone with Docker Compose (for Development)

Apache Ozone provides a comprehensive set of Docker Compose configurations within its source distribution, designed specifically for developers to quickly launch various Ozone cluster setups for testing, debugging, and feature validation. These configurations are located in the `compose/` directory within the unpacked Ozone distribution tarball (e.g., `hadoop-ozone/dist/target/ozone-<version>/compose/`).

This guide explains how to use these Docker Compose setups, particularly for testing local code changes.

## Overview

The `compose/` directory contains subdirectories, each representing a different Ozone deployment scenario:

*   `ozone/`: Basic non-secure, non-HA cluster (1 SCM, 1 OM, 3 Datanodes).
*   `ozone-ha/`: Non-secure cluster with SCM HA (3 SCMs, 1 OM, 3 Datanodes).
*   `ozone-om-ha/`: Non-secure cluster with OM HA (1 SCM, 3 OMs, 3 Datanodes).
*   `ozonesecure/`: Secure (Kerberized) non-HA cluster.
*   `ozonesecure-ha/`: Secure (Kerberized) cluster with both SCM and OM HA.
*   `upgrade/`: Setups for testing Ozone upgrade procedures.
*   `compatibility/`: Setups for testing compatibility between different Ozone versions.
*   ... and others for specific features like CSI, Balancer, Topology, etc.

Each subdirectory typically contains:

*   `docker-compose.yaml`: Defines the services (SCM, OM, Datanode, KDC, etc.), networks, and volumes.
*   `docker-config/`: Contains configuration files (`ozone-site.xml`, etc.) mounted into the containers.
*   `.env`: Sets default environment variables, including the Docker images to use and paths for mounting local builds.
*   `test.sh` or `run.sh`: Helper scripts to manage the Docker Compose lifecycle (start, stop, run tests).

## Primary Use Case: Testing Local Builds

The most common use case for developers is testing code changes made in their local Ozone source repository without needing to build a full `apache/ozone` Docker image each time. The default configuration in most `compose` subdirectories facilitates this using the `apache/ozone-runner` image.

**How it Works (Default Behavior):**

1.  **Base Image:** The `docker-compose.yaml` files typically specify `image: ${OZONE_RUNNER_IMAGE:-apache/ozone-runner}:${OZONE_RUNNER_VERSION:-latest}` for the Ozone services (SCM, OM, Datanode).
2.  **Volume Mounts:** Crucially, they mount the Ozone distribution artifacts (JARs, scripts, config templates) from your local Maven build output directly into the running containers. This is usually configured via volumes like:
    ```yaml
    volumes:
      - ../../../:/opt/hadoop # Mounts the entire distribution from the target dir
    ```
    *(The exact path `../../../` depends on running `docker-compose` from within a specific subdirectory like `compose/ozone/` relative to the distribution root `hadoop-ozone/dist/target/ozone-<version>/`)*.
3.  **Execution:** When the container starts, it uses the Java runtime and dependencies from the `ozone-runner` image but executes the Ozone code (JARs and scripts) mounted from your local build.

**Steps to Run with Local Build:**

1.  **Build Ozone:** Ensure you have built Ozone from your source code using Maven, including the distribution package:
    ```bash
    # From the root of your Ozone source directory
    mvn clean package -Pdist -DskipTests -Dmaven.javadoc.skip=true
    ```
2.  **Navigate to Compose Directory:** Change to the specific compose scenario you want to run within the build output directory:
    ```bash
    # Example for basic non-HA cluster
    cd hadoop-ozone/dist/target/ozone-<version>/compose/ozone
    ```
3.  **Start Cluster:** Use the provided script (often `test.sh` or `run.sh`) or standard `docker-compose` commands:
    ```bash
    # Using the provided script (often runs tests after startup)
    ./test.sh

    # Or using docker-compose directly
    docker-compose up -d
    ```
4.  **Interact/Test:** Once the cluster is up (check logs using `docker-compose logs -f`), you can interact with it using `ozone sh` commands executed *inside* one of the containers (e.g., the SCM or OM container) or by configuring external clients to point to the exposed ports.
    ```bash
    # Example: Execute an ozone sh command inside the scm container
    docker-compose exec scm ozone sh volume list /

    # Example: Run Freon tests (if applicable to the scenario)
    docker-compose exec scm ozone freon okg -n10 ...
    ```
5.  **Stop Cluster:**
    ```bash
    # Using the provided script (if it includes cleanup)
    # ./test.sh cleanup (or similar, check the script)

    # Or using docker-compose directly
    docker-compose down
    ```

This workflow allows you to quickly test code changes by simply rebuilding with Maven and restarting the Docker Compose cluster, as the containers will pick up the updated JARs from the mounted volume.

## Using Pre-Built `apache/ozone` Images

If you want to test a specific released version of Ozone instead of your local build, you can modify the `.env` file within the chosen compose subdirectory:

1.  **Edit `.env`:** Open the `.env` file (e.g., `compose/ozone/.env`).
2.  **Set `OZONE_IMAGE`:** Uncomment or add the `OZONE_IMAGE` variable and set it to the desired pre-built image tag:
    ```dotenv
    # Use pre-built image instead of runner + local build mount
    OZONE_IMAGE=apache/ozone:1.4.0
    # OZONE_RUNNER_VERSION=... (Can often be left commented out when using OZONE_IMAGE)
    ```
3.  **Adjust `docker-compose.yaml` (If Necessary):** Ensure the `docker-compose.yaml` file uses `${OZONE_IMAGE}` for the `image:` definition of the Ozone services and *removes* or comments out the volume mount that maps your local build (`../../../:/opt/hadoop`). Some compose files might already be set up to conditionally use `OZONE_IMAGE` if defined.
4.  **Start Cluster:** Run `docker-compose up -d` as usual. The cluster will now use the specified release image.

## Customizing Configuration

You can modify the Ozone configuration for the Docker Compose cluster by editing the files within the `docker-config/` subdirectory *before* starting the cluster. These files (e.g., `ozone-site.xml`) are mounted into `/opt/hadoop/etc/hadoop` inside the containers, overriding the defaults within the image or the base distribution.

This allows you to easily test different configuration parameters for your development cluster.

The Docker Compose setups provide a powerful and flexible way for Ozone developers to run and test various cluster configurations locally.
