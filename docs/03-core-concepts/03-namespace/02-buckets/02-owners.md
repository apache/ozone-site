---
sidebar_label: Owners
---

# Bucket Owners

## 1. Overview

Every bucket in Ozone has an **owner** property that identifies the user who owns the bucket. A bucket has a single owner. The bucket owner plays a role in access control and property management, particularly when using Ozone's native ACL authorization.

## 2. Bucket Owner Property

### Storage and Metadata

The bucket owner is stored as part of the bucket's metadata in the Ozone Manager's metadata store. Specifically:

- **Bucket Table:** The owner name is stored in the `OmBucketInfo` object within the Bucket Table, accessible via `OmBucketInfo.getOwner()`.
- **Metadata Fields:** The owner is stored alongside other bucket properties such as:
  - Volume name
  - Bucket name
  - Creation and modification timestamps
  - Quotas (space and namespace)
  - Access Control Lists (ACLs)
  - Bucket layout
  - Storage type

### Owner Identification

The bucket owner is stored as a **plain string identifier**. It does not need to correspond to an actual system user account - any string can be used (e.g., `user1`, `alice`).

**Owner Matching:**

Ozone checks if the current user matches the bucket owner by comparing the stored owner string against:

- `callerUgi.getUserName()` (full principal name, e.g., `alice@REALM`)
- `callerUgi.getShortUserName()` (short username, e.g., `alice`)

If either matches the stored owner string, the user is considered the owner. The comparison is case-sensitive and exact.

## 3. Setting the Bucket Owner

### During Bucket Creation

When creating a bucket, the owner can be explicitly specified using the `--user` or `-u` command-line option:

```bash
ozone sh bucket create /myvolume/mybucket --user alice
```

If the owner is not specified during creation, the owner defaults based on the authentication method:

- **S3 Authentication:** Owner defaults to the short username derived from the S3 access ID.
- **Standard Authentication:** Owner defaults to the current user's short username (`UserGroupInformation.getCurrentUser().getShortUserName()`).

**Example:**

```bash
# Create bucket without specifying owner (defaults to current user)
$ ozone sh bucket create /myvol1/buck1
$ ozone sh bucket info /myvol1/buck1
{
  "volumeName" : "myvol1",
  "name" : "buck1",
  "owner" : "om",
  ...
}
```

### Changing Bucket Ownership

The bucket owner can be changed after creation using the bucket update command:

```bash
ozone sh bucket update <volume>/<bucket> --user <new_owner>
```

Or using the short form:

```bash
ozone sh bucket update <volume>/<bucket> -u <new_owner>
```

**Example:**

```bash
$ ozone sh bucket update /myvol1/buck1 --user bob
{
  "volumeName" : "myvol1",
  "name" : "buck1",
  "owner" : "bob",
  "modificationTime" : "2026-01-25T16:06:38.516Z",
  ...
}
```

**Requirements for Changing Ownership:**

- **Permissions:** The user attempting to change ownership must have `WRITE_ACL` permission on the bucket. This ensures that only authorized users can transfer ownership.
- **ACL Check:** When ACLs are enabled, Ozone performs an ACL check before allowing the ownership change:

  ```java
  checkAcls(ozoneManager, OzoneObj.ResourceType.BUCKET,
      OzoneObj.StoreType.OZONE, IAccessAuthorizer.ACLType.WRITE_ACL,
      volumeName, bucketName, null);
  ```

**Ownership Transfer Process:**

When ownership is transferred, Ozone performs the following operations atomically:

1. **Validation:** Checks if the new owner is different from the current owner (no-op if same).
2. **Permission Check:** Verifies the requester has `WRITE_ACL` permission.
3. **Bucket Metadata Update:** Updates the bucket's owner property and modification timestamp.
4. **Transaction Logging:** Records the change in the transaction log for consistency and recovery.

**Error Conditions:**

- If the requester lacks `WRITE_ACL` permission, an `OMException` with `PERMISSION_DENIED` is thrown.
- If the bucket doesn't exist, a `BUCKET_NOT_FOUND` exception is thrown.

**Owner vs. ACLs:**

Changing the bucket owner via `ozone sh bucket update -u <new_owner>` updates the ownership metadata but **does not automatically modify ACLs**. The previous owner's ACL entries remain unchanged. If you need to revoke the old owner's access entirely, you must manage ACLs separately using ACL update commands.

## 4. Bucket Owner Privileges

### Property Updates

When using Ozone's native ACL authorization, the bucket owner can update bucket properties. Bucket properties include:

- Storage type
- Versioning
- Encryption settings
- Quotas (space and namespace)
- Bucket layout
- Other bucket metadata

**Access Control Check:**

For native ACL authorization, bucket property updates are allowed by:

- Administrators
- Bucket owners

For Ranger authorization, bucket property updates are determined by Ranger policies.

## 4. Volume Owner vs. Bucket Owner

**Volume Owner Privileges:**

The volume owner has broader privileges than the bucket owner:

- Volume owners bypass ACL checks for all resources (buckets, keys, prefixes) within their volume.
- Volume owners have implicit access to all buckets in their volume, regardless of bucket ownership or ACLs.

**Bucket Owner Privileges:**

Bucket owners have limited privileges:

- Bucket owners can update bucket properties (when using native ACL authorization).
- Bucket owners do **not** bypass ACL checks for keys or prefixes within the bucket.
- Bucket ownership is primarily used for property management, not access control bypass.

:::note
Volume ownership takes precedence over bucket ownership in access control decisions. If a user is the volume owner, they have full access regardless of bucket ownership.
:::
