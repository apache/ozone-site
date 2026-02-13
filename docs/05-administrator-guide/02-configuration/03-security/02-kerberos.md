---
sidebar_label: Kerberos
---

# Configuring Kerberos

Ozone depends on [Kerberos](https://web.mit.edu/kerberos/) to make the clusters secure. Historically, HDFS has supported running in an isolated secure networks where it is possible to deploy without securing the cluster.

This release of Ozone follows that model, but soon will move to *secure by default.* Today to enable security in Ozone cluster, we need to set the configuration `ozone.security.enabled` to `true` and `hadoop.security.authentication` to `kerberos`.

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

:::note
For general configuration on enabling Kerberos based SPNEGO authentication for HTTP web-consoles, refer to [Configuring HTTP authentication using Kerberos SPNEGO](../../../administrator-guide/configuration/security/https).
:::

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

## HttpFS Gateway

The HttpFS gateway offers an HDFS-compatible REST API (`webhdfs`). It requires Kerberos for its client-facing HTTP endpoint and for its internal connection to the Ozone Manager (which acts as an HDFS NameNode proxy).

| Property | Description |
|---|---|
| `hadoop.http.authentication.type` | Defines the authentication mechanism used by HttpFS for its HTTP clients. Valid values are `simple` or `kerberos`. Set to `kerberos` for SPNEGO. |
| `hadoop.http.authentication.kerberos.principal` | The HTTP Kerberos principal used by HttpFS for its client-facing HTTP endpoint. This MUST start with `HTTP/` (e.g., `HTTP/${httpfs.hostname}@${kerberos.realm}`). |
| `hadoop.http.authentication.kerberos.keytab` | The Kerberos keytab file for the client-facing HTTP principal. e.g., `${user.home}/httpfs.keytab`. |
| `httpfs.hadoop.authentication.type` | Defines the authentication mechanism used by HttpFS to connect to the HDFS NameNode (Ozone Manager). Valid values are `simple` (default) or `kerberos`. |
| `httpfs.hadoop.authentication.kerberos.principal` | The Kerberos principal used by HttpFS to connect to the HDFS NameNode (Ozone Manager). e.g., `${user.name}/${httpfs.hostname}@${kerberos.realm}`. |
| `httpfs.hadoop.authentication.kerberos.keytab` | The Kerberos keytab file for the principal used to connect to the HDFS NameNode (Ozone Manager). e.g., `${user.home}/httpfs.keytab`. |

## Recon Server

Recon provides monitoring and management capabilities and can be secured using Kerberos authentication for its web UI and REST endpoints.

| Property | Description |
|---|---|
| `ozone.recon.http.auth.type` | Sets Recon's HTTP authentication type. Set to `kerberos` for SPNEGO. |
| `ozone.recon.http.auth.kerberos.principal` | The service principal for the Recon HTTP endpoint. e.g., `HTTP/_HOST@REALM`. |
| `ozone.recon.http.auth.kerberos.keytab` | The keytab file for the Recon HTTP principal. e.g., `/path/to/HTTP.keytab`. |

Access to Recon's admin-only APIs is controlled by `ozone.administrators` or `ozone.recon.administrators` lists. Refer to [Configuring Ozone Administrators](../../../administrator-guide/configuration/security/administrators) for more details.

## Securing Datanodes

Datanodes under Hadoop is traditionally secured by creating a Keytab file on the Datanodes. With Ozone, we have moved away to using Datanode certificates. That is, Kerberos on Datanodes is not needed in case of a secure Ozone cluster.

However, we support the legacy Kerberos based Authentication to make it easy for the current set of users. The HDFS configuration keys are the following that is setup in `hdfs-site.xml`.

| Property                                     | Description                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `dfs.datanode.kerberos.principal`            | The Datanode service principal. e.g. `dn/_HOST@REALM.COM`                       |
| `dfs.datanode.kerberos.keytab.file`          | The keytab file used by Datanode daemon to login as its service principal.      |
| `hdds.datanode.http.auth.kerberos.principal` | Datanode HTTP server service principal.                                         |
| `hdds.datanode.http.auth.kerberos.keytab`    | The keytab file used by Datanode HTTP server to login as its service principal. |
