---
sidebar_label: gRPC TLS
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

## Related Configuration

For information on protecting other types of in-transit traffic in Ozone, see:

- [Hadoop RPC Encryption](./hadoop-rpc) - For client-to-Ozone Manager communication
- [Default Ports](../../../basic/network/default-ports) - For details on network ports and transport types
