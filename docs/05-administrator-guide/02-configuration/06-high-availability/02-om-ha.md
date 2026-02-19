---
sidebar_label: OM HA Configuration
---

# Ozone Manager High Availability

Ozone Manager (OM) High Availability ensures that there is no single point of failure for the metadata-manager node responsible for key space management. In HA mode, the internal state is replicated via RAFT (with Apache Ratis) across multiple Ozone Manager instances.

:::info
For conceptual information about OM HA, see the [OM HA documentation](../../../core-concepts/high-availability/om-ha).
:::

## Configuration

One Ozone configuration (`ozone-site.xml`) can support multiple Ozone HA cluster. To select between the available HA clusters a logical name is required for each of the clusters which can be resolved to the IP addresses (and domain names) of the Ozone Managers.

This logical name is called `serviceId` and can be configured in the `ozone-site.xml`

```xml
<property>
   <name>ozone.om.service.ids</name>
   <value>cluster1</value>
</property>
```

For each of the defined `serviceId` a logical configuration name should be defined for each of the servers.

```xml
<property>
   <name>ozone.om.nodes.cluster1</name>
   <value>om1,om2,om3</value>
</property>
```

The defined prefixes can be used to define the address of each of the OM services:

```xml
<property>
   <name>ozone.om.address.cluster1.om1</name>
   <value>host1</value>
</property>
<property>
   <name>ozone.om.address.cluster1.om2</name>
   <value>host2</value>
</property>
<property>
   <name>ozone.om.address.cluster1.om3</name>
   <value>host3</value>
</property>
```

:::warning
Updating the OM service ID after the cluster is set up is not supported and will cause the OM startup process to abort. This value should be considered immutable after initial deployment.
:::

The defined `serviceId` can be used instead of a single OM host using client interfaces.

For example with `o3fs://`

```bash
hdfs dfs -ls o3fs://bucket.volume.cluster1/prefix/
```

Or with `ofs://`:

```bash
hdfs dfs -ls ofs://cluster1/volume/bucket/prefix/
```

## OM Bootstrap

To convert a non-HA OM to be HA or to add new OM nodes to existing HA OM ring, new OM node(s) need to be bootstrapped.

Before bootstrapping a new OM node, all the existing OM's on-disk configuration file (ozone-site.xml) must be updated with the configuration details of the new OM such as nodeId, address, port etc. Note that the existing OMs need not be restarted. They will reload the configuration from disk when they receive a bootstrap request from the bootstrapping node.

To bootstrap an OM, the following command needs to be run:

```bash
ozone om [global options (optional)] --bootstrap
```

The bootstrap command will first verify that all the OMs have the updated configuration file and fail the command otherwise. This check can be skipped using the *force* option. The *force* option allows to continue with the bootstrap when one of the existing OMs is down or not responding.

```bash
ozone om [global options (optional)] --bootstrap --force
```

Note that using the *force* option during bootstrap could crash the OM process if it does not have updated configurations.

## OM Leader Transfer

The `ozone admin om transfer` command allows you to manually transfer the leadership of the Ozone Manager (OM) Raft group to a specific OM node or to a randomly chosen follower.

### Usage

```bash
ozone admin om transfer -id <OM_SERVICE_ID> -n <NEW_LEADER_ID>
ozone admin om transfer -id <OM_SERVICE_ID> -r
```

- `-id, --service-id`: Specifies the Ozone Manager Service ID.
- `-n, --newLeaderId, --new-leader-id`: The node ID of the OM to which leadership will be transferred (e.g., `om1`).
- `-r, --random`: Randomly chooses a follower to transfer leadership to.

### Example

To transfer leadership to `om2` in a cluster with service ID `cluster1`:

```bash
ozone admin om transfer -id cluster1 -n om2
```

To transfer leadership to a random follower:

```bash
ozone admin om transfer -id cluster1 -r
```

## OM Service Roles Listing

The `ozone admin om roles` command lists all Ozone Managers and their respective Raft server roles (leader, follower, or candidate).

### Usage

```bash
ozone admin om roles [-id <OM_SERVICE_ID>] [--json | --table]
```

- `-id, --service-id`: (Optional) Specifies the Ozone Manager Service ID.
- `--json`: (Optional) Formats the output as JSON.
- `--table`: (Optional) Formats the output as a table.

### Example

To list OM roles for `cluster1`:

```bash
ozone admin om roles -id cluster1
```

Example output:

```text
om1 : LEADER (host1)
om2 : FOLLOWER (host2)
om3 : FOLLOWER (host3)
```

To list OM roles as a table:

```bash
ozone admin om roles -id cluster1 --table
```

Example table output:

```text
Ozone Manager Roles
-------------------
Host Name | Node ID | Role
-------------------
host1     | om1     | LEADER
host2     | om2     | FOLLOWER
host3     | om3     | FOLLOWER
-------------------
```

## References

<!--
- [OM HA Implementation Details](/docs/system-internals/components/ozone-manager/high-availability) - Technical implementation details including double buffer and automatic snapshot installation
-->

- [SCM HA Configuration](./scm-ha) - Storage Container Manager High Availability configuration

<!--
- [OM HA Implementation Details](../../../system-internals/components/ozone-manager/high-availability) - Technical implementation details including double buffer and automatic snapshot installation
-->
