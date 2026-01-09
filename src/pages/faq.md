# Frequently Asked Questions

This page answers common high-level questions about Apache Ozone. For more detailed technical questions or troubleshooting, please refer to the main [documentation](/docs/). If you have a question that isn't answered here, feel free to ask the community.

## What is Apache Ozone?

Apache Ozone is a scalable, redundant, and distributed object store built for big data applications. It can store billions of objects of all sizes and is designed to run on commodity hardware. Ozone is a project of the Apache Software Foundation.

## How is Ozone different from HDFS?

While both are part of the Apache Hadoop ecosystem, they serve different purposes. HDFS is a distributed file system designed for large, streaming reads of massive files. Ozone is an object store designed to handle both small and large objects efficiently. Key differences include:

- **Namespace:** HDFS has a single, massive namespace. Ozone separates the namespace and block space management, which allows it to scale to billions of objects.
- **Object vs. File:** Ozone is a true object store, whereas HDFS is a file system. This allows Ozone to be more flexible and scalable for certain workloads.
- **S3 Compatibility:** Ozone has a built-in S3-compatible API, while HDFS requires a separate gateway.

## How is Ozone different from other object stores?

Ozone is designed with the big data ecosystem in mind. Key differentiators include:

- **Strong Consistency:** Ozone provides strong consistency for all operations, which simplifies application development compared to eventually consistent object stores.
- **Hadoop Ecosystem Integration:** Ozone is a native Hadoop-compatible file system, allowing seamless integration with tools like Spark, Hive, and YARN.
- **Scalability:** Ozone's architecture is designed to scale to exabytes of data and billions of objects.

## What are the main use cases for Ozone?

Ozone is well-suited for a variety of use cases, including:

- **Data lakes for analytics and machine learning.**
- **Storage for cloud-native applications.**
- **A replacement for HDFS for certain workloads.**
- **On-premise S3-compatible storage.**

## Who is using Ozone?

Apache Ozone is used in production by a variety of companies across different industries. You can see a list of publicly known users on the [Ozone website](/community/who-uses-ozone).

## How can I get started with Ozone?

The easiest way to get started with Ozone is to run it in a Docker container on your local machine. You can find a step-by-step guide in our [Quick Start documentation](/docs/quick-start).

## Does Ozone support Kubernetes?

Yes, Ozone is designed to be cloud-native and runs well on Kubernetes. We provide a Helm chart to simplify deployment on Kubernetes. You can find more information in our [Kubernetes documentation](/docs/quick-start/installation/kubernetes).

## Is Ozone compatible with the S3 API?

Yes, Ozone has a built-in [S3-compatible REST API](/docs/user-guide/client-interfaces/s3). This allows you to use existing S3 tools and applications to interact with Ozone.

## Can I use Hadoop ecosystem tools (like Spark, Hive) with Ozone?

Yes, Ozone provides a Hadoop-compatible file system interface (`ofs://`), which allows [seamless integration](/docs/user-guide/integrations) with tools like Apache Spark, Apache Hive, Apache Flink, and more.

## What are the core components of an Ozone cluster?

An Ozone cluster consists of three main components:

- **Ozone Manager (OM):** Manages the namespace (volumes, buckets, and keys).
- **Storage Container Manager (SCM):** Manages the storage nodes (Datanodes) and data replication.
- **Datanodes:** Store the actual data in containers.

## How does Ozone provide strong consistency?

Ozone uses the [Raft consensus protocol](https://raft.github.io/) to replicate metadata and ensure that all operations are strongly consistent. This means that once a write operation is acknowledged, the data is guaranteed to be readable by all subsequent read operations.

## Does Ozone have a UI?

Yes, Ozone comes with a web UI called [**Recon**](/docs/administrator-guide/operations/observability/recon/recon-web-ui). Recon provides a visual overview of the cluster, including the state of the nodes, containers, and pipelines.

## What is the license for Apache Ozone?

Apache Ozone is released under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0), forever.

## Where can I ask more questions?

For further questions, you can:

- Join the [Ozone mailing lists](/community).
- Start a discussion on our [GitHub Discussions page](https://github.com/apache/ozone/discussions).
