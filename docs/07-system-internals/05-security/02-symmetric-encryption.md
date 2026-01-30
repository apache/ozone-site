---
sidebar_label: Symmetric Encryption
---

# Symmetric Encryption Within Ozone

In secure mode, Ozone issues tokens to authorize and verify each block and container access. Traditionally, each token is signed by Ozone Manager (OM) or Storage Container Manager (SCM) using RSA private keys and verified by DataNodes using public keys and certificates. However, with RSA private key sizes of 2048 bits, the signing operation is computationally expensive and can contribute more than 80% to the latency of read/write operations in Ozone Manager.

Since Ozone Manager is not horizontally scalable by design, minimizing operational costs is critical for achieving sub-millisecond latencies. Asymmetric key signing cannot meet this requirement. The solution is to use symmetric-key algorithms, such as HMAC with SHA256, to sign tokens—similar to how HDFS operates. This approach reduces signature generation costs from milliseconds to microseconds.

## Performance Advantages Over Asymmetric Encryption

| Aspect | Asymmetric (RSA-2048) | Symmetric (HMAC-SHA256) |
|--------|----------------------|------------------------|
| Signing Speed | Milliseconds | Microseconds |
| CPU Overhead | High | Low |
| Latency Impact | >80% of OM read/write latency | Negligible |
| Scalability | Limited by signing cost | Highly scalable |

## Shared Secret Model

Symmetric key algorithms require both the signer (OM) and the verifier (DataNodes) to share the same SecretKey. This necessitates managing SecretKey distribution and lifecycle across Ozone components.

### Architecture Overview

**Component Responsibilities:**

| Component | Role |
|-----------|------|
| **SCM** | Source of truth. Generates, rotates, stores, and distributes SecretKeys. |
| **OM** | Fetches current SecretKey from SCM, caches it, and signs block tokens using HMAC. |
| **DataNodes** | Receive SecretKeys via heartbeat/register, verify tokens using cached keys. |

**SecretKey Flow:**

```
                        Fetch Current Key
            ┌─────────────────────────────────────┐
            │                                     │
            ▼                                     │
┌───────────────────┐                    ┌────────┴────────┐
│    SCM Leader     │ ── Rotate Daily ──►│       OM        │
│                   │                    │     (HMAC)      │
│  SecretKey File   │                    └────────┬────────┘
└─────────┬─────────┘                             │
          │                                       │ Sign Block Token
          │ Distribute Keys                       │
          │ via Heartbeat                         ▼
          │                              ┌─────────────────┐
          │                              │     Client      │
          ▼                              └────────┬────────┘
┌───────────────────┐                             │
│    DataNodes      │◄────────────────────────────┘
│                   │        Read/Write with Token
│  Verify Token     │
└───────────────────┘
```

## SecretKey Lifecycle

### Key Structure

Each SecretKey encapsulates:
- **ID**: Unique identifier for the SecretKey
- **creationTime**: Timestamp of key creation
- **expiryTime**: creationTime + X days (configurable expiry duration)
- **secretKey**: The actual symmetric key material

### Key Generation and Storage

- SCM generates SecretKeys and stores them persistently in the SCM file system
- Each SCM generates its own SecretKeys independently
- SCM maintains both the current active SecretKey and all non-expired keys
- Keys are stored in a KeyStore file in `<hdds.metadata.dir>/scm/<hdds.key.dir.name>`
- File permissions are restricted to read-only access for the SCM process owner

### Key Rotation

SCM proactively generates and distributes the next SecretKey to ensure the current active key is always available on DataNodes before it becomes active:

```java
// When SCM first starts
currentKey = generateSecretKey();
nextKey = generateSecretKey();
allKeys.add(currentKey);
allKeys.add(nextKey);

// Key rotation (periodic)
currentKey = nextKey;
nextKey = generateSecretKey();
allKeys.add(nextKey);
filterExpiredSecretKeys(allKeys);
```

During each rotation cycle:
1. The previously generated `nextKey` becomes the `currentKey`
2. A new `nextKey` is generated for the upcoming cycle
3. Expired SecretKeys are removed from the active set

## Key Distribution

### To Ozone Manager

- OM retrieves the current SecretKey from SCM (leader) via RPC
- For performance, OM caches the SecretKey in memory with a configurable TTL
- Signed tokens include the SecretKey ID, allowing DataNodes to identify which key to use for verification

### To DataNodes

DataNodes receive SecretKeys through two mechanisms:

1. **Registration**: When a DataNode joins or rejoins a cluster, it registers with all SCM instances and fetches all current non-expired SecretKeys

2. **Heartbeat**: During heartbeat processing, SCM checks if new SecretKeys need to be distributed and includes them in the heartbeat response

DataNodes store SecretKeys in memory using a HashMap for fast lookup by ID. They also periodically remove expired keys.

## Handling Special Events

### OM Restart

After restarting, OM calls SCM to fetch and cache the current SecretKey.

### SCM Restart

After restarting, SCM:
1. Reads the stored file to load non-expired SecretKeys
2. Removes any expired keys
3. Assigns the `currentKey` based on timestamps of loaded keys
4. Generates a new `nextKey` if needed

If all stored keys have expired, SCM behaves as if starting fresh.

The following table illustrates SCM key restoration behavior with a 7-day key expiry period. In this example, `kN` represents a key generated on day N. Assume SCM was running until Day 6 and stored keys k1-k7 (where k6 was `currentKey` and k7 was `nextKey`), then went down. The table shows what happens when SCM restarts on different days:

| Stored Keys | Restart Day | Key Restoration Result |
|-------------|-------------|------------------------|
| k1-k7 | Day 6 | `currentKey` = k6, `nextKey` = k7, `allKeys` = [k1, k2, k3, k4, k5, k6, k7] |
| k1-k7 | Day 7 | `currentKey` = k7, `nextKey` = generateNewKey(), `allKeys` = [k1, k2, k3, k4, k5, k6, k7, nextKey] |
| k1-k7 | Day 8 | `currentKey` = k7, `nextKey` = generateNewKey(), `allKeys` = [k2, k3, k4, k5, k6, k7, nextKey] |
| k1-k7 | Day 13 | `currentKey` = k7, `nextKey` = generateNewKey(), `allKeys` = [k7, nextKey] |
| k1-k7 | Day 14 | `currentKey` = generateNewKey(), `nextKey` = generateNewKey(), `allKeys` = [currentKey, nextKey] |

**Notes:**
- Day 6: Same day as shutdown, keys restored as-is
- Day 7: k7 promoted to current, new nextKey generated
- Day 8: k1 expired (generated Day 1 + 7 days = Day 8), removed from allKeys
- Day 13: Only k7 remains valid, k1-k6 all expired
- Day 14: All stored keys expired (k7: Day 7 + 7 = Day 14), fresh keys generated

### SCM Failover

When SCM leadership transfers to a new instance:
- The new SCM's SecretKeys should already be present on DataNodes (since DataNodes register with all SCM instances)
- OM can continue using its cached SecretKey until the cache expires
- Edge cases where a DataNode lacks a required SecretKey are handled through eventual consistency mechanisms

### Missing SecretKey on DataNode

If a DataNode cannot find a required SecretKey:
1. It triggers an immediate heartbeat to update SecretKeys from all SCMs
2. Returns a `SecretKeyNotFound` error to the client
3. The client retries with other nodes in the pipeline
4. If all nodes fail, the client requests fresh block information from OM with a flag to refresh the SecretKey cache
5. A metric is emitted to expose the situation for monitoring

## Compliance and Security Standards

### Algorithm Selection

Following NIST SP 800-133 recommendations for Message Authentication Codes, Ozone uses **HMAC** as it is:
- Highly performant
- Supported by Java Security Core
- Compliant with security standards

The default configuration uses **HMAC with SHA256**, which provides 128-bit security strength per NIST SP 800-57.

### Key Generation

SecretKeys are generated using Java's `SecureRandom`, which complies with FIPS 140-2 requirements for approved Random Number Generators.

### Key Storage

- SecretKeys are persisted in a KeyStore file
- File permissions are restricted to owner-only read access
- Location: `<hdds.metadata.dir>/scm/<hdds.key.dir.name>`

### Key Transfer

SecretKeys are transferred between SCM, OM, and DataNodes via TLS-protected RPC connections, ensuring confidentiality during transit.

## Related Resources

- [HDDS-7733](https://issues.apache.org/jira/browse/HDDS-7733) - Performance analysis of token signing
- [NIST SP 800-133](https://csrc.nist.gov/publications/detail/sp/800-133/rev-2/final) - Recommendation for Cryptographic Key Generation
- [NIST SP 800-57](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final) - Recommendation for Key Management
