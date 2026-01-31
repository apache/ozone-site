---
sidebar_label: Overview
---

# Volumes Overview

## What is a Volume?

A **Volume** in Ozone is the highest level of the namespace hierarchy. It serves as a logical container for one or more buckets. Conceptually, a volume can be thought of as a user's home directory or a project space, providing a clear separation of data ownership and management.

**Key Characteristics:**

- **Administrative Control:** Only administrators can create or delete volumes. This ensures proper resource allocation and access control at the highest level.
- **Storage Accounting:** Volumes are used as the basis for storage accounting, allowing administrators to track resource usage per volume.
- **Container for Buckets:** A volume can contain any number of buckets.

:::note Volume/Bucket Naming Convention

To maintain S3 compatibility, Ozone volume and bucket name follows S3 naming convention.

This means volume/bucket names in Ozone:

Allowed Characters and Length:

- Allowed characters: Lowercase letters (a-z), numbers (0-9), dots (.), and hyphens (-)
- Length: Must be between 3 and 63 characters long
- Start and End: Must begin and end with a letter or a number

Prohibitions:

- Cannot contain uppercase letters or underscores (_)
- Cannot be formatted as an IP address (e.g., 192.168.5.4)
- Cannot have consecutive periods (e.g., my..bucket) or have dashes adjacent to periods (e.g., my-.bucket)
- Cannot end with a dash

This can cause trouble when migrating HDFS workloads to Ozone, since HDFS path names are POSIX-compliant.

To relax the compliance check, configure the property `ozone.om.namespace.s3.strict` to `false` in the `ozone-site.xml` of Ozone Manager.

:::

## Details

### Creation and Management

Volumes are typically created and managed using the Ozone command-line interface (CLI). For example:

```bash
ozone sh volume create /myvolume
```

For more details on volume operations, refer to the [Ozone CLI documentation](../../../04-user-guide/01-client-interfaces/01-o3.md#volume-operations).

### Quota Management

Volumes can have quotas applied to them, limiting the total storage space or the number of namespaces (buckets) they can consume. This is crucial for multi-tenant environments to prevent any single user or project from monopolizing resources.

- **Storage Space Quota:** Limits the total data size within the volume.
- **Namespace Quota:** Limits the number of buckets that can be created within the volume.

For comprehensive information on configuring and managing quotas, see the [Quota Management documentation](../../../05-administrator-guide/03-operations/11-quota.md).

### Access Control Lists (ACLs)

Access to volumes is controlled via ACLs, which define permissions for users and groups. These permissions determine who can create buckets within a volume, list its contents, or perform other operations.

- **Create:** Allows creating buckets within the volume.
- **List:** Allows listing buckets within the volume.
- **Read:** Allows reading metadata of the volume.
- **Write:** Allows writing metadata of the volume.
- **Delete:** Allows deleting the volume (if empty or recursively).

ACLs can be set and managed using the Ozone CLI. Refer to the [Security ACLs documentation](../../04-security/02-acls/01-native-acls.md) for more in-depth information.

### S3 Gateway Integration (`/s3v` Volume)

For compatibility with the S3 API, Ozone uses a special volume, typically `/s3v`. By default, all buckets accessed via the S3 interface are stored under this volume. It's also possible to expose buckets from other Ozone volumes via the S3 interface using "bucket linking."
For more details, refer to the [S3 Protocol documentation](../../../04-user-guide/01-client-interfaces/03-s3/01-s3-api.md) and [S3 Multi-Tenancy documentation](../../../05-administrator-guide/03-operations/07-s3-multi-tenancy/01-overview.md).

### Datanode Physical Volumes vs. Ozone Manager Logical Volumes

It's important to distinguish between the logical "volumes" managed by the Ozone Manager (as described above) and the physical "volumes" (disks) managed by the Datanodes.

- **Ozone Manager Volumes:** Logical namespace containers for buckets and keys.
- **Datanode Volumes:** Physical storage devices (disks) on a Datanode where actual data blocks are stored in containers.

For more information on Datanode volume management, refer to the [Datanodes documentation](../../01-architecture/05-datanodes.md).
