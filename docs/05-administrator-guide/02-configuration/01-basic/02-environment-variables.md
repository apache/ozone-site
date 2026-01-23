---
sidebar_label: Environment Variables
---

# Environment Variables

The `ozone-env.sh` script, located at `$OZONE_HOME/etc/hadoop`, defines the environment variables used by Ozone processes.

## Required Environment Variables

The only required environment variable is `JAVA_HOME`.

## Common Environment Variables

Some environment variables apply to all Ozone processes:

*   `JAVA_HOME`: The path to the Java installation.
*   `OZONE_HOME`: The path to the Ozone installation directory.
*   `OZONE_CONF_DIR`: The directory containing Ozone configuration files.
*   `OZONE_LOG_DIR`: The directory where Ozone log files are stored.
*   `OZONE_HEAPSIZE_MAX`: The maximum heap size for Ozone processes.
*   `OZONE_HEAPSIZE_MIN`: The minimum heap size for Ozone processes.

## Service-Specific Environment Variables

Other environment variables apply only to certain services:

*   `OZONE_CLIENT_OPTS`: Specifies Java properties for Ozone commands and clients.
*   `OZONE_OM_OPTS`: Specifies Java properties for the Ozone Manager (OM).
*   `OZONE_SCM_OPTS`: Specifies Java properties for the Storage Container Manager (SCM).
*   `OZONE_DATANODE_OPTS`: Specifies Java properties for Datanodes.
*   `OZONE_S3G_OPTS`: Specifies Java properties for the S3 Gateway.
*   `OZONE_RECON_OPTS`: Specifies Java properties for the Recon server.

## System-wide Configuration

Instead of updating `ozone-env.sh` directly, you can create a system-wide profile file, for example `/etc/profile.d/ozone.sh`. Here is an example:

```bash
export JAVA_HOME="$(/usr/libexec/java_home)"
export OZONE_HOME=/opt/ozone
export OZONE_CONF_DIR=/etc/ozone/conf
```