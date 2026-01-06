---
sidebar_label: HTTPS
---

# HTTPS

This document describes how to configure Ozone HTTP web-consoles to require user authentication.

## Default authentication

By default Ozone HTTP web-consoles (OM, SCM, S3G, Recon, Datanode) allow access without authentication based on the following default configurations.

| Property | Value |
|----------|-------|
| `ozone.security.http.kerberos.enabled` | `false` |
| `ozone.http.filter.initializers` | |

If you have an SPNEGO enabled Ozone cluster and want to disable it for all Ozone services, just make sure the two key mentioned are configured as above.

## Kerberos based SPNEGO authentication

However, they can be configured to require Kerberos authentication using HTTP SPNEGO protocol (supported by browsers like Firefox and Chrome). To achieve that, the following keys must be configured first.

| Property | Value |
|----------|-------|
| `hadoop.security.authentication` | `kerberos` |
| `ozone.security.http.kerberos.enabled` | `true` |
| `ozone.http.filter.initializers` | `org.apache.hadoop.security.AuthenticationFilterInitializer` |

After that, individual component needs to configure properly to completely enable SPNEGO or SIMPLE authentication.

## Enable SPNEGO authentication for OM HTTP

| Property | Value |
|----------|-------|
| `ozone.om.http.auth.type` | `kerberos` |
| `ozone.om.http.auth.kerberos.principal` | `HTTP/_HOST@REALM` |
| `ozone.om.http.auth.kerberos.keytab` | `/path/to/HTTP.keytab` |

## Enable SPNEGO authentication for S3G HTTP

| Property | Value |
|----------|-------|
| `ozone.s3g.http.auth.type` | `kerberos` |
| `ozone.s3g.http.auth.kerberos.principal` | `HTTP/_HOST@REALM` |
| `ozone.s3g.http.auth.kerberos.keytab` | `/path/to/HTTP.keytab` |

## Enable SPNEGO authentication for Recon HTTP

| Property | Value |
|----------|-------|
| `ozone.recon.http.auth.type` | `kerberos` |
| `ozone.recon.http.auth.kerberos.principal` | `HTTP/_HOST@REALM` |
| `ozone.recon.http.auth.kerberos.keytab` | `/path/to/HTTP.keytab` |

## Enable SPNEGO authentication for SCM HTTP

| Property | Value |
|----------|-------|
| `ozone.scm.http.auth.type` | `kerberos` |
| `ozone.scm.http.auth.kerberos.principal` | `HTTP/_HOST@REALM` |
| `ozone.scm.http.auth.kerberos.keytab` | `/path/to/HTTP.keytab` |

## Enable SPNEGO authentication for Datanode HTTP

| Property | Value |
|----------|-------|
| `ozone.datanode.http.auth.type` | `kerberos` |
| `ozone.datanode.http.auth.kerberos.principal` | `HTTP/_HOST@REALM` |
| `ozone.datanode.http.auth.kerberos.keytab` | `/path/to/HTTP.keytab` |

Note: Ozone Datanode does not have a default webpage, which prevents you from accessing “/” or “/index.html”. But it does provide standard servlet like `jmx/conf/jstack` via HTTP.

In addition, Ozone HTTP web-console support the equivalent of Hadoop’s Pseudo/Simple authentication. If this option is enabled, the user name must be specified in the first browser interaction using the user.name query string parameter. e.g., http://scm:9876/?user.name=scmadmin.

## Enable SIMPLE authentication for OM HTTP

| Property | Value |
|----------|-------|
| `ozone.om.http.auth.type` | `simple` |
| `ozone.om.http.auth.simple.anonymous.allowed` | `false` |

If you don’t want to specify the user.name in the query string parameter, change `ozone.om.http.auth.simple.anonymous.allowed` to true.

## Enable SIMPLE authentication for S3G HTTP

| Property | Value |
|----------|-------|
| `ozone.s3g.http.auth.type` | `simple` |
| `ozone.s3g.http.auth.simple.anonymous.allowed` | `false` |

If you don’t want to specify the user.name in the query string parameter, change `ozone.s3g.http.auth.simple.anonymous.allowed` to true.

## Enable SIMPLE authentication for Recon HTTP

| Property | Value |
|----------|-------|
| `ozone.recon.http.auth.type` | `simple` |
| `ozone.recon.http.auth.simple.anonymous.allowed` | `false` |

If you don’t want to specify the user.name in the query string parameter, change `ozone.recon.http.auth.simple.anonymous.allowed` to true.

## Enable SIMPLE authentication for SCM HTTP

| Property | Value |
|----------|-------|
| `ozone.scm.http.auth.type` | `simple` |
| `ozone.scm.http.auth.simple.anonymous.allowed` | `false` |

If you don’t want to specify the user.name in the query string parameter, change `hdds.scm.http.auth.simple.anonymous.allowed` to true.

## Enable SIMPLE authentication for Datanode HTTP

| Property | Value |
|----------|-------|
| `ozone.datanode.http.auth.type` | `simple` |
| `ozone.datanode.http.auth.simple.anonymous.allowed` | `false` |

If you don’t want to specify the user.name in the query string parameter, change `hdds.datanode.http.auth.simple.anonymous.allowed` to true.
