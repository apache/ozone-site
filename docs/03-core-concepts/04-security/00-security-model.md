---
sidebar_label: Security model
---

# Ozone security model

This page summarizes the security assumptions, trust boundaries, and guarantees of Apache Ozone for administrators and users. The project's [threat model](https://github.com/apache/ozone/blob/master/THREAT_MODEL.md) defines the security properties and scope used to evaluate vulnerability reports. It evolves with the project; reports against a released version are evaluated against the model for that version.

For configuration instructions, see the [Security](../../administrator-guide/configuration/security) section of the Administrator Guide. For individual mechanisms, see [Kerberos](./kerberos), [Native ACLs](./acls/native-acls), [Ranger ACLs](./acls/ranger-acls), and [Users and groups](./users-and-groups).

## Secure mode and separate controls

**Secure mode (`ozone.security.enabled=true`) is the supported production posture.** Non-secure mode provides no authentication and is intended for development and sandbox clusters. In secure mode, the S3 Gateway rejects anonymous access and verifies requests using AWS Signature Version 4 and the user's S3 secret.

Enabling secure mode does not enable every security control. Operators must configure the controls needed for their deployment:

- **Object authorization:** `ozone.acl.enabled` defaults to `false`. When enabled, Native ACLs are the default authorizer; Ranger is an alternative configured through `ozone.acl.authorizer.class`. S3 multi-tenancy requires Ranger.
- **Block and container access:** `hdds.block.token.enabled` and `hdds.container.token.enabled` default to `false`. Enable them to require valid tokens on the corresponding Datanode access paths.
- **RPC service authorization:** `hadoop.security.authorization` defaults to `false`. When enabled, protocol service ACLs default to `*` and must be restricted to the intended users and groups. These are separate from volume, bucket, and key ACLs.
- **Transport encryption:** Configure Hadoop RPC privacy, gRPC TLS, and HTTPS for the relevant paths. Authentication alone does not encrypt traffic; `hdds.grpc.tls.enabled` defaults to `false`.
- **Data encryption:** Transparent Data Encryption (TDE) is optional and protects data in encrypted buckets using keys managed by an external Key Management Service (KMS). See [bucket encryption](../namespace/buckets/encryption).
- **Web authentication:** HTTP authentication (SPNEGO) is disabled by default. Enable it for the OM and SCM web servers, or isolate their HTTP ports. Their DB checkpoint endpoints expose the metadata database and, with default HTTP authentication settings, are served without an administrator check.

## Trust boundaries

Ozone is a cluster of services with distinct responsibilities and access paths:

- **S3 Gateway:** Accepts untrusted REST requests, potentially from the internet, and validates S3 signatures.
- **Ozone Manager (OM):** Owns the namespace and metadata. RPC clients authenticate with Kerberos or delegation tokens; OM checks volume, bucket, and key permissions when object authorization is enabled.
- **Storage Container Manager (SCM):** Manages blocks and containers and acts as the cluster's internal Certificate Authority (CA). SCM-issued certificates establish service identity; protecting the CA private key is essential.
- **Datanodes:** Store data and verify block and container tokens when enabled. OM issues block tokens to clients; SCM provides token signing keys. A block token is a bearer capability: possession grants the scoped access until expiry, without the Datanode re-authenticating the user.
- **Ratis:** Replicates data between Datanode peers using Raft. A valid service identity does not guarantee that a compromised peer behaves correctly.
- **Recon:** Provides read-only management and monitoring access and is part of the security model.

Authenticated users are still untrusted with respect to other users' data. A user attempting to exceed their granted permissions is within the threat model.

## Security properties and limits

With secure mode and the applicable controls enabled, Ozone provides:

- **Authentication and service identity:** Kerberos or delegation tokens authenticate RPC clients; S3 signatures authenticate S3 requests; SCM-issued certificates establish identity on certificate-backed service paths.
- **Authorization:** The configured Native ACL or Ranger authorizer enforces permissions on volumes, buckets, and keys. Token-enabled Datanodes require valid, unexpired, correctly signed tokens for protected block and container operations.
- **Confidentiality:** Configured transport encryption protects the corresponding network paths. TDE protects data at rest in encrypted buckets; it does not replace protection for service metadata databases.
- **Integrity and consensus:** Checksums on normal reads and replica/container checks detect ordinary corruption. Ratis provides standard Raft safety under an honest majority, such as two of three replicas for `RATIS THREE`. It is not Byzantine fault tolerant, and there is no full integrity guarantee against a compromised Datanode that forges both data and metadata on the path it serves.
- **Availability:** A small, fixed number of requests from an untrusted client or an authenticated non-admin user must not terminate or hang a service or leave it unable to serve others. This includes requests whose allocation or processing cost the caller controls, even when the operation is within the user's permissions. It also includes work before authentication completes. A process that remains running but stops making progress for other users is a hang; responses slowing in proportion to load are not.

Ozone does not guarantee availability against request floods, connection exhaustion, or many concurrent requests whose individual cost the server already limits. Resource use within granted quotas and server limits is expected, provided the service continues serving others. Availability attacks by administrators or compromised service peers are outside this guarantee.

## Operator responsibilities

The model assumes trusted operators, intact service binaries and configuration, a functioning Kerberos KDC, synchronized clocks, and correct DNS configuration. Operators must:

- Run secure mode and enable the authorization, token, encryption, and HTTP authentication controls appropriate for production.
- Maintain least-privilege object policies and RPC service ACLs. Internal protocols must admit their intended service accounts; user-facing protocols must continue to admit legitimate clients. For example, the SCM block protocol needs both OM and SCM accounts, while `ozone.om.security.client.protocol.acl` must allow ordinary OM clients. Service ACLs use Hadoop short user names and groups after `hadoop.security.auth_to_local` mapping.
- Protect the KDC, Ranger policies, SCM CA private key, KMS keys, and operator hosts. Isolate the KMS and restrict Datanode, Ratis, and administrator ports to the cluster and authorized clients.
- Protect block and delegation tokens and S3 secrets in transit and in client caches. Rotate S3 secrets and review token lifetimes. Leaked bearer tokens remain usable until expiry.
- Restrict filesystem access to OM, SCM, and Recon metadata databases and encrypt them on disk where possible. Bucket TDE does not provide this protection.
- Bound client load with [quotas](../../administrator-guide/operations/quota), an OM [fair call queue](../../administrator-guide/configuration/performance/fair-call-queue), and rate limiting for an internet-facing S3 Gateway. The fair call queue applies to the Hadoop RPC transport; S3 traffic requires the Ozone identity provider and does not use this queue when the S3 Gateway reaches OM over gRPC.

Ozone enforces the policies operators configure; it cannot correct overly permissive policies or protect compromised external security infrastructure. Compromise of the SCM CA private key defeats service identity. A Byzantine majority of Ratis peers is outside the consensus safety guarantee.

## Security of logs

System and audit logs may contain user identifiers, volume, bucket and key names, client addresses, and other sensitive metadata. Restrict access to authorized operators using host and filesystem permissions, and review logs before sharing them. Object read permission does not imply permission to read service logs.

## Reporting vulnerabilities

Follow the project's [security policy](https://github.com/apache/ozone/blob/master/SECURITY.md): report suspected vulnerabilities privately to [security@ozone.apache.org](mailto:security@ozone.apache.org) so they can be investigated and fixed before public disclosure. Subscription is not required. Use [dev@ozone.apache.org](mailto:dev@ozone.apache.org) for ordinary security questions and discussion.

The security policy links to the [download page](https://ozone.apache.org/download/) for supported versions. Security reviewers should consult the threat model's triage guidance, including its configuration assumptions and known non-findings, when preparing a report.
