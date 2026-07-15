---
sidebar_label: Links
---

# Bucket Links

Bucket linking allows exposing a bucket from one volume (or even another bucket) as if it were in a different location, particularly useful for S3 compatibility or cross-tenant access. This creates a symbolic link-like behavior. For more information, see the [S3 Protocol documentation](../../../user-guide/client-interfaces/s3) and [S3 Multi-Tenancy documentation](../../../administrator-guide/operations/s3-multi-tenancy).

## Overview

Ozone has one more element in the namespace hierarchy compared to S3: volumes. By default, all the buckets of the `/s3v` volume can be accessed with the S3 interface, but only the (Ozone) buckets of the `/s3v` volume are exposed.

Bucket linking provides a way to make buckets from any volume accessible through the S3 interface by creating a "symbolic link" to the target bucket.

## Use Cases

Bucket links are particularly useful for:

- **S3 Compatibility**: Exposing buckets from non-S3 volumes through the S3 interface
- **Cross-Tenant Access**: Providing access to buckets across different volumes without data duplication
- **Namespace Organization**: Creating logical groupings of buckets without moving data
- **Access Control**: Controlling visibility of buckets through different access paths

## Creating Bucket Links

To make any bucket available with the S3 interface, create a symbolic linked bucket:

```bash
ozone sh volume create /s3v
ozone sh volume create /vol1

ozone sh bucket create /vol1/bucket1
ozone sh bucket link /vol1/bucket1 /s3v/common-bucket
```

This example exposes the `/vol1/bucket1` Ozone bucket as an S3 compatible `common-bucket` via the S3 interface.

## How Bucket Links Work

Bucket links are stored in the database the same way as regular buckets, but with additional information about the source volume and bucket they reference:

1. The source bucket (e.g., `/vol1/bucket1`) continues to store the actual data
2. The link bucket (e.g., `/s3v/common-bucket`) acts as a symbolic reference
3. Key operations (list, get, put, etc.) on the link bucket are transparently redirected to the source bucket
4. Bucket operations (info, delete, ACL) work on the link object itself
5. No data is copied or duplicated during the linking process

## Accessing Linked Buckets

Once a bucket link is created, you can access it through the S3 interface just like any other bucket:

```bash
# Set up AWS credentials
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

# Access the linked bucket through S3 interface
aws s3api --endpoint http://localhost:9878 list-objects --bucket common-bucket
```

For implementation details, refer to the [Volume Management design document](https://ozone.apache.org/docs/edge/design/volume-management.html).
