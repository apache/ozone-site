---
sidebar_label: Tokens
---

# Token Based Authentication Within Ozone

Ozone uses token-based authentication to secure access to data stored in containers and blocks.
Tokens are short-lived credentials that authorize specific operations without requiring clients to repeatedly
authenticate with the central authority.

Ozone implements two types of tokens: 
- **Delegation Tokens** for namespace operations
- **Block Tokens** for fine-grained data access,
- **Container Tokens** for container-level administrative operations.

## Delegation Token

- **Granularity:** `Namespace-level`. A Delegation Token grants access to perform metadata and namespace operations across the entire Ozone cluster, such as creating volumes, buckets, and keys, or listing objects.

- **Issuer:** `Ozone Manager (OM)`. The OM generates Delegation Tokens when a client initially authenticates (**typically via Kerberos**) and requests a delegation token. This is because the OM is responsible for managing the namespace and metadata operations within Ozone.

- **Usage Context:** A Delegation Token is used when a client needs to perform control-plane operations (namespace/metadata operations) without repeatedly authenticating with Kerberos. For example:

  1. A client application starts and authenticates with Kerberos to the Ozone Manager.
  2. The client requests a Delegation Token from the OM, which issues a token that represents the user's identity.
  3. For subsequent operations like creating a volume, listing buckets, or creating keys, the client uses this Delegation Token instead of Kerberos credentials.
  4. The token can be renewed before expiry, allowing long-running applications to continue operating without re-authentication.

- **Information Carried (`OzoneTokenIdentifier`):** The token identifier contains:

  - The owner (effective username).
  - The renewer (who can renew the token).
  - The real user (actual user if impersonation is used).
  - Issue date and expiration date.
  - Sequence number and master key ID for token management.
  - Secret key ID (for symmetric signing) or OM certificate serial ID (deprecated).
  - OM service ID for multi-OM deployments.

- **Token Types:** The `OzoneTokenIdentifier` supports two subtypes:
  - `DELEGATION_TOKEN`: Standard delegation token for namespace operations.
  - `S3AUTHINFO`: S3 authentication information (AWS Signature Version 4) for S3-compatible access.

## Block Token

- **Granularity:** `Block-level`. A Block Token grants access to a single, specific block within a container.
- **Issuer:** `Ozone Manager (OM)`. The OM generates Block Tokens when a client requests to write or read a block. This is because the OM is responsible for managing the block namespace within the object store.
- **Usage Context:** A Block Token is used when a client needs to perform a data-plane operation (read/write) on a specific block. For example:

  1. A client wants to write data for key1.
  2. It contacts the OM, which allocates a new block (e.g., block123) for key1.
  3. The OM returns the location of block123 (which includes the Datanodes) and a unique Block Token for `block123`.
  4. The client then uses this specific Block Token to write data for block123 to the Datanodes.

- **Information Carried (`OzoneBlockTokenIdentifier`):** The token identifier contains:

  - The user/owner ID.
  - The BlockID it authorizes.
  - The access modes it permits (e.g., READ, WRITE, DELETE).
  - The expiration time.

## Container Token

- **Granularity:** `Container-level`. A Container Token grants access to an entire container, which can contain many blocks.
- **Issuer:** `Storage Container Manager (SCM)`. The SCM generates Container Tokens. This is logical because the SCM is responsible for managing containers and their placement across Datanodes, but it is unaware of the individual blocks inside them.
- **Usage Context:** A Container Token is used for operations that concern the container as a whole, often for administrative or maintenance tasks that bypass the Ozone Manager. For example:

  1. An administrator uses the `ozone debug replicas verify` command to check the integrity of replicas for a container.
  2. The admin tool contacts the SCM to get a Container Token for the specified ContainerID.
  3. The tool then uses this token to communicate directly with Datanodes to perform the verification.
  4. Another example is when the SCM itself issues commands to Datanodes (e.g., to close a container). It generates a Container Token to authorize its own command.

- **Information Carried (`ContainerTokenIdentifier`):** The token identifier contains:

  - The user/owner ID.
  - The ContainerID it authorizes.
  - Expiration time.
  - It does not specify individual blocks or fine-grained access modes like a Block Token does.

## Summary of Key Differences

| Feature | Delegation Token | Block Token | Container Token |
|---------|------------------|-------------|-----------------|
| **Scope of Access** | Entire namespace (all volumes, buckets, keys) | A single Block | An entire Container |
| **Generated By** | Ozone Manager (OM) | Ozone Manager (OM) | Storage Container Manager (SCM) |
| **Primary Use Case** | Authorizing namespace/metadata operations (create volumes, buckets, keys, list operations) | Authorizing client data operations (read/write blocks) | Authorizing administrative or management operations on containers |
| **Typical User** | End-client applications performing namespace operations | End-client applications writing/reading keys | Ozone-internal processes (like SCM) or admin tools (ozone debug) |
| **Renewable** | Yes | No (short-lived, get new one when expired) | No (short-lived) |
| **Default Enabled** | Yes (when security enabled) | Yes (when security enabled) | No (disabled by default) |

In short, think of it like this:

- A **Delegation Token** is your general admission pass to the movie theater complex (Ozone cluster), given to you by the main ticket counter (Ozone Manager), allowing you to access all attractions (namespace operations) without repeatedly showing your ID (Kerberos credentials).
- A **Block Token** is your ticket to a specific seat in a movie theater, given to you by the box office (Ozone Manager).
- A **Container Token** is a master key for the entire theater room, given to you by the building manager (SCM) for maintenance or inspection purposes.
