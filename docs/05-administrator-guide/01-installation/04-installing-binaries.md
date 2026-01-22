# Installing the Ozone Binaries

This section outlines the steps to obtain and install the Apache Ozone binaries on your hosts.

## Identify Hosts

First, identify the hosts where Ozone will be installed. The installation steps described below should be performed on each designated host.

## Obtain Binaries

To obtain the Ozone binaries, you have two primary options:

1. **Official Apache Ozone Releases**:
    For official releases, navigate to the [Downloads page](/download) to get the released binary tarball. Follow the instructions to verify the integrity of the tarball.

2. **Build from Source**:
    Alternatively, you can build Ozone from its source code. Follow the detailed instructions in the [Developer Guide: Building Ozone With Maven](../../08-developer-guide/01-build/01-maven.md).

### Untar the Tarball (for released binaries)

If you downloaded a binary tarball, untar it to your desired installation path:

```bash
tar zxvf ozone-<version>.tar.gz -C /path/to/ozone
```

### RPM or DEB Packages

To use an RPM or DEB package, execute the appropriate command:

For RPM:

```bash
rpm -ivh ozone-<version>-1.noarch.rpm
```

For DEB:

```bash
apt install ozone_<version>-<linux_distro>_.deb
```
