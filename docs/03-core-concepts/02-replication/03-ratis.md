---
title: Ratis
sidebar_label: Ratis
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

[Apache Ratis](https://ratis.apache.org/) is a highly customizable open-source Java implementation of the [Raft consensus protocol](https://raft.github.io/). Raft is an easily understandable consensus algorithm designed to manage replicated state. Unlike ZooKeeper or other Raft implementations such as etcd, Ratis is designed as a library rather than a standalone consensus server, which simplifies its management and integration.

Ozone leverages Ratis to replicate system states across multiple nodes, ensuring high availability and redundancy. Each piece of data written by clients is replicated to 3 Ozone Datanodes by Ratis. Within Ozone, Ratis is employed in critical components such as the [Ozone Manager](../03-namespace/01-overview.md), [Storage Container Manager](../01-architecture.md), and Datanodes. It forms the central pillar for the High Availability (HA) mechanisms of both the Ozone Manager (OM-HA) and Storage Container Manager (SCM-HA).

For more detailed information, please visit the [Apache Ratis website](https://ratis.apache.org/).
