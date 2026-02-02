---
sidebar_label: Ranger authorization policies
---

# Ranger authorization policies

Ozone supports two authorization models: **Native ACLs** and **Apache Ranger policies**.

- [**Native ACLs**](./01-native-acls.md) are managed through Ozone's command-line interface or APIs and are stored internally within Ozone's metadata. They are suitable for simpler security requirements and for environments where Ozone is run as a standalone service.

- **Apache Ranger** provides centralized security administration for the entire Hadoop ecosystem. If you are already using Ranger to manage permissions for other components like HDFS, Hive, or HBase, integrating Ozone with Ranger allows you to manage all access policies in one place. Ranger offers a user-friendly UI, centralized auditing, and more advanced policy features. For more information about configuring Apache Ranger authorization for Ozone, refer to [configuring Apache Ranger](/docs/05-administrator-guide/02-configuration/03-security/05-ranger.md).

When Ranger is enabled, it becomes the sole authority for access control, and native ACLs are ignored.

## Permission comparison table

The table below shows the mapping between Ozone operations and the required Ranger permissions. An Ozone Manager plugin synchronizes these policies from Ranger.

### Volume related operation

| `Operation` | `Volume permission` |
|--------------------------|---------------------|
| `Create volume` | `CREATE` |
| `List volume` | `LIST` |
| `Get volume info` | `READ` |
| `Delete volume` | `DELETE` |
| `Set Quota` | `WRITE` |
| `Set Owner` | `WRITE_ACL` |
| `Create Tenant (and volume)` | `CREATE` |
| `Delete Tenant` | `WRITE_ACL` |

### Bucket related operation

| `Operation` | `Volume permission` | `Bucket permission` |
|--------------------------|---------------------|---------------------|
| `Create bucket` | `READ` | `CREATE` |
| `List bucket` | `LIST, READ` | |
| `Get bucket info` | `READ` | `READ` |
| `Delete bucket` | `READ` | `DELETE` |
| `Update bucket property (quota, replication, ...)` | `READ` | `WRITE` |
| `List Snapshot` | `READ` | `LIST` |
| `List Trash` | `READ` | `LIST` |
| `Trash Recover` | `READ` | `WRITE` |
| `Set Owner` | `READ` | `WRITE_ACL` |

### FSO / OBS related operation for key and files

| `Operation` | `Volume permission` | `Bucket permission` | `Key permission` |
|--------------------------|---------------------|---------------------|------------------|
| `List key` | `READ` | `LIST, READ` | |
| `Write key` | `READ` | `READ` | `CREATE, WRITE` |
| `Read key` | `READ` | `READ` | `READ` |

