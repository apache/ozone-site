---
draft: true
sidebar_label: Server
---

# Network Protocols Used Among Ozone Servers

**TODO:** File a subtask under [HDDS-9862](https://issues.apache.org/jira/browse/HDDS-9862) and complete this page or section.

For each section, indicate the network protocol that is used, why it is used, and how it is secured. Add some intro/explanation at the top here.

| Client | Server | Protocol | Authentication | Encryption | Notes |
|-|-|-|-|-|-|
| Ozone Manager | Storage Container Manager | gRPC | Certificate | TLS | Used to allocate blocks, delete blocks, and get block locations. |
| Ozone Manager | Ranger | | | | |
| Ozone Manager | S3 Secret Store | | | | |
| Datanode | Datanode | | | | |
| Datanode | Storage Container Manager | | | | |
| Datanode | Recon | | | | |
| Recon | Ozone Manager | | | | |
| Recon | Storage Container Manager | | | | |
| All Ozone Components | Kerberos KDC | | | | |
| Prometheus | All Ozone Components | | | | |
