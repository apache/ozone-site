---
sidebar_label: Owners
---

# Volume Owners

## Volume Ownership

Ownership is a fundamental aspect of Ozone volumes that determines who has administrative control:

- Each volume has exactly one owner, typically represented by a username
- Volume owners have full administrative control over their volumes
- Ownership is established at creation time (`ozone sh volume create /vol1 --user=alice`)
- In secure clusters, ownership is tied to authentication mechanisms like Kerberos
- Volume ownership enables delegation of administrative responsibilities
- Only the volume owner and Ozone administrators can perform certain operations like:
    - Creating buckets within the volume
    - Setting volume properties
    - Modifying volume quotas
    - Deleting the volume

### Ozone Administrators

In addition to volume owners, Ozone provides system-wide administrative capabilities through special configuration properties:

- **ozone.administrators**: Comma-separated list of users with administrative privileges
- **ozone.administrators.groups**: Comma-separated list of groups whose members have administrative privileges

Users defined in these configurations have administrative authority over **all** volumes in the system, regardless of who owns them. This enables centralized management while still allowing delegated ownership of individual volumes.

Example configuration in `ozone-site.xml`:

```xml
<property>
  <name>ozone.administrators</name>
  <value>hdfs,admin,ozone_admin</value>
  <description>Comma-separated list of users with administrator privileges</description>
</property>

<property>
  <name>ozone.administrators.groups</name>
  <value>hadoop,ozone_admins</value>
  <description>Comma-separated list of groups with administrator privileges</description>
</property>
```

In a secure cluster with Kerberos enabled, these administrators must authenticate with their Kerberos principals before exercising their administrative privileges.

### Example Commands

```bash
# Create a volume with specific owner
ozone sh volume create /marketing --user=marketing-team

# Display volume information including ownership
ozone sh volume info /marketing

# List all volumes and their owners
ozone sh volume list /

# Change the owner of an existing volume (requires current owner or admin privileges)
ozone sh volume update --user=new-owner /marketing
```