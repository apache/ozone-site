---
title: "From Trickle to Torrent: Streaming Your Way to Faster Reads in Apache Ozone 2.2.0"
date: 2026-02-12
authors: ["apache-ozone-community"]
tags: [Ozone, Performance, gRPC, "Ozone 2.2.0"]
---

Ever felt like you're fetching data one spoonful at a time? For big data systems, slow reads can be a major bottleneck, impacting everything from analytics queries to application performance. In Apache Ozone, we're constantly pushing the boundaries of performance, and with the upcoming 2.2.0 release, we're introducing a feature that turns read operations from a trickle into a torrent: gRPC streaming for block reads.

<!-- truncate -->

### The Bottleneck: One Chunk at a Time

In a distributed storage system like Ozone, data is broken down into blocks, and blocks are composed of chunks. Previously, when a client needed to read a large block, it had to ask for each chunk individually. This meant a separate network request for every single chunk.

Client: "Can I have chunk 1?"
Datanode: "Here's chunk 1."
Client: "Thanks! Now, can I have chunk 2?"
Datanode: "Here's chunk 2."
...and so on.

For a large file, this chatty conversation adds up. Each round trip introduces network latency, and the cumulative effect can significantly slow down read-heavy workloads. It's a simple and robust design, but not the most efficient for high-performance scenarios.

### The Game Changer: gRPC Streaming for Block Reads

With the work done in [HDDS-10338](https://issues.apache.org/jira/browse/HDDS-10338), Ozone 2.2.0 flips the script. Instead of the client pulling chunks one by one, the Datanode can now *push* a continuous stream of data to the client in response to a single request.

This is made possible by gRPC's powerful bidirectional streaming capabilities. The conversation now looks more like this:

Client: "Stream me the data for this block."
Datanode: "Here comes the data stream! (chunk 1, chunk 2, chunk 3...)"

The benefits are immediate:

*   **Drastically Reduced Latency:** By collapsing hundreds or thousands of requests into one, we eliminate most of the network round-trip overhead.
*   **Higher Throughput:** The Datanode can send data as fast as the network allows, without waiting for the client's next request.
*   **Simpler Client Code:** The logic for reading a block becomes much cleaner, as the client no longer needs to manage a loop of individual chunk requests.

### Under the Hood: How to Turn on the Firehose

This powerful new feature is disabled by default to ensure backward compatibility. To enable it, simply set the following property in your client-side `ozone-site.xml`:

```xml
<property>
  <name>stream.readblock.enable</name>
  <value>true</value>
</property>
```

When this flag is enabled, the Ozone client will automatically use the new streaming API.

The implementation involved creating a new `streamReadBlock` RPC in our gRPC protocol. On the client side, the `XceiverClientGrpc` now uses a `StreamObserver` to handle the incoming flood of data, feeding it into a new `StreamBlockInputStream`. On the Datanode, the container service was upgraded to efficiently read block data from disk and write it directly to the network stream.

You can dive into the full implementation details in [pull request #9342](https://github.com/apache/ozone/pull/9342) on GitHub.

### The Proof is in the Pudding: Performance Gains

But what does this mean in practice? The numbers speak for themselves.

Initial exploration and proof-of-concept work for this feature, detailed in [pull request #6613](https://github.com/apache/ozone/pull/6613), showed dramatic improvements. In one test reading a 1GB file, the new streaming API was over **4x faster** than the old method, cutting read time from over 30 seconds down to just 7.6 seconds.

Further optimizations have pushed throughput to incredible levels, with benchmarks reaching **2800 MB/s** and even **3300 MB/s** in some scenarios.

These aren't just incremental improvements; they represent a leap forward in read performance for Apache Ozone.

### Conclusion: The Future is Fast

The introduction of streaming reads in Apache Ozone 2.2.0 is more than just an optimization—it's a fundamental improvement that makes data access faster and more efficient. It's a significant step in our ongoing mission to make Ozone the most performant and scalable object store for the big data ecosystem.

We encourage you to enable this feature and experience the performance gains firsthand. As always, the Apache Ozone community values your feedback and contributions as we continue to build the future of distributed storage.
