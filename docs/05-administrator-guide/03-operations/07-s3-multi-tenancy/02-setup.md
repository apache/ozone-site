---
sidebar_label: Setup
---

# Multi-Tenancy Setup

Steps to enable S3 Multi-Tenancy feature in Ozone clusters.

## Prerequisites

S3 Multi-Tenancy requires the following components to be configured:

1. **Secure cluster**: The cluster must be Kerberized (secured). Follow the [Kerberos](../../../administrator-guide/configuration/security/kerberos) guide if the cluster is not Kerberized yet.
2. **S3 Gateway**: At least one S3 Gateway must be set up. Follow the [S3 Gateway](../../../user-guide/client-interfaces/s3) guide if the cluster doesn't have a S3 Gateway yet.
3. **Apache Ranger**: ACL must be enabled with `RangerOzoneAuthorizer` as the effective ACL authorizer implementation. If not configured, follow the [Security with Ranger](../../../administrator-guide/configuration/security/ranger) guide.

## Configuration

Add the following configs to all Ozone Managers' `ozone-site.xml`:

```xml
<property>
  <name>ozone.om.multitenancy.enabled</name>
  <value>true</value>
</property>

<property>
  <name>ozone.om.ranger.https-address</name>
  <value>https://RANGER_HOST:6182</value>
</property>

<property>
  <name>ozone.om.ranger.service</name>
  <value>RANGER_OZONE_SERVICE_NAME</value>
</property>
```

The value of `ozone.om.ranger.service` should match Ozone's "Service Name" as configured under "Service Manager" page in Ranger Admin Server Web UI. e.g. `cm_ozone`.

To authenticate to Apache Ranger Admin Server, `ozone.om.kerberos.principal` and `ozone.om.kerberos.keytab.file` will be picked up from the existing configs used for Kerberos security setup.

:::warning

Make sure the user behind the Kerberos principal (e.g. `om`) has Admin privilege in Ranger, otherwise some functionality will break. This is a limitation of Apache Ranger at the moment. e.g. background sync won't be able to get the policyVersion to function properly, and create/update/delete Ranger role will fail.

:::

### Optional: User name and password authentication (not recommended for production)

If one wants to test Ranger with user name and clear text password login (not recommended in production), add the following configs to Ozone Manager:

```xml
<property>
  <name>ozone.om.ranger.https.admin.api.user</name>
  <value>RANGER_ADMIN_USERNAME</value>
</property>

<property>
  <name>ozone.om.ranger.https.admin.api.passwd</name>
  <value>RANGER_ADMIN_PASSWORD</value>
</property>
```

Note if both Ranger user name and password are configured, it will be chosen over the (default and recommended) Kerberos keytab authentication method.

## Applying configuration

Finally restart all OzoneManagers to apply the new configs.

## Next Steps

After configuration is complete, proceed to [Tenant Commands](./tenant-commands) to learn how to create and manage tenants.
