---
sidebar_label: Administrators
---

# Configuring Ozone Administrators

Ozone identifies administrators through specific configuration properties, allowing for fine-grained control over administrative access. These properties define users and groups with elevated privileges, or read-only administrative access.

## Core Ozone Administrators

These properties define the primary administrators for the Ozone cluster.

| Property Name | Description | Default Value |
|---|---|---|
| `ozone.administrators` | Comma-separated list of user names who are considered Ozone administrators. If this property is not explicitly set, the user who launches an Ozone service will be automatically designated as the initial administrator. | (empty) |
| `ozone.administrators.groups` | Comma-separated list of group names whose members are considered Ozone administrators. Users belonging to any of these groups will have administrative access. | (empty) |

## Read-Only Ozone Administrators

These properties define users and groups with read-only administrative access, allowing them to perform read operations without standard access checks.

| Property Name | Description | Default Value |
|---|---|---|
| `ozone.readonly.administrators` | Comma-separated list of user names who have read-only administrative access. These users can perform read operations without undergoing regular access checks. | (empty) |
| `ozone.readonly.administrators.groups` | Comma-separated list of group names whose members have read-only administrative access. Users in these groups can perform read operations bypassing normal access controls. | (empty) |

## S3-Specific Administrators

These properties define administrators with privileges specific to the S3 Gateway interface.

| Property Name | Description | Default Value |
|---|---|---|
| `ozone.s3.administrators` | Comma-separated list of user names who have S3-specific administrative access. These users can access admin-only information from the S3 Gateway. If this property is empty, users defined in `ozone.administrators` will automatically have S3 administrative privileges. | (empty) |
| `ozone.s3.administrators.groups` | Comma-separated list of group names whose members have S3-specific administrative access. Members of these groups can access admin-only information from the S3 Gateway. | (empty) |

## Recon Administrators

These properties define administrators for the Recon service, which provides monitoring and management capabilities for the Ozone cluster.

| Property Name | Description | Default Value |
|---|---|---|
| `ozone.recon.administrators` | Comma-separated list of user names who are Recon administrators. These users can access admin-only information from Recon. Note that users defined in `ozone.administrators` will always have access to all Recon information regardless of this setting. | (empty) |
| `ozone.recon.administrators.groups` | Comma-separated list of group names whose members are Recon administrators. Users in these groups can access admin-only information from Recon. | (empty) |

It is enough for a user to be defined in `ozone.administrators` or be directly or indirectly in a group defined in `ozone.administrators.groups` to have full administrative access across Ozone services.
