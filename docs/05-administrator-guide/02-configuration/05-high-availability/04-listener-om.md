---
sidebar_label: Listener OM
---

# Listener Ozone Manager

A **Listener Ozone Manager (Listener OM)** is a read-only member of an OM high availability (HA) group. It applies the same Ratis log as voting members so its metadata stays current, but it does **not** vote in elections or on the Raft write path. You can direct read traffic to Listener OMs to spread load and improve read-heavy workloads.

For background on OM HA, see [Ozone Manager High Availability](../../../core-concepts/high-availability/om-ha). For client retry and failover behavior, see [HA Client Failover](./client-failover).

## When to use Listener OMs

In a typical OM HA deployment, every voting peer participates in Raft consensus. Listener OMs add extra nodes that **only follow the log and serve reads**, so voting members spend less effort on read RPCs and replication to listeners does not consume quorum votes.

:::tip
Run **more than one** Listener OM if reads depend on them. If a single listener fails, clients should still reach other listeners or fall back to voting members according to your client and load balancer setup.
:::

## Requirements and limitations

- **Voting group size:** Raft needs an odd number of **voting** members. Use **one or three** voting OMs (for example three for production). A two-voting-member configuration is invalid.
- **Listeners are not promotable:** A Listener OM cannot become leader or follower. Administrative leader transfer ([`ozone admin om transfer`](./om-ha#om-leader-transfer)) applies only to voting members.
- **Read consistency:** Reads served from a Listener OM are **eventually consistent** relative to the leader: they can lag slightly behind the latest committed metadata. Plan for that if applications need to see writes immediately.

## Configure Listener OMs

1. **List every OM node** (voting and listener) in the same service ID, as you would for standard OM HA.
2. **Mark listener node IDs** with `ozone.om.listener.nodes`.

Deploy the same logical layout on **all** OM hosts (voting and listener) so every process agrees on membership.

### Example

Three voting OMs (`om1`–`om3`) and two Listener OMs (`om4`, `om5`) for service ID `cluster1`:

```xml
<property>
  <name>ozone.om.service.ids</name>
  <value>cluster1</value>
</property>
<property>
  <name>ozone.om.nodes.cluster1</name>
  <value>om1,om2,om3,om4,om5</value>
</property>
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
<property>
  <name>ozone.om.address.cluster1.om4</name>
  <value>host4</value>
</property>
<property>
  <name>ozone.om.address.cluster1.om5</name>
  <value>host5</value>
</property>
<property>
  <name>ozone.om.listener.nodes</name>
  <value>om4,om5</value>
</property>
```

Add or adjust **`ozone.om.address.*`**, ports, and TLS settings for your environment the same way as for voting OMs (see [OM HA Configuration](./om-ha)).

## Bootstrap new Listener nodes

Before starting a new Listener OM for the first time, **bootstrap** it like any other OM added to the ring: update `ozone-site.xml` on all OMs first, then run on the new node:

```bash
ozone om [global options] --bootstrap
```

Details, including the `--force` option when a peer is down, are in [OM Bootstrap](./om-ha#om-bootstrap).

## Operations

- **Roles:** Use `ozone admin om roles` to confirm each node’s role (for example leader, follower, or listener) in the Raft group.
- **Decommission:** Remove a Listener OM with the same decommission flow you use for a standard OM node. After it leaves the HA ring, it no longer receives Ratis entries.
- **Monitoring:** Watch latency, CPU, and RPC load on listeners. If they saturate, add listeners or shift read traffic.

## References

- [OM HA Configuration](./om-ha) — membership, bootstrap, and leader transfer
- [Ozone Manager High Availability](../../../core-concepts/high-availability/om-ha) — concepts
- [HDDS-11523](https://issues.apache.org/jira/browse/HDDS-11523) — feature tracker
- [Listener OM design (Apache Ozone repo)](https://github.com/apache/ozone/blob/master/hadoop-hdds/docs/content/design/listener-om.md) — original design notes
