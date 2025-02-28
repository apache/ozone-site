---
sidebar_label: Docker Images
---

<!-- cspell:word testkrb5 -->

# Building Ozone Docker Images

This page provides an overview of the Docker images maintained by the Apache Ozone community for developing and testing Ozone.  It also describes the workflow to be followed when making changes to one of these images.

## Images

### ozone-runner

[ozone-runner](https://github.com/apache/ozone-docker-runner) is the base image with tools for running and testing Ozone, but does not include any Ozone artifacts.

Developers and CI workflows rely on it heavily to run/test custom Ozone builds (using the local build via bind-mount).  It also serves as the base image for `apache/ozone` (see next section).

Published to [Docker Hub](https://hub.docker.com/r/apache/ozone-runner) and [GitHub](https://github.com/apache/ozone-docker-runner/pkgs/container/ozone-runner).

### ozone

[ozone](https://github.com/apache/ozone-docker) is built on top of `ozone-runner`, adding the binaries built for official Ozone releases.

These are used for testing compatibility of various Ozone versions, and upgrade from one version to another.  May also be useful for running quick experiments with specific version of Ozone, without the need to download or rebuild it.

Published to [Docker Hub](https://hub.docker.com/r/apache/ozone) and [GitHub](https://github.com/apache/ozone-docker/pkgs/container/ozone).

### ozone-testkrb5

[ozone-testkrb5](https://github.com/apache/ozone-docker-testkrb5) is used as KDC in tests where Kerberos is enabled.

Published only to [GitHub](https://github.com/apache/ozone-docker-testkrb5/pkgs/container/ozone-testkrb5).

## Development

### Common Flow

High-level overview of making changes to any of the Docker images:

1. Local development: make changes, build image, test locally.
2. If this is your first time working on the image: fork the repo and enable GitHub Actions workflows.
3. Push to your fork.  The image is built and tagged by commit SHA in GitHub.  This can be used for testing integration with other repos, e.g. using as base for the `ozone` image, or using in Ozone CI.  It can also be shared with others for feedback.
4. Create pull request.  The change is validated in CI workflow.  Ask for reviews.
5. Final steps for committers:
    1. Merge the pull request.  This will trigger build and the image will be tagged with commit SHA.
    2. Fetch changes to your local clone.
    3. The way the image can be published with a friendlier tag depends on the repo, see details below.

### Base Image

Development happens on branch `master`, relevant changes are cherry-picked to branch `jdk11`.

The image can be built simply by running the helper script `build.sh`:

```bash
./build.sh
```

#### Image Tagging

Images are manually tagged by date, and come in two flavors: `jdk21` (for Ozone 2.0+) and `jdk11` (for Ozone 1.x).

Publishing Docker tags:

1. Tag the commit following existing pattern (`<date>-<n>-<flavor>`, where `<n>` starts at 1, and is incremented if multiple images need to be published the same day).
2. Push the tag to the origin (`apache/ozone-docker-runner`) repo.  This will trigger another CI run to publish the image with the given tag.

### Ozone

Development branch: `latest`.

The image can be built simply by running the helper script `build.sh`:

```bash
./build.sh
```

This will create a single-platform image for your architecture.  Build automation in GitHub Actions creates multi-platform image for `amd64` and `arm64`.

It can be customized via environment variables defined at build time.

```bash
# the URL to download Ozone from; allows using custom tarball or local mirror
OZONE_URL

# version of Ozone to include in the image; ignored if URL is also specified
OZONE_VERSION

# the base image name in repo/image format
OZONE_RUNNER_IMAGE

# the base image version to use
OZONE_RUNNER_VERSION
```

#### Image Tagging

Images are tagged by Ozone version numbers and optional flavor.  Flavor `-rocky` was introduced when `ozone-runner` was changed from CentOS to Rocky Linux due to CentOS end-of-life, to avoid breaking things for existing users.  Future images will be published only with Rocky Linux, with and without flavor suffix.

Image tags are derived from branch names: push to the branch `ozone-<tag>` gets published with `<tag>` (e.g. `ozone-1.4.1 -> 1.4.1`).

Publishing Docker tags:

1. Update the version-specific branch:
   - The latest release version can usually be updated by fast-forwarding the branch: `git merge --ff-only origin/latest` (This allows CI workflow to tag the existing image from `latest` branch, instead of building completely new image.)
   - For other versions branch can be updated by cherry-picking one or more commits.
2. Push the branch to the origin (`apache/ozone-docker`) repo.  This will trigger another CI run to publish the image.

### KDC

Development branch: `master`.

The image can be built simply by running the helper script `build.sh`:

```bash
./build.sh
```

#### Image Tagging

Images are manually tagged by date.

Publishing Docker tags:

1. Tag the commit following existing pattern (`<date>-<n>`, where `<n>` starts at 1, and is incremented if multiple images need to be published the same day).
2. Push the tag to the origin (`apache/ozone-docker-testkrb5`) repo.  This will trigger another CI run to publish the image with the given tag.
