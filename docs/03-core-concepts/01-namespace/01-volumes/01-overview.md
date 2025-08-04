---
sidebar_label: Overview
---

# Volumes Overview

Volumes are the top-level entity in the Apache Ozone namespace hierarchy. They serve as the primary organizational unit and provide a framework for multi-tenancy, ownership management, and resource allocation within Ozone.

## Key Characteristics

- **Namespace Position**: Volumes sit at the top of Ozone's three-tier hierarchy (Volumes > Buckets > Keys)
- **Multi-tenancy**: Volumes provide separation between different users, departments, or applications
- **Administrative Boundaries**: Each volume has its own ownership and management policies
- **Resource Management**: Volumes support quota enforcement for storage space and object counts
- **Command Line Access**: Volumes can be created and managed through the Ozone shell (`ozone sh`)

## Volume Name Limitations

When creating volumes in Ozone, the following limitations apply to volume names:

- **Length**: Volume names must be between 3 and 63 characters long
- **Allowed Characters**: Volume names can only contain:
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Hyphens (-)
  - Periods (.)
  - Underscore (_) when not in S3-strict mode
- **Formatting Rules**:
  - Cannot start with a period or dash
  - Cannot end with a period or dash
  - Cannot contain two consecutive periods
  - Cannot have a period following a dash
  - Cannot have a dash following a period
  - Cannot contain uppercase letters
  - Cannot be an IPv4 address format or consist of only numbers
  - Cannot contain other special characters

These limitations ensure that volume names are compatible with DNS naming conventions and maintain consistency across the Ozone ecosystem.


## Use Cases for Volumes

Volumes are particularly useful in the following scenarios:

- **Multi-tenant Environments**: Separate storage for different user groups
- **Project Organization**: Group related data by project or department
- **Data Isolation**: Maintain strict boundaries between different types of data
- **Resource Allocation**: Ensure fair distribution of storage resources
- **Delegated Administration**: Allow different teams to administer their own storage

## Integration with Interfaces

Volumes can be accessed through multiple Ozone interfaces:

- **Ozone Shell**: `ozone sh volume ...` commands
- **Ozone File System (OFS)**: `ofs://om-service-id/volume/bucket/key`
- **S3 Gateway**: Volume information is not directly exposed in the S3 protocol. A default volume `s3v` is automatically created for S3 operations.
- **Programmatic Access**: Through the Java Client API