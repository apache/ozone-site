---
sidebar_label: Audit Logs
---

# Configuring Audit Logs

Audit logs record security-sensitive operations, providing a trail of actions performed on the cluster. The following services produce audit logs:

- Ozone Manager

- Storage Container Manager

- Datanode

- S3 Gateway

Audit log configurations are set in `*-audit-log4j2.properties` files. You can change the corresponding files to update the audit log policies for each component.

## Sample Audit Log Entry

Here is an example of an audit log entry from the Ozone Manager:

```text
INFO  | OMAudit | ? | user=hdfs | ip=127.0.0.1 | op=CREATE_VOLUME | params={volume=vol1, admin=hdfs, owner=hdfs} | result=SUCCESS
```

This entry shows that the user `hdfs` successfully created a volume named `vol1`.

## Deletion of Audit Logs

The default log appender is a rolling appender. The following configurations can be added for the deletion of out-of-date AuditLogs.

```properties
appender.rolling.strategy.type=DefaultRolloverStrategy

appender.rolling.strategy.max=3000

appender.rolling.strategy.delete.type=Delete

appender.rolling.strategy.delete.basePath=${sys:hadoop.log.dir}

appender.rolling.strategy.delete.maxDepth=1

appender.rolling.strategy.delete.ifFileName.type=IfFileName

appender.rolling.strategy.delete.ifFileName.glob=om-audit-*.log.gz

appender.rolling.strategy.delete.ifLastModified.type=IfLastModified

appender.rolling.strategy.delete.ifLastModified.age=30d
```

For more details, please check [Log4j2 Delete on Rollover](https://logging.apache.org/log4j/2.x/manual/appenders.html#CustomDeleteOnRollover).
