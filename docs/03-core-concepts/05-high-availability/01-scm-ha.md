---
sidebar_label: SCM High Availability
---

# SCM High Availability

Ozone has two metadata-manager nodes (*Ozone Manager* for key space management and *Storage Container Management* for block space management) and multiple storage nodes (Datanode). Data is replicated between Datanodes with the help of RAFT consensus algorithm.

To avoid any single point of failure the metadata-manager nodes also should have a HA setup.

Both Ozone Manager and Storage Container Manager supports HA. In this mode the internal state is replicated via RAFT (with Apache Ratis)

This document explains the HA setup of Storage Container Manager (SCM). <!-- TODO: Link to OM HA page when created --> Please check the OM HA documentation for HA setup of Ozone Manager (OM). While they can be setup for HA independently, a reliable, full HA setup requires enabling HA for both services.
