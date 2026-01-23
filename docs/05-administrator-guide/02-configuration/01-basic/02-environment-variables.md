---
sidebar_label: Environment Variables
---

# Environment Variables

The `ozone-env.sh` script, located at `$OZONE_HOME/etc/hadoop`, defines the environment variables used by Ozone processes.

> Note: The following list is not exhaustive but includes the most commonly used environment variables.

## Common Environment Variables

These environment variables apply to all Ozone processes.

| Variable           | Default Value                      | Description                                                                                                       |
| :----------------- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `JAVA_HOME`        | (none)                             | The path to the Java installation. Must be set on most platforms, but is auto-detected on macOS.                  |
| `OZONE_HOME`       | Auto-detected from script location | The path to the Ozone installation directory.                                                                     |
| `OZONE_CONF_DIR`   | `$OZONE_HOME/etc/hadoop`           | The directory containing Ozone configuration files.                                                               |
| `OZONE_LOG_DIR`    | `$OZONE_HOME/logs`                 | The directory where Ozone log files are stored.                                                                   |
| `OZONE_PID_DIR`    | `/tmp`                             | The directory where daemon PID files are stored.                                                                  |
| `OZONE_OPTS`       | `-Djava.net.preferIPv4Stack=true`  | Universal Java options applied to all Ozone processes.                                                            |
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

:::note HttpFS Gateway Configuration
The HttpFS Gateway does not use an `OZONE_HTTPFS_OPTS` variable. Its specific JVM properties must be added to the global `OZONE_OPTS` variable.
:::

## Configuration Methods

There are several ways to set these environment variables, depending on your needs.

### System-Wide Configuration

For multi-user environments, creating a system-wide profile file ensures that variables are set for all users. A common practice is to create a file in `/etc/profile.d/`, which is loaded by most shells on login.

**Example for `/etc/profile.d/ozone.sh`:**
```bash
export JAVA_HOME="$(/usr/libexec/java_home)"
export OZONE_HOME=/opt/ozone
export OZONE_CONF_DIR=/etc/ozone
```
After creating this file, users must log out and log back in for the changes to take effect.

### User-Specific Configuration

If you only need to set variables for a single user, you can add them to their personal shell profile.

- For Bash users, add to `~/.bashrc` or `~/.bash_profile`.
- For Zsh users, add to `~/.zshrc`.
- For other shells, consult their documentation.

**Example for `~/.bashrc`:**
```bash
export OZONE_HOME=/opt/ozone
export OZONE_CONF_DIR=/etc/ozone
```
After editing, you must reload the profile (e.g., `source ~/.bashrc`) or open a new shell session.

### Per-Command Configuration

For quick tests or one-off commands, you can set an environment variable for a single command's execution.

```bash
OZONE_HEAPSIZE_MAX=16G ozone sh volume create /vol1
```

