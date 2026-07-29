---
draft: true
sidebar_label: Client
---

# Network Protocols Used By Ozone Clients

**TODO:** File a subtask under [HDDS-9862](https://issues.apache.org/jira/browse/HDDS-9862) and complete this page or section.

For each section, indicate the network protocol that is used, why it is used, and how it is secured. Some intro/explanation at the top here would be good too.

| Client | Server | Protocol | Authentication | Authorization | Encryption | Notes |
|-|-|-|-|-|-|-|
| S3 Client | S3 Gateway | HTTPS | S3 Secrets | ACLs | TLS | S3 Gateway REST API is compatible with regular S3 HTTP clients. |
| HDFS Client | Ozone Manager | Hadoop RPC | Kerberos | ACLs | SASL | HDFS client uses Ozone client jar internally to communicate with Ozone. |
| Ozone Client | Ozone Manager | Hadoop RPC | Kerberos | ACLs | SASL | Hadoop RPC is used to transfer Kerberos information. |
| Ozone Client | Storage Container Manager | | | | | |
| Ozone Client | Datanode | gRPC |  | | | |
| Ozone Client | Kerberos KDC | | | | | |
| Ozone Client | Ranger KMS | | | | | |
| REST Client | HttpFS Server | | | | | |
| REST Client | Recon REST API | HTTPS | Kerberos + SPNEGO | [Configured Ozone Administrators](../../administrator-guide/configuration/security/administrators) | TLS | |
| Web Browser | Recon UI | HTTPS | Kerberos + SPNEGO/Apache Knox | [Configured Ozone Administrators](../../administrator-guide/configuration/security/administrators) | TLS | |
| Web Browser | Ozone WebUIs | HTTPS | Kerberos + SPNEGO/Apache Knox | | TLS | |
