---
sidebar_label: Environment Variables
---

# Environment Variables

The `ozone-env.sh` script, located at `$OZONE_HOME/etc/hadoop`, defines the environment variables used by Ozone processes.

> Note: The following list is not exhaustive but includes the most commonly used environment variables.

Below is a list of environment variables that can be used to configure Apache Ozone processes.

## Common Environment Variables

These environment variables apply to all Ozone processes.

| Variable           | Default Value                      | Description                                                                                                       |
| :----------------- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `JAVA_HOME`        | (none)                             | The path to the Java installation. Must be set on most platforms, but is auto-detected on macOS.                  |
| `OZONE_HOME`       | Auto-detected from script location | The path to the Ozone installation directory.                                                                     |
| `OZONE_CONF_DIR`   | `$OZONE_HOME/etc/hadoop`           | The directory containing Ozone configuration files.                                                               |
| `OZONE_LOG_DIR`    | `$OZONE_HOME/logs`                 | The directory where Ozone log files are stored.                                                                   |
| `OZONE_PID_DIR`    | `/tmp`                             | The directory where daemon PID files are stored.                                                                  |
| `OZONE_OPTS`       | `"-Djava.net.preferIPv4Stack=true"`| Universal Java options applied to all Ozone processes.                                                            |
| `OZONE_HEAPSIZE_MAX`| (JVM default)                      | The maximum JVM heap size (`-Xmx`). If not set, the JVM auto-scales.                                              |
| `OZONE_HEAPSIZE_MIN`| (JVM default)                      | The minimum JVM heap size (`-Xms`). If not set, the JVM auto-scales.                                              |

## Role-Specific Environment Variables

These environment variables apply only to certain Ozone services or roles.

| Variable           | Default Value                      | Description                                                                                                       |
| :----------------- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `OZONE_SERVER_OPTS`| (none)                             | Options for all Ozone server daemons (appended to `OZONE_OPTS`).                                                  |
| `OZONE_CLIENT_OPTS`| (empty)                            | Specifies Java properties for Ozone commands and clients.                                                         |
| `OZONE_OM_OPTS`    | (empty)                            | Specifies Java properties for the Ozone Manager (OM).                                                             |
| `OZONE_SCM_OPTS`   | (empty)                            | Specifies Java properties for the Storage Container Manager (SCM).                                                |
| `OZONE_DATANODE_OPTS`| (empty)                            | Specifies Java properties for Datanodes.                                                                          |
| `OZONE_S3G_OPTS`   | (empty)                            | Specifies Java properties for the S3 Gateway.                                                                     |
| `OZONE_RECON_OPTS` | (empty)                            | Specifies Java properties for the Recon server.

> Note: The HTTPFS Gateway does not use an OZONE_HTTPFS_OPTS variable. Its specific JVM properties must be added to the global OZONE_OPTS variable.

> Connecting to an HA SCM Cluster: Most Ozone commands connect to the SCM by reading the service ID from ozone-site.xml. However, some administrative and debug commands (like ozone admin scm ...) also accept a `--service-id` command-line option to override the configuration.

## System-wide Configuration

Instead of updating `ozone-env.sh` directly, you can create a system-wide profile file, for example `/etc/profile.d/ozone.sh`. Here is an example:

```bash
export JAVA_HOME="$(/usr/libexec/java_home)"
export OZONE_HOME=/opt/ozone
export OZONE_CONF_DIR=/etc/ozone
```
