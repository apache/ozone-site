---
sidebar_label: Client Failover
---

# HA Client Failover

## Overview

This document describes how Ozone clients handle failover and retry logic to ensure high availability and reliability. In Ozone's high availability (HA) setup, clients need to automatically failover between multiple service instances (Ozone Manager, Storage Container Manager) and retry operations when encountering failures with Datanodes.

The failover and retry mechanisms operate transparently to client applications. Clients automatically detect failures, switch to alternative service instances, and retry operations according to configurable policies. An exception is only raised to the application layer after all retry attempts have been exhausted.

## Client to Ozone Manager Failover

Clients always submit requests to the leader Ozone Manager (OM). If the `leader` is `unknown`, clients start by sending requests to the first OM in the configuration and retries other OMs until a leader is found.

### 1. Hadoop RPC Transport (`HadoopRpcOMFailoverProxyProvider`)

If client to OM is Hadoop RPC transport(`HadoopRpcOMFailoverProxyProvider`), failover or retry may happen if the OM:

- is not reachable,
- is not the leader, or
- is the leader but not ready to accept requests.

The failover mechanism retries up to **500 times** (`ozone.client.failover.max.attempts`), with **2 seconds** between each failover retry (`ozone.client.wait.between.retries.millis`).
If an OM is not aware of the current leader, the client tries the next OM in round-robin fashion. Otherwise, the client retries contacting the current leader.

Additionally, it is crucial to ensure clients and OM have consistent node mapping configurations, otherwise failover may not reach the leader OM.

### 2. gRPC Transport

When using gRPC transport (`GrpcOMFailoverProxyProvider`), the failover behavior is similar to Hadoop RPC transport, using the same retry policies and configuration parameters.

## Client to Storage Container Manager Failover

Client (client, OM, or Datanode) to SCM failover is controlled by configuration properties in `SCMClientConfig`. Clients try to connect to the leader SCM.
If the SCM provides a suggested leader in the exception, the client fails over to that leader. Otherwise, the client tries the next SCM in round-robin fashion.

The failover configuration properties are:

| Property | Default | Description |
|----------|-------|-------------|
| `hdds.scmclient.rpc.timeout` | 15min | RPC timeout for SCM. If `ipc.client.ping` is set to true and this RPC-timeout is greater than the value of `ipc.ping.interval`, the effective value of the RPC-timeout is rounded up to multiple of `ipc.ping.interval`. |
| `hdds.scmclient.max.retry.timeout` | 10min | Maximum retry timeout for SCM Client. |
| `hdds.scmclient.failover.max.retry` | 15    | Maximum retry count for SCM Client when failover happens. If `maxRetryTimeout / retryInterval` is larger than this value, the calculated value is used instead. |
| `hdds.scmclient.failover.retry.interval` | 2s    | Time to wait between retry attempts to other SCM IP. |

## Client to Datanode Failover and Retry

Clients retry Datanodes in the pipeline in order upon failure, in other words clients attempting to access a block belonging to a Ratis/3 pipeline may retry up to 3 Datanodes. The retry behavior differs for read and write operations:

**Read Operations:**

- Clients retry each Datanode 3 times (`ozone.client.read.max.retries`)
- 1 second pause between retries (`ozone.client.read.retry.interval`)
- Maximum retries: **3 × number of Datanodes**

**Write Operations:**

- Clients retry each Datanode 5 times (`ozone.client.max.retries`)
- No pause between retries (`ozone.client.retry.interval`, default: 0)
- Maximum retries: **5 × number of Datanodes**

| Property | Default | Description |
|----------|---------|-------------|
| `ozone.client.read.max.retries` | 3 | Maximum number of retries by Ozone Client on encountering connectivity exception when reading a key. |
| `ozone.client.read.retry.interval` | 1 second | Time duration in seconds a client will wait before retrying a read key request on encountering a connectivity exception from Datanodes. |
| `ozone.client.max.retries` | 5 | Maximum number of retries by Ozone Client on encountering exception while writing a key. |
| `ozone.client.retry.interval` | 0 | Time duration a client will wait before retrying a write key request on encountering an exception. By default there is no wait. |
