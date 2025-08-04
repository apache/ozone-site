---
sidebar_label: Docker Images
---

<!-- cspell:word testkrb5 -->

# Building Ozone Docker Images

The Apache Ozone community maintains several Docker images to facilitate development, testing, and experimentation. This page describes these images, their purpose, and the process for building and publishing them.

These images are distinct from any official release artifacts and are primarily intended for the development lifecycle.

## `apache/ozone-runner`

*   **GitHub Repository:** [apache/ozone-docker-runner](https://github.com/apache/ozone-docker-runner)
*   **Published:** [Docker Hub](https://hub.docker.com/r/apache/ozone-runner), [GitHub Packages](https://github.com/apache/ozone-docker-runner/pkgs/container/ozone-runner)

### Purpose and Use Case

The `ozone-runner` image serves as a **base environment** for running and testing Ozone. It includes:
*   A base operating system (currently Rocky Linux).
*   Required JDK versions (JDK 11 and JDK 21 flavors are available).
*   Essential tools and dependencies needed to execute Ozone components and tests.

Crucially, `ozone-runner` **does not contain any Ozone binaries or artifacts**. Its primary use cases are:

1.  **Local Development & Testing:** Developers mount their local Ozone source code and build artifacts into a container running `ozone-runner` to test their changes in a consistent environment.
2.  **CI Workflows:** Used extensively in GitHub Actions to run tests against specific commits or pull requests using the built artifacts.
3.  **Base for `apache/ozone`:** Serves as the foundation layer for the `apache/ozone` image (described next).

### Building the Image

The image is built using the `build.sh` script within the `apache/ozone-docker-runner` repository:

```bash
# Clone the repository first if you haven't already
git clone https://github.com/apache/ozone-docker-runner.git
cd ozone-docker-runner

# Build the image (defaults usually suffice)
./build.sh
```

### Tagging and Publishing

*   **Tag Format:** Images are tagged by date and JDK flavor: `<date>-<n>-<flavor>`
    *   `<date>`: YYYYMMDD format (e.g., `20240411`).
    *   `<n>`: A counter starting at 1, incremented if multiple images are published on the same day.
    *   `<flavor>`: `jdk11` (for Ozone 1.x compatibility) or `jdk21` (for Ozone 2.0+).
*   **Development Branches:** `master` (typically for `jdk21`) and `jdk11`.
*   **Publishing Trigger:** Pushing a Git tag matching the format above to the `apache/ozone-docker-runner` repository triggers a GitHub Actions workflow that builds and publishes the corresponding Docker image tag to Docker Hub and GitHub Packages.

## `apache/ozone`

*   **GitHub Repository:** [apache/ozone-docker](https://github.com/apache/ozone-docker)
*   **Published:** [Docker Hub](https://hub.docker.com/r/apache/ozone), [GitHub Packages](https://github.com/apache/ozone-docker/pkgs/container/ozone)

### Purpose and Use Case

The `apache/ozone` image builds upon `apache/ozone-runner` by **adding the official Ozone release binaries**. Its primary use cases are:

1.  **Release Testing:** Testing specific released versions of Ozone.
2.  **Compatibility Testing:** Verifying application compatibility against different Ozone releases.
3.  **Upgrade Testing:** Simulating and testing upgrade paths between Ozone versions.
4.  **Experimentation:** Quickly launching a specific Ozone version for experimentation without needing a manual build.

### Building the Image

The image is built using the `build.sh` script within the `apache/ozone-docker` repository. This script downloads the specified Ozone release tarball and layers it onto the appropriate `ozone-runner` base image.

```bash
# Clone the repository first if you haven't already
git clone https://github.com/apache/ozone-docker.git
cd ozone-docker

# Build the image (defaults to latest Ozone release and runner)
./build.sh
```

The build process can be customized using environment variables:

*   `OZONE_VERSION`: Specifies the Ozone release version to download and include (e.g., `1.4.1`). Ignored if `OZONE_URL` is set.
*   `OZONE_URL`: A direct URL to download the Ozone tarball from. Useful for testing release candidates or using local mirrors. Overrides `OZONE_VERSION`.
*   `OZONE_RUNNER_IMAGE`: The base runner image name (default: `apache/ozone-runner`).
*   `OZONE_RUNNER_VERSION`: The tag of the base `ozone-runner` image to use (e.g., `20240411-1-jdk21`).

**Note:** Running `build.sh` locally creates a single-platform image. The CI build process creates multi-platform images (`amd64`, `arm64`).

#### Building with Local Ozone Source (Development Build)

While the standard build process downloads official release binaries, developers often need to test changes from their local source code repository (e.g., the `master` branch) within the `apache/ozone` Docker image environment.

Here's how to build the `apache/ozone` image using a local Ozone distribution built from source:

1.  **Build Ozone Distribution:**
    *   Navigate to your local Ozone source code directory (e.g., `<path-to-ozone-source>`).
    *   Build the distribution tarball using Maven. This command compiles Ozone and creates the necessary package in `hadoop-ozone/dist/target/`:
        ```bash
        mvn clean package -Pdist -DskipTests -Dmaven.javadoc.skip=true
        ```
    *   Identify the generated tarball, typically named `ozone-<VERSION>-SNAPSHOT.tar.gz` or similar, located in the `hadoop-ozone/dist/target/` subdirectory.

2.  **Prepare Docker Build Context:**
    *   Navigate to the directory containing the `apache/ozone` Docker build files (e.g., `<path-to-ozone-docker-repo>`).
    *   Copy the Ozone distribution tarball you built in step 1 into this directory. It's recommended to give it a consistent name, for example `ozone-local-dev.tar.gz`:
        ```bash
        # Example: Copy from source build to docker build context
        cp <path-to-ozone-source>/hadoop-ozone/dist/target/ozone-*-SNAPSHOT.tar.gz ./ozone-local-dev.tar.gz
        ```

3.  **Modify Dockerfile (Temporary or Permanent):**
    *   Edit the `Dockerfile` within the `ozone-docker` directory.
    *   Find the line that downloads and extracts Ozone (usually involves `curl $OZONE_URL`). It looks similar to this:
        ```dockerfile
        ARG OZONE_URL=...
        WORKDIR /opt
        RUN sudo rm -rf /opt/hadoop && curl ... && tar ... && mv ...
        ```
    *   Replace that `RUN` command with instructions to `COPY` and extract the local tarball you placed in the context:
        ```dockerfile
        # ARG OZONE_URL=... # Comment out or remove the URL argument if not needed

        # Add argument for the local tarball name
        ARG LOCAL_OZONE_TAR=ozone-local-dev.tar.gz

        WORKDIR /opt
        # Copy the local tarball from the build context
        COPY ${LOCAL_OZONE_TAR} ozone.tar.gz
        # Extract the copied tarball
        RUN sudo rm -rf /opt/hadoop && tar zxf ozone.tar.gz && rm ozone.tar.gz && mv ozone* hadoop
        ```
    *   **Important:** Remember to revert these `Dockerfile` changes if you want to build images based on official releases later, or manage this change using version control (e.g., a separate branch or temporary commit).

4.  **Build the Docker Image:**
    *   Run the `docker build` command from within the `ozone-docker` directory. You might need to specify the build argument for the local tarball name if you added it as shown above. You should also tag the image appropriately (e.g., `local/ozone:dev`).
        ```bash
        # Example build command
        docker build --build-arg LOCAL_OZONE_TAR=ozone-local-dev.tar.gz -t local/ozone:dev .
        ```
    *   Do **not** use the `OZONE_URL` or `OZONE_VERSION` environment variables/build arguments when building with a local tarball via the modified `Dockerfile`.

This process creates an `apache/ozone` style Docker image containing the Ozone binaries built directly from your local source code, ready for deployment or testing.

### Tagging and Publishing

*   **Tag Format:** Images are tagged primarily with the Ozone version number (e.g., `1.4.1`).
    *   A `-rocky` suffix was used temporarily during the base OS transition from CentOS but may be phased out.
*   **Development Branch:** `latest`.
*   **Publishing Trigger:** Pushing to a branch named `ozone-<tag>` (e.g., `ozone-1.4.1`) in the `apache/ozone-docker` repository triggers a GitHub Actions workflow. This workflow builds the image for that version (using the corresponding `OZONE_VERSION`) and publishes it with the Docker tag `<tag>` (e.g., `1.4.1`).
*   **Updating Latest Release:** For the *latest* stable release, the corresponding `ozone-<version>` branch is often updated by fast-forwarding it to the `latest` branch (`git merge --ff-only origin/latest`). This allows CI to simply re-tag the existing image built from `latest`, avoiding a full rebuild. For older versions, specific commits might be cherry-picked onto the version branch before pushing.

## `apache/ozone-testkrb5`

*   **GitHub Repository:** [apache/ozone-docker-testkrb5](https://github.com/apache/ozone-docker-testkrb5)
*   **Published:** [GitHub Packages](https://github.com/apache/ozone-docker-testkrb5/pkgs/container/ozone-testkrb5) (Only)

### Purpose and Use Case

The `ozone-testkrb5` image provides a minimal Kerberos KDC (Key Distribution Center) environment **solely for testing purposes**.

Its only use case is within Ozone's integration tests that require Kerberos authentication to be enabled.

**Security Warning:** This image is **highly insecure** and must **never** be used in production or any environment requiring real security. It is published only to GitHub Packages to limit accidental exposure.

### Building the Image

The image is built using the `build.sh` script within the `apache/ozone-docker-testkrb5` repository:

```bash
# Clone the repository first if you haven't already
git clone https://github.com/apache/ozone-docker-testkrb5.git
cd ozone-docker-testkrb5

# Build the image
./build.sh
```

### Tagging and Publishing

*   **Tag Format:** Images are tagged by date: `<date>-<n>`
    *   `<date>`: YYYYMMDD format (e.g., `20240411`).
    *   `<n>`: A counter starting at 1, incremented if multiple images are published on the same day.
*   **Development Branch:** `master`.
*   **Publishing Trigger:** Pushing a Git tag matching the format above to the `apache/ozone-docker-testkrb5` repository triggers a GitHub Actions workflow that builds and publishes the corresponding Docker image tag to GitHub Packages.
