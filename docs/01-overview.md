---
# Make this the default docs landing page.
slug: /
---

# Overview

## What is Ozone?

Apache Ozone is a scalable, reliable, distributed storage system optimized for data analytics and object store workloads. Designed to address the limitations of traditional storage systems, Ozone efficiently scales to petabytes of data and billions of objects while managing both small and large files.

As a modern storage solution for data lakes and AI workloads, Ozone provides a high-performance foundation that seamlessly integrates with existing big data frameworks. Applications like Apache Spark, Hive, Hadoop, and other data processing engines work natively with Ozone without modifications.

Ozone combines the best aspects of traditional distributed file systems with cloud-native object storage capabilities, delivering durability, consistency, and performance at scale.

## Key Features

### Scalable Architecture

- **Billions of Objects**: Designed from the ground up to store and manage billions of objects efficiently
- **Separation of Namespaces**: Decouples namespace management from block space management, allowing the cluster to scale with capacity regardless of file sizes
- **Dense Storage Support**: Optimized for high-density storage nodes with support for up to 400TB per node (compared to 100TB in traditional HDFS)

### Multi-Protocol Support

- **S3 Compatible API**: Native support for the Amazon S3 API, enabling seamless integration with S3-compatible tools and applications
- **Hadoop Compatible File System**: Provides a filesystem interface that works with existing Hadoop ecosystem applications
- **Rich API Options**: Supports multiple client interfaces including Java API, command-line tools, and REST endpoints

### Enterprise-Ready Security

- **Strong Authentication**: Integrates with [Kerberos authentication](administrator-guide/configuration/security/kerberos) for robust security
- **Fine-Grained Authorization**: Support for both native ACLs and [Apache Ranger integration](administrator-guide/configuration/security/ranger) for centralized authorization policies
- **Encryption**: Transparent data encryption [at rest](administrator-guide/configuration/security/encryption/transparent-data-encryption) and [in-flight](administrator-guide/configuration/security/encryption/network-encryption) to protect sensitive information

### Robust Data Management

- **Strong Consistency**: Provides strict consistency to simplify application design and ensure data integrity
- **Metadata Management**: Efficient handling of metadata with dedicated services for high performance
- **Snapshots**: Support for point-in-time snapshots to protect against data corruption and facilitate backups

### Operational Excellence

- **Fault Tolerance**: Designed for resiliency with automatic recovery mechanisms to handle failures at all levels
- **Observability**: Comprehensive metrics, logging, and monitoring through web UI, Prometheus integration, and Grafana dashboards
- **Replication and Erasure Coding**: Flexible data protection strategies to balance storage efficiency and durability requirements

### Integration with Data Analytics Ecosystem

- **Hadoop Ecosystem**: Seamless integration with Hadoop, Hive, and Spark workloads
- **SQL Engines**: Works with SQL query engines like Hive, Impala, and Trino without modification
- **Modern Data Formats**: Supports modern table formats like Apache Iceberg for data lake architectures

## Architecture Overview

Ozone has a layered architecture that separates namespace management from block space management:

- **Ozone Manager (OM)**: Manages the namespace hierarchy (volumes, buckets, and keys) and handles client metadata operations
- **Storage Container Manager (SCM)**: Manages storage containers which contain block data and handles block allocation
- **Datanodes**: Store the actual data in containers and provide read and write access
- **Recon**: Analytics and monitoring service that provides insight into the cluster

This separation allows Ozone to achieve the scale required for modern storage systems while maintaining high performance and reliability.

## Storage Elements

Ozone organizes storage in a three-level hierarchy:

- **Volumes**: Similar to accounts, created by administrators for organizations or teams
- **Buckets**: Created by users within volumes, similar to S3 buckets
- **Keys**: Data objects stored inside buckets, each potentially containing multiple blocks

When a client writes data, Ozone stores it as blocks on the Datanodes, which are organized into storage containers for efficient management and replication.

## Getting Started

To get started with Ozone, see the [Quick Start Guide](quick-start) for installation instructions and basic usage examples.
