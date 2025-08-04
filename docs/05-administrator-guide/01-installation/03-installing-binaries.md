---
sidebar_label: Installing Binaries
---

# Installing the Ozone Binaries

To install Apache Ozone on a cluster (bare metal or VMs), you first need to obtain the Ozone binary distribution. This distribution contains all the necessary JAR files, scripts, configuration templates, and web application files required to run Ozone services.

There are two primary ways to get the binaries:

1.  **Download a Release:**
    *   This is the recommended approach for production deployments or when using a stable, official version of Ozone.
    *   Binary tarballs (`ozone-<version>.tar.gz`) are available from the official [Apache Ozone Downloads Page](/download).
    *   Instructions for unpacking and configuring the downloaded binaries are detailed in the **[Bare Metal Installation Guide](/docs/02-quick-start/01-installation/03-bare-metal.md)**.

2.  **Build from Source:**
    *   This approach is typically used by developers contributing to Ozone or users needing to test unreleased features or custom patches.
    *   Building from source generates the binary distribution locally.
    *   Instructions for building Ozone using Maven can be found in the **[Maven Build Guide](/docs/08-developer-guide/01-build/01-maven.md)**.
    *   Once built, the installation process follows the same steps outlined in the **[Bare Metal Installation Guide](/docs/02-quick-start/01-installation/03-bare-metal.md)**, using the locally built distribution tarball or directory.

Choose the method appropriate for your needs to obtain the binaries, then proceed with the configuration and startup steps detailed in the Bare Metal Installation guide.
