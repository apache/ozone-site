---
sidebar_label: Client connectivity
---

# Troubleshooting client connectivity

Use this page when **Ozone clients cannot connect to Datanodes** for data transfer, even though metadata operations through the Ozone Manager still work.

## When to use this page

- **Kubernetes** — Datanode pods were restarted; data reads or writes fail, or pipelines misbehave after restarts.
- **Port-forward or remote clients** — You reach OM or S3 from outside the cluster network; metadata works but client-to-Datanode data traffic fails.
- **Multi-homed servers** — Datanodes have more than one network; clients cannot reach the Datanode **IP** SCM registered.

## Symptoms

- **Metadata operations succeed** (for example `ozone sh key info`, listing keys, or S3 object metadata), but **data operations fail** (reads, writes, or other client-to-Datanode traffic).
- Logs mention `UNAVAILABLE`, `Connection refused`, or a Datanode **IP** that is not reachable from the client host.
- After Kubernetes pod restarts, write throughput drops or never recovers.

## Why hostname mode helps

With the default (`hdds.datanode.use.datanode.hostname=false`), the client opens gRPC to the **IP address stored in SCM** for each Datanode. That value is used directly; the client does not look it up in DNS again at connect time. If the IP is stale or not routable from your client, data operations fail even when hostnames would work.

With `hdds.datanode.use.datanode.hostname=true`, the client connects using the **hostname** from SCM, and the JVM resolves that name when opening the channel.

## Fix

**Step 1.** Add this to **Ozone clients** and **every Datanode** (`ozone-site.xml`):

```xml
<property>
  <name>hdds.datanode.use.datanode.hostname</name>
  <value>true</value>
</property>
```

**Step 2.** Ensure Datanode **hostnames** resolve on the network where data is read and written:

- **Kubernetes:** use stable pod DNS (StatefulSet with a headless Service).
- **Multi-homed:** set `hdds.datanode.hostname` to the storage FQDN if needed. Make sure DNS or `/etc/hosts` on clients resolves that name on the **data** network.

**Step 3.** Restart clients and Datanodes (or roll pods) so the new setting is loaded.

:::note Ozone version
For **reads**, this setting is fully honored from **Ozone 2.1** onward. On older releases, run read workloads inside the cluster network or upgrade. See [HDDS-13124](https://issues.apache.org/jira/browse/HDDS-13124).
:::

## Verify

Run from the **same host and network** as your application:

```bash
ozone sh key info <volume>/<bucket>/test.txt
ozone sh key cat <volume>/<bucket>/test.txt
```

The first command checks metadata (OM). The second checks data read (Datanode). On Kubernetes, repeat after restarting a Datanode pod.

## Still stuck?

- From the client host, check that the Datanode hostname shown in SCM or Recon resolves (`getent hosts <hostname>`).
- **Multi-homed only:** if SCM shows the wrong IP, review `hdds.datanode.dns.interface` in the [configuration appendix](../administrator-guide/configuration/appendix).
- If **OM or SCM** RPC fails (not Datanode data ports), that is a separate issue. See [Client Failover](../administrator-guide/configuration/high-availability/client-failover).

## See also

- [HDDS-5916](https://issues.apache.org/jira/browse/HDDS-5916) — Kubernetes pipeline issues after pod IP changes
- [HDDS-13124](https://issues.apache.org/jira/browse/HDDS-13124) — read path and hostname configuration
