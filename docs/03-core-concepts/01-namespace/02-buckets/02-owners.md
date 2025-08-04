---
sidebar_label: Owners
---

# Bucket Owners

Every bucket in Apache Ozone has an **owner**. The owner is typically the user who created the bucket.

## Significance of Ownership

*   **Default Permissions:** The owner of a bucket implicitly has full control (ALL permissions) over the bucket itself, including the ability to modify its properties (like quotas, versioning) and delete it.
*   **ACL Management:** The owner (or an Ozone administrator) is usually responsible for managing the Access Control Lists (ACLs) for the bucket, granting permissions to other users or groups.
*   **Quota Accountability:** While quotas are set on the bucket itself, ownership can be relevant for tracking resource usage back to a specific user or tenant, especially in multi-tenant environments where volumes might represent tenants and buckets represent applications or projects within that tenant.

## Determining the Owner

*   **Creation Time:** When a bucket is created, the user principal making the creation request (authenticated via Kerberos, token, etc.) is typically set as the owner.
*   **Inheritance (S3 Interface):** When creating buckets via the S3 gateway, the owner might be determined differently based on the S3 multi-tenancy configuration. In some setups, the owner might be mapped from the S3 access key or assumed role.

## Viewing the Owner

You can view the owner of a bucket using the Ozone shell:

```bash
ozone sh bucket info /volumeName/bucketName
```

The output will include an `owner` field displaying the user principal who owns the bucket.

## Changing the Owner

Changing the owner of a bucket after creation is generally **not** a standard user operation in Ozone and typically requires administrative privileges or specific tooling, depending on the deployment and security configuration. Ownership is primarily established at creation time.

Understanding bucket ownership is important for managing permissions and accountability within the Ozone namespace.