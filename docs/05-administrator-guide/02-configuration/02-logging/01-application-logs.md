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

#### Enabling Jersey Debug Logs in S3 Gateway

Jersey uses `java.util.logging` (JUL). S3 Gateway forwards JUL records to SLF4J,
but JUL checks the log level before forwarding a record. Therefore, both JUL
and log4j must allow debug records.

Create a JUL configuration file, for example
`$OZONE_CONF_DIR/s3g-jul-logging.properties`, with the following content:

```properties
org.glassfish.jersey.level = FINE
```

`FINE` is the JUL level that maps to SLF4J `DEBUG`. This setting enables it only
for Jersey loggers.

Add the following line to `$OZONE_CONF_DIR/log4j.properties`:

```properties
log4j.logger.org.glassfish.jersey=DEBUG
```

Configure S3 Gateway to use the JUL properties file by adding the following to
`$OZONE_CONF_DIR/ozone-env.sh`:

```bash
export OZONE_S3G_OPTS="${OZONE_S3G_OPTS} -Djava.util.logging.config.file=${OZONE_CONF_DIR}/s3g-jul-logging.properties"
```

Restart S3 Gateway for the changes to take effect.

### Changing Service Log Levels at Runtime

Use `ozone daemonlog` to inspect or change the log level of a running Ozone
daemon without restarting it. The command talks to the daemon's HTTP endpoint
and is useful when you need temporary debug logging while troubleshooting a live
service.

```bash
ozone daemonlog -getlevel <host:port> <logger-name> [-protocol http|https]
ozone daemonlog -setlevel <host:port> <logger-name> <level> [-protocol http|https]
```

The `<host:port>` value is the daemon HTTP address. For example, the default
HTTP ports are `9874` for Ozone Manager, `9876` for Storage Container Manager,
`9882` for Datanode, `19878` for the S3 Gateway web admin server, and `9888`
for Recon.

The following example checks the effective log level for the SCM event queue logger:

```bash
ozone daemonlog -getlevel scm.example.com:9876 org.apache.hadoop.hdds.server.events.EventQueue
```

To increase the same logger to `DEBUG`:

```bash
ozone daemonlog -setlevel scm.example.com:9876 org.apache.hadoop.hdds.server.events.EventQueue DEBUG
```

After collecting the required debug information, reset the logger to its previous level:

```bash
ozone daemonlog -setlevel scm.example.com:9876 org.apache.hadoop.hdds.server.events.EventQueue INFO
```

The change applies to the running daemon process. To make a log level change
persistent across restarts, update the service's `log4j.properties` file
instead.

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
