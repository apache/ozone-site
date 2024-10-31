---
sidebar_label: Maven
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**TODO:** File a subtask under [HDDS-9861](https://issues.apache.org/jira/browse/HDDS-9861) and complete this page or section.

- Cover basic Maven commands to build and run tests.
- Document all the Ozone specific Maven flags we use to speed up or skip parts of the build, and when they are useful.


# Building Ozone With Maven

This guide explains how to build Apache Ozone from source using Maven and prepare it for deployment.


## Prerequisites

**TODO** : [HDDS-11625](https://issues.apache.org/jira/browse/HDDS-11625) Finalize the version numbers of prerequisite packages

Before you begin, ensure you have the following installed on your build machine:

- Java 1.8 or higher
- Apache Maven 3.6.3 or higher
- Git (if building from source repository)

## Building Ozone

You can build Apache Ozone either by cloning the source code from Git or by downloading the official source tarball.

### 1. Obtain the Source Code

Choose one of the following methods to get the source code:

<Tabs>
  <TabItem value="Git" label="Git" default>
    ```bash
    git clone https://github.com/apache/ozone.git
    cd ozone
    ```
  </TabItem>
  <TabItem value="Tarball" label="Tarball">
    ```bash 
    curl -OL https://dlcdn.apache.org/ozone/1.4.0/ozone-1.4.0-src.tar.gz
    tar xzf ozone-1.4.0-src.tar.gz
    cd ozone-1.4.0-src
    ```
  </TabItem>
</Tabs>

### 2. Build the Project

#### Basic Build
For a basic build that skips tests:

```bash
mvn clean package -DskipTests=true
```

This command will:
- Clean previous build artifacts
- Compile the source code
- Package the compiled code into JAR files
- Create a distribution in `hadoop-ozone/dist/target/ozone-<version>`

#### Build with Tests
To run unit tests during the build:

```bash
mvn clean package
```

#### Create Distribution Tarball
To create a distribution tarball for deployment:

```bash
mvn clean package -DskipTests=true -Pdist
```

This creates a tarball in `hadoop-ozone/dist/target` that contains all necessary files for deployment.

### Maven Build Options

Several Maven options are available to customize the build process:

- `-DskipTests=true`: Skip all tests
- `-Pdist`: Enable the distribution profile to create deployment tarballs
- `-Pnative`: Build native libraries (requires additional system dependencies)
- `-T 4`: Use 4 threads for parallel building (adjust number based on your CPU)
- `-am -pl module-name`: Build a specific module and its dependencies

### Build Output

The build process creates several important artifacts:

- **Distribution Directory**: `hadoop-ozone/dist/target/ozone-<version>/`
- **Distribution Tarball**: `hadoop-ozone/dist/target/ozone-<version>.tar.gz` (when using `-Pdist`)
- **Individual Module JARs**: Found in `target/` directories within each module


### Next Steps
Run the build by deploying the binary on either a [machine](../../05-administrator-guide/01-installation/03-installing-binaries.md) or on a [docker cluster](../../08-developer-guide/02-run/02-docker-compose.md)
