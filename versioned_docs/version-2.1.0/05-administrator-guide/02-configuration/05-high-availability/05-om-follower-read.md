---
sidebar_label: OM Follower Read
---

# OM Follower Read

OM follower read lets Ozone clients send eligible read-only OM requests to non-leader OMs in an HA service. This can reduce read load on the OM leader while preserving the normal leader path for writes and for read requests that are not eligible for follower routing.

Follower read is disabled by default. When it is enabled on the client, the Hadoop RPC transport wraps the normal OM failover proxy with a follower-read proxy. The proxy adds a read consistency hint to eligible read requests, tries OM nodes in the configured service, and falls back to the leader path if follower reads cannot be served.

## Enable follower reads

Set the client-side flag in the client configuration used by Ozone clients, S3 Gateway, or other services that issue OM reads:

```xml
<property>
  <name>ozone.client.follower.read.enabled</name>
  <value>true</value>
</property>
```

The default follower-read consistency is `LINEARIZABLE_ALLOW_FOLLOWER`, which preserves linearizable read semantics when the OM Ratis server supports linearizable reads.

```xml
<property>
  <name>ozone.client.follower.read.default.consistency</name>
  <value>LINEARIZABLE_ALLOW_FOLLOWER</value>
</property>
```

To serve `LINEARIZABLE_ALLOW_FOLLOWER` reads from followers, enable linearizable reads on OM Ratis servers:

```xml
<property>
  <name>ozone.om.ha.raft.server.read.option</name>
  <value>LINEARIZABLE</value>
</property>
```

If `ozone.om.ha.raft.server.read.option` remains `DEFAULT`, followers cannot serve linearizable follower reads. The request falls back to the leader path.

## Follower read consistency

`ozone.client.follower.read.default.consistency` controls the consistency hint used when a client sends an eligible read request to a follower.

| Consistency | Behavior |
|-------------|----------|
| `LINEARIZABLE_ALLOW_FOLLOWER` | The client may send a read to a follower. The OM uses the Ratis ReadIndex path so the follower does not return stale data. |
| `LOCAL_LEASE` | The follower may serve local metadata directly when its leader RPC time and log-index lag are within configured bounds. This is a bounded-staleness mode. |

The follower-read default must be a consistency mode that allows follower reads. Valid values for `ozone.client.follower.read.default.consistency` are `LINEARIZABLE_ALLOW_FOLLOWER` and `LOCAL_LEASE`. Setting it to `DEFAULT` or `LINEARIZABLE_LEADER_ONLY` is invalid.

## Leader read consistency

`ozone.client.leader.read.default.consistency` controls the consistency hint used when a client sends a read request through the leader path. It can be changed separately from follower-read consistency:

```xml
<property>
  <name>ozone.client.leader.read.default.consistency</name>
  <value>DEFAULT</value>
</property>
```

| Consistency | Behavior |
|-------------|----------|
| `DEFAULT` | The leader serves reads using the default leader path for backward compatibility. |
| `LINEARIZABLE_LEADER_ONLY` | The leader serves the read only after a linearizable leadership check. |

The leader-read default must be a consistency mode that does not allow follower reads. Valid values for `ozone.client.leader.read.default.consistency` are `DEFAULT` and `LINEARIZABLE_LEADER_ONLY`. Setting it to `LINEARIZABLE_ALLOW_FOLLOWER` or `LOCAL_LEASE` is invalid.

## Raft linearizability and performance

Linearizable reads make an OM read observe the latest committed Raft state. With follower reads, this matters because a follower can be behind the leader even after the leader has committed newer metadata changes.

When OM Ratis uses the `LINEARIZABLE` read option, a read goes through the Ratis linearizable read path. Ratis verifies that the serving OM is still consistent with the current leader and that the read is ordered after the committed log entries it must observe.

For followers, this normally means using the ReadIndex protocol before serving the local OM metadata. The follower can still serve the response, but it first coordinates with Raft so the read is not satisfied from stale local state.

This has a performance cost. A linearizable follower read avoids loading every read on the OM leader's RPC handler and RocksDB path, but it can add Raft coordination latency compared with a local read. Under read-heavy load, it can improve leader CPU and request concurrency while increasing per-read latency relative to `DEFAULT` leader reads.

`DEFAULT` and `LINEARIZABLE_LEADER_ONLY` both route reads to the OM leader, but they make different consistency and latency trade-offs.

With `DEFAULT`, the ready leader serves the read directly from local committed metadata. This is the fastest leader-read path because it does not perform a Raft linearizable read check for every request.

With `LINEARIZABLE_LEADER_ONLY`, the leader first verifies that it is still the current leader before serving the read. This prevents stale reads from an old leader, but the extra Raft coordination can add latency.

The split-brain case is the reason for the distinction. During a network partition, an old leader might be separated from the majority while a new leader is elected. Until the old leader detects the loss of leadership, a direct `DEFAULT` read from that old leader can return stale data because it does not have transactions committed by the new leader.

In normal operation, that split-brain window is expected to be rare. Ozone therefore keeps `DEFAULT` as the leader-read default for backward compatibility and performance, because the latency benefit is usually more valuable than strict linearizability for every leader read.

If strict linearizability is required, use `LINEARIZABLE_LEADER_ONLY` for leader reads, or `LINEARIZABLE_ALLOW_FOLLOWER` when followers should also be allowed to serve reads. If `ozone.om.allow.leader.skip.linearizable.read` is enabled, a ready leader can skip the linearizable read check and serve local committed data directly, which gives the same trade-off as the default leader path.

`LOCAL_LEASE` removes the ReadIndex round trip when the follower is within configured lag bounds. This gives the lowest follower-read latency, but it is a bounded-staleness mode rather than a linearizable mode.

## Network partitions and ReadIndex timeout

Linearizable follower reads depend on the follower being able to complete the Ratis ReadIndex protocol. If a follower is partitioned away from the majority, it cannot confirm a current read index with the leader. The read waits until the Ratis read timeout expires, then fails and the client can retry or fail over to another OM.

In Ozone, OM HA Ratis server properties can be configured by prefixing the Ratis property with `ozone.om.ha.`. For example, Ratis `raft.server.read.timeout` becomes `ozone.om.ha.raft.server.read.timeout`.

The main Ratis timeout setting for follower-read behavior is:

| Property | Ratis default | Description |
|----------|---------------|-------------|
| `ozone.om.ha.raft.server.read.timeout` | `10s` | Timeout for linearizable read-only requests, including the wait for the follower to complete the read against a current Raft state. |

## Ratis leader lease

Ratis leader lease can reduce the cost of linearizable leader reads. When the leader has a valid lease based on recent majority heartbeats, it can serve a linearizable leader read without sending a fresh heartbeat round for that read.

This optimization applies to leader reads, such as `LINEARIZABLE_LEADER_ONLY` and the leader side of `LINEARIZABLE_ALLOW_FOLLOWER`. It does not make a partitioned follower able to serve a linearizable follower read.

The trade-off is failover timing. The lease is derived from the minimum election timeout and `raft.server.read.leader.lease.timeout.ratio`. A new leader should not be elected until the old leader's lease can no longer be valid, so enabling or lengthening the lease can increase the time before a partitioned leader is replaced.

Leader lease also assumes bounded clock drift across OM hosts. If clocks can drift beyond the lease assumptions, the linearizability guarantee can be weakened because different OMs may disagree about whether the old leader's lease is still valid.

Leader lease can be configured with:

| Property | Ratis default | Description |
|----------|---------------|-------------|
| `ozone.om.ha.raft.server.read.leader.lease.enabled` | `false` in Ozone | Enables Ratis leader lease for linearizable leader reads. |
| `ozone.om.ha.raft.server.read.leader.lease.timeout.ratio` | `0.9` | Controls the maximum timeout ratio used by the Ratis leader lease. |

## Local lease reads

`LOCAL_LEASE` trades strict linearizability for lower latency by allowing a follower to serve local data without running ReadIndex, but only while the follower is close enough to the leader.

Enable local lease reads on OMs:

```xml
<property>
  <name>ozone.om.follower.read.local.lease.enabled</name>
  <value>true</value>
</property>
```

Then configure clients to request `LOCAL_LEASE` for follower reads:

```xml
<property>
  <name>ozone.client.follower.read.default.consistency</name>
  <value>LOCAL_LEASE</value>
</property>
```

The OM accepts a local lease read only when both configured limits pass:

| Property | Default | Description |
|----------|---------|-------------|
| `ozone.om.follower.read.local.lease.log.limit` | `10000` | Maximum allowed gap between the follower's last applied index and the leader's commit index. Set to `-1` to allow unbounded log lag. |
| `ozone.om.follower.read.local.lease.time.ms` | `5000` | Maximum elapsed time since the follower last heard from the leader. Set to `-1` to allow unbounded time lag. |

:::caution
Use `LOCAL_LEASE` only for workloads that can tolerate bounded stale metadata. It does not guarantee monotonic reads across client failover from a newer OM to an older-but-still-within-bounds follower.
:::

## Request routing and fallback

Only read-only OM request types are eligible for follower read routing. Writes and ineligible reads continue to use the leader failover path.

When follower read is enabled, the client:

1. Adds the configured follower-read consistency hint to eligible read requests that do not already carry a hint.
2. Tries OM proxies from the HA service configuration.
3. Uses follower reads when the target OM supports the requested consistency.
4. Falls back to the leader failover path if follower reads are disabled, unsupported, exhausted, or the request is not eligible.

If a follower returns `OMNotLeaderException` for a follower-read request, the client treats that as a signal that follower read is unsupported or misconfigured, disables follower read for that proxy provider, and retries through the leader path.

## Related features

Follower read works with both voting follower OMs and Listener OMs. Listener OMs are read-only, non-voting members that can be used to add more read-serving OM replicas.
