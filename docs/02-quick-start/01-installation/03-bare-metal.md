---
sidebar_label: Bare Metal
---

# Bare Metal Installation

This guide describes how to install and run Apache Ozone directly on a cluster of machines (bare metal or VMs) without using container orchestration like Docker or Kubernetes. This approach is similar to traditional Hadoop HDFS deployments.

## Prerequisites

Before starting, ensure the following requirements are met on **all** machines intended to run Ozone services (Ozone Manager, Storage Container Manager, Datanode):

- **Java Development Kit (JDK):** Version 8 or 11 (check the specific Ozone release notes for recommended versions). Verify with `java -version`. Ensure `JAVA_HOME` is set correctly in the environment.
- **Operating System:** A compatible Linux distribution (e.g., CentOS, RHEL, Ubuntu, Debian).
- **User Account:** A dedicated user account (e.g., `ozone`) to run the Ozone services is recommended for security and manageability. Ensure this user exists on all nodes.
- **SSH Access:** Passwordless SSH access should be configured between the node where you will run start/stop scripts and all other nodes running Ozone services, using the dedicated Ozone user account. This is required for the cluster management scripts.
- **Network Configuration:**
  - All nodes must be reachable from each other over the network.
  - Hostnames must be resolvable (either via DNS or `/etc/hosts` entries on all nodes).
  - Firewalls must allow traffic on the configured Ozone ports (see Configuration section).
- **Disk Storage:**
  - Ozone Manager (OM) metadata (`ozone.om.db.dirs`). SSDs are highly recommended.
  - Storage Container Manager (SCM) metadata (`hdds.scm.db.dirs`). SSDs are recommended.
  - Datanode data storage (`hdds.datanode.dir`). Multiple disks are recommended for performance and capacity).

## 1. Download and Unpack Ozone

1. **Download:** Obtain the **binary** distribution tarball (`ozone-<version>.tar.gz`) for your desired Ozone release from the official [Apache Ozone Downloads Page](/download). Do **not** download the source tarball (`-src.tar.gz`).
2. **Distribute:** Copy the downloaded tarball to a designated installation directory on **all** nodes in your cluster (e.g., `/opt/ozone`, `/usr/local/ozone`). Ensure the dedicated Ozone user has ownership or write permissions.
3. **Unpack:** On **each node**, unpack the tarball using the dedicated Ozone user:

    ```bash
    # Example using /opt/ozone as the installation base
    sudo mkdir -p /opt/ozone
    sudo chown ozone:ozone /opt/ozone # Assuming 'ozone' user and group
    sudo cp ozone-<version>.tar.gz /opt/ozone/

    # Switch to the ozone user
    sudo su - ozone

    # Navigate to the installation directory
    cd /opt/ozone

    # Unpack
    tar xzf ozone-<version>.tar.gz

    # (Optional) Create a symbolic link for easier upgrades
    ln -s ozone-<version> current
    # Use /opt/ozone/current as OZONE_HOME later
    ```

    Replace `<version>` with the actual version number.

## 2. Configure Ozone

Configuration files are located in the `etc/hadoop/` directory within the unpacked Ozone distribution (e.g., `/opt/ozone/current/etc/hadoop/`). You need to configure at least `ozone-site.xml` and potentially `ozone-env.sh`.

**Tip:** You can generate a template `ozone-site.xml` file containing all available configuration keys with their default values using the `genconf` command. Run this *before* creating your final `ozone-site.xml`:

```bash
cd /opt/ozone/current # Or your Ozone installation directory
bin/ozone genconf /path/to/generate/template/config
# This will create ozone-site.xml in the specified directory.
# Copy relevant properties from this template to your actual etc/hadoop/ozone-site.xml.
```

**a) `ozone-site.xml`:**

Create or edit `etc/hadoop/ozone-site.xml` on **all nodes**. Add the following essential properties, adjusting values for your specific cluster setup:

```xml
<configuration>

  <!-- General Cluster ID -->
  <property>
    <name>ozone.scm.cluster.id</name>
    <value>myOzoneCluster</value> <!-- Choose a unique ID for your cluster -->
    <description>The cluster ID identifies the SCM instance. All OMs and Datanodes should have the same cluster ID.</description>
  </property>

  <!-- SCM Configuration -->
  <property>
    <name>ozone.scm.names</name>
    <value>scm-host1.example.com,scm-host2.example.com,scm-host3.example.com</value> <!-- List of SCM hostnames (comma-separated for HA) -->
    <description>Hostnames or IP addresses of the SCM nodes.</description>
  </property>
  <property>
    <name>hdds.scm.db.dirs</name>
    <value>/path/to/scm/metadata</value> <!-- Local path on SCM nodes for metadata. Use SSD if possible. -->
    <description>Local directory for SCM metadata database.</description>
  </property>
  <!-- Add other SCM ports if defaults are changed -->

  <!-- Ozone Manager (OM) HA Configuration -->
  <property>
    <name>ozone.om.service.ids</name>
    <value>omservice</value> <!-- Choose a logical name for your OM HA service -->
    <description>Logical name for the Ozone Manager service for HA.</description>
  </property>
  <property>
    <name>ozone.om.nodes.omservice</name> <!-- Use the service ID from ozone.om.service.ids -->
    <value>om1=OM-host1.example.com:9862,om2=OM-host2.example.com:9862,om3=OM-host3.example.com:9862</value>
    <description>List of OM nodes in the HA ring: nodeID=hostname:rpc_port,...</description>
  </property>
  <property>
    <name>ozone.om.node.id</name>
    <!-- THIS MUST BE SET DIFFERENTLY ON EACH OM NODE -->
    <!-- Example for OM-host1: <value>om1</value> -->
    <!-- Example for OM-host2: <value>om2</value> -->
    <!-- Example for OM-host3: <value>om3</value> -->
    <value>om1</value> <!-- Set the unique node ID for THIS specific OM node -->
    <description>Unique identifier for this OM node within the HA service.</description>
  </property>
  <property>
    <name>ozone.om.db.dirs</name>
    <value>/path/to/om/metadata</value> <!-- Local path on OM node for RocksDB metadata. Use SSD. -->
    <description>Local directory for Ozone Manager metadata database.</description>
  </property>
  <property>
    <name>ozone.om.ratis.storage.dir</name>
    <value>/path/to/om/ratis</value> <!-- Local path on OM node for Ratis logs. Separate disk recommended. -->
    <description>Local directory for OM Ratis logs (used for HA state replication).</description>
  </property>
  <!-- Ensure ozone.om.ratis.port (default 9872) is open in firewalls between OMs -->
  <!-- Add other OM ports (HTTP) if defaults are changed -->

  <!-- Datanode Configuration -->
  <property>
    <name>hdds.datanode.dir</name>
    <value>/path/to/dn/data1,/path/to/dn/data2</value> <!-- Comma-separated list of local data directories on Datanodes -->
    <description>Local directories for Datanode container storage.</description>
  </property>
  <property>
    <name>hdds.datanode.dir.perm</name>
    <value>700</value> <!-- Set appropriate permissions for datanode directories -->
    <description>Permissions for the Datanode data directories.</description>
  </property>
  <!-- Add other Datanode ports if defaults are changed -->

</configuration>
```

- **Replace placeholders:** Update hostnames (`*.example.com`), paths (`/path/to/...`), and the cluster ID (`myOzoneCluster`) according to your environment.
- **HA Configuration:** The example above shows OM HA configuration. For SCM HA, configure `hdds.scm.service.ids` and `hdds.scm.nodes.<service-id>` similarly. Refer to the detailed HA documentation for more options.
- **Distribute:** Ensure the finalized `ozone-site.xml` is identical across all nodes in the cluster.

**b) `ozone-env.sh` (Optional):**

Edit `etc/hadoop/ozone-env.sh` to set environment variables, primarily Java options:

```bash
# Set Java Home if not already set globally
# export JAVA_HOME=/path/to/your/java

# Set Heap Size for Ozone Manager (adjust based on expected metadata size)
export OZONE_MANAGER_HEAP_OPTS="-Xmx4g" # Example: 4GB

# Set Heap Size for Storage Container Manager
export HDFS_STORAGECONTAINERMANAGER_HEAP_OPTS="-Xmx4g" # Example: 4GB

# Set Heap Size for Datanode
export HDDS_DATANODE_HEAP_OPTS="-Xmx2g" # Example: 2GB

# Set Heap Size for S3 Gateway (if used)
# export OZONE_S3G_HEAP_OPTS="-Xmx2g"

# Set Heap Size for Recon (if used)
# export RECON_HEAP_OPTS="-Xmx4g"
```

- Adjust heap sizes (`-Xmx`) based on your available RAM and expected workload.
- Distribute this file consistently if modified.

## 3. Initialize Metadata

Before starting the services for the first time, you need to initialize the metadata directories on the respective nodes. Perform these steps using the dedicated Ozone user.

- **On the SCM node(s):**

  ```bash
  cd /opt/ozone/current # Or your Ozone installation directory
  bin/ozone admin scm --init
  ```

  *Note: In an HA setup, run `--init` on one SCM, then use `--bootstrap` on the others.*

- **On the OM nodes (HA Setup):**

  1. **On the *first* OM node only:** Run the `--init` command. This initializes the cluster metadata and Ratis group.

      ```bash
      # On OM node 1 (e.g., OM-host1)
      cd /opt/ozone/current
      bin/ozone om --init
      ```

  2. **On *all other* OM nodes (e.g., OM-host2, OM-host3):** Run the `--bootstrap` command. This makes the OM contact the initialized OM (now the Ratis leader) to get the latest state and join the replication group. Ensure the first OM is running before bootstrapping others.

      ```bash
      # On OM node 2 (e.g., OM-host2)
      cd /opt/ozone/current
      bin/ozone om --bootstrap

      # On OM node 3 (e.g., OM-host3)
      cd /opt/ozone/current
      bin/ozone om --bootstrap
      ```

Initialization creates the necessary database files and writes the `VERSION` file in the metadata directories. This only needs to be done once for the cluster.

## 4. Start Ozone Services

Use the provided scripts in the `sbin/` directory to start the Ozone daemons. Run these commands as the dedicated Ozone user from one node (usually an SCM or OM node) where passwordless SSH to other nodes is configured.

**Note:** The cluster start/stop scripts (`start-ozone.sh`, `stop-ozone.sh`) rely on a `workers` file (similar to HDFS's `slaves` file) located in the `etc/hadoop/` directory to determine which nodes to start/stop Datanode services on. Ensure this file exists and lists the hostnames of all your Datanode machines, one per line.

```bash
cd /opt/ozone/current # Or your Ozone installation directory

# Start all Ozone services (SCM, OM, Datanodes) based on configuration
sbin/start-ozone.sh
```

Alternatively, you can start services individually using `ozone-daemon.sh`:

```bash
# Start SCM on the SCM host(s)
sbin/ozone-daemon.sh start scm

# Start OM on the OM host(s)
sbin/ozone-daemon.sh start OM

# Start Datanode on the Datanode host(s)
sbin/ozone-daemon.sh start datanode
```

Check the log files in the `logs/` directory (usually under the Ozone installation directory, unless configured otherwise) on each node to monitor startup progress and check for errors.

## 5. Verify Installation

Once services are started, perform some basic checks:

- **Check SCM Safe Mode:** SCM starts in Safe Mode and needs time to exit.

  ```bash
  # Wait for SCM to exit safe mode (may take a few minutes)
  bin/ozone admin scm safemode wait

  # Check status (should report "SCM is out of safe mode.")
  bin/ozone admin scm safemode status
  ```

- **Check Datanode Status:**

  ```bash
  bin/ozone admin datanode list
  ```

  Verify that all expected Datanodes are listed and in `HEALTHY` state.

- **Perform Basic I/O:**

  ```bash
  # Create a volume
  bin/ozone sh volume create /vol1

  # Create a bucket
  bin/ozone sh bucket create /vol1/bucket1

  # Create a test file locally
  echo "Hello Ozone" > /tmp/test.txt

  # Put the file into Ozone
  bin/ozone sh key put /vol1/bucket1/test.txt /tmp/test.txt

  # Get the file back
  bin/ozone sh key get /vol1/bucket1/test.txt /tmp/test_download.txt

  # Verify content
  cat /tmp/test_download.txt
  # Expected output: Hello Ozone

  # Cleanup
  bin/ozone sh key delete /vol1/bucket1/test.txt
  rm /tmp/test.txt /tmp/test_download.txt
  ```

If these steps complete successfully, your basic Ozone cluster is running on bare metal.

## Stopping Ozone Services

To stop the services:

```bash
cd /opt/ozone/current # Or your Ozone installation directory

# Stop all services
sbin/stop-ozone.sh

# Or stop individually
# sbin/ozone-daemon.sh stop datanode
# sbin/ozone-daemon.sh stop OM
# sbin/ozone-daemon.sh stop scm
```

Refer to the Administrator Guide for more advanced configuration options, security setup, and operational procedures.
