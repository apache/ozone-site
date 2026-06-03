---
sidebar_label: Netty native (direct) memory
---

# Capping Netty native (direct) memory

## Symptom

An Ozone DataNode (or other Ozone daemon under sustained Netty I/O,
including S3 Gateway) shows non-heap memory usage that is much larger
than the JVM heap. The process RSS keeps climbing under heavy
workloads even though the Java heap is stable, and `pmap` / `jeprof`
traces show most of the growth coming from `Unsafe_AllocateMemory`.

This is almost never a leak. It is Netty's pooled allocator
(`PooledByteBufAllocator`) holding on to a per-thread / per-arena
cache of direct buffers. By default, that cache can grow up to
`-XX:MaxDirectMemorySize`, which itself defaults to roughly `-Xmx`.
With both the regular `io.netty` library *and* the Ratis-shaded copy
(`org.apache.ratis.thirdparty.io.netty`) running in the same JVM, the
combined direct-memory ceiling can reach roughly 2× `-Xmx` before any
caller actually allocates that much.

## Workarounds

There are two relevant Netty system properties:

- `-Dio.netty.maxDirectMemory=<bytes>` — caps the unshaded `io.netty`
  allocator. Used by the S3 Gateway and parts of the Ozone gRPC path.
- `-Dorg.apache.ratis.thirdparty.io.netty.maxDirectMemory=<bytes>` —
  caps the Ratis-shaded copy. Used by the DataNode write/replication
  pipeline and other Ratis traffic.

Both are read once at process start. The value is parsed as a raw
byte count by Netty's `PlatformDependent`; suffix forms like `512m`
or `1g` are **not** accepted — pass the integer number of bytes (for
example, `536870912` for 512 MiB).

Disabling pooling entirely with `-Dio.netty.allocator.type=unpooled`
is also documented in Netty, but it has a measurable throughput cost
under heavy I/O and is **not** recommended for Ozone DataNodes; cap
the pool instead.

## Configuring via Ozone shell env vars

Ozone's `ozone-env.sh` understands two opt-in environment variables
that inject the matching `-D` properties into every Ozone daemon for
you. Both are unset by default, preserving prior behavior:

| Env var | What it sets |
| --- | --- |
| `OZONE_NETTY_MAX_DIRECT_MEMORY` | `-Dio.netty.maxDirectMemory=<value>` (added to `OZONE_OPTS`) |
| `OZONE_RATIS_NETTY_MAX_DIRECT_MEMORY` | `-Dorg.apache.ratis.thirdparty.io.netty.maxDirectMemory=<value>` (added to `RATIS_OPTS`) |

Example for `ozone-env.sh`, capping each pool at 4 GiB on a DataNode
with `-Xmx16g`:

```bash
export OZONE_NETTY_MAX_DIRECT_MEMORY=4294967296
export OZONE_RATIS_NETTY_MAX_DIRECT_MEMORY=4294967296
```

If you would rather set the JVM properties directly (for example, via
`OZONE_DATANODE_OPTS`) the env vars above are simply a thin wrapper —
either form is supported.

## Picking a starting value

The point of capping these is *not* to make Netty's pool small —
under default JVM settings each pool can already grow to roughly
`-Xmx`, so the implicit per-process ceiling on a typical DataNode is
already several gigabytes per pool. The point is to make that ceiling
explicit so the resident size of the daemon does not silently exceed
what the host can afford.

There is no single right number; it depends on container size, write
fan-out, and the mix of EC vs. RATIS pipelines. A reasonable starting
point on a production DataNode is roughly `Xmx / 4` to `Xmx / 2` per
pool — for example, **2–4 GiB each on `-Xmx8g`** or **4–8 GiB each on
`-Xmx16g`**. Going much below `Xmx / 4` on a DataNode that handles EC
reconstruction or HBase-style sustained block traffic is likely to
trigger `OutOfDirectMemoryError` under load; that is the signal the
cap is too tight. Watch the daemon log and back off if you see it.

The `NettyMetrics` source on each Ozone daemon (see
[HDDS-11100](https://issues.apache.org/jira/browse/HDDS-11100) and
[HDDS-13944](https://issues.apache.org/jira/browse/HDDS-13944))
exposes the Ratis-shaded Netty pool's max and used direct memory,
which is useful for sizing `OZONE_RATIS_NETTY_MAX_DIRECT_MEMORY` on a
DataNode. It does not currently report the unshaded `io.netty` pool.
