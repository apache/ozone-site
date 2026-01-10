---
sidebar_label: Streaming Write Pipeline
---

# Streaming Write Pipeline

This document discusses the Streaming Write Pipeline feature in Ozone. It is implemented with the Ratis Streaming API. Note that the existing Ozone Write Pipeline is implemented with the Ratis Async API. We refer the new Streaming Write Pipeline as Write Pipeline V2 and the existing Async Write Pipeline as Write Pipeline V1.

The Streaming Write Pipeline V2 increases the performance by providing better network topology awareness and removing the performance bottlenecks in V1. The V2 implementation also avoids unnecessary buffer copying (by Netty zero copy) and has a better utilization of the CPUs and the disks in each Datanode.

For detailed architectural information about write pipelines, see the [Write Pipelines documentation](../../../core-concepts/replication/write-pipelines).

## Configuration Properties

Set the following properties to the Ozone configuration file `ozone-site.xml`.

### Enable Streaming Write Pipeline

To enable the Streaming Write Pipeline feature, set the following property to true:

```xml
<property>
  <name>hdds.container.ratis.datastream.enabled</name>
  <value>false</value>
  <description>Enable data stream of container</description>
</property>
```

### Configure Datastream Port

Datanodes listen to the following port for the streaming traffic:

```xml
<property>
  <name>hdds.container.ratis.datastream.port</name>
  <value>9855</value>
  <description>The datastream port number of container</description>
</property>
```

### Enable Filesystem Streaming

To use Streaming in FileSystem API, set the following property to true:

```xml
<property>
  <name>ozone.fs.datastream.enabled</name>
  <value>false</value>
  <description>
    Enable filesystem write via ratis streaming.
  </description>
</property>
```

## Client APIs

### OzoneDataStreamOutput

The new `OzoneDataStreamOutput` class is very similar to the existing `OzoneOutputStream` class, except that `OzoneDataStreamOutput` uses `ByteBuffer` as a parameter in the `write` methods while `OzoneOutputStream` uses `byte[]`. The reason of using a `ByteBuffer`, instead of a `byte[]`, is to support zero buffer copying. A typical `write` method is shown below:

OzoneDataStreamOutput:

```java
public void write(ByteBuffer b, int off, int len) throws IOException;
```

OzoneOutputStream:

```java
public void write(byte[] b, int off, int len) throws IOException;
```

Using `ByteBuffer` enables zero-copy operations, reducing CPU overhead and improving throughput.

### OzoneBucket

The following new methods are added to `OzoneBucket` for creating keys using the Streaming Write Pipeline.

#### createStreamKey

```java
public OzoneDataStreamOutput createStreamKey(String key, long size)
    throws IOException;
```

```java
public OzoneDataStreamOutput createStreamKey(String key, long size,
    ReplicationConfig replicationConfig, Map<String, String> keyMetadata)
    throws IOException;
```

#### createMultipartStreamKey

For multipart uploads:

```java
public OzoneDataStreamOutput createMultipartStreamKey(String key, long size,
    int partNumber, String uploadID) throws IOException;
```

Note that the methods above have the same parameter list as the existing `createKey` and `createMultipartKey` methods.

### Example

Below is an example to create a key from a local file using a memory-mapped buffer:

```java
// Create a memory-mapped buffer from a local file:
final FileChannel channel = ...  // local file channel
final long length = ...          // length of the data
final ByteBuffer mapped = channel.map(FileChannel.MapMode.READ_ONLY, 0, length);

// Create an OzoneDataStreamOutput
final OzoneBucket bucket = ...   // an Ozone bucket
final String key = ...           // the key name
final OzoneDataStreamOutput out = bucket.createStreamKey(key, length);

// Write the memory-mapped buffer to the key output
out.write(mapped);

// close
out.close();      // In practice, use try-with-resource to close it.
channel.close();  // In practice, use try-with-resource to close it.
```

## References

- [Write Pipelines](../../../core-concepts/replication/write-pipelines) - Architectural overview of V1 and V2 pipelines
- [Java Client API](../../../user-guide/client-interfaces/java-client-api) - General Ozone Java client documentation
- [Ozone Write Pipeline V2 with Ratis Streaming](https://www.cloudera.com/blog/technical/ozone-write-pipeline-v2-with-ratis-streaming.html) - Technical blog post
