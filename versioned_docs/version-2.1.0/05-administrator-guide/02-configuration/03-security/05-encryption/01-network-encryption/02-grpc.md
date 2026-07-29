---
sidebar_label: gRPC TLS
---

# Configuring gRPC With TLS

Ozone traffic may be transferred via gRPC (e.g., Ratis write pipeline or client reading blocks from Datanode). To enable TLS for gRPC traffic, set `hdds.grpc.tls.enabled` to **true**. This encrypts communication between Ozone services that use gRPC.

## mTLS in Apache Ozone

In Apache Ozone, mTLS requirements are split across two distinct communication layers:

| Communication Layer | Protocol | mTLS Requirement | Configuration Key(s) |
| --- | --- | --- | --- |
| Peer-to-Peer (Core) | gRPC / Ratis | Required (Hardcoded) | `ozone.security.enabled` & `hdds.grpc.tls.enabled` |
| Management / Web | HTTPS | Optional | `ozone.https.client.need-auth` (default: **false**) |

For the primary peer-to-peer communication (consensus, replication, heartbeats), Ozone effectively mandates mTLS by default whenever TLS is enabled in a secure cluster, using the SCM's internal Certificate Authority to issue and verify peer identities. For the HTTPS layer, mTLS is an optional extra security measure.

Clients (including the S3 Gateway) are often treated as "external" entities. While the S3 Gateway is part of the Ozone distribution, it utilizes the standard client libraries which are designed to work from machines that do not have SCM-issued certificates, relying instead on Kerberos for identity and tokens for data access.

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
