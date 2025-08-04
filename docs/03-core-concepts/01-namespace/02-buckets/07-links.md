---
sidebar_label: Links
---

# Bucket Links

Apache Ozone supports **Bucket Links**, which function similarly to symbolic links (symlinks) in a traditional filesystem, but at the bucket level. A bucket link allows one bucket path (the *link bucket*) to point to another existing bucket (the *source bucket*).

## Concept

When you create a bucket link, you specify:

1.  **Source Bucket:** The existing bucket that the link will point to (e.g., `/realVolume/realBucket`).
2.  **Link Bucket:** The new bucket path that will act as the link (e.g., `/linkVolume/linkBucket`).

Any operation performed on a key within the link bucket (e.g., reading `/linkVolume/linkBucket/myKey`) is automatically redirected by the Ozone Manager to the corresponding key in the source bucket (`/realVolume/realBucket/myKey`).

## Key Characteristics

*   **Property Inheritance:** A link bucket inherits most of its fundamental properties directly from its ultimate source bucket. This includes:
    *   [Layout](./04-layouts/README.mdx)
    *   [Replication](./05-replication.md) configuration
    *   [Encryption](./06-encryption.md) key
    *   Versioning status
    *   [Quotas](./03-quotas.md) (limits are enforced based on the source bucket's settings)
    *   Storage Type
*   **Independent ACLs:** While properties are inherited, a link bucket maintains its **own set of Access Control Lists (ACLs)**. This is a key feature, allowing administrators to grant different permissions for accessing the data *via the link* compared to accessing the data directly through the source bucket.
*   **Server-Side Resolution:** Link resolution is handled transparently by the Ozone Manager (`resolveBucketLink`). Clients interacting with the link bucket generally do not need to be aware that it's a link.
*   **Chaining:** Bucket links can be chained (e.g., Link A -> Link B -> Source C). Ozone resolves the entire chain to find the final source bucket.
*   **Loop Detection:** Ozone detects and prevents circular references (e.g., Link A -> Link B -> Link A) during resolution, failing operations that would traverse a loop.
*   **Dangling Links:** If the source bucket of a link is deleted, the link becomes "dangling." Attempts to access data through a dangling link will result in an error.

## Use Cases

*   **Simplified Access Paths:** Provide shorter or more user-friendly names to access buckets located elsewhere.
*   **Data Sharing with Different Permissions:** Share a source bucket with different teams or users by creating links with distinct ACLs tailored for each team.
*   **Tenant Isolation:** Used in multi-tenant scenarios where tenants might be given access to shared data via links within their own volumes.

## Creating Bucket Links

Use the Ozone shell `link` command:

```bash
ozone sh bucket link /sourceVolume/sourceBucket /linkVolume/linkBucket
```

**Example:**

```bash
# Link /sharedVol/datasets to /projectA/inputData
ozone sh bucket link /sharedVol/datasets /projectA/inputData

# Now, accessing /projectA/inputData/file.csv will actually access /sharedVol/datasets/file.csv
# ACLs on /projectA/inputData can be set independently from /sharedVol/datasets
```

## Deleting Bucket Links

Deleting a link bucket removes only the link itself, **not** the source bucket or its data.

```bash
ozone sh bucket delete /linkVolume/linkBucket
```

Bucket links provide a flexible mechanism for managing access paths and permissions within the Ozone namespace.