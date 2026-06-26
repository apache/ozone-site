---
sidebar_label: Supported Platforms
---

# Supported Platforms and Software Stack

This page is the canonical reference for operating systems, CPU architectures, JDK versions, and deployment models supported by Apache Ozone. Use it before [Hardware and Sizing](./hardware-and-sizing) and [Installing Binaries](./installing-binaries) when planning a production cluster.

For kernel tuning, filesystem choices, heap sizing, and network layout, see [Production Deployment](../configuration/performance/placeholder). For capacity and drive planning, see [Hardware and Sizing](./hardware-and-sizing).

## Deployment models

| Deployment model | Production | Dev / test / eval |
| ---------------- | ---------- | ----------------- |
| Bare metal Linux | Supported (recommended) | — |
| Linux VM | Supported (with caveats; see [Production Deployment](../configuration/performance/placeholder)) | — |
| Kubernetes (Helm) | **Supported** | Also used in [Quick Start Kubernetes](../../quick-start/installation/kubernetes) |
| Docker Compose | Not for production | Supported ([Quick Start Docker](../../quick-start/installation/docker), CI, local eval) |
| macOS (Apple Silicon / Intel) | **Not supported** | Dev/build only — see [Development-only platforms](#development-only-platforms) |
| Windows | **Not supported** | **Not supported** |

Bare metal Linux is the recommended production path for maximum performance and predictable I/O. Linux VMs are acceptable when sized and tuned appropriately. **Kubernetes is the supported containerized production path** (via the [Apache Ozone Helm Chart](https://apache.github.io/ozone-helm-charts/)). Docker Compose is intended for development, testing, and evaluation only—not production clusters.

## CPU architecture

| Architecture | Production runtime | Notes |
| ------------ | ------------------ | ----- |
| x86_64 (amd64) | Supported | Full feature set |
| aarch64 (ARM64) | Supported (Ozone 2.0+, [HDDS-6263](https://issues.apache.org/jira/browse/HDDS-6263)) | See feature caveats below |

**Feature caveat:** OpenSSL-based TDE hardware acceleration is x86-only today. See [Transparent Data Encryption](../configuration/security/encryption/transparent-data-encryption) for details.

Official release packages and container images are published for both `amd64` and `arm64`.

## Operating system (Linux production)

Apache Ozone production clusters run on **Linux only**. macOS and Windows are not supported for production OM, SCM, Datanode, or gateway services.

| OS family | Status |
| --------- | ------ |
| RHEL 8+, Rocky Linux 8+, AlmaLinux 8+ | Supported |
| RHEL 9+, Rocky Linux 9+, AlmaLinux 9+ | Supported |
| CentOS Stream 8 / 9 | Supported |
| Ubuntu 20.04 LTS, 22.04 LTS, 24.04 LTS | Supported |
| SUSE Linux Enterprise | Supported |
| RHEL 7 / CentOS 7 | Legacy eval only |

:::note RHEL 7 / CentOS 7
RHEL 7 and CentOS 7 appear in some quick-start examples for evaluation. They are **not recommended for new production deployments**. Plan new clusters on RHEL/Rocky/Alma 8+ or a current Ubuntu LTS release.
:::

## JDK versions

Ozone is a Java application. Set `JAVA_HOME` on every host before starting services. See [Environment Variables](../configuration/basic/environment-variables) for configuration details.

| Ozone line | Supported JDK (runtime) | Recommended | Notes |
| ---------- | ----------------------- | ----------- | ----- |
| **2.x (current)** | 11, 17, 21 | **17 or 21** | Tested at release in [Ozone 2.0.0](https://ozone.apache.org/blog/2025-04-30-ozone-2.0.0-release); official Docker images use the `jdk21` flavor |
| **2.x** | 8 | Build / legacy only | Not recommended for production runtime; some tools require 11+ (for example, `ozone iceberg` per [Iceberg Table Path Rewrite](../operations/tools/iceberg-table-path-rewrite)) |
| **1.x** | 8, 11 | 11 | Official Docker images use the `jdk11` flavor |

:::tip Production recommendation
For Ozone 2.x production clusters, run **JDK 17 or 21**. Reserve JDK 8 for building from source or legacy tooling—not for OM, SCM, or Datanode runtime.
:::

## Distribution format

Official Apache Ozone releases ship as a **tarball** that works on any supported Linux architecture and CPU platform. RPM and DEB packages are not yet included in official releases.

See [Installing Binaries](./installing-binaries) for download and install steps.

## Docker (dev / eval only)

Docker Compose is for **local evaluation, CI, and developer workflows**—not production clusters. For production on containers, use [Kubernetes](#kubernetes).

| Component | Requirement |
| --------- | ----------- |
| Docker Engine | Latest stable release |
| Docker Compose | v2 (plugin or standalone) |
| Images | [`apache/ozone`](https://hub.docker.com/r/apache/ozone) on Docker Hub; multi-platform `amd64` + `arm64`; base OS Rocky Linux |
| JDK flavor | `jdk21` (Ozone 2.0+) or `jdk11` (Ozone 1.x) per [Docker Images](../../developer-guide/build/docker-images) |

**Getting started:** [Try Ozone With Docker](../../quick-start/installation/docker). Sample Compose files live in the [apache/ozone-docker](https://github.com/apache/ozone-docker) repository.

## Kubernetes

Kubernetes is a **supported production deployment path** for Apache Ozone, typically via the Helm chart.

| Component | Requirement |
| --------- | ----------- |
| Kubernetes | **1.28+** minimum supported version |
| Last tested | **1.34.x** (k3s) in [Developer Guide Kubernetes examples](../../developer-guide/run/kubernetes)—last tested, not a maximum |
| Helm | [Apache Ozone Helm Chart](https://apache.github.io/ozone-helm-charts/) |
| Container images | Same [`apache/ozone`](https://hub.docker.com/r/apache/ozone) images as the Docker section |

**Getting started:**

- [Try Ozone With Kubernetes](../../quick-start/installation/kubernetes) — Helm, Minikube, and hosted-cluster examples
- [SCM High Availability](../configuration/high-availability/scm-ha) — SCM HA bootstrap and operations on Kubernetes
- [Ozone on Kubernetes (developer)](../../developer-guide/run/kubernetes) — local k3s examples and IDE debugging

:::tip Kubernetes networking
In dynamic pod environments, consider enabling `ozone.client.failover.resolve-needed` and related settings documented in the [configuration appendix](../configuration/appendix) when server IPs change while DNS names remain stable.
:::

## Development-only platforms

These platforms are supported for **building and local development**, not for production Ozone services.

### macOS (Apple Silicon / Intel)

macOS is supported for compiling Ozone from source and running local dev workflows. Do not run production OM, SCM, Datanode, or gateway services on macOS.

- **Build from source:** [Building Ozone With Maven](../../developer-guide/build/maven) — includes ARM Mac protobuf steps for Apple Silicon
- **Docs site preview:** Docker Compose workflow in [CONTRIBUTING.md](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md)

### Windows

Windows is not a supported platform for running Ozone services or building production deployments. Use Linux (bare metal, VM, or Kubernetes) for all production workloads.

## Related requirements

The following topics are documented elsewhere—this page covers the software stack only:

- [Hardware and Sizing](./hardware-and-sizing) — capacity, drives, network bandwidth
- [Production Deployment](../configuration/performance/placeholder) — kernel tuning, filesystem, heap sizing, security
- [Installing Binaries](./installing-binaries) — tarball download and installation
- [Upgrade and Downgrade](../operations/upgrade-and-downgrade) — version-to-version upgrade process
- [Initializing Cluster](./initializing-cluster) — first-time cluster bootstrap after binary install
