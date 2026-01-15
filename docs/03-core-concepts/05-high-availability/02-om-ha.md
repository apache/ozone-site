---
sidebar_label: Ozone Manager High Availability
---

# Ozone Manager High Availability

Ozone has two metadata-manager nodes (*Ozone Manager* for key space management and *Storage Container Manager* for block space management) and multiple storage nodes (Datanode). Data is replicated between Datanodes with the help of RAFT consensus algorithm.

To avoid any single point of failure the metadata-manager nodes also should have a HA setup.

Both Ozone Manager and Storage Container Manager supports HA. In this mode the internal state is replicated via RAFT (with Apache Ratis).

This page explains the HA setup of Ozone Manager (OM). Please check the [SCM High Availability](./scm-ha) page for SCM HA. While they can be setup for HA independently, a reliable, full HA setup requires enabling HA for both services.

## How It Works

A single Ozone Manager uses [RocksDB](https://github.com/facebook/rocksdb/) to persist metadata (volumes, buckets, keys) locally. HA version of Ozone Manager does exactly the same but all the data is replicated with the help of the RAFT consensus algorithm to follower Ozone Manager instances.

![HA OM](HA-OM.png)

Client connects to the Leader Ozone Manager which processes the request and schedules the replication with RAFT. When the request is replicated to all the followers the leader can return with the response.

## Configuration

For detailed configuration instructions on setting up OM HA, see the [OM HA Configuration](/docs/administrator-guide/configuration/high-availability/om-ha) documentation.
