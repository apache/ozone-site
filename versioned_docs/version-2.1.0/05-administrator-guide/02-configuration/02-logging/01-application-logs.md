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

The logging behavior for each service is controlled by its `log4j.properties` file, located in the service’s `$OZONE_CONF_DIR` directory, usually `etc/hadoop`. You can modify this file to change the log level, logging outputs, and other logging parameters.

## Datanode Container Logs

In addition to the main service log, Datanode also generates container-specific logs that track container replica-level events. These logs record brief messages about container state changes (open, closing, closed, unhealthy), replication events, reconstruction, reconciliation, container moves, and other container lifecycle events.

Container logs are configured via `dn-container-log4j2.properties` and are stored as `dn-container-${hostName}.log` in the `$OZONE_LOG_DIR` directory.

### Example

```text
2026-02-01 16:08:59,261 | INFO  | ID=2 | Index=0 | BCSID=0 | State=OPEN | Volume=/hadoop-ozone/datanode/data/hdds | DataChecksum=0 |
2026-02-03 12:49:36,139 | INFO  | ID=2 | Index=0 | BCSID=1172 | State=CLOSING | Volume=/hadoop-ozone/datanode/data/hdds | DataChecksum=0 |
2026-02-03 12:49:37,443 | INFO  | ID=2 | Index=0 | BCSID=1172 | State=CLOSED | Volume=/hadoop-ozone/datanode/data/hdds | DataChecksum=4117a7a2 |
2026-02-03 13:31:17,149 | INFO  | ID=2018 | Index=0 | BCSID=159 | State=CLOSING | Volume=/mnt/dummy_disk1/hadoop-ozone/datanode/data/hdds | DataChecksum=0 |
2026-02-03 13:31:17,205 | WARN  | ID=2018 | Index=0 | BCSID=159 | State=QUASI_CLOSED | Volume=/mnt/dummy_disk1/hadoop-ozone/datanode/data/hdds | DataChecksum=2a21d155 | Ratis group removed. Group id: group-82AA09A3DA8C |
```

## Debugging

You can increase the log verbosity for debugging purposes for both services and CLI tools.

### Enabling Debug Logs for Services

To enable debug logging for a service, you need to modify its `log4j.properties` file. Change the log level for the desired logger from `INFO` to `DEBUG`. For example, to enable debug logging for the Ozone Manager, you would edit its `log4j.properties` and change the following line:

```properties
rootLogger.level = info
```

to

```properties
rootLogger.level = debug
```

After saving the file and restarting the service, the service will start logging more detailed debug information.

### Enabling Debug Logs for CLI Tools

To enable debug logging for Ozone CLI tools (e.g., `ozone sh volume create`), you can set the `OZONE_ROOT_LOGGER` environment variable to `debug`:

```bash
export OZONE_ROOT_LOGGER=DEBUG,console
ozone sh volume create /vol1
```

Alternatively, you can use the --loglevel option with the Ozone command:

```bash
ozone --loglevel debug sh volume create /vol1
```
