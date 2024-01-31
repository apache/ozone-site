---
sidebar_label: Release Manager Guide
---

# Apache Release Manager Guide

This document describes the process to release Apache Ozone. The process is not yet scripted, and the documentation is **a work in progress**.

## Pre-Requisites

### Install Required Packages

In addition to the usual development tools required to work on Ozone, the following packages are required during the release process:
  - [Subversion](https://subversion.apache.org/) to publish release artifacts and GPG keys.
  - [GnuPG](https://www.gnupg.org/) to manage your GPG keys.
  - [protolock](https://github.com/nilslice/protolock) to manage protocol buffer compatibility.

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
export CODESIGNINGKEY=your_gpg_key_id
gpg --list-sigs $CODESIGNINGKEY >> KEYS
gpg --armor --export $CODESIGNINGKEY >> KEYS
svn commit -m "ozone: adding key of <your_name> to the KEYS"
```

```bash title="Move Key (PMC)"
svn cp -m "ozone: adding key of <name> to the KEYS" https://dist.apache.org/repos/dist/dev/ozone/KEYS https://dist.apache.org/repos/dist/release/ozone/KEYS
```

## Pre-Vote

### Create a Parent Jira for the Release

This provides visibility into the progress of the release for the community. Tasks mentioned in this guide like cherry-picking fixes on to the release branch, updating the ozone website, publishing the docker image, etc can be added as subtasks.

### Bulk Comment on Jiras Targeting This Release

Issue a Jira query like [this](https://issues.apache.org/jira/browse/HDDS-4183?jql=project%20%3D%20HDDS%20AND%20resolution%20%3D%20Unresolved%20AND%20(cf%5B12310320%5D%20%3D%201.3.0%20OR%20fixVersion%20%3D%201.3.0)%20ORDER%20BY%20priority%20DESC%2C%20updated%20DESC), modified for the release number you are working with, to find all unresolved Jiras that have the target version field set to this release. Note that some people incorrectly use Fix Version as the Target Version, so Fix Version is included in this search. Use the following steps to issue a bulk update to these Jiras:

 1. In the top right corner, click `Tools` and under `Bulk Change` , select `all ... issues`.
 2. Click the top check box to select all the issues. Click `Next`.
 3. Select `Edit Issues` , then click `Next`.
 4. Select `Change Fix Version/s` , and in the drop down select `Clear field`.
    :::note
    This corrects unresolved issues which incorrectly set a fix version for this release.
 5. Select `Change Target Version/s`, and enter the version of the release after the one you are managing.
 6. Select `Change Comment`, and add a comment saying that you have moved the release field out, but if the issue is being actively worked on, is close to completion, and would like to be included in this release, to contact you by a given date, probably a week in the future.
    :::note
    Even though the action is called `Change Comment`, it actually adds a comment to the Jira and does not affect existing comments.
 7. Keep clicking through until the operation is started. It may take a while for Jira to finish the bulk update once it is started.

### Create a Release Branch

After the date specified in the Jira comments has passed and blocking issues have been resolved, you can create a release branch in the [apache/ozone](https://github.com/apache/ozone) Github repo. Name the branch after the major and minor version of the release, so patch releases can also be done off this branch. For example, If releasing 1.2.0, create a branch called `ozone-1.2` . All release related changes will go to this branch until the release is complete, after which some changes mentioned below will be cherry picked to `master`.

### Set Up Local Environment

The following variables will be referenced in commands.

```bash
export VERSION=1.1.0 # Set to the version of ozone being released.
export RELEASE_DIR=~/ozone-release/ # ozone-release needs to be created
export CODESIGNINGKEY=<your_gpg_key_id>
export RC=0 # Set to the number of the current release candidate, starting at 0.
```

It is probably best to clone a fresh ozone repository locally to work on the release, and leave your existing repository intact for dev tasks you may be working on simultaneously. After cloning, make sure the git remote for the apache/ozone upstream repo is named `origin`. This is required for release build metadata to be correctly populated. Assume all following commands are executed from within this repo with your release branch checked out.

### Reset the Git Repository

```bash
git reset --hard
git clean -dfx
```

### Update the Versions

Use the commands below or your IDE to replace `$VERSION-SNAPSHOT` with `$VERSION`.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="linux" label="Linux">
```bash title="Update the Versions"
find . -name pom.xml -type f | xargs sed -i "s/$VERSION-SNAPSHOT/$VERSION/g"
```
</TabItem>
<TabItem value="mac" label="Mac">
```bash title="Update the Versions (Mac)"
find . -name pom.xml -type f -print0 | xargs -0 sed -i '' "s/$VERSION-SNAPSHOT/$VERSION/g"
```
</TabItem>
</Tabs>

```bash title="Commit the Version Changes "
git commit -am "Update Ozone version to $VERSION"
```

### Build and Commit the `proto.lock` Change

Protolock files are used to check backwards compatibility of protocol buffers between releases. The ozone build checks protocol buffers against these lock files and fails if an incompatibility is detected. They should be updated for each release, and require [protolock](https://github.com/nilslice/protolock) to be installed. Save and run the following script from your ozone repo root, and then commit the changed files to git. Double check that only files called `proto.lock` are being committed, and that the changes to the files makes sense based on new features added in this release.

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

- Commit changes to the `proto.lock` files.

```bash
git commit -m "update proto.lock for Ozone $VERSION"
```

### Tag the Commit for the Release Candidate

This will sign the tag with the gpg key matching the git mailing address. Make sure that the email given by `git config user.email` matches the email for the key you want to use shown by `gpg --list-secret-keys`.

```bash
git tag -s "ozone-$VERSION-RC$RC"
```

If the command fails on MacOS, you may need to do the following additional steps:
- Install a program to prompt you for your gpg key passphrase (example using homebrew): `brew install pinentry-mac`
- Tell git to use this program for signing:`git config --global gpg.program "$(which gpg)"`
- Tell git which key to sign with: `git config --global user.signingKey <gpg_key_id>`
- Tell gpg to use this program to prompt for passphrase: `echo "pinentry-program $(which pinentry-mac)" > ~/.gnupg/gpg-agent.conf`
- Reload gpg-agent: `gpgconf --kill gpg-agent`

### Create the Release Artifacts

- Run rat check and ensure there are no failures.
    ```bash
    ./hadoop-ozone/dev-support/checks/rat.sh
    ```
- Clean the Repo of all Rat output
    ```bash
    git reset --hard
    git clean -dfx
    ```
- Build the Release Tarballs. Make sure you are using GNU-tar instead of BSD-tar.
    ```bash
    mvn clean install -Dmaven.javadoc.skip=true -DskipTests -Psign,dist,src -Dtar -Dgpg.keyname="$CODESIGNINGKEY"
    ```
- Now that we have built the release artifacts, we will copy them to the release directory.
    ```bash
    cp hadoop-ozone/dist/target/ozone-*.tar.gz "$RELEASE_DIR"/
    ```

### Calculate the Checksum and Sign the Artifacts

Run the following commands to generate checksum files for all release artifacts:

```bash
cd "$RELEASE_DIR"
for i in $(ls -1 *.tar.gz); do gpg -u "$CODESIGNINGKEY" --armor --output "$i.asc" --detach-sig "$i"; done

for i in $(ls -1 *.tar.gz); do sha512sum "$i" > "$i.sha512"; done

for i in $(ls -1 *.tar.gz); do gpg --print-mds "$i" > "$i.mds"; done
```

Now each .tar.gz file should have an associated .mds file, .asc file, and .sha512 file

### Check the Artifacts

Before uploading the artifacts, run some basic tests on them, similar to what other devs will run before voting in favor of the release.

1. Extract the contents of the source tarball and build it with an empty maven cache by renaming your `~/.m2` directory before doing the build.
2. Check the size of the output binary tarball for significant size increase from the last release.
  - A significant increase in size could indicate a dependency issue that needs to be fixed.
  - The Apache svn repo has a size limit for release artifacts. If uploading svn fails because the tarball is too big, we need to contact INFRA to increase our repo size. [See here for details.](https://issues.apache.org/jira/browse/INFRA-23892)
3. Verify signatures
  - Download the KEYS file from [https://dist.apache.org/repos/dist/release/ozone/KEYS](https://dist.apache.org/repos/dist/release/ozone/KEYS)
  - Import its contents (which should include your public gpg key): `gpg --import KEYS`
  - Verify each .tar.gz artifact: `gpg --verify <artifact>.tar.gz.asc <artifact>.tar.gz`
4. Verify checksums
  - Run `shasum -a 512 *.tar.gz`
  - Verify that the output checksums for each artifact match the contents of its .sha512 file and the SHA512 line in its .mds file.
5. Make sure docs are present in the release tarball
  - There should be a directory called docs in the top level. If there is not, then `hugo` was not installed during the build and it must be re-done.
  - Extract the release and open docs/index.html in your web browser, and check that the documentation website looks ok.
6. Check the output of running `bin/ozone version` from the extracted release tarball
  - After extracting the release, the output of this command should contain:
    - The correct release
    - The correct national park tag
    - A non-snapshot version of Ratis.
    - A link to the apache/ozone GitHub repository (not your fork).
    - The git hash of the last commit the release was built on.
7. Run the Ozone upgrade acceptance tests by running `test.sh` from the compose/upgrade directory in the extracted release tarball.
  - This check is also run by the GitHub actions CI for each commit, so it should pass with no surprises.

### Upload the Artifacts Dev Staging Area

- Upload everything from the `$RELEASE_DIR` to the dev staging area.

```bash
svn mkdir https://dist.apache.org/repos/dist/dev/ozone/"$VERSION-rc$RC"
svn co https://dist.apache.org/repos/dist/dev/ozone/"$VERSION-rc$RC"
cp "$RELEASE_DIR"/* "$VERSION-rc$RC"
cd "$VERSION-rc$RC"
svn add *
svn commit -m "Ozone $VERSION RC$RC"
```

- Check the results using your browser by connecting to [https://dist.apache.org/repos/dist/dev/ozone/](https://dist.apache.org/repos/dist/dev/ozone/)

### Upload the Artifacts to Apache Nexus

Double check that your apache credentials are added to your local `~/.m2/settings.xml`.

```xml title="settings.xml"
<settings>
  <servers>
	<server>
      <id>apache.snapshots.https</id>
      <username>your_apache_id</username>
      <password>your_apache_password</password>
    </server>
    <!-- To stage a release of some part of Maven -->
    <server>
      <id>apache.staging.https</id>
      <username>your_apache_id</username>
      <password>your_apache_password</password>
	</server>
  </servers>
</settings>
```

Return to your Ozone repository being used for the release, and run the following command to upload the release artifacts:

```bash
mvn deploy -Psign -pl '!:ozone-dist' -DskipTests -Dbuildhelper.skipAttach
```

Go to https://repository.apache.org/#stagingRepositories and **close** the newly created `orgapacheozone` repository.

### Push the Release Candidate Tag to GitHub

```bash
git push origin "ozone-$VERSION-RC$RC"
```

## Vote

Send a vote email to the dev@ozone.apache.org mailing list. Include the following items in the email:

- Link to the release candidate tag on Github
- Link to a Jira query showing all resolved issues for this release. Something like [this](https://issues.apache.org/jira/issues/?jql=project%20%3D%20HDDS%20AND%20status%20in%20(Resolved%2C%20Closed)%20AND%20fixVersion%20%3D%201.4.0).
- Location of the source and binary tarballs. This link will look something like https://dist.apache.org/repos/dist/dev/ozone/1.2.0-rc0
- Location where the maven artifacts are staged. This link will look something like [https://repository.apache.org/content/repositories/orgapacheozone-1001/](https://repository.apache.org/content/repositories/orgapacheozone-1001/)
- Link to the public key used to sign the artifacts. This should always be in the KEYS file and you can just link to that: [https://dist.apache.org/repos/dist/dev/ozone/KEYS](https://dist.apache.org/repos/dist/dev/ozone/KEYS)
- Fingerprint of the key used to sign the artifacts.

If no issues are found with the artifacts, let the vote run for 7 days. Review the [ASF wide release voting policy](https://www.apache.org/legal/release-policy.html#release-approval), and note the requirements for binding votes which can only come from PMC members. Sometimes responders will not specify whether or not their vote is binding. If in doubt check [The ASF committer index](https://people.apache.org/committer-index.html). Users whose group membership includes `ozone-pmc` can cast binding votes.

Once voting is finished, send an email summarizing the results (binding +1s, non-binding +1s, -1s, 0s) and, if the vote passed, indicate that the release artifacts will be published. If an issue is found with the artifacts, apply fixes to the release branch and repeat the steps starting from [Tag the Commit for the Release Candidate](#tag-the-commit-for-the-release-candidate) with the `$RC` variable incremented by 1 for all steps.

## After-Vote

### Publish the Artifacts

You should commit the artifacts to the SVN repository. If you are not a PMC member you can commit it to the dev zone first and ask a PMC for the final move.

Checkout the svn folder and commit the artifacts to a new directory.

```bash
svn checkout https://dist.apache.org/repos/dist/dev/ozone
cd ozone
svn mkdir "$VERSION"
cp "$RELEASE_DIR"/* "$VERSION"/
svn add "$VERSION"/*
svn commit -m "Added ozone-$VERSION directory"
```

PMC members can move it to the final location:

```bash
svn mv -m "Move ozone-$VERSION to release" https://dist.apache.org/repos/dist/dev/ozone/"$VERSION" https://dist.apache.org/repos/dist/release/ozone/"$VERSION"
```

To publish the artifacts to [Maven Central](https://central.sonatype.com), login to https://repository.apache.org/#stagingRepositories, select your **staging** repository and **release** it.

### Write a Haiku

Check the tag from the [Ozone Roadmap](https://cwiki.apache.org/confluence/display/OZONE/Ozone+Roadmap) page (it's a national park).
Find a photo which is under the CC license.
Write a haiku to the photo with Future font.

### Update the Ozone Website

- Create release notes and add them to the Ozone website with your haiku image. An example pull request showing how to do this is [here](https://github.com/apache/ozone-site/pull/17). Note that the target branch is `master`.
- Extract the docs folder from the release tarball, and add its contents to the website. An example pull request for this is [here](https://github.com/apache/ozone-site/pull/18). Note that the target branch is `asf-site` , and that the docs/current symlink has been updated to point to the latest release's directory.
- Test the website locally by running `hugo serve` from the repository root with the master branch checked out. Check that links for the new release are working. Links to the documentation will not work until the PR to the `asf-site` branch is merged.

### Add the Final Git Tag and Push It

```bash
git checkout "ozone-$VERSION-RC$RC"
git tag -s "ozone-$VERSION" -m "Ozone $VERSION release"
git push origin "ozone-$VERSION"
```

### Update the Master Branch

- Cherry pick your commit updating the protolock files to a branch on your fork, and merge it to master with a pull request.
- Update the Ozone SNAPSHOT version and national park tag on master with a pull request. Here you will pick the [national park](https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States) to use for the next release of Ozone and set it in the project's top level pom at `<ozone.release>`. See [this pull request](https://github.com/apache/ozone/pull/2863) for an example.

### Update the Ozone Roadmap

- Update the [Ozone Roadmap](https://cwiki.apache.org/confluence/display/OZONE/Ozone+Roadmap) so that the release notes for the just completed release are correct.
- Move its row to the `Past Releases` section.
- Create a row for the next release in the `Upcoming Releases` section, and add planned features that you are aware of.

### Write an Announcement Mail to the Ozone Mailing Lists

Include the following links:

- Release notes: [https://ozone.apache.org/release/1.2.0/](https://ozone.apache.org/release/1.2.0/). Replace the version in the URL with the version being released.
- Download link: [https://ozone.apache.org/downloads/](https://ozone.apache.org/downloads/)
- Link to versioned documentation: [https://ozone.apache.org/docs/](https://ozone.apache.org/docs/)

### Publish a Docker Image for the Release

The Ozone docker image is intended for testing purposes only, not production use. Therefore, it is ok to update this after announcing the release. An example pull request to update the docker image is [here](https://github.com/apache/ozone-docker/pull/22/files). The target branch for your pull request should be `latest`. After the pull request is merged, it can be published to [Docker Hub](https://hub.docker.com/r/apache/ozone) by updating the branches that correspond to [docker image tags](https://hub.docker.com/r/apache/ozone/tags).

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

## Patch Release

If there is a security vulnerability or critical bug uncovered in a major or minor Ozone release, a patch release may be necessary to fix this. The process is a bit simpler than a major or minor release, since there is already a solid foundation on the release's maintenance branch.

1. Cherry pick the fix(es) on to the maintenance branch. For example, for Ozone's 1.2.0 release, this is the branch called `ozone-1.2`.

2. Run all steps from the sections [Update the Versions](#update-the-versions) through [Publish a Docker Image for the Release](#publish-a-docker-image-for-the-release), with the following modifications:
  - Do not update the protolock files unless protocol buffers were changed as part of the fix.
  - When updating the website, all instances of the original major/minor release should be replaced with this patch version, since we do not want users downloading the original release anymore.
    - For example, any website text referring to 1.2.0 should be changed to refer to 1.2.1.
    - Continuing the 1.2.0 to 1.2.1 example, the release/1.2.0 page should redirect to release/1.2.1.
    - An example pull request to do this is [here](https://github.com/apache/ozone-site/pull/23).
    - The docs can be added to the website normally as described above in [Update the Ozone Website](#update-the-ozone-website). The docs link for the original major/minor release can remain alongside the docs link for the patch release.
   - In the event of a critical security vulnerability or seriously harmful bug with a small set of changes in the patch, PMC members may vote to forgo the usual 72 hour minimum time for a release vote and publish once there are enough binding +1s.

3. Remove the previous release that this patch release supercedes from the Apache distribution site:

```bash
svn rm -m 'Ozone: delete old version 1.2.0' https://dist.apache.org/repos/dist/release/ozone/1.2.0
```

## Update This Document

After finishing the release process, update this page to fix any mistakes, unclear steps, or outdated information.