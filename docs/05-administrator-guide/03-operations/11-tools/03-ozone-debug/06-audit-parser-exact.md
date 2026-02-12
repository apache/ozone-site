# Audit Parser

Audit Parser tool can be used for querying the Ozone audit logs.
This tool creates a sqlite database at the specified path. If the database
already exists, it will avoid creating a database.

The database contains only one table called `audit` defined as:

```sql
CREATE TABLE IF NOT EXISTS audit (
datetime text,
level varchar(7),
logger varchar(7),
user text,
ip text,
op text,
params text,
result varchar(7),
exception text,
UNIQUE(datetime,level,logger,user,ip,op,params,result))
```

Usage:

```bash
ozone debug auditparser <path to db file> [COMMAND] [PARAM]
```

To load an audit log to database:

```bash
ozone debug auditparser <path to db file> load <path to audit log>
```

Load command creates the audit table described above.

To run a custom read-only query:

```bash
ozone debug auditparser <path to db file> query <select query enclosed within double quotes>
```

Audit Parser comes with a set of templates(most commonly used queries).

To run a template query:

```bash
ozone debug auditparser <path to db file> template <templateName>
```

Following templates are available:

| Template Name           | Description                            | SQL                                                                                                                                   |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| top5users               | Top 5 users                            | select user,count(\*) as total from audit group by user order by total DESC limit 5                                                   |
| top5cmds                | Top 5 commands                         | select op,count(\*) as total from audit group by op order by total DESC limit 5                                                       |
| top5activetimebyseconds | Top 5 active times, grouped by seconds | select substr(datetime,1,charindex(',',datetime)-1) as dt,count(\*) as thecount from audit group by dt order by thecount DESC limit 5 |

[Next >>](/docs/administrator-guide/operations/tools/ozone-debug/container-replica-debugger-tool)
