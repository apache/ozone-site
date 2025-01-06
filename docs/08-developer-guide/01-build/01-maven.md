---
sidebar_label: Maven
---

<!-- cspell:words xzf Dskip Pdist installnpm installnpx installyarn -->

# Building Ozone With Maven

**TODO:** File a subtask under [HDDS-9861](https://issues.apache.org/jira/browse/HDDS-9861) and complete this page or section.

- Cover basic Maven commands to build and run tests.
- Document all the Ozone specific Maven flags we use to speed up or skip parts of the build, and when they are useful.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide explains how to build Apache Ozone from source using Maven and prepare it for deployment.

## Prerequisites

**TODO** : [HDDS-11625](https://issues.apache.org/jira/browse/HDDS-11625) Finalize the version numbers of prerequisite packages

Before you begin, ensure you have the following installed on your build machine:

- Java 1.8 or higher
- Apache Maven 3.6.3 or higher
- Git (if building from source repository)

## Obtain the Source Code

You can build Apache Ozone either by cloning the source code from Git or by downloading the official source tarball.

Choose one of the following methods to get the source code:

<Tabs>
  <TabItem value="Git" label="Git" default>
    Use this option to build any release, tag or commit of Ozone.
    ```bash
    git clone https://github.com/apache/ozone.git
    cd ozone
    ```
  </TabItem>
  <TabItem value="Tarball" label="Tarball">
    Use this option if you only want a released version of Ozone. Source code for Ozone releases can be obtained from the [download page](/download).
    ```bash
    tar xzf ozone-<version>-src.tar.gz
    cd ozone-<version>-src
    ```
  </TabItem>
</Tabs>

## Build the Project

Apache Ozone uses [Maven](https://maven.apache.org/) as its build system. The build process compiles the source code, runs tests, and creates deployable artifacts. The project supports various build configurations to accommodate different development and deployment needs.

### Build Options

The build system offers several options to customize the build process according to your requirements:

#### Basic Build

For a basic build that skips tests:

```bash
mvn clean install -DskipTests=true
```

This command will:

- Clean previous build artifacts
- Compile the source code
- Package the compiled code into JAR files
- Create a distribution in `hadoop-ozone/dist/target/ozone-<version>`

#### Build with Tests

To run unit tests during the build:

```bash
mvn clean install
```

#### Create Distribution Tarball

To create a distribution tarball for deployment:

```bash
mvn clean install -DskipTests=true -Pdist
```

This creates a tarball in `hadoop-ozone/dist/target` that contains all necessary files for deployment.

#### Maven Build Options

Several Maven options are available to customize the build process:

Here's the conversion to a markdown table:

| Command | Description |
|---------|-------------|
| `-DskipTests=true` | Skip all tests |
| `-Dskip.installnpm -Dskip.installnpx -Dskip.installyarn -Dskip.npm -Dskip.npx -Dskip.yarn` | Skip building the Javascript frontend for Recon |
| `-Pdist` | Enable the distribution profile to create deployment tarballs |
| `-T 4` | Use 4 threads for parallel building (adjust number based on your CPU) |
| `-T 2C` | Use 2 threads per core for parallel building (adjust number based on your CPU) |
| `-am -pl module-name` | Build a specific module and its dependencies |
| `-DskipShade` | Skip shading. This saves a ton of time by e.g. skipping the ozone-filesystem-hadoop3 fat jar build |
| `-Dmaven.artifact.threads=30` | Allow maven to download 30 artifacts at once. The default value is 5. This could speed up the build process by a lot when the maven cache was not previously populated. |
| `-Pnative` | Build native module(s). So far it only affects `hdds-rocks-native` |

### Build Output

You can test the result of the compilation process by running a simple Ozone command which will display the Ozone version

```bash
./hadoop-ozone/dist/target/ozone-<version>-SNAPSHOT/bin/ozone version
```

The build process creates several important artifacts:

- **Distribution Tarball**: `hadoop-ozone/dist/target/ozone-<version>.tar.gz` (when using `-Pdist`)
- **Distribution Directory**: `hadoop-ozone/dist/target/ozone-<version>/`
- **Individual Module JARs**: `hadoop-ozone/dist/target/ozone-<version>-SNAPSHOT/share/ozone/lib`

## Next Steps

Run the build by deploying the binary on either a [machine](../../05-administrator-guide/01-installation/03-installing-binaries.md) or on a [Docker cluster](../../08-developer-guide/02-run/02-docker-compose.md)
