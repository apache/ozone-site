---
draft: true
sidebar_label: Read
---

# Apache Ozone Internals: Read Operation Implementation Guide

This guide provides a comprehensive trace of a read request in Apache Ozone, including metadata resolution, security (Block Tokens), Transparent Data Encryption (TDE), and Authorization (Ranger/Native ACLs).

---

## 1. Phase 1: Request & Authorization (Client & OM)

### 1.1 Initiating the Request

The application calls `OzoneBucket.readKey(key)`. The client sends a `lookupKey` RPC to the Ozone Manager (OM).

### 1.2 OM: Authorization Check

Before processing the lookup, the OM must authorize the user.

1. **Entry Point:** `OmMetadataReader.checkAcls()` is called within the `lookupKey` flow.
2. **Authorizer Selection:** Based on configuration (`ozone.acl.authorizer.class`), OM uses either:
   - **Native Authorizer:** Uses Ozone's internal ACLs stored in RocksDB.
   - **Apache Ranger Authorizer:** Delegates the decision to the Ranger Ozone Plugin (`RangerOzoneAuthorizer`).
3. **Authorization Logic:**
   - OM builds an `OzoneObj` (Volume/Bucket/Key) and a `RequestContext` (User, IP, Action: READ).
   - **Ranger Flow:** The plugin checks its local cache of policies (periodically synced from the Ranger Admin server). If a policy allows READ for the user/group on that resource, access is granted.
   - **Fallback:** If Ranger is disabled or the Native authorizer is used, OM checks the object's ACL list for matching user/group permissions.

### 1.3 OM: Key & Encryption Resolution

Once authorized:

1. **Key Lookup:** OM finds the `OmKeyInfo` in the `keyTable`.
2. **Encryption Check:** If TDE is enabled, the `OmKeyInfo` contains the EDEK (Encrypted Data Encryption Key) and the EZ Key Name.
3. **Block Allocation:** OM retrieves the `OmKeyLocationInfo` (Block IDs and Pipelines).
4. **Block Token Generation:** OM generates a signed Block Token for each block using secret keys managed by the SCM.

OM returns `OmKeyInfo` (Metadata + EDEK + Block Tokens) to the client.

---

## 2. Phase 2: Decryption Setup (Client & KMS)

### 2.1 Decrypting the EDEK

If the key is encrypted:

1. **KMS Request:** The client sends the EDEK to the KMS (Key Management Server).
2. **KMS Authorization:** The KMS also performs an authorization check (often via Ranger KMS plugin) to ensure the user can use the EZ Key for decryption.
3. **DEK Retrieval:** KMS returns the raw DEK (Data Encryption Key) to the client.

### 2.2 Initializing the Crypto Stream

The client wraps the data stream in a `CryptoInputStream` initialized with the raw DEK and the IV from the metadata.

---

## 3. Phase 3: Data Retrieval (Client & Datanode)

### 3.1 Fetching Encrypted Chunks

The client's `ChunkInputStream` sends a `ReadChunk` request to a Datanode.

- **Security:** The request includes the Block Token.
- **Datanode Validation:** The Datanode verifies the token's signature using the Secret Keys it fetched from the SCM. This is the final "at-the-edge" authorization check.
- **Data Transfer:** The Datanode reads the encrypted data from disk and streams it back.

### 3.2 On-the-fly Decryption

1. `KeyInputStream` receives encrypted bytes from the network.
2. `CryptoInputStream` decrypts the bytes in the client's memory.
3. The application receives the original plaintext data.

---

## Summary of Authorization & Security Layers

| Layer            | Component | Mechanism                   | Purpose                                              |
| ---------------- | --------- | --------------------------- | ---------------------------------------------------- |
| Identity         | RPC Layer | Kerberos / Delegation Token | Identifies who is making the request.                |
| Access Control   | OM        | Ranger or Native ACLs       | Determines if the user can see/access the Key.       |
| Data Security    | KMS       | EZ Master Keys              | Protects the Data Encryption Key (DEK).            |
| Edge Security    | Datanode  | Block Tokens (SCM-signed)   | Ensures only authorized clients can read raw blocks. |
| At-Rest Security | Client/DN | AES-CTR (TDE)               | Ensures data is encrypted on physical disks.         |

---

## Read Path Logic Flow

```text
 1 Application -> [OzoneClient]
 2                   |
 3         (1) lookupKey(Volume, Bucket, Key)
 4                   |
 5         [Ozone Manager] -> (2) [Ranger/Native Authorizer] (Access READ?)
 6                   |                 |-- Yes: Continue
 7                   |                 |-- No:  Throw PERMISSION_DENIED
 8                   |
 9         (3) Fetch OmKeyInfo (Metadata + EDEK + Block IDs)
10         (4) Sign Block Tokens using SCM Secret Keys
11                   |
12         <-- Returns OmKeyInfo --
13                   |
14         (5) [Client] -> KMS: decrypt(EDEK) -> returns DEK
15         (6) [Client] -> Datanode: readChunk(BlockToken)
16                   |
17         [Datanode] -> (7) Verify Block Token Signature
18                   |                 |-- Valid: Stream bytes
19                   |                 |-- Invalid: Reject
20                   |
21         (8) [Client] decrypts bytes using DEK -> returns Plaintext
```

---

## System diagram

![Apache Ozone Internals: Read Operation Implementation Guide — read path across Application, OM, KMS, Client, and Datanode](./read_implementation.png)
