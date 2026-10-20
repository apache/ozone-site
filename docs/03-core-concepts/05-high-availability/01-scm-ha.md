---
sidebar_label: SCM High Availability
---

# SCM High Availability

Ozone has two metadata-manager nodes (*Ozone Manager* for key space management and *Storage Container Management* for block space management) and multiple storage nodes (Datanode). Data is replicated between Datanodes with the help of RAFT consensus algorithm.

To avoid any single point of failure the metadata-manager nodes also should have a HA setup.

Both Ozone Manager and Storage Container Manager supports HA. In this mode the internal state is replicated via RAFT (with Apache Ratis)

Please check the [OM HA documentation](om-ha) for HA setup of Ozone Manager (OM). While they can be setup for HA independently, a reliable, full HA setup requires enabling HA for both services.

## Fault tolerance

SCM HA group can have more than three voting members. Raft requires a majority of voting members to elect a leader and commit requests:

| Voting members | Majority required | Failures tolerated |
| --- | --- | --- |
| 2 | 2 | 0 |
| 3 | 2 | 1 |
| 4 | 3 | 1 |
| 5 | 3 | 2 |
| 6 | 4 | 2 |

An even number of voting members works, but adds no failure tolerance compared with the preceding odd number. Three voting members tolerate one failure; five tolerate two, allowing one node to fail while another is down for maintenance. Deploy voting members on independent hosts. Listener OMs do not count toward the voting majority or increase failure tolerance.

## Service ID and SCM Host Mapping

To select between the available SCM nodes, a logical name (a `serviceId`) is required for each of the clusters which can be resolved to the IP addresses (and domain names) of the Storage Container Managers. Check out the [SCM HA configuration documentation](../../administrator-guide/configuration/high-availability/scm-ha) for details on how to configure the service ID and map it to individual SCM nodes.
