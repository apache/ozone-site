---
sidebar_label: Hadoop RPC
---

# Configuring Hadoop RPC With SASL

Ozone traffic may be transferred via Hadoop RPC for client-to-OM (Ozone Manager) communication. To encrypt client-OM communication, configure `hadoop.rpc.protection` to `privacy` in your `core-site.xml`. This ensures that all data exchanged over Hadoop RPC is encrypted.

Hadoop RPC is encrypted using the algorithm selected by the Java SASL, which is typically 3DES or RC4. Note that the Hadoop RPC throughput may drop due to encryption overhead.

For more information, check out [Hadoop in Secure Mode](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/SecureMode.html).

```xml
<property>
  <name>hadoop.rpc.protection</name>
  <value>privacy</value>
</property>
```

## OM Transport Class

The default transport class for communication with the Ozone Manager (OM) is `org.apache.hadoop.ozone.om.protocolPB.Hadoop3OmTransportFactory`. However, users can configure the system to use a gRPC-based transport class for client-to-OM communication by setting the `ozone.om.transport.class` configuration property to `org.apache.hadoop.ozone.om.protocolPB.GrpcOmTransportFactory`.

In this case, the Hadoop RPC encryption configuration is not applicable. Refer to the [Configuring gRPC With TLS](./02-grpc.md) page to encrypt gRPC-based communication.
