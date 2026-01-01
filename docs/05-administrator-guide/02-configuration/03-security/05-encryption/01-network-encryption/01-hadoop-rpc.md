---
sidebar_label: Hadoop RPC
---

# Configuring Hadoop RPC With SASL

Ozone traffic, whether between the cluster and client, or internal inside the cluster, may be transferred via Hadoop RPC (e.g. client to Ozone Manager). To encrypt client-OM (Ozone Manager) communication, configure `hadoop.rpc.protection` to `privacy` in your `core-site.xml`. This ensures that all data exchanged over Hadoop RPC is encrypted.

```xml
<property>
  <name>hadoop.rpc.protection</name>
  <value>privacy</value>
</property>
```

## ozone.om.transport.class

While the default is `org.apache.hadoop.ozone.om.protocolPB.Hadoop3OmTransportFactory`, it is possible to specify a gRPC based transport using the `ozone.om.transport.class` configuration property: `org.apache.hadoop.ozone.om.protocolPB.GrpcOmTransportFactory`. In this case, the Hadoop RPC configuration is not applicable.
