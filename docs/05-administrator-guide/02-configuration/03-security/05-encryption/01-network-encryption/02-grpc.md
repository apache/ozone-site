---
sidebar_label: gRPC
---

# Configuring gRPC With TLS

Ozone traffic may be transferred via gRPC (e.g., Ratis write pipeline or client reading blocks from Datanode). To enable TLS for gRPC traffic, set `hdds.grpc.tls.enabled` to **true**. This encrypts communication between Ozone services that use gRPC.

## Configuration

Add the following property to your `ozone-site.xml` configuration file:

```xml
<property>
  <name>hdds.grpc.tls.enabled</name>
  <value>true</value>
  <description>Enable TLS for gRPC traffic</description>
</property>
```

When enabled, this property encrypts:

- Ratis write pipeline communication
- Client-to-Datanode block read operations
- Other internal gRPC-based communication between Ozone services

## Related Configuration

For information on protecting other types of in-transit traffic in Ozone, see:

- [Hadoop RPC Encryption](./hadoop-rpc) - For client-to-Ozone Manager communication
- [Network Ports](../../../../core-concepts/architecture/network-ports) - For details on network ports and transport types <!-- TODO: Link to network ports documentation when created -->
