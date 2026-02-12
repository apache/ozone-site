---
sidebar_label: Maven
---


# Building Ozone With Maven

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide explains how to build Apache Ozone from source using Maven and prepare it for deployment.

## Prerequisites

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

### Additional Steps Required For ARM-based Apple silicon (Apple M1, M2, etc.)

If you are running on an ARM-based Apple silicon Mac, please perform the additional steps in this section.

#### Compile and Patch Protobuf version 2.5.0 for ARM-based Mac

Note: These steps are required for Hadoop 2 support in Ozone 2.1.x and earlier. This won't be needed in Ozone 2.2.0 and later since protobuf 2.5.0's removal in HDDS-5407.

Execute the following commands to compile and patch Protobuf version 2.5.0:

```bash
PROTOBUF_VERSION="2.5.0"
curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v2.5.0/protobuf-2.5.0.tar.gz
tar xzf protobuf-2.5.0.tar.gz
pushd protobuf-2.5.0
```

Next, patch to insert arm64 macro in `src/google/protobuf/stubs/platform_macros.h`:

```bash
# Patch to insert arm64 macro
patch -p1 << EOF
diff --git a/src/google/protobuf/stubs/platform_macros.h b/src/google/protobuf/stubs/platform_macros.h
index b1df60e..8a68655 100644
--- a/src/google/protobuf/stubs/platform_macros.h
+++ b/src/google/protobuf/stubs/platform_macros.h
@@ -57,6 +57,9 @@
 #elif defined(__ppc__)
 #define GOOGLE_PROTOBUF_ARCH_PPC 1
 #define GOOGLE_PROTOBUF_ARCH_32_BIT 1
+#elif defined(__arm64__)
+#define GOOGLE_PROTOBUF_ARCH_ARM 1
+#define GOOGLE_PROTOBUF_ARCH_64_BIT 1
 #else
 #error Host architecture was not detected as supported by protobuf
 #endif
EOF
```

Execute the following commands to build `protoc`:

```bash
./configure --disable-shared
make -j
```

Execute the following command to install `protoc` version 2.5.0 to the local Maven repository:

```bash
mvn install:install-file -DgroupId=com.google.protobuf -DartifactId=protoc -Dversion=${PROTOBUF_VERSION} -Dclassifier=osx-aarch_64 -Dpackaging=exe -Dfile=src/protoc
```

If you are running Maven 3.9.x or higher, execute the following command.  This command is not needed for 3.8.x or earlier:

```bash
mv $HOME/.m2/repository/com/google/protobuf/protoc/${PROTOBUF_VERSION}/protoc-${PROTOBUF_VERSION}-osx-aarch_64 $HOME/.m2/repository/com/google/protobuf/protoc/${PROTOBUF_VERSION}/protoc-${PROTOBUF_VERSION}-osx-aarch_64.exe
```

### Build Options

The build system offers several options to customize the build process according to your requirements

#### Basic Build with Tests

```bash
mvn clean package
```

This command will:

- Clean previous build artifacts
- Compile the source code
- Package the compiled code into JAR files
- Create a distribution in `hadoop-ozone/dist/target/ozone-<version>`
- Run unit and integration tests during the build

- [//]: # (- Run [unit]&#40;/docs/developer-guide/test/unit-tests&#41; and [integration]&#40;/docs/developer-guide/test/integration-tests&#41; tests during the build)

:::note

This command does not run acceptance tests. Refer to the [acceptance tests](/docs/developer-guide/test/acceptance-tests) page for test execution instructions.

:::

#### Common Maven Build Options

| Command                       | Description                                                                                                                                                             |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-DskipTests=true`            | Skip all tests                                                                                                                                                          |
| `-Pdist`                      | This creates a tarball in `hadoop-ozone/dist/target` that contains all necessary files for deployment                                                                   |
| `-DskipRecon`                 | Skip building the Javascript frontend for Recon                                                                                                                         |
| `-T 4`                        | Use 4 threads for parallel building (adjust number based on your CPU)                                                                                                   |
| `-T 2C`                       | Use 2 threads per core for parallel building                                                                                          |
| `-am -pl :<module-name>`      | Build a specific module and its dependencies when run from the root of the project                                                                                      |
| `-DskipShade`                 | Skip shading. This saves a ton of time by skipping the `ozone-filesystem-hadoop3` fat jar build used by the client                                                      |
| `-Dmaven.artifact.threads=30` | Allow Maven to download 30 artifacts at once. The default value is 5. This could speed up the build process by a lot when the Maven cache was not previously populated. |
| `-Pnative`                    | Build native module(s). So far it only affects `hdds-rocks-native`                                                                                                      |

### Build Output

The build process creates several important artifacts:

- **Distribution Tarball**: `hadoop-ozone/dist/target/ozone-<version>.tar.gz` (when using `-Pdist`)
- **Distribution Directory**: `hadoop-ozone/dist/target/ozone-<version>/`
- **Individual Module JARs**: `hadoop-ozone/dist/target/ozone-<version>/share/ozone/lib`

You can test the result of the compilation process by running a simple Ozone command which will display the Ozone version:

```bash
hadoop-ozone/dist/target/ozone-<version>/bin/ozone version
```

## Next Steps

Run the build by deploying the binary on either [bare metal](../../05-administrator-guide/01-installation/04-installing-binaries.md) or a [Docker cluster](../../08-developer-guide/02-run/02-docker-compose.md).
