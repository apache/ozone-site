---
sidebar_label: Connectivity
---

# Troubleshooting connectivity issues

Connection failures can cause Ozone clients and services to retry for a long time before an operation fails. Identify which connection is failing before changing retry or timeout settings.

## Identify the failing connection

| Symptom | Connection to check | Start here |
| --- | --- | --- |
| Metadata operations fail or repeatedly retry | Client to Ozone Manager (OM) | [Client cannot connect to OM](#client-cannot-connect-to-om) |
| Clients retry even though OM processes are running | OM to OM over Ratis | [OM cannot elect a leader](#om-cannot-elect-a-leader) |
| Writes fail while OM tries to allocate blocks | OM to Storage Container Manager (SCM) | [OM cannot allocate blocks from SCM](#om-cannot-allocate-blocks-from-scm) |
| Datanode logs report failures connecting to Recon | Datanode to Recon | [Datanode cannot connect to Recon](#datanode-cannot-connect-to-recon) |
| Key metadata is available, but data reads or writes fail | Client to Datanode, or Datanode to Datanode | [Client cannot read or write data](#client-cannot-read-or-write-data) |

## Common checks

1. Find the first connection error in the logs, including its timestamp, destination hostname or IP address, and port. Compare it with the destination service logs at the same time.
2. Check the configuration loaded by the process that initiates the connection. Verify that its `ozone-site.xml` points to the intended cluster and service endpoints.
3. Test name resolution and TCP connectivity from that process's host or container. A successful test from an administrator's workstation does not establish connectivity from an OM, Datanode, or application container.

   On Linux, for example, replace the placeholders with the endpoint from the logs or effective configuration:

   ```bash
   getent hosts <hostname>
   nc -vz -w 5 <hostname> <port>
   ```

4. On the destination host, verify that the service is running and listening on the expected interface and port. Check routing, firewall rules, and container network policies along the failing connection.

Use the configured RPC or data transfer port, rather than the service's web UI port. See [Default Ports](../administrator-guide/configuration/basic/network/default-ports) for reference; deployments can override these defaults.

A successful TCP connection does not prove that an RPC request can succeed, authentication is valid, or a leader is available. `Connection refused` can indicate that no service is listening or a connection is actively rejected. A timeout can indicate a network problem or an unresponsive service. Use logs from both ends to distinguish these cases.

Run the Ozone commands below with the deployment's client configuration and an identity permitted to perform the operation. In a secure cluster, use valid credentials. Authentication or authorization errors require separate investigation from network failures.

## Client cannot connect to OM

### Symptoms

Metadata operations, such as listing keys or fetching key information, repeatedly retry or fail with connection errors naming an OM endpoint.

### Checks

- Check the client's `ozone.om.address` for a non-HA deployment.
- For an HA deployment, check `ozone.om.service.ids`, `ozone.om.nodes.<service-id>`, and each `ozone.om.address.<service-id>.<node-id>`. Ensure that the operation selects the intended service ID and that every configured OM endpoint is reachable from the client.
- Check whether the OM process is listening on its configured RPC port and whether its logs show the request arriving.
- If the RPC endpoints are reachable but requests still retry, check [OM leader election](#om-cannot-elect-a-leader).

### Fix

Correct stale or incorrect client addresses, DNS entries, or network rules for the failing endpoint. If OM is stopped, investigate its startup logs and restore the service. Ensure that the client loads the corrected configuration when it starts. See [Client Failover](../administrator-guide/configuration/high-availability/client-failover) for HA configuration and retry behavior.

### Verify

Repeat a metadata operation against an existing key in the intended cluster:

```bash
ozone sh key info <volume>/<bucket>/<key>
```

Confirm that it succeeds and that the original connection error no longer occurs.

## OM cannot elect a leader

### Symptoms

Clients repeatedly retry or report that no leader is available, even though OM processes are running. OM logs show repeated elections or failures communicating with Ratis peers.

### Checks

For an HA deployment, inspect the reported OM roles:

```bash
ozone admin om roles --service-id=<om-service-id>
```

This command requires a reachable OM RPC endpoint. If it fails, inspect each OM's logs directly; a failed command alone does not prove that the cluster has no leader.

Check that a majority of the configured voting OMs are running and can communicate with each other over their configured Ratis ports. The client-facing OM RPC port and the OM Ratis port serve different purposes: clients reaching OM does not establish that OM peers can communicate. Compare the service IDs, node IDs, peer addresses, and Ratis configuration on all OMs. Also check for startup errors, storage errors, or long pauses that prevent a running OM from participating.

### Fix

Restore the unavailable voting OMs or the network connections between them so that a majority can communicate. Correct inconsistent peer configuration using the [OM HA configuration guide](../administrator-guide/configuration/high-availability/om-ha). Increasing client retries does not restore the majority needed to elect a leader.

### Verify

Run the roles command again and confirm that it reports a leader. Repeat the failed client operation and check OM logs for continuing election or peer connection failures.

## OM cannot allocate blocks from SCM

### Symptoms

Writes fail or repeatedly retry while OM allocates blocks. OM logs show connection failures to SCM. Some metadata operations may still succeed.

### Checks

- From the OM host or container, check connectivity to the SCM block RPC endpoint configured through `ozone.scm.block.client.address` and `ozone.scm.block.client.port`. For HA, check the applicable service and node settings described in the [SCM HA configuration guide](../administrator-guide/configuration/high-availability/scm-ha).
- Check SCM process health and logs. In an HA deployment, inspect the reported roles:

  ```bash
  ozone admin scm roles
  ```

  This command requires SCM RPC connectivity. A successful result does not independently verify the OM-to-SCM block RPC connection; test that endpoint from OM as well.

- If SCM responds with a safe mode or pipeline allocation error, investigate that error separately. A reachable SCM may still be unable to allocate a block because it is in safe mode or lacks a suitable pipeline.

### Fix

Restore the SCM service or HA leader, or correct the OM-to-SCM address and network configuration identified by the checks. If the failure is caused by safe mode or unavailable pipelines, restore the required Datanode and pipeline health rather than increasing connection timeouts.

### Verify

Repeat the failed write using a new test key in a bucket where you have write permission. Confirm that the write succeeds and OM no longer reports SCM connection or block allocation failures.

## Datanode cannot connect to Recon

### Symptoms

Datanode logs repeatedly report connection failures to Recon, and Recon's view of Datanodes or containers may become stale.

### Checks

- Check `ozone.recon.address` in the configuration loaded by the affected Datanode. This is Recon's RPC endpoint, not its HTTP web UI address.
- From the Datanode host or container, verify that the configured Recon endpoint resolves and accepts connections.
- Check that Recon is running, listening on its RPC port, and processing Datanode reports without errors.

Recon is an optional monitoring service. Losing the Datanode-to-Recon connection does not by itself explain a client read or write failure. If data operations also fail, check their OM, SCM, and Datanode connections separately.

### Fix

Restore Recon or correct its configured RPC address, name resolution, or network access from the affected Datanodes. Ensure that any configuration changes are loaded by the affected processes.

### Verify

Confirm that the Datanode stops reporting Recon connection failures and that Recon receives fresh reports from it. Opening the Recon web UI alone does not verify the Datanode-to-Recon RPC connection.

## Client cannot read or write data

### Symptoms

Key metadata operations succeed, but reads or writes fail with errors naming Datanode endpoints. The failure may affect only some keys or pipelines.

### Checks

Compare metadata and data access for an existing key:

```bash
ozone sh key info <volume>/<bucket>/<key>
ozone sh key cat <volume>/<bucket>/<key>
```

The first command checks metadata access through OM. The second also requires data access to Datanodes. A successful metadata request does not establish that the client can reach the Datanode data ports.

Check the actual Datanode addresses and ports used by the failing request from the client host or container. For S3 operations, check from the S3 Gateway host or container, which connects to Ozone services on behalf of the S3 client. For writes, also inspect Datanode logs for failed connections between pipeline members.

If the problem follows a pod restart, an IP address change, or the use of a different client network, follow [Troubleshooting client connectivity](./client-connectivity) for the hostname configuration checks.

Check the availability of the replicas or EC blocks needed by the affected key and the health of the write pipeline. A single stopped Datanode does not necessarily make every read or write fail; the impact depends on the replication configuration and the remaining available replicas or EC blocks.

### Fix

Restore the affected Datanode service or network path. Correct unreachable advertised addresses or hostname resolution where the checks identify an address problem. If the network is working but replicas or pipelines are unavailable, investigate their health rather than treating the failure as a client timeout problem.

### Verify

Repeat the read of the affected key and verify a write to a new test key in a bucket where you have write permission. Read the new key back and compare its content with the source. Confirm that the relevant client and Datanode logs no longer show the original connection failures.
