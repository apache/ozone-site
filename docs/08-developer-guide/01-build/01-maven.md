---
sidebar_label: Maven Build Guide
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building Ozone With Maven

Apache Ozone uses [Apache Maven](https://maven.apache.org/) as its build system. This guide provides detailed instructions for developers on how to build Ozone from source, understand the build structure, and customize the build process.

## Prerequisites

Ensure the following software is installed and configured on your build machine:

*   **Java Development Kit (JDK):** Version 8 or higher (as specified by `<javac.version>` in `pom.xml`). Check your active version with `java -version`.
*   **Apache Maven:** Version 3.3.0 or higher (as specified by `<enforced.maven.version>` in `pom.xml`). Check your version with `mvn --version`.
*   **Git:** Required for cloning the source code repository.
*   **Network Access:** Maven needs to download dependencies from repositories like Maven Central and Apache Snapshots.
*   **(Optional) Docker:** Required for building native RocksDB code (`-Pnative`) or running certain integration tests.
*   **(Optional) Node.js/npm:** Required if building the Recon web UI (can be skipped with `-DskipRecon`).

## Obtaining the Source Code

You can build Ozone from the official Git repository or a downloaded source release tarball.

<Tabs>
  <TabItem value="Git" label="Git (Recommended for Development)" default>
    Cloning the repository gives you access to the latest development branch (`master`) and all release branches/tags.

    ```bash
    # Clone the main Ozone repository
    git clone https://github.com/apache/ozone.git
    cd ozone

    # (Optional) Check out a specific branch or tag
    # git checkout master  # Latest development
    # git checkout rel/1.4.0 # Specific release branch
    ```
  </TabItem>
  <TabItem value="Tarball" label="Source Tarball">
    Download the source tarball (`ozone-<version>-src.tar.gz`) for a specific release from the official [Apache Ozone Downloads Page](/download).

    ```bash
    # Download the source tarball (replace <version> appropriately)
    # wget https://downloads.apache.org/ozone/<version>/ozone-<version>-src.tar.gz

    # Extract the tarball
    tar xzf ozone-<version>-src.tar.gz
    cd ozone-<version>-src
    ```
  </TabItem>
</Tabs>

## Understanding the Build Structure

Ozone uses a multi-module Maven structure. Key top-level modules include:

*   `hadoop-hdds`: Contains the Hadoop Distributed Data Store components (SCM, Datanode core, Container logic, Ratis integration, RocksDB).
*   `hadoop-ozone`: Contains Ozone-specific components (Ozone Manager, Client, S3 Gateway, Filesystem implementations, Recon).
*   `dev-support`: Contains tools and configurations for developers (checkstyle, findbugs, test patches, etc.).

Builds are typically run from the root directory of the cloned repository or extracted source tarball.

## Common Build Commands

Execute these commands from the root of the Ozone source directory.

### Compiling and Packaging (No Tests)

This is often the quickest way to compile the code and create JARs, useful during active development when you want fast feedback on compilation errors.

```bash
# Compile and package all modules, skipping tests and Recon UI build
mvn clean package -DskipTests -DskipRecon
```

### Running Tests

*   **Run All Unit and Integration Tests:**
    ```bash
    mvn clean verify
    ```
    *Note: This can take a significant amount of time.*

*   **Run Tests in a Specific Module:**
    ```bash
    # Navigate to the module directory first
    cd hadoop-hdds/common
    mvn test

    # Or run from the root, specifying the module
    mvn test -pl hadoop-hdds/common
    ```

*   **Run a Specific Test Class:**
    ```bash
    # From the module directory
    mvn test -Dtest=TestOzoneConfiguration

    # From the root directory
    mvn test -pl hadoop-hdds/common -Dtest=TestOzoneConfiguration
    ```

*   **Run a Specific Test Method:**
    ```bash
    # From the module directory
    mvn test -Dtest=TestOzoneConfiguration#testDefaultPort
    ```

### Creating the Distribution Package

To create the deployable tarball (`.tar.gz`) containing all necessary binaries, libraries, scripts, and configuration files:

```bash
# Build the distribution package, skipping tests for speed
mvn clean package -Pdist -DskipTests -Dmaven.javadoc.skip=true
```

*   `-Pdist`: Activates the distribution profile defined in `hadoop-ozone/dist/pom.xml`.
*   `-Dmaven.javadoc.skip=true`: Skips Javadoc generation, speeding up the build.

The output tarball will be located in `hadoop-ozone/dist/target/ozone-<version>.tar.gz`. An unpacked version will also be available in `hadoop-ozone/dist/target/ozone-<version>/`.

## Useful Maven Build Options & Profiles

Customize your build using these common Maven options (passed with `-D`) and profiles (passed with `-P`):

| Option/Profile                | Description                                                                                                                                                             |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-DskipTests`                 | Skips execution of all tests (unit and integration). Equivalent to `-DskipUTs -DskipITs`.                                                                                 |
| `-DskipUTs`                   | Skips execution of unit tests (Surefire plugin).                                                                                                                        |
| `-DskipITs`                   | Skips execution of integration tests (Failsafe plugin).                                                                                                                 |
| `-Pdist`                      | Activates the profile to create the binary distribution tarball.                                                                                                        |
| `-DskipRecon`                 | Skips building the JavaScript frontend for the Recon UI. Saves time if you don't need Recon or are not working on its UI.                                                 |
| `-DskipShade`                 | Skips the shading process, primarily affecting the `ozone-filesystem-hadoop3` fat JAR. Can significantly speed up builds if you don't need this specific client artifact. |
| `-Pnative`                    | Builds native code components, currently used for the RocksDB JNI library (`hdds-rocks-native`). Requires Docker.                                                        |
| `-PHadoop-2`                  | Builds Ozone artifacts compatible with Hadoop 2.x environments.                                                                                                         |
| `-PHadoop-3`                  | (Default) Builds Ozone artifacts compatible with Hadoop 3.x environments.                                                                                               |
| `-pl <module>`                | Build only the specified module(s) (e.g., `-pl hadoop-hdds/common`).                                                                                                    |
| `-am`                         | If used with `-pl`, also builds modules that the specified module depends on.                                                                                           |
| `-amd`                        | If used with `-pl`, also builds modules that depend on the specified module.                                                                                            |
| `-T <N>` or `-T <N>C`         | Enables parallel builds using `N` threads or `N` threads per CPU core (e.g., `-T 4`, `-T 1C`). Can significantly speed up builds on multi-core machines.                 |
| `-Dmaven.artifact.threads=30` | Increases the number of threads Maven uses to download dependencies concurrently (default is 5). Useful for speeding up the initial build when the local Maven repository (`~/.m2/repository`) is empty. |
| `-Dcheckstyle.skip=true`      | Skips Checkstyle code style checks.                                                                                                                                     |
| `-Drat.skip=true`             | Skips Apache RAT (Release Audit Tool) license header checks.                                                                                                            |
| `-Dspotbugs.skip=true`        | Skips SpotBugs static analysis checks.                                                                                                                                  |
| `-Dmaven.javadoc.skip=true`   | Skips Javadoc generation.                                                                                                                                               |

**Example Combining Options:** Build the distribution quickly without tests, using 4 threads:

```bash
mvn clean package -Pdist -DskipTests -Dmaven.javadoc.skip=true -T 4
```

## Build Output Locations

*   **Distribution Tarball:** `hadoop-ozone/dist/target/ozone-<version>.tar.gz` (created by `-Pdist`)
*   **Unpacked Distribution:** `hadoop-ozone/dist/target/ozone-<version>/` (created by `-Pdist`)
*   **Module JARs:** Located within the `target/` directory of each individual module (e.g., `hadoop-hdds/common/target/hadoop-hdds-common-<version>.jar`).
*   **Aggregated Libraries:** The distribution directory (`hadoop-ozone/dist/target/ozone-<version>/share/ozone/lib/`) contains the necessary JARs for running Ozone services.

## Verifying the Build

After a successful build (especially with `-Pdist`), you can perform a basic check by running the version command from the unpacked distribution:

```bash
# Replace <version> with the actual version built
./hadoop-ozone/dist/target/ozone-<version>/bin/ozone version
```

This should output the Ozone version details corresponding to the source code you built.

## Next Steps

Once you have successfully built Ozone, you can:

*   Deploy the distribution tarball to a cluster ([Bare Metal Installation](../../05-administrator-guide/01-installation/03-installing-binaries.md)).
*   Run Ozone locally using Docker Compose ([Run with Docker Compose](../02-run/02-docker-compose.md)).
*   Run specific integration or acceptance tests ([Testing Guide](../03-test/README.mdx)).
