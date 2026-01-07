---
sidebar_label: SCM High Availability
---

# SCM High Availability

Ozone has two metadata-manager nodes (*Ozone Manager* for key space management and *Storage Container Management* for block space management) and multiple storage nodes (Datanode). Data is replicated between Datanodes with the help of RAFT consensus algorithm.

To avoid any single point of failure the metadata-manager nodes also should have a HA setup.

Both Ozone Manager and Storage Container Manager supports HA. In this mode the internal state is replicated via RAFT (with Apache Ratis)

<!-- TODO: Link to OM HA page when created --> Please check the OM HA documentation for HA setup of Ozone Manager (OM). While they can be setup for HA independently, a reliable, full HA setup requires enabling HA for both services.

## Service ID and SCM Host Mapping

To select between the available SCM nodes, a logical name (a `serviceId`) is required for each of the clusters which can be resolved to the IP addresses (and domain names) of the Storage Container Managers. Check out the [SCM HA configuration documentation](/docs/administrator-guide/configuration/high-availability/scm-ha) for details on how to configure the service ID and map it to individual SCM nodes.
