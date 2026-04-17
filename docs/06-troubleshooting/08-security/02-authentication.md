---
draft: true
sidebar_label: Authentication
---

# Authentication

**TODO:** File a subtask under [HDDS-9860](https://issues.apache.org/jira/browse/HDDS-9860) and complete this page or section.

## Kerberos

If you are experiencing issues with Kerberos authentication in the cluster (e.g., missing configurations, invalid tickets, or mapping errors), use the ```ozone debug kerberos``` subcommands output as the first thing to inspect for the Kerberos troubleshooting.
It is highly useful for diagnosing system faults and verifying how Kerberos principals map to local Unix users.

### Debug Kerberos

Debug commands for identifying issues with Kerberos authentication in the cluster.

```bash
Usage: ozone debug kerberos [--verbose] [COMMAND]
Debug commands for kerberos related issues.
      --verbose   More verbose output. Show the stack trace of the errors.
Commands:
  diagnose             Diagnose Kerberos configuration issues.
  translate-principal  Translate Kerberos principal(s) using auth_to_local rules.
```

***The ```diagnose``` command is as follows:***

```bash
ozone debug kerberos diagnose
```

**Sample output:**

```bash
== Ozone Kerberos Diagnostics ==

-- Host Information --
Hostname = om2
User = hadoop
Java version = 21.0.2
[PASS] Host Information

-- Environment Variables --
KRB5_CONFIG = (unset)
KRB5CCNAME = (unset)
OZONE_CONF_DIR = /etc/hadoop
HADOOP_CONF_DIR = (unset)
JAVA_SECURITY_KRB5_CONF = (unset)
[PASS] Environment Variables

-- JVM Kerberos Properties --
java.security.krb5.conf = (unset)
java.security.krb5.realm = (unset)
java.security.krb5.kdc = (unset)
sun.security.krb5.debug = (unset)
Effective krb5.conf (default) = /etc/krb5.conf
[PASS] JVM Kerberos Properties

-- Kerberos Configuration --
krb5.conf = /etc/krb5.conf
Default realm = EXAMPLE.COM
[PASS] Kerberos Configuration

-- Kerberos kinit Command --
PATH = /opt/hadoop/libexec:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/jdk-21.0.2/bin:/opt/hadoop/bin
kinit found at  = /usr/bin/kinit
[PASS] Kerberos kinit Command

-- Keytab Validation --
Keytab OK = /etc/security/keytabs/om.keytab
Keytab OK = /etc/security/keytabs/scm.keytab
Keytab OK = /etc/security/keytabs/dn.keytab
Keytab OK = /etc/security/keytabs/recon.keytab
Keytab OK = /etc/security/keytabs/s3g.keytab
[PASS] Keytab Validation

-- Kerberos Ticket --
kerberos configured = true
Login user = testuser/om@EXAMPLE.COM
Authentication method = KERBEROS
Kerberos ticket present = true
Ticket cache = (default cache)
Kerberos status = Authentication is active and ticket is valid
[PASS] Kerberos Ticket

-- Auth-to-Local Mapping --
auth_to_local rules = DEFAULT
Principal = om/om@EXAMPLE.COM to Local user = om
Principal = scm/scm@EXAMPLE.COM to Local user = scm
Principal = dn/dn@EXAMPLE.COM to Local user = dn
Principal = recon/recon@EXAMPLE.COM to Local user = recon
Principal = s3g/s3g@EXAMPLE.COM to Local user = s3g
[PASS] Auth-to-Local Mapping

-- Security Configuration --
hadoop.security.authentication = kerberos
ozone.security.enabled = true
ozone.security.http.kerberos.enabled = true
hadoop.rpc.protection = authentication
hadoop.security.saslproperties.resolver.class = (unset)
ozone.administrators = testuser,recon,om,hdfs
ozone.s3.administrators = testuser,s3g
hdds.block.token.enabled = true
hdds.container.token.enabled = true
hdds.grpc.tls.enabled = true
[PASS] Security Configuration

-- Authorization Configuration --
ozone.security.enabled = true
ozone.authorization.enabled = true
ozone.acl.enabled = true
ozone.acl.authorizer.class = org.apache.hadoop.ozone.security.acl.OzoneNativeAuthorizer
hadoop.security.authorization = true
ozone.om.security.client.protocol.acl = *
hdds.security.client.datanode.container.protocol.acl = *
hdds.security.client.scm.container.protocol.acl = *
hdds.security.client.scm.block.protocol.acl = *
hdds.security.client.scm.certificate.protocol.acl = *
[PASS] Authorization Configuration

-- HTTP Kerberos Authentication --
ozone.om.http.auth.type = kerberos
hdds.scm.http.auth.type = kerberos
hdds.datanode.http.auth.type = kerberos
ozone.recon.http.auth.type = kerberos
ozone.s3g.http.auth.type = kerberos
[PASS] HTTP Kerberos Authentication

== Diagnostic Summary ==
PASS : 11
WARN : 0
FAIL : 0
bash-5.1$ 
```

***The ```translate-principal``` command is as follows:***

```bash
ozone debug kerberos translate-principal <principal>
```

**Sample output:**

```bash
== Kerberos Principal Translation  ==

auth_to_local rules = DEFAULT
-- testuser/om@EXAMPLE.COM --
Principal = testuser/om@EXAMPLE.COM to Local user = testuser
[PASS] testuser/om@EXAMPLE.COM

== Translation Summary ==
PASS : 1
FAIL : 0
```

:::tip
Multiple principal can be used together in a single command separated by space.
:::

## SPNEGO

## S3 Credentials
