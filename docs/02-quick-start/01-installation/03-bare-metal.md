---
sidebar_label: Bare Metal
---

# Try Ozone on Bare Metal

This guide covers setting up Apache Ozone on physical or virtual machines. Choose between manual installation or automated deployment using the Ozone Installer tool.

## Ozone Components

1. **Ozone Manager (OM)** - Manages the namespace (volumes, buckets, keys)
2. **Storage Container Manager (SCM)** - Block manager that provides blocks for data writes
3. **Datanodes (DN)** - Store containers and handle data read/write operations
4. **Recon** (Optional) - Management and monitoring interface
5. **S3 Gateway (S3G)** (Optional) - Provides S3-compatible API access to Ozone

Learn more: [Ozone Architecture Overview](../../core-concepts/architecture/overview)

## Prerequisites

**All Nodes:**

- Linux OS (RHEL/CentOS 7+, Ubuntu 20.04+)
- Java 11 or Java 17 (OpenJDK)
- Minimum 4 GB RAM
- SSH access
- Network connectivity between nodes

**For Manual Installation:**

- Root/sudo access on all nodes
- wget or curl for downloading binaries

**For Automated Installation:**

- **Controller node:** Python 3.10-3.12, Ansible Community 10.x
- **Managed nodes:** Python 3.7+, sudo access

---

## Method 1: Manual Installation

:::note
We will be using `/opt/ozone` as the base directory for Ozone configs and binaries, and `/data/ozone` for the application data and metadata in all of our examples. Feel free to use any path as per your environment.
:::

### Step 1: Install Java

```bash
jdk_version=11  # or 17
# RHEL/CentOS/Rocky Linux
sudo yum install -y java-${jdk_version}-openjdk-devel

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y openjdk-${jdk_version}-jdk

# Verify installation
java -version
```

Set `JAVA_HOME`:

```bash
# Find Java location
sudo update-alternatives --config java

# Add to ~/.bashrc or /etc/profile
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk
export PATH=$PATH:$JAVA_HOME/bin
```

### Step 2: Create Service User

```bash
# Create ozone user and group
sudo groupadd ozone
sudo useradd -g ozone -m -s /bin/bash ozone

# Create data directories
sudo mkdir -p /data/ozone/{metadata,datanode/id,datanode/data}
sudo chown -R ozone:ozone /data/ozone

# Create installation directory
sudo mkdir -p /opt/ozone
sudo chown ozone:ozone /opt/ozone
```

### Step 3: Download and Extract Ozone

Check [GitHub releases](https://github.com/apache/ozone/releases/latest) for the latest version.

```bash
# Switch to ozone user
sudo su - ozone

# Download Ozone (latest: 2.1.0)
wget https://downloads.apache.org/ozone/2.1.0/ozone-2.1.0.tar.gz

# Extract on all nodes
tar -xzf ozone-2.1.0.tar.gz -C /opt/
ln -s /opt/ozone /opt/ozone-2.1.0
cd /opt/ozone
```

### Step 4: Generate and Configure

```bash
# Generate configuration template
bin/ozone genconf /opt/ozone/etc/hadoop/
```

Edit `/opt/ozone/etc/hadoop/ozone-site.xml`:

```xml
<configuration>
  <property>
    <name>ozone.metadata.dirs</name>
    <value>/data/ozone/metadata</value>
  </property>

  <property>
    <name>ozone.scm.names</name>
    <value>scm-host.example.com</value>
  </property>

  <property>
    <name>ozone.om.address</name>
    <value>om-host.example.com</value>
  </property>

  <property>
    <name>ozone.scm.datanode.id.dir</name>
    <value>/data/ozone/datanode/id</value>
  </property>

  <property>
    <name>hdds.datanode.dir</name>
    <value>/data/ozone/datanode/data</value>
  </property>

  <property>
    <name>ozone.replication</name>
    <value>3</value>
    <!-- Use 1 for single node deployment -->
  </property>

  <!-- Optional: S3 Gateway Configuration -->
  <property>
    <name>ozone.s3g.http-address</name>
    <value>0.0.0.0:9878</value>
  </property>
</configuration>
```

**Configuration Resources:**

- [Configuration Properties Reference](../../administrator-guide/installation/initializing-cluster#ozone-settings-summary)
- [Network Ports Reference](../../administrator-guide/configuration/basic/network/default-ports)
- [S3 Gateway Setup Guide](../../user-guide/client-interfaces/s3/s3-api)
- [Security Configuration](../../administrator-guide/configuration/)
- [High Availability Setup](pathname:///docs/2.0.0/feature/om-ha.html)

Copy `ozone-site.xml` to all nodes.

### Step 5: Initialize Services

```bash
# On SCM node (as ozone user)
bin/ozone scm --init

# On OM node (requires SCM to be running)
bin/ozone om --init
```

### Step 6: Start Services

```bash
# Start SCM (on SCM node, as ozone user)
bin/ozone --daemon start scm

# Start OM (on OM node, as ozone user)
bin/ozone --daemon start om

# Start Datanodes (on all datanode nodes, as ozone user)
bin/ozone --daemon start datanode

# Optional: Start Recon (on Recon node, as ozone user)
bin/ozone --daemon start recon

# Optional: Start S3 Gateway (on S3G node, as ozone user)
bin/ozone --daemon start s3g
```

### Step 7: Verify Installation

```bash
# Check running processes
jps
# Should list all ozone process

# Test basic operations
bin/ozone sh volume create /vol1
bin/ozone sh bucket create /vol1/bucket1
echo "Hello Ozone" > /tmp/test.txt
bin/ozone sh key put /vol1/bucket1/key1 /tmp/test.txt
bin/ozone sh key list /vol1/bucket1
```

### Stop Services (when needed)

```bash
bin/ozone --daemon stop s3g
bin/ozone --daemon stop datanode
bin/ozone --daemon stop om
bin/ozone --daemon stop scm
bin/ozone --daemon stop recon
```

---

## Method 2: Automated Installation (Recommended)

The [ozone-installer](https://github.com/apache/ozone-installer) is an Ansible-based tool that automates Ozone deployment. It handles Java installation, user creation, and all configuration steps automatically.

### Installation Steps

**1. Clone and setup:**

```bash
git clone https://github.com/apache/ozone-installer.git
cd ozone-installer
pip install -r requirements.txt
```

**2. Run the installer:**

```bash
# Single node
python3 ozone_installer.py -H hostname.example.com -v 2.1.0

# Multi-node (HA with 3+ hosts)
python3 ozone_installer.py -H "host{1..5}.example.com" -v 2.1.0

# Using host file
python3 ozone_installer.py -F hosts.txt -v 2.1.0

# Specify Python interpreter (if needed)
python3 ozone_installer.py -H hosts -v 2.1.0 --python-interpreter /usr/bin/python3.9

# Cleanup and reinstall
python3 ozone_installer.py --clean -H hosts -v 2.1.0
```

### What Gets Installed

**Automated setup includes:**

- Java 11 or 17 installation (if not present)
- Service user (`ozone`) creation
- Directory structure setup
- Ozone binary installation and configuration
- S3 Gateway setup

**Non-HA (1-2 nodes):**

- First host: OM + SCM + Recon (+ S3G if enabled)
- All hosts: Datanodes

**HA (3+ nodes):**

- First 3 hosts: OM + SCM (HA)
- First host: Recon + S3G (if enabled)
- All hosts: Datanodes

**Default paths:**

- Install: `/opt/ozone`
- Data: `/data/ozone`
- Service user: `ozone:ozone`

**For more details, see the [ozone-installer repository](https://github.com/apache/ozone-installer).**

## References

- [Single Node Deployment Guide](https://cwiki.apache.org/confluence/display/OZONE/Single+Node+Deployment)
- [Ozone Installer on GitHub](https://github.com/apache/ozone-installer)
