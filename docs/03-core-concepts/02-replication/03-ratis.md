---
sidebar_label: Ratis
---

# Ratis

[Apache Ratis](https://ratis.apache.org/) is a highly customizable open-source Java implementation
of the [Raft consensus protocol](https://raft.github.io/). Raft is an easily understandable consensus
algorithm designed to manage replicated state. Unlike ZooKeeper or other Raft implementations such as etcd,
Ratis is designed as a library rather than a standalone consensus server, which simplifies its management
and integration.

Ozone leverages Ratis to replicate system states across multiple nodes, ensuring high availability and
redundancy. When using Ratis for replication, each piece of data written by clients is replicated to 3 Datanodes.
Within Ozone, Ratis is employed in critical components such as the [Ozone Manager](../03-namespace/01-overview.md),
[Storage Container Manager](../01-architecture.md), and Datanodes. It forms the central pillar for the
High Availability (HA) mechanisms of both the Ozone Manager (OM-HA) and Storage Container Manager (SCM-HA).

For more detailed information, please visit the [Apache Ratis website](https://ratis.apache.org/).

For troubleshooting Ratis problems encountered in production, please refer to
[Troubleshooting Ratis](/06-troubleshooting/13-ratis.md).
