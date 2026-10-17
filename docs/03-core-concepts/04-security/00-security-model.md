---
sidebar_label: Security model
---

# Ozone security model

This page describes the security assumptions, trust boundaries, and guarantees Apache Ozone is designed around. It is aimed at administrators, security reviewers, and anyone integrating Ozone into a larger security posture.

For how to **configure** authentication, encryption, and related settings, see the [Security](../../administrator-guide/configuration/security) section of the Administrator Guide. This page stays at the conceptual level.

For day-to-day mechanisms, see [Kerberos](./kerberos), [Native ACLs](./acls/native-acls), [Ranger ACLs](./acls/ranger-acls), and [Users and groups](./users-and-groups).

## Trust model

Ozone is made up of several parts: Ozone Manager (OM), Storage Container Manager (SCM), Datanodes, and gateways such as the S3 Gateway and Recon.

1. **Mutual trust between services:** When security is enabled (Kerberos), Ozone services trust one another based on Kerberos service principals.
2. **Centralized authentication:** User and service authentication is anchored in Kerberos (and, for S3, request signing).
3. **Token-based delegation:** Services rely on delegation tokens and block tokens issued by OM and SCM, respectively, for scoped access without forwarding long-lived credentials on every call.

## Assumptions

The model below only holds if these assumptions are true in your deployment:

1. **Network and control plane:** Traffic between Ozone components should run on a network you treat as appropriate for your threat model. TLS can protect much RPC and HTTP traffic, but some paths may still assume an isolated or operator-controlled network—validate against your own requirements.
2. **Trusted operators:** Anyone with OS-level or configuration access to Ozone nodes is in a position to change behavior or exfiltrate data. Features such as Transparent Data Encryption (TDE) limit exposure to raw disks, but access to a Key Management Service (KMS) or key material can still defeat those protections.
3. **Component integrity:** Binaries, configuration, and the runtime environment are assumed not to be attacker-controlled.
4. **Time:** Clocks should be reasonably synchronized cluster-wide so Kerberos and token expiry behave predictably.

## Guarantees

With security features enabled and configured as documented, Ozone is intended to provide:

1. **Authentication:** Users and services authenticate via Kerberos and/or S3 signature validation (for example AWS Signature Version 4), depending on the client path.
2. **Authorization:** Access to volumes, buckets, and keys is enforced with [Native ACLs](./acls/native-acls) and/or [Apache Ranger](./acls/ranger-acls), according to your setup.
3. **Data confidentiality:**
   - **In transit:** TLS/SSL for RPC and HTTP where enabled and configured.
   - **At rest:** Transparent Data Encryption (TDE) and bucket encryption options (see the [encryption](../namespace/buckets/encryption) overview) for limiting exposure of data on storage media.
4. **Data integrity:** Checksums are used to detect corruption on disk and over the wire as part of the storage path.

Exact behavior depends on configuration (for example whether Ranger is used, which protocols are TLS-terminated, and which encryption features are on). Treat the list above as design intent, not a substitute for your own testing and compliance review.

## Non-goals

Ozone does **not** try to solve every threat by itself. Notably:

1. **Malicious or all-powerful administrator:** A superuser or root on data nodes can typically read or destroy data and disrupt the cluster. Defense in depth and separation of duties are organizational controls, not something the Ozone process alone enforces.
2. **Physical attacks:** Physical access to media is out of scope for the distributed software model; encryption at rest is the main technical mitigation.

## Security of logs

**Should read-only users be given log files? Might logs contain secrets?**

- **Audience:** System and audit logs are meant for **operators**. Protect them with host and filesystem permissions like any other infrastructure log set.
- **Secret handling:** Ozone attempts to mask passwords, tokens, and similar values in logs. That masking is **best-effort**; logs are **not** certified to be free of sensitive strings.
- **Metadata:** Logs may include user identifiers, resource names (volume, bucket, key paths), client addresses, and similar metadata that may be sensitive under your policies.
- **Recommendation:** Restrict log access to authorized staff. Do not treat Ozone logs as safe to publish to untrusted or end-user audiences.
