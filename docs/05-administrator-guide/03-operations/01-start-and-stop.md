---
sidebar_label: Start and Stop
---

# Starting and Stopping the Ozone Cluster

This guide describes how to start and stop an Ozone cluster, assuming it has already been configured and initialized.

## Startup the cluster

Run the following command on each SCM host:

```bash
ozone --daemon start scm
```

Run the following command on each OM host:

```bash
ozone --daemon start om
```

At this point Ozone's name services, the Ozone Manager, and the block service SCM are both running.

Now we need to start the data nodes. Please run the following command on each Datanode.

```bash
ozone --daemon start datanode
```

Wait until SCM exits safe mode

```bash
ozone admin safemode wait -t 240
```

At this point SCM, Ozone Manager and data nodes are up and running and are ready to serve requests.

### Starting Optional Services

If you need to start optional services like the Recon server, S3 Gateway, or HttpFS Gateway, you can start them separately:

```bash
ozone --daemon start recon
ozone --daemon start s3g
ozone --daemon start httpfs
```

## Shortcut

If you want to make your life simpler, you can just run:

```bash
start-ozone.sh
```

This assumes that you have set up the `workers` file correctly and ssh configuration that allows ssh-ing to all data nodes.

1. You are expected to list all hostnames or IP addresses in your `${OZONE_CONF_DIR}/workers` file, one per line.
2. You have passwordless SSH access configured from the control node to all other nodes in the cluster.

## Stopping the Cluster

To stop all core services, you can use the `stop-ozone.sh` script from your SCM or OM node:

```bash
stop-ozone.sh
```

To stop services individually, you can run the following commands on their respective nodes:

```bash
ozone --daemon stop scm
ozone --daemon stop om
ozone --daemon stop datanode
```

To stop optional services, run the following commands on their respective nodes:

```bash
ozone --daemon stop recon
ozone --daemon stop s3g
ozone --daemon stop httpfs
```
