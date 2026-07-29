---
sidebar_label: Datanode Maintenance Mode
---

# Datanode Maintenance Mode

Maintenance mode is a feature in Apache Ozone that allows you to temporarily take a Datanode offline for maintenance operations (e.g., hardware upgrades, software updates) without triggering immediate data replication. Unlike decommissioning, which aims to permanently remove a Datanode and its data from the cluster, maintenance mode is designed for temporary outages.

While in maintenance mode, a Datanode does not accept new writes but may still serve reads, assuming containers are healthy and online. Existing data on the Datanode will remain in place, and replication of its data will only be triggered if the Datanode remains in maintenance mode beyond a configurable timeout period. This allows for planned downtime without unnecessary data movement, reducing network overhead and cluster load.

The Datanode transitions through the following operational states during maintenance:

1. **IN_SERVICE**: The Datanode is fully operational and participating in data writes and reads.
2. **ENTERING_MAINTENANCE**: The Datanode is transitioning into maintenance mode. New writes will be avoided.
3. **IN_MAINTENANCE**: The Datanode is in maintenance mode. Data will not be written to it. If the Datanode remains in this state beyond the configured maintenance window, its data will start to be replicated to other Datanodes to ensure data durability.

## Command Line Usage

To place a Datanode into maintenance mode, use the `ozone admin datanode maintenance` command. You can specify a duration for the maintenance period. If no duration is specified, a default duration will be used (this can be configured).

To check the current state of the Datanodes, including their operational state, you can execute the following command:

```shell
ozone admin datanode list
```

To start maintenance mode for one or more Datanodes:

```shell
ozone admin datanode maintenance [-hV] [-id=<scmServiceId>] [--scm=<scm>] [--end=<hours>] [--force] [<hosts>...]
```

- `<hosts>`: A space-separated list of hostnames or IP addresses of the Datanodes to put into maintenance mode.
- `--end=<hours>`: Optional. Automatically end maintenance after the given hours. By default, maintenance must be ended manually.
- `--force`: Optional. Forcefully try to put the Datanode(s) into maintenance mode.

To take a Datanode out of maintenance mode and return it to `IN_SERVICE` state, you can use the `recommission` command:

```shell
ozone admin datanode recommission [-hV] [-id=<scmServiceId>] [--scm=<scm>] [<hosts>...]
```

## Configuration Properties

The following properties, typically set in `ozone-site.xml`, are relevant to maintenance mode:

| Property | Default Value | Description |
| -------- |---------------|-------------|
| `hdds.scm.replication.maintenance.replica.minimum` | `2` | The minimum number of container replicas which must be available for a node to enter maintenance. If putting a node into maintenance reduces the available replicas for any container below this level, the node will remain in the ENTERING_MAINTENANCE state until a new replica is created. |
| `hdds.scm.replication.maintenance.remaining.redundancy` | `1` | The number of redundant containers in a group which must be available for a node to enter maintenance. If putting a node into maintenance reduces the redundancy below this value, the node will remain in the `ENTERING_MAINTENANCE` state until a new replica is created. For Ratis containers, the default value of 1 ensures at least two replicas are online, meaning 1 more can be lost without data becoming unavailable. For any EC container it will have at least dataNum + 1 online, allowing the loss of 1 more replica before data becomes unavailable. Currently only EC containers use this setting. Ratis containers use `hdds.scm.replication.maintenance.replica.minimum`. For EC, if nodes are in maintenance, it is likely reconstruction reads will be required if some of the data replicas are offline. This is seamless to the client, but will affect read performance. |

## Metrics

The following SCM metrics are relevant to Datanode decommissioning and maintenance across all tracked nodes.

- `DecommissioningMaintenanceNodesTotal`: This metric reports the total number of Datanodes that are currently in either decommissioning or maintenance mode.
- `RecommissionNodesTotal`: This metric reports the total number of Datanodes that are currently being recommissioned (i.e., returning to `IN_SERVICE` state from either decommissioning or maintenance mode).
- `PipelinesWaitingToCloseTotal`: This metric reports the total number of Datanodes tracked with pipelines waiting to close.
- `ContainersUnderReplicatedTotal`: This metric reports the total number of containers under replicated in tracked nodes.
- `ContainersUnClosedTotal`: This metric reports the total number of containers not fully closed in tracked nodes.
- `ContainersSufficientlyReplicatedTotal`: This metric reports the total number of containers sufficiently replicated in tracked nodes.

The following SCM metrics are relevant to Datanode decommissioning and maintenance per node.

- `UnderReplicatedDN`: Number of under-replicated containers for the specific host
- `PipelinesWaitingToCloseDN`: Number of pipelines waiting to close for the specific host
- `SufficientlyReplicatedDN`: Number of sufficiently replicated containers for the specific host
- `UnclosedContainersDN`: Number of containers not fully closed for the specific host
- `StartTimeDN`: Timestamp when decommissioning was started for the specific host
