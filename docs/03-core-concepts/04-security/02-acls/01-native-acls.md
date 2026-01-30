---
sidebar_label: Native ACLs
---

# Native ACLs

Ozone supports a set of native ACLs.
These ACLs can be used independently of Ozone ACL plugin such as Ranger.
Add the following properties to the `ozone-site.xml` to enable native ACLs.

| Property                     | Value                                                        |
| ---------------------------- | ------------------------------------------------------------ |
| `ozone.acl.enabled`          | `true`                                                       |
| `ozone.acl.authorizer.class` | `org.apache.hadoop.ozone.security.acl.OzoneNativeAuthorizer` |

Ozone ACLs are a super set of Posix and S3 ACLs.

The general format of an ACL is *object*:*who*:*rights*:*scope*.

Where an *object* can be:

1. **Volume** - An Ozone volume. e.g. */volume*
2. **Bucket** - An Ozone bucket. e.g. */volume/bucket*
3. **Key** - An object key or an object. e.g. */volume/bucket/key*
4. **Prefix** - A path prefix for a specific key. e.g. */volume/bucket/prefix1/prefix2*

Where a *who* can be:

1. **User** - A user in the Kerberos domain. User like in Posix world can be
   named or unnamed.
2. **Group** - A group in the Kerberos domain. Group also like in Posix world
   can be named or unnamed.
3. **World** - All authenticated users in the Kerberos domain. This maps to
   others in the Posix domain.
4. **Anonymous** - Ignore the user field completely. This is an extension to
   the Posix semantics, This is needed for S3 protocol, where we express that
   we have no way of knowing who the user is or we don't care.

:::tip
A S3 user accessing Ozone via AWS v4 signature protocol will be translated to the appropriate Kerberos user by Ozone Manager.
:::

Where a *right* can be:

1. **Create** – This ACL provides a user the ability to create buckets in a
   volume and keys in a bucket. Please note: Under Ozone, Only admins can create volumes.
2. **List** – This ACL allows listing of buckets and keys. This ACL is attached
   to the volume and buckets which allow listing of the child objects. Please note: The user and admins can list the volumes owned by the user.
3. **Delete** – Allows the user to delete a volume, bucket or key.
4. **Read** – Allows the user to read the metadata of a Volume and Bucket and
   data stream and metadata of a key.
5. **Write** - Allows the user to write the metadata of a Volume and Bucket and
   allows the user to overwrite an existing Ozone key.
6. **Read_ACL** – Allows a user to read the ACL on a specific object.
7. **Write_ACL** – Allows a user to write the ACL on a specific object.

Where an *scope* can be:

1. **ACCESS** – Access ACL is applied only to the specific object and not inheritable. It controls the access to the object itself.
2. **DEFAULT** - Default ACL is applied to the specific object and will be inherited by object's descendants. Default ACLs cannot be set on keys (as there can be no objects under a key).

   :::note
   ACLs inherited from parent's Default ACLs will follow the following rules based on different bucket layout:
   - **Legacy with EnableFileSystem or FSO**: inherit the immediate parent's DEFAULT ACLs. If none, inherit the bucket DEFAULT ACLs.
   - **Legacy with DisableFileSystem or OBS**: inherit the bucket DEFAULT ACLs.

   :::

## Ozone Native ACL APIs

The ACLs can be manipulated by a set of APIs supported by Ozone. The APIs
supported are:

1. **SetAcl** – This API will take user principal, the name, type
   of the Ozone object and a list of ACLs.
2. **GetAcl** – This API will take the name and type of the Ozone object
   and will return a list of ACLs.
3. **AddAcl** - This API will take the name, type of the Ozone object, the
   ACL, and add it to existing ACL entries of the Ozone object.
4. **RemoveAcl** - This API will take the name, type of the
   ozone object and the ACL that has to be removed.

## ACL Manipulation Using Ozone CLI

The ACLs can also be manipulated by using the `ozone sh` commands.

Usage:

```bash
ozone sh <object> <action> [-a=<value>[,<value>...]] <object-uri>
```

`-a` is for the comma separated list of ACLs. It is required for all subcommands except `getacl`.

`<value>` is of the form **`type:name:rights[scope]`**.

- **type** can be user, group, world or anonymous.
- **name** is the name of the user/group. For world and anonymous type, name should either be left empty or be WORLD or ANONYMOUS respectively.
- **rights** can be (read=r, write=w, delete=d, list=l, all=a, none=n, create=c, read_acl=x, write_acl=y)
- **scope** can be **ACCESS** or **DEFAULT**. If not specified, default is **ACCESS**.

:::warning
When the object is a prefix, the path-to-object must contain the full path from volume till the directory or prefix of the key. i.e.,

```bash
   /volume/bucket/some/key/prefix/
```

Note: the tail "/" is required.
:::

Following are the supported ACL actions.

### `setacl`

```shell
$ ozone sh bucket setacl -a user:testuser2:a /vol1/bucket1
 ACLs set successfully.
$ ozone sh bucket setacl -a user:om:a,group:om:a /vol1/bucket2
 ACLs set successfully.
$ ozone sh bucket setacl -a=anonymous::lr /vol1/bucket3
 ACLs set successfully.
$ ozone sh bucket setacl -a world::a /vol1/bucket4
 ACLs set successfully.
```

### `getacl`

```shell
$ ozone sh bucket getacl /vol1/bucket2
[ {
  "type" : "USER",
  "name" : "om/om@EXAMPLE.COM",
  "aclScope" : "ACCESS",
  "aclList" : [ "ALL" ]
}, {
  "type" : "GROUP",
  "name" : "om",
  "aclScope" : "ACCESS",
  "aclList" : [ "ALL" ]
} ]
```

### `addacl`

```shell
$ ozone sh bucket addacl -a user:testuser2:a  /vol1/bucket2
ACL user:testuser2:a[ACCESS] added successfully.

$ ozone sh bucket addacl -a user:testuser:rxy[DEFAULT] /vol1/bucket2
ACL user:testuser:rxy[DEFAULT] added successfully.

$ ozone sh prefix addacl -a user:testuser2:a[DEFAULT] /vol1/buck3/dir1/
ACL user:testuser2:a[DEFAULT] added successfully.
```

### `removeacl`

```shell
$ ozone sh bucket removeacl -a user:testuser:r[DEFAULT] /vol1/bucket2
ACL user:testuser:r[DEFAULT] removed successfully.
```

## Differences Between Ozone ACL and S3 ACL

Ozone ACLs and S3 ACLs differ primarily in their scope and support.

- **S3 ACLs**: Currently, only S3 Bucket ACL is implemented in Ozone (a beta feature). S3 Object ACL is not yet implemented. Any `PutObjectAcl` request will result in a `501: Not Implemented` response code.
- **Ozone ACLs**: Ozone ACLs provide a more comprehensive and flexible access control mechanism. They are designed to work seamlessly with Ozone's native architecture and support various rights and scopes as mentioned above.

## Ozone File System ACL API

- ACL-related APIs in Ozone file system implementation (`ofs` and `o3fs`), such as `getAclStatus`, `setAcl`, `modifyAclEntries`, `removeAclEntries`, `removeDefaultAcl`, and `removeAcl` are not supported. These operations will throw an UnsupportedOperationException.
- Similarly, HttpFS ACL-related APIs.

These limitations should be taken into account when integrating Ozone with applications that rely on S3 or file system ACL operations.
