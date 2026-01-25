---
sidebar_label: Owners
---

# Volume Owners

## 1. Overview

Every volume in Ozone has an **owner** property that identifies the user who owns the volume. The volume owner is a fundamental concept in Ozone's access control and resource management system. It plays a crucial role in determining permissions, storage accounting, and multi-tenant isolation.

The volume owner is distinct from the volume administrator (`admin`). While both have elevated privileges, the **owner** typically represents the user who "owns" the data and resources within the volume, while the **admin** is responsible for administrative tasks. In many cases, these may be the same user, but they serve different purposes in the access control model.

## 2. Volume Owner Property

### Storage and Metadata

The volume owner is stored as part of the volume's metadata in the Ozone Manager's metadata store. Specifically:

- **Volume Table:** The owner name is stored in the `OmVolumeArgs` object within the Volume Table, accessible via `OmVolumeArgs.getOwnerName()`.
- **User Table:** Ozone maintains a User Table (`PersistedUserVolumeInfo`) that tracks all volumes owned by each user. This table is used for storage accounting and enforcing per-user volume limits.
- **Metadata Fields:** The owner is stored alongside other volume properties such as:
  - Volume name
  - Admin name
  - Creation and modification timestamps
  - Quotas (space and namespace)
  - Access Control Lists (ACLs)
  - Reference count

### Owner Identification

The volume owner is stored as a **plain string identifier**. It does not need to correspond to an actual system user account - any string can be used (e.g., `bob`, `alice`).

**Owner Matching:**

Ozone checks if the current user matches the volume owner by comparing the stored owner string against:

- `callerUgi.getUserName()` (full principal name, e.g., `alice@REALM`)
- `callerUgi.getShortUserName()` (short username, e.g., `alice`)

If either matches the stored owner string, the user is considered the owner. The comparison is case-sensitive and exact.

## 3. Setting the Volume Owner

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

- If `--user` is not provided, the owner defaults to `UserGroupInformation.getCurrentUser().getShortUserName()`.
- The admin name also defaults to the current user if not explicitly set.
- Both owner and admin can be set independently during volume creation.

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
- **ACL Check:** When ACLs are enabled, Ozone performs an ACL check before allowing the ownership change:

  ```java
  checkAcls(ozoneManager, OzoneObj.ResourceType.VOLUME,
      OzoneObj.StoreType.OZONE, IAccessAuthorizer.ACLType.WRITE_ACL,
      volume, null, null);
  ```

**Ownership Transfer Process:**

When ownership is transferred, Ozone performs the following operations atomically:

1. **Validation:** Checks if the new owner is different from the current owner (no-op if same).
2. **Permission Check:** Verifies the requester has `WRITE_ACL` permission.
3. **User Table Update:**
   - Removes the volume from the old owner's volume list in the User Table.
   - Adds the volume to the new owner's volume list.
   - Validates that the new owner hasn't exceeded the maximum user volume count limit.
4. **Volume Metadata Update:** Updates the volume's owner property and modification timestamp.
5. **Transaction Logging:** Records the change in the transaction log for consistency and recovery.

**Error Conditions:**

- If the new owner already owns the maximum number of volumes allowed per user, the operation fails with an appropriate error.
- If the requester lacks `WRITE_ACL` permission, an `OMException` with `PERMISSION_DENIED` is thrown.
- If the volume doesn't exist, a `VOLUME_NOT_FOUND` exception is thrown.

**Owner vs. ACLs:**

Changing the volume owner via `ozone sh volume update --user <new_user>` updates the ownership metadata but **does not automatically modify ACLs**. The previous owner's ACL entries remain unchanged. If you need to revoke the old owner's access entirely, you must manage ACLs separately using ACL update commands.

## 4. Volume Owner Privileges

The volume owner receives special privileges that provide comprehensive access to the volume and all resources within it. These privileges are enforced by Ozone's native authorizer (`OzoneNativeAuthorizer`) and bypass standard ACL checks.

### Bypass ACL Checks

The volume owner can perform operations on buckets, keys, and prefixes within their volume **without requiring explicit ACL permissions**. This is implemented in the access control logic:

This means the owner has **implicit access** to all resources in their volume, regardless of ACL settings on those resources. The owner check happens before any ACL evaluation, providing a fast-path for owner operations.

### Volume-Level Operations

The volume owner can perform all non-administrative operations on the volume itself:

- **List Buckets:** List all buckets within the volume.
- **Read Metadata:** Read volume metadata including quotas, creation time, modification time, and ACLs.
- **Write Metadata:** Modify volume properties including:
  - Setting or updating quotas (space and namespace)
  - Updating ACLs
  - Modifying volume metadata
- **Manage Properties:** Update any volume property that doesn't require administrative privileges.

:::note
Volume creation and deletion are **administrative operations** that require administrator privileges, regardless of ownership. Even the volume owner cannot delete their own volume unless they have administrator privileges.
:::

### Resource Access Within Volume

The owner has full access to all resources (buckets, keys, prefixes) within their volume:

- **Create:** Create buckets, keys, and prefixes.
- **Read:** Read data from keys and list bucket/prefix contents.
- **Write:** Write data to keys and modify existing keys.
- **Delete:** Delete buckets, keys, and prefixes.
- **Modify ACLs:** Update ACLs on buckets, keys, and prefixes (subject to volume-level permissions).

All these operations bypass ACL checks when performed by the volume owner, providing seamless access to all resources in the volume.

### Volume Deletion by Owner

While the volume owner has full access to all resources within their volume, **volume deletion is a restricted operation** that requires specific conditions to be met:

**Requirements for Volume Deletion:**

- **DELETE Permission:** The requester must have `DELETE` ACL permission on the volume. Ownership alone is not sufficient - even volume owners cannot delete their own volumes unless they have `DELETE` permission (typically granted to administrators).
- **Empty Volume:** The volume must contain no buckets. All buckets must be deleted before the volume can be deleted.
- **Zero Reference Count:** The volume's `refCount` must be 0. If `refCount > 0`, it indicates that Ozone features (like multi-tenancy) hold a "lock" on the volume. The lock must be released first (e.g., via `ozone tenant delete <tenantId>`).

**Deletion Process:**

When a volume is successfully deleted:

1. The volume is removed from the owner's volume list in the User Table (`PersistedUserVolumeInfo`).
2. The volume entry is removed from the Volume Table.
3. The owner's volume count is decremented, allowing them to create new volumes if they were at the limit.

**Error Conditions:**

- **VOLUME_NOT_EMPTY:** Volume contains buckets that must be deleted first.
- **VOLUME_IS_REFERENCED:** Volume has `refCount > 0`. Release the lock via the feature that holds it.
- **PERMISSION_DENIED:** Requester lacks `DELETE` ACL permission on the volume.

**Note:** Volume owners can delete all buckets and keys within their volume, but volume deletion itself requires `DELETE` permission, which is typically an administrative privilege.

## 5. Storage Accounting

The volume owner is used for **storage accounting** purposes in Ozone:

### 1. Per-User Volume Tracking

Ozone maintains a User Table (`PersistedUserVolumeInfo`) that tracks all volumes owned by each user. This table:

- Stores a list of volume names for each user.
- Is updated atomically when volumes are created or ownership is transferred.
- Is used to enforce per-user volume limits.

### 2. Maximum User Volume Count

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

## Volume Owner vs. Volume Administrator

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
