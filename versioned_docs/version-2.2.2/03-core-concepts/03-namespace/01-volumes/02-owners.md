---
sidebar_label: Owners
---

# Volume Owners

## 1. Overview

Every volume in Ozone has an **owner** property that identifies the user who owns the volume. The volume owner is a fundamental concept in Ozone's access control and resource management system. It plays a crucial role in determining permissions, storage accounting, and multi-tenant isolation.

While volumes also have an `admin` field in their metadata structure, **with Native ACLs** (`OzoneNativeAuthorizer`), this field is stored but not functionally used by Ozone Manager for authorization or access control purposes. Authorization checks rely on ACLs and the volume owner instead.
The behavior of the `admin` field may differ when using `RangerOzoneAuthorizer`.

## 2. Setting the Volume Owner

### During Volume Creation

When creating a volume, the owner can be explicitly specified using the `--user` command-line option:

```bash
ozone sh volume create /myvolume --user alice
ozone sh volume info /myvolume
{
  "metadata" : { },
  "name" : "myvolume",
  "admin" : "om",
  "owner" : "alice",
  ...
}
```

If the `--user` option is not provided during volume creation, Ozone automatically sets the owner to the **authenticated user identity** as determined by `UserGroupInformation.getCurrentUser()`. The behavior differs based on the cluster security configuration:

- **Secure/Kerberos mode**: The owner is set to the Kerberos principal (or its short name) of the authenticated user. For example, if authenticated as Kerberos principal `om@REALM`, the volume owner will be `om`.

- **Non-secure mode**: The owner is typically set to the Linux user running the CLI command. For example, if you run the command as Linux user `root`, the volume owner will be `root`.

```bash
# Owner defaults to authenticated user
ozone sh volume create /myvolume

# secure mode kerberos authenticated user
ozone sh volume info /myvolume
{
  "metadata" : { },
  "name" : "myvolume",
  "admin" : "om",
  "owner" : "om",
  ...
}

# unsecure mode linux user root
ozone sh volume info /myvolume
{
  "metadata" : { },
  "name" : "myvolume",
  "admin" : "root",
  "owner" : "root",
  ...
}
```

**Default Behavior:**

- If `--user` is not provided, the owner defaults to the authenticated user creating the volume.
- The `ozone sh volume create` command does not allow setting the admin user. The admin can only be set using the Ozone o3 native Java API.

**Example Output:**

When viewing volume information, you can see the default ACLs:

```bash
# Volume created with explicit owner
$ ozone sh volume create /myvolume --user alice
$ ozone sh volume info /myvolume
{
  "name" : "myvolume",
  "admin" : "om",
  "owner" : "alice",
  "acls" : [ {
    "type" : "USER",
    "name" : "alice",
    "aclScope" : "ACCESS",
    "aclList" : [ "ALL" ]
  } ]
}

# Volume created without specifying owner (defaults to authenticated user)
$ ozone sh volume create /myvol1
$ ozone sh volume info /myvol1
{
  "name" : "myvol1",
  "admin" : "om",
  "owner" : "om",
  "acls" : [ {
    "type" : "USER",
    "name" : "om",
    "aclScope" : "ACCESS",
    "aclList" : [ "ALL" ]
  }, {
    "type" : "GROUP",
    "name" : "om",
    "aclScope" : "ACCESS",
    "aclList" : [ "READ", "LIST" ]
  } ]
}
```

**Note:** While the volume owner has these default ACLs, they typically don't need them because owner privileges bypass ACL checks entirely. However, these ACLs are useful for:

- Audit and compliance tracking
- Documentation of intended permissions
- Cases where ACLs might be evaluated before owner checks

### Changing Volume Ownership

The volume owner can be changed after creation using the volume update command:

```bash
ozone sh volume update /myvolume --user bob
{
  "metadata" : { },
  "name" : "myvolume",
  "admin" : "om",
  "owner" : "bob",
  "quotaInBytes" : -1,
  "quotaInNamespace" : -1,
  "usedNamespace" : 0,
  "creationTime" : "2026-01-25T15:12:12.922Z",
  "modificationTime" : "2026-01-25T15:20:35.530Z",
  "acls" : [ {
    "type" : "USER",
    "name" : "alice",
    "aclScope" : "ACCESS",
    "aclList" : [ "ALL" ],
    "aclSet" : [ "ALL" ]
  } ],
  "refCount" : 0
}
```

**Requirements for Changing Ownership:**

- **Permissions:** The user attempting to change ownership must have `WRITE_ACL` permission on the volume. This ensures that only authorized users can transfer ownership.

**Owner vs. ACLs:**

Changing the volume owner via `ozone sh volume update --user <new_user>` updates the ownership metadata but **does not automatically modify ACLs**. The previous owner's ACL entries remain unchanged. If you need to revoke the old owner's access entirely, you must manage ACLs separately using ACL update commands.

:::note Volume-Level Operations and Permissions
Volume-level operations with respect to permissions can differ between Native ACL and Ranger ACL implementations. The permission requirements described here are specific to Native ACLs.
:::

For detailed information on how permissions and operations work for both **Native ACL** and **Ranger ACL**, refer to the [ACLs documentation](../../security/acls).

## 3. Volume Owner Privileges

The volume owner receives special privileges that provide comprehensive access to the volume and all resources within it. These privileges are enforced by Ozone's native authorizer (`OzoneNativeAuthorizer`) and bypass standard ACL checks.

### Bypass ACL Checks

The volume owner can perform operations on buckets, keys, and prefixes within their volume **without requiring explicit ACL permissions**. This means the owner has **implicit access** to all resources in their volume, regardless of ACL settings on those resources. The owner check happens before any ACL evaluation, providing a fast-path for owner operations.

### Volume Deletion by Owner

Volume owners **can delete their own volumes** because volumes are created with default ACLs that grant the owner `ALL` permissions, which includes `DELETE` permission.

**Requirements for Volume Deletion:**

- **DELETE Permission:** The requester must have `DELETE` ACL permission on the volume.
- **Empty Volume:** The volume must contain no buckets. All buckets must be deleted before the volume can be deleted.
- **Zero Reference Count:** The volume's `refCount` must be 0. If `refCount > 0`, it indicates that Ozone features (like multi-tenancy) hold a "lock" on the volume. The lock must be released first (e.g., via `ozone tenant delete <tenantId>`).

:::note
Volume creation is still an **administrative operation** that requires administrator privileges. Only administrators can create volumes.
:::
