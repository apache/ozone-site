---
sidebar_label: Owners
---

# Volume Owners

## 1. Overview

Every volume in Ozone has an **owner** property that identifies the user who owns the volume. The volume owner is a fundamental concept in Ozone's access control and resource management system. It plays a crucial role in determining permissions, storage accounting, and multi-tenant isolation.

The volume owner is distinct from the volume administrator (`admin`). While both have elevated privileges, the **owner** typically represents the user who "owns" the data and resources within the volume, while the **admin** is responsible for administrative tasks. In many cases, these may be the same user, but they serve different purposes in the access control model.

## 2. Setting the Volume Owner

### During Volume Creation

When creating a volume, the owner can be explicitly specified using the `--user` command-line option:

```bash
ozone sh volume create /myvolume --user alice
```

If the owner is not specified during creation, Ozone automatically sets the owner to the current user creating the volume:

```bash
# Owner defaults to current user
ozone sh volume create /myvolume
```

**Default Behavior:**

- If `--user` is not provided, the owner defaults to the current user creating the volume.
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

# Volume created without specifying owner (defaults to current user)
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

### Maximum User Volume Count

Ozone enforces a configurable limit on the number of volumes a user can own. This limit is controlled by the configuration property:

**Maximum number of volumes a user can own:**

- **Default:** 1024 volumes per user
- **Configuration property:** `ozone.om.user.max.volume`
- **Error:** If exceeded, the operation fails with **USER_TOO_MANY_VOLUMES** error and message: `"Too many volumes for user: {owner}"`

```xml
<property>
  <name>ozone.om.user.max.volume</name>
  <value>1024</value>
  <description>Maximum number of volumes a user can own</description>
</property>
```

## 4. Volume Owner vs. Volume Administrator

It's important to understand the distinction between the volume **owner** and volume **administrator** (`admin`):

| Aspect | Volume Owner | Volume Administrator |
|--------|--------------|---------------------|
| **Purpose** | Identifies the user who "owns" the data | Identifies the user responsible for administrative tasks |
| **Privileges** | Bypasses ACL checks for resources in volume | Has administrative privileges for volume operations |
| **Scope** | Full access to volume and all resources within it | Administrative control over volume properties |
| **Storage Accounting** | Used for per-user volume tracking and limits | Not used for storage accounting |
| **Can be Different** | Yes, owner and admin can be different users | Yes, admin can be different from owner |
| **Typical Use Case** | Data owner, tenant representative | System administrator, delegated admin |

**Common Scenarios:**

- **Same User:** In many cases, the owner and admin are the same user, simplifying management.
- **Different Users:** In enterprise environments, the owner might be a data steward while the admin is an IT administrator.
- **Delegation:** An admin might create volumes for other users, setting them as owners while retaining admin privileges.
