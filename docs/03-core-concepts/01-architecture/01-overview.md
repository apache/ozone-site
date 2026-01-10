---
sidebar_label: Overview
---
<!---
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

# Overview

Ozone is a fault-tolerant, distributed object store optimized for Big Data workloads. Its primary design goal is scalability, aiming to support billions of objects.

Ozone achieves better scalability by separating namespace management from block space management.

- The **Ozone Manager (OM)** daemon handles namespace-related tasks, like managing volumes, buckets, and keys.
- The **Storage Container Manager (SCM)** manages the physical storage layer, including the data nodes and the blocks that form the data.

## Core Components

The block diagram below illustrates Ozone's main components and their interactions.

![Architecture diagram](ozoneBlockDiagram.png)

- **Clients** interact with Ozone to read and write data.
- The **Ozone Manager (OM)** acts as the namespace manager. It handles client requests for creating, deleting, or looking up keys.
- The **Storage Container Manager (SCM)** is the manager of the physical data layer. It manages the **Datanodes** and the replication of data.
- **Datanodes** are responsible for storing the actual data, which is organized into logical units called **blocks**.
- **Recon** is a management server for Ozone. It provides a user interface and API to monitor and manage the Ozone cluster.

## Namespace and Storage

Ozone's namespace is organized into a hierarchy of volumes, buckets, and keys.

- **Volumes** are similar to home directories and can only be created by an administrator. They are the basis for storage accounting.
- **Buckets** are contained within volumes. Users can create many buckets within a volume.
- **Keys** hold the actual data and reside within buckets.

This separation of the logical namespace from the physical storage layer is a key aspect of Ozone's scalability.

## Functional Layers

Another way to understand Ozone is by looking at its functional layers.

![FunctionalOzone](FunctionalOzone.png)

- The **Metadata Management Layer** is composed of the Ozone Manager and Storage Container Manager.
- The **Data Storage Layer** consists of the Datanodes, which are managed by SCM. Data is stored in logical blocks, which are grouped into containers for replication.
- The **Replication Layer** is powered by [Ratis](../02-replication/03-ratis.md), a Java-based implementation of the Raft consensus protocol. Ratis ensures that metadata is reliably replicated across OM and SCM instances and maintains data consistency during write operations on the Datanodes.
- The **Protocol Bus** allows Ozone to be extended with different protocols. Currently, it supports an S3-compatible protocol. This bus allows new object store or file system protocols to be implemented on top of Ozone's native protocol.

This layered architecture, combined with a clear separation of metadata and data management, allows Ozone to scale to handle billions of objects while maintaining high performance and fault tolerance.
