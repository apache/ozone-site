---
sidebar_label: Cluster expansion
---

# Cluster expansion

This guide covers common ways to grow capacity: **new Datanodes**, **extra disks** on existing Datanodes, and **more memory** (heap) for a Datanode. These operations are supported; Ozone picks up new nodes and storage through normal Datanode registration and heartbeat metadata—no separate “sync” step is required beyond correct configuration and restart where noted.

Adding capacity does **not** immediately redistribute existing data. New writes use the expanded cluster; to spread load or disk usage, use the balancers linked below.

## Add a new Datanode

1. Prepare the host (OS, Java, network, users/permissions) and install Ozone binaries—same as any new node. See the [bare-metal installation guide](../../quick-start/installation/bare-metal) and [Installing Ozone binaries](../installation/installing-binaries).
2. Copy or generate **`ozone-site.xml`** (and related config) so this node matches the cluster’s OM/SCM addresses, security settings, and storage layout conventions.
3. Start the Datanode on the new host:

   ```bash
   ozone --daemon start datanode
   ```

   For a full startup order and optional scripts, see [Starting and Stopping the Ozone Cluster](./start-and-stop).

After the Datanode registers with SCM, its capacity is available for new containers and replicas.

### Balance load across Datanodes

To move existing **closed** containers toward an even utilization of the cluster, run the [Container Balancer](./data-balancing/container-balancer) after expansion.

## Add a disk to an existing Datanode

1. Install the disk, **format** it, and **mount** it on the host.
2. Ensure the Ozone process user can read/write the mount (ownership and permissions).
3. Append the new mount path to **`hdds.datanode.dir`** in `ozone-site.xml` (comma-separated list). See the [configuration appendix](../configuration/appendix) for property details.
4. **Restart** the Datanode so it picks up the new volume.

SCM learns the added capacity through the Datanode’s storage reports.

### Balance traffic across disks

To shift work between disks on the same Datanode, use the [Disk Balancer](./data-balancing/disk-balancer).

## Increase Datanode memory (heap)

You do **not** need Ozone configuration keys to use additional **RAM** on the host; the process can use what the OS provides.

To raise the Datanode **Java heap** explicitly, set the environment (for example in the service environment file or before launch), then restart the Datanode:

- **`OZONE_HEAPSIZE_MAX`** — sets the maximum heap (`-Xmx`).
- **`OZONE_DATANODE_OPTS`** — additional JVM options for Datanodes.

See [Environment variables](../configuration/basic/environment-variables) for descriptions and examples.

**CPU:** Extra vCPUs or sockets do not require Ozone-specific settings; the running Datanode benefits after restart if you also change JVM or service limits at the OS level.
