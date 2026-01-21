---
sidebar_label: Kerberos
---

# Configuring Kerberos

Ozone depends on [Kerberos](https://web.mit.edu/kerberos/) to make the clusters secure. Historically, HDFS has supported running in an isolated secure networks where it is possible to deploy without securing the cluster.

This release of Ozone follows that model, but soon will move to _secure by default._ Today to enable security in Ozone cluster, we need to set the configuration `ozone.security.enabled` to `true` and `hadoop.security.authentication` to `kerberos`.

| Property                         | Value      |
| -------------------------------- | ---------- |
| `ozone.security.enabled`         | `true`     |
| `hadoop.security.authentication` | `kerberos` |

## Storage Container Manager

SCM requires two Kerberos principals, and the corresponding key tab files for both of these principals.

| Property                                | Description                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `hdds.scm.kerberos.principal`           | The SCM service principal. e.g. `scm/_HOST@REALM.COM`                                                               |
| `hdds.scm.kerberos.keytab.file`         | The keytab file used by SCM daemon to login as its service principal.                                               |
| `hdds.scm.http.auth.kerberos.principal` | SCM HTTP server service principal if SPNEGO is enabled for SCM HTTP server.                                         |
| `hdds.scm.http.auth.kerberos.keytab`    | The keytab file used by SCM HTTP server to login as its service principal if SPNEGO is enabled for SCM HTTP server. |

## Ozone Manager

Like SCM, OM also requires two Kerberos principals, and the corresponding key tab files for both of these principals.

| Property                                | Description                                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ozone.om.kerberos.principal`           | The OzoneManager service principal. e.g. `om/_HOST@REALM.COM`                                                     |
| `ozone.om.kerberos.keytab.file`         | The keytab file used by OM daemon to login as its service principal.                                              |
| `ozone.om.http.auth.kerberos.principal` | Ozone Manager HTTP server service principal if SPNEGO is enabled for OM HTTP server.                              |
| `ozone.om.http.auth.kerberos.keytab`    | The keytab file used by OM HTTP server to login as its service principal if SPNEGO is enabled for OM HTTP server. |

## S3 Gateway

S3 Gateway requires one service principal and here the configuration values needed in the `ozone-site.xml`.

| Property                                 | Description                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ozone.s3g.kerberos.principal`           | S3 Gateway principal. e.g. `s3g/_HOST@REALM`                                                        |
| `ozone.s3g.kerberos.keytab.file`         | The keytab file used by S3 Gateway. e.g. `/etc/security/keytabs/s3g.keytab`                         |
| `ozone.s3g.http.auth.kerberos.principal` | S3 Gateway principal if SPNEGO is enabled for S3 Gateway HTTP server. e.g. `HTTP/_HOST@EXAMPLE.COM` |
| `ozone.s3g.http.auth.kerberos.keytab`    | The keytab file used by S3 Gateway if SPNEGO is enabled for S3 Gateway HTTP server.                 |

## Securing Datanodes

Datanodes under Hadoop is traditionally secured by creating a Keytab file on the Datanodes. With Ozone, we have moved away to using Datanode certificates. That is, Kerberos on Datanodes is not needed in case of a secure Ozone cluster.

However, we support the legacy Kerberos based Authentication to make it easy for the current set of users. The HDFS configuration keys are the following that is setup in `hdfs-site.xml`.

| Property                                     | Description                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `dfs.datanode.kerberos.principal`            | The Datanode service principal. e.g. `dn/_HOST@REALM.COM`                       |
| `dfs.datanode.kerberos.keytab.file`          | The keytab file used by Datanode daemon to login as its service principal.      |
| `hdds.datanode.http.auth.kerberos.principal` | Datanode HTTP server service principal.                                         |
| `hdds.datanode.http.auth.kerberos.keytab`    | The keytab file used by Datanode HTTP server to login as its service principal. |
