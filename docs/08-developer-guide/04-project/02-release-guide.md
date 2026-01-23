---
sidebar_label: Release Manager Guide
---

# Apache Release Manager Guide

This document describes the process to release Apache Ozone. The process is not yet scripted, and the documentation is **a work in progress**.

## Pre-Requisites

### Install Required Packages

The following packages are required during the release process:

- JDK 8
- [Maven](https://maven.apache.org/download.cgi) to build.
- [Subversion](https://subversion.apache.org/) to publish release artifacts and GPG keys.
- [GnuPG](https://www.gnupg.org/) to manage your GPG keys.
- [Protolock](https://github.com/nilslice/protolock) to manage protocol buffer compatibility.

:::note
As of Ozone 2.0.0, we have optional native libraries for fault inject tool and Ozone Snapshot features. It is recommended to build on a Linux so users can use these features.
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="mac" label="Mac">
Install pre-requisites using Homebrew.

  ```bash
  brew install svn git pinentry-mac cmake gcc coreutils gpatch

  sudo ln -s /usr/local/bin/gsha256sum /usr/local/bin/sha256sum
  sudo ln -s /usr/local/bin/gsha512sum /usr/local/bin/sha512sum

  # use GNU patch as patch
  PATH="$HOMEBREW_PREFIX/opt/gpatch/libexec/gnubin:$PATH"
  ```

Make sure to use [GNU tar](https://www.gnu.org/software/tar/).  On Mac, built-in tar includes additional metadata in the archive, which appears as extra files when extracted on other platforms.  GNU tar can be installed e.g. via Homebrew:

```bash title="Install GNU tar on Mac"
brew install gnu-tar
# to use it as "tar", not "gtar", add the "gnubin" directory to your PATH
export PATH="$HOMEBREW_PREFIX/opt/gnu-tar/libexec/gnubin:$PATH"
```

You may encounter problems regarding sqlite3 compatibility issues when installing Subversion on Mac. Use the following workaround to resolve it:

```bash title="Install Subversion on Mac"
# fix svn sqlite3 incompatibility
brew update
brew remove sqlite svn
brew reinstall sqlite svn --build-from-source
```

</TabItem>
<TabItem value="rockylinux" label="Rocky Linux">

```bash title="Install pre-requisites"
yum install -y svn git pinentry java-1.8.0-openjdk-devel cmake gcc-c++ patch which
```

</TabItem>
<TabItem value="ubuntulinux" label="Ubuntu Linux">

```bash title="Install pre-requisites"
apt update && apt install -y subversion git pinentry-tty openjdk-8-jdk cmake g++ patch gpg
```

</TabItem>
</Tabs>

### Publish Your GPG Key

Create a GPG key to sign the artifacts if you do not already have one. For help creating your key refer to the [ASF new committer guide](https://www.apache.org/dev/new-committers-guide.html#set-up-security-and-pgp-keys). The release manager's GPG key is supposed to be published together with the release. Please append it to the end of the [KEYS file](https://dist.apache.org/repos/dist/release/ozone/KEYS) stored in Subversion, if it is not already present.

- PMC members can append their key directly to the release KEYS file:

```bash title="Publish Key (PMC)"
svn co https://dist.apache.org/repos/dist/release/ozone
cd ozone
export CODESIGNINGKEY=<your_gpg_key_id>
gpg --list-sigs $CODESIGNINGKEY >> KEYS
gpg --armor --export $CODESIGNINGKEY >> KEYS
svn commit -m "ozone: adding key of <your_name> to the KEYS"
```

- If you are a committer and not a PMC member, you can add your key to the dev KEYS file and a PMC member can move it to the final destination:

```bash title="Publish Key (Committer)"
# Use the latest KEYS as the base
svn rm https://dist.apache.org/repos/dist/dev/ozone/KEYS
svn cp https://dist.apache.org/repos/dist/release/ozone/KEYS https://dist.apache.org/repos/dist/dev/ozone/KEYS

svn co https://dist.apache.org/repos/dist/dev/ozone
cd ozone
export CODESIGNINGKEY=<your_gpg_key_id>
gpg --list-sigs $CODESIGNINGKEY >> KEYS
gpg --armor --export $CODESIGNINGKEY >> KEYS
svn commit -m "ozone: adding key of <your_name> to the KEYS"
```

```bash title="Move Key (PMC)"
svn mv -m "ozone: adding key of <name> to the KEYS" https://dist.apache.org/repos/dist/dev/ozone/KEYS https://dist.apache.org/repos/dist/release/ozone/KEYS
```

### Configure Maven Credentials

Add your Apache credentials to the local Maven settings `~/.m2/settings.xml`.

  ```xml title="settings.xml"
  <settings>
    <servers>
      <server>
        <id>apache.staging.https</id>
        <username>your_apache_id</username>
        <password>your_apache_password</password>
      </server>
    </servers>
  </settings>
  ```

## Pre-Vote

### Create a Parent Jira for the Release

This provides visibility into the progress of the release for the community. Tasks mentioned in this guide like cherry-picking fixes on to the release branch, updating the Ozone website, publishing the Docker image, etc can be added as subtasks.

### Bulk Comment on Jiras Targeting This Release

Issue a Jira query like [this](https://issues.apache.org/jira/issues/?jql=project%20%3D%20HDDS%20AND%20resolution%20%3D%20Unresolved%20AND%20(cf%5B12310320%5D%20%3D%201.3.0%20OR%20fixVersion%20%3D%201.3.0)%20ORDER%20BY%20priority%20DESC%2C%20updated%20DESC), modified for the release number you are working with, to find all unresolved Jiras that have the target version field set to this release. Note that some people incorrectly use Fix Version as the Target Version, so Fix Version is included in this search. Use the following steps to issue a bulk update to these Jiras:

1. In the top right corner, click `Tools` and under `Bulk Change` , select `all ... issues`.
2. Click the top check box to select all the issues. Click `Next`.
3. Select `Edit Issues` , then click `Next`.
4. Select `Change Fix Version/s` , and in the drop down select `Clear field`.
    :::note
    This corrects unresolved issues which incorrectly set a fix version for this release.
    :::
5. Select `Change Target Version/s`, and enter the version of the release after the one you are managing.
6. Select `Change Comment`, and add a comment saying that you have moved the release field out, but if the issue is being actively worked on, is close to completion, and would like to be included in this release, to contact you by a given date, probably a week in the future.
    :::note
    Even though the action is called `Change Comment`, it actually adds a comment to the Jira and does not affect existing comments.
    :::
7. Keep clicking through until the operation is started. It may take a while for Jira to finish the bulk update once it is started.

Wait for the date specified in the Jira comments to pass and blocking issues to be resolved before proceeding with the next steps to update the master branch and cut a release branch.

### Build and Commit `proto.lock` Files to the Master Branch

Protolock files are used to check backwards compatibility of protocol buffers between releases. The Ozone build checks protocol buffers against these lock files and fails if an incompatibility is detected. They should be updated for each release, and require [protolock](https://github.com/nilslice/protolock) to be installed.

1. Save and run the following script from your Ozone repo root.

    ```bash title="update_protolocks.sh"
    #!/usr/bin/env sh

    for lock in $(find . -name proto.lock); do
      lockdir="$(dirname "$lock")"
      protoroot="$lockdir"/../proto
      if protolock status --lockdir="$lockdir" --protoroot="$protoroot"; then
        protolock commit --lockdir="$lockdir" --protoroot="$protoroot"
      else
        echo "protolock update failed for $protoroot"
      fi
    done
    ```

2. Commit changes to the `proto.lock` files.

    ```bash
    git commit -m "Update proto.lock for Ozone $VERSION"
    ```

    :::warning
    Double check that only files called `proto.lock` are being committed, and that the changes to the files makes sense based on new features added in this release.
    :::

    :::tip
    Ozone currently uses the following protolock files:
    - `hadoop-hdds/interface-client/src/main/resources/proto.lock`: Controls the protocol for clients communicating with Datanodes.
    - `hadoop-hdds/interface-admin/src/main/resources/proto.lock`: Controls the protocol for clients communicating with SCM.
    - `hadoop-hdds/interface-server/src/main/resources/proto.lock`: Controls the protocol for SCMs communicating with each other.
    - `hadoop-ozone/interface-client/src/main/resources/proto.lock`: Controls all protocols involving the Ozone Manager.
    - `hadoop-ozone/csi/src/main/resources/proto.lock`: Controls the protocol for the Ozone CSI server.
    :::

3. Submit a pull request to add the updated `proto.lock` changes to Ozone's master branch. This commit will be the parent of your release branch.

### Update the Ozone Version on the Master Branch

Update the Ozone SNAPSHOT version and national park tag on master with a pull request. The snapshot version should be set to one minor version after the current release. For example, if you are releasing 2.0.0, then the master branch's current version would be `2.0.0-SNAPSHOT`. Here you would increase it to `2.1.0-SNAPSHOT`. As part of this change, you will pick the [United States National Park](https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States) to use for the next release of Ozone and set it in the project's top level pom at `<ozone.release>`. See [this pull request](https://github.com/apache/ozone/pull/8065) for an example.

```bash title="Update project version"
mvn versions:set -DnewVersion=2.1.0-SNAPSHOT
mvn versions:set-property -Dproperty=ozone.version -DnewVersion=2.1.0-SNAPSHOT
mvn versions:set-property -Dproperty=ozone.release -DnewVersion="Joshua Tree”
```

:::note
It is okay if there are commits that land between the `proto.lock` file updates and the SNAPSHOT version increase on the master branch, but they will not be part of the release unless they are manually cherry-picked after the release branch is created.
:::

### Create a Release Branch

Once the previous two pull requests to update protolock files and the Ozone SNAPSHOT version are merged, you can create a release branch in the [apache/ozone](https://github.com/apache/ozone) Github repo.
:::important
The parent commit of the release branch should be the commit that was merged in the [proto.lock file update](#build-and-commit-protolock-files-to-the-master-branch).
:::
Name the branch after the major and minor version of the release, so patch releases can also be done off this branch. For example, If releasing 2.0.0, create a branch called `ozone-2.0` . All release related changes will go to this branch until the release is complete.

### Set Up Local Environment

The following variables will be referenced in commands:

```bash
export VERSION=2.0.0 # Set to the version of ozone being released.
export RELEASE_DIR=~/ozone-release/ # ozone-release needs to be created
export CODESIGNINGKEY=<your_gpg_key_id>
export RC=0 # Set to the number of the current release candidate, starting at 0.
# Optional, if not specified, gpg will prompt during the build for passphrase.
export MAVEN_GPG_PASSPHRASE=<PASSPHRASE> # Maven passes this environment variable to gpg for passphrase.
```

It is probably best to clone a fresh Ozone repository locally to work on the release, and leave your existing repository intact for dev tasks you may be working on simultaneously. After cloning, make sure the git remote for the [apache/ozone](https://github.com/apache/ozone) upstream repo is named `origin`. This is required for release build metadata to be correctly populated.

Run the following commands to make sure your repo is clean:

```bash
git reset --hard
git clean -dfx
```

Assume all following commands are executed from within this repo with your release branch checked out.

### Update the Ozone Version on the Release Branch

Use the commands below or your IDE to replace `$VERSION-SNAPSHOT` with `$VERSION`.

```bash title="Update and Commit the Version Changes"
mvn versions:set -DnewVersion=$VERSION
mvn versions:set-property -Dproperty=ozone.version -DnewVersion=$VERSION

git commit -am "Update Ozone version to $VERSION"
```

### Tag the Commit for the Release Candidate

This will sign the tag with the GPG key matching the git mailing address. Make sure that the email given by `git config user.email` matches the email for the key you want to use shown by `gpg --list-secret-keys`.

```bash
git tag -s "ozone-$VERSION-RC$RC"
```

:::tip
If the command fails, you may need to do the following additional steps:
:::

- Tell git to use this program for signing and which key to sign with:

  ```bash
  git config --global gpg.program "$(which gpg)"
  git config --global user.signingKey $CODESIGNINGKEY
  ```

- And then perform the following platform-dependent steps.

<Tabs>
<TabItem value="mac" label="Mac">
- Tell GPG to use this program to prompt for passphrase:

  ```bash
  echo "pinentry-program $(which pinentry-mac)" > ~/.gnupg/gpg-agent.conf
  ```

- Reload `gpg-agent`:

  ```bash
  gpgconf --kill gpg-agent
  ```

</TabItem>
<TabItem value="linux" label="Linux">
- add this to `~/.gnupg/gpg.conf`:

  ```bash
  use-agent
  ```

- add this to `~/.gnupg/gpg-agent.conf`

  ```bash
  allow-loopback-pinentry
  ```

</TabItem>
</Tabs>

### Perform Sanity Checks

- Run rat check and ensure there are no failures.

  ```bash
  ./hadoop-ozone/dev-support/checks/rat.sh
  ```

- Clean the Repo of all Rat output

  ```bash
  git reset --hard
  git clean -dfx
  ```

### Build the Project

Build the project to fetch dependencies.

  ```bash
  mvn clean install -DskipTests -Psign,dist,src -Dtar -Dgpg.keyname="$CODESIGNINGKEY" -Drocks_tools_native
  ```

### Create and Upload Maven Artifacts

- Perform the final build and upload the release artifacts.

  ```bash
  mvn deploy -DdeployAtEnd=true -DskipTests -Psign,dist,src -Dtar -Dgpg.keyname="$CODESIGNINGKEY" -Drocks_tools_native
  ```

- Go to https://repository.apache.org/#stagingRepositories and **close** the newly created `orgapacheozone` repository.

### Calculate the Checksum and Sign the Artifacts

- Now that we have built the release artifacts, we will copy them to the release directory.

  ```bash
  cp hadoop-ozone/dist/target/ozone-*.tar.gz "$RELEASE_DIR"/
  ```

- Run the following commands to generate checksum files for all release artifacts:

  ```bash
  cd "$RELEASE_DIR"
  for i in $(ls -1 *.tar.gz); do gpg -u "$CODESIGNINGKEY" --armor --output "$i.asc" --detach-sig "$i"; done

  for i in $(ls -1 *.tar.gz); do sha512sum "$i" > "$i.sha512"; done

  for i in $(ls -1 *.tar.gz); do gpg --print-mds "$i" > "$i.mds"; done
  ```

Now each .tar.gz file should have an associated .mds file, .asc file, and .sha512 file

### Check the Artifacts

Before uploading the artifacts, run some basic tests on them, similar to what other devs will run before voting in favor of the release.

1. Extract the contents of the source tarball and build it with an empty Maven cache by renaming your `~/.m2` directory before doing the build.
2. Check the size of the output binary tarball for significant size increase from the last release.
    - A significant increase in size could indicate a dependency issue that needs to be fixed.
    - The Apache svn repo has a size limit for release artifacts. If uploading svn fails because the tarball is too big, we need to contact INFRA to increase our repo size. [See here for details.](https://issues.apache.org/jira/browse/INFRA-23892)
3. Verify signatures
    - Download the KEYS file from https://dist.apache.org/repos/dist/release/ozone/KEYS
    - Import its contents (which should include your public GPG key):

      ```bash
      gpg --import KEYS
      ```

    - Verify each .tar.gz artifact:

      ```bash
      for x in *.tar.gz; do gpg --verify $x.asc $x; done
      ```

4. Verify checksums
    - For each artifact, verify that the checksums given by the `shasum` command match the contents of the .sha512 file and the SHA512 line in its .mds file.

        ```bash
        shasum -a 512 *.tar.gz
        ```

5. Make sure docs are present in the release tarball
   - Extract the release and open docs/index.html in your web browser, and check that the documentation website looks ok.
6. Run `bin/ozone version` from the extracted release tarball. The output of this command should contain:
    - The correct release
    - The correct national park tag
    - A non-snapshot version of Ratis.
    - A link to the [apache/ozone](https://github.com/apache/ozone) GitHub repository (not your fork).
    - The git hash of the last commit the release was built on.
7. Run the upgrade compatibility acceptance tests by running `test.sh` from the `compose/upgrade` directory in the extracted release tarball.
    :::note
    The `test.sh` file committed to the master branch only checks upgrade compatibility against the last released Ozone version to save build time. Compatibility with all past versions should be checked by uncommenting all `run_test` lines in the `test.sh` file before running it. This test matrix may take a long time to run, so it might be better to run it on GitHub Actions instead of locally.
    :::

### Upload the Artifacts to Dev Staging

1. Upload everything from the `$RELEASE_DIR` to the dev staging area.

    ```bash
    svn checkout https://dist.apache.org/repos/dist/dev/ozone
    cd ozone
    mkdir "$VERSION-rc$RC"
    cp -v "$RELEASE_DIR"/* "$VERSION-rc$RC"/
    svn add "$VERSION-rc$RC"
    svn commit -m "Ozone $VERSION RC$RC"
    ```

2. Check the results by opening the [dev directory](https://dist.apache.org/repos/dist/dev/ozone/) in your browser.

### Push the Release Candidate Tag to GitHub

```bash
git push origin "ozone-$VERSION-RC$RC"
```

## Vote

Send a vote email to the dev@ozone.apache.org mailing list. Include the following items in the email:

- Link to the release candidate tag on Github
- Link to a Jira query showing all resolved issues for this release. Something like [this](https://issues.apache.org/jira/issues/?jql=project%20%3D%20HDDS%20AND%20status%20in%20(Resolved%2C%20Closed)%20AND%20fixVersion%20%3D%202.0.0).
- Location of the source and binary tarballs. This link will look something like https://dist.apache.org/repos/dist/dev/ozone/2.0.0-rc0
- Location where the Maven artifacts are staged. This link will look something like https://repository.apache.org/content/repositories/orgapacheozone-1029/
- Link to the public key used to sign the artifacts. This should always be in the KEYS file and you can just link to that: https://dist.apache.org/repos/dist/release/ozone/KEYS
- Fingerprint of the key used to sign the artifacts.

If no issues are found with the artifacts, let the vote run for 7 days. Review the [ASF wide release voting policy](https://www.apache.org/legal/release-policy.html#release-approval), and note the requirements for binding votes which can only come from PMC members. Sometimes responders will not specify whether their vote is binding. If in doubt check the [ASF committer index](https://people.apache.org/committer-index.html). Users whose group membership includes `ozone-pmc` can cast binding votes.

Once voting is finished, send an email summarizing the results (binding +1s, non-binding +1s, -1s, 0s) and, if the vote passed, indicate that the release artifacts will be published.

### If Release Candidate has Problems

If an issue is found with the artifacts:

1. Remove the abandoned release candidate from Subversion.

    ```bash
    svn delete -m "Abandon Ozone $VERSION RC$RC" https://dist.apache.org/repos/dist/dev/ozone/"$VERSION-rc$RC"
    ```

2. Discard the staging repository at https://repository.apache.org/#stagingRepositories
3. Apply fixes to the release branch.
4. Repeat the steps starting from [Tag the Commit for the Release Candidate](#tag-the-commit-for-the-release-candidate) with the `$RC` variable incremented by 1 for all steps.

## After-Vote

### Publish the Artifacts

If you are a PMC member, move artifacts in Subversion to the final location, otherwise ask the PMC to do the same:

```bash
svn mv -m "Release ozone-$VERSION-rc$RC as ozone-$VERSION" \
  https://dist.apache.org/repos/dist/dev/ozone/"$VERSION-rc$RC" \
  https://dist.apache.org/repos/dist/release/ozone/"$VERSION"
```

To publish the artifacts to [Maven Central](https://central.sonatype.com), login to https://repository.apache.org/#stagingRepositories, select your **staging** repository and **release** it.

### Write a Haiku

Check the tag from the [Ozone Roadmap](https://cwiki.apache.org/confluence/display/OZONE/Ozone+Roadmap) page (it's a national park).
Find a photo which is under the CC license.
Write a haiku to the photo with Future font.

### Update the Ozone Website

1. Create release notes and add them to the Ozone website with your haiku image. An example pull request showing how to do this is [here](https://github.com/apache/ozone-site/pull/17). Note that the target branch is `master`. Please write the release notes in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. In particular, make sure it is human readable and not a simple commit log diffs.
2. Extract the docs folder from the release tarball, and add its contents to the website. An example pull request for this is [here](https://github.com/apache/ozone-site/pull/18). Note that the target branch is `asf-site` , and that the `docs/current` symlink has been updated to point to the latest release's directory.
3. Test the website locally by running `hugo serve` from the repository root with the master branch checked out. Check that links for the new release are working. Links to the documentation will not work until the PR to the `asf-site` branch is merged.

### Add the Final Git Tag and Push It

```bash
git checkout "ozone-$VERSION-RC$RC"
git tag -s "ozone-$VERSION" -m "Ozone $VERSION release"
git push origin "ozone-$VERSION"
```

### Update GitHub Releases page

Update the [GitHub Releases](https://github.com/apache/ozone/releases/new) page with the release information. See the [1.4.1 Release page](https://github.com/apache/ozone/releases/tag/ozone-1.4.1) for an example.

### Publish a Docker Image for the Release

The Ozone Docker image is intended for testing purposes only, not production use. An example pull request to update the Docker image is [here](https://github.com/apache/ozone-docker/pull/22/files). The target branch for your pull request should be `latest`. After the pull request is merged, it can be published to [Docker Hub](https://hub.docker.com/r/apache/ozone) by updating the branches that correspond to [Docker image tags](https://hub.docker.com/r/apache/ozone/tags).

1. Publish the image with the `latest` tag by fast-forwarding the `ozone-latest` branch to match the `latest` branch.

    ```bash
    git checkout ozone-latest
    git pull
    git merge --ff-only origin/latest
    git push origin ozone-latest
    ```

2. Publish the image with a version specific tag by creating a new branch with a name like `ozone-1.5.0` (replace this with the current version) from the `latest` branch and push it to [GitHub](https://github.com/apache/ozone-docker).

    ```bash
    git checkout ozone-latest
    git checkout -b "ozone-$VERSION"
    git push origin "ozone-$VERSION"
    ```

### Update Helm Chart (Optional)

Once Docker Image is published, we can also update Helm Chart. Check out this [Pull Request](https://github.com/apache/ozone-helm-charts/pull/11) for an example.

### Update Acceptance Tests on the Master Branch

Update the upgrade and client cross compatibility acceptance tests to check against the new release. See [this pull request](https://github.com/apache/ozone/pull/6040/files) for an example.
:::note
This step requires the release's [Docker image](#publish-a-docker-image-for-the-release) to be published.
:::

### Update the Ozone Roadmap

1. Update the [Ozone Roadmap](https://cwiki.apache.org/confluence/display/OZONE/Ozone+Roadmap) so that the release notes for the just completed release are correct.

2. Move its row to the `Past Releases` section.

3. Create a row for the next release in the `Upcoming Releases` section, and add planned features that you are aware of.

### Write an Announcement Mail to the Ozone Mailing Lists

Include the following links:

- Release notes: https://ozone.apache.org/release/1.2.0/. Replace the version in the URL with the version being released.
- Download link: https://ozone.apache.org/downloads/
- Link to versioned documentation: https://ozone.apache.org/docs/

## Patch Release

If there is a security vulnerability or critical bug uncovered in a major or minor Ozone release, a patch release may be necessary to fix this. The process is a bit simpler than a major or minor release, since there is already a solid foundation on the release's maintenance branch.

1. Cherry pick the fix(es) on to the maintenance branch. For example, for Ozone's 1.2.0 release, this is the branch called `ozone-1.2`.

2. Run all steps from the sections [Update the Versions](#update-the-ozone-version-on-the-release-branch) through [Publish a Docker Image for the Release](#publish-a-docker-image-for-the-release), with the following modifications:
    - Do not update the protolock files unless protocol buffers were changed as part of the fix.
    - When updating the website, all instances of the original major/minor release should be replaced with this patch version, since we do not want users downloading the original release anymore.
      - For example, any website text referring to 1.2.0 should be changed to refer to 1.2.1.
      - Continuing the 1.2.0 to 1.2.1 example, the release/1.2.0 page should redirect to release/1.2.1.
      - An example pull request to do this is [here](https://github.com/apache/ozone-site/pull/23).
      - The docs can be added to the website normally as described above in [Update the Ozone Website](#update-the-ozone-website). The docs link for the original major/minor release can remain alongside the docs link for the patch release.
    - In the event of a critical security vulnerability or seriously harmful bug with a small set of changes in the patch, PMC members may vote to forgo the usual 72 hour minimum time for a release vote and publish once there are enough binding +1s.

3. Remove the previous release that this patch release supersedes from the Apache distribution site:

    ```bash
    svn rm -m 'Ozone: delete old version 1.2.0' https://dist.apache.org/repos/dist/release/ozone/1.2.0
    ```

## Update This Document

After finishing the release process, update this page to fix any mistakes, unclear steps, or outdated information.
