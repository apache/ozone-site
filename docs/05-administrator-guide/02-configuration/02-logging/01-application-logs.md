---
sidebar_label: Application Logs
---

# Configuring Application Logs

## Service Logs

Each Ozone service (Ozone Manager, Storage Container Manager, Datanode, S3 Gateway, and Recon) generates its own log file. These logs contain detailed information about the service’s operations, including errors and warnings.

By default, log files are stored in the `$OZONE_LOG_DIR` directory, which is usually set to the `logs` directory under the Ozone installation. The log file names are specific to each service, for example:

- `ozone-om-....log` for Ozone Manager
- `ozone-scm-....log` for Storage Container Manager
- `ozone-datanode-....log` for Datanode

The logging behavior for each service is controlled by its `log4j.properties` file, located in the service’s `$OZONE_CONF_DIR` directory, usually `etc/hadoop`. You can modify this file to change the log level, appenders, and other logging parameters.

## Debugging

You can increase the log verbosity for debugging purposes for both services and CLI tools.

### Enabling Debug Logs for Services

To enable debug logging for a service, you need to modify its `log4j.properties` file. Change the log level for the desired logger from `INFO` to `DEBUG`. For example, to enable debug logging for the Ozone Manager, you would edit its `log4j.properties` and change the following line:

```properties
rootLogger.level = info
```

to

```
rootLogger.level = debug
```

After saving the file and restarting the service, the service will start logging more detailed debug information.

### Enabling Debug Logs for CLI Tools

To enable debug logging for Ozone CLI tools (e.g., `ozone sh volume create`), you can set the `OZONE_ROOT_LOGGER` environment variable to `debug`:

```bash
export OZONE_ROOT_LOGGER=DEBUG,console
ozone sh volume create /vol1
```

Alternatively, you can use the --loglevel option with the ozone command:

```bash
ozone --loglevel debug sh volume create /vol1
```
