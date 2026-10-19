---
sidebar_label: HTTPS
---

# Configuring HTTP authentication using Kerberos SPNEGO

This document describes how to configure Ozone HTTP web-consoles to require user authentication.

## Default authentication

By default Ozone HTTP web-consoles (OM, SCM, S3G, Recon, Datanode) allow access without authentication based on the following default configurations.

| Property | Value |
|----------|-------|
| `ozone.security.http.kerberos.enabled` | `false` |
| `ozone.http.filter.initializers` | |

If you have an SPNEGO enabled Ozone cluster and want to disable it for all Ozone services, just make sure the two key mentioned are configured as above.

Without SPNEGO a request carries no authenticated identity, so endpoints that are restricted to administrators cannot check the caller. This includes the DB checkpoint endpoints of OM (`/dbCheckpoint`, `/v2/dbCheckpoint`) and SCM (`/dbCheckpoint`), which serve a copy of the service's metadata DB. The OM DB contains the S3 secrets of all users. On a secure cluster, enable SPNEGO for OM and SCM as described below, or restrict network access to their HTTP ports.

## Kerberos based SPNEGO authentication

However, they can be configured to require Kerberos authentication using HTTP SPNEGO protocol (supported by browsers like Firefox and Chrome). To achieve that, the following keys must be configured first.

| Property | Value |
|----------|-------|
| `hadoop.security.authentication` | `kerberos` |
| `ozone.security.http.kerberos.enabled` | `true` |
| `ozone.http.filter.initializers` | `org.apache.hadoop.security.AuthenticationFilterInitializer` |

After that, individual component needs to configure properly to completely enable SPNEGO or SIMPLE authentication.

## Resolving `_HOST` in the Kerberos principal

`HTTP/_HOST@REALM` in `*.http.auth.kerberos.principal` is expanded at startup. The
hostname must match your **keytab** and the **host in the browser URL**.

Ozone takes `_HOST` from the **advertised** web address (`ozone.<service>.http-address`
or `https-address`), **not** from `*-http-bind-host`. Bind host only chooses where
the process listens (`0.0.0.0`, `::`, a NIC IP, and so on).

For Datanode, the address keys are `hdds.datanode.http-address` and
`hdds.datanode.https-address`.

| Property (OM example) | Example | Used for `_HOST` |
|-----------------------|---------|------------------|
| `ozone.om.http-address` | `om1.example.com:9874` | Yes |
| `ozone.om.http-bind-host` | `0.0.0.0` or `::` | No |

Ozone checks enabled schemes, HTTP before HTTPS, and uses the first configured
hostname that is not an IP literal for all listeners. With `HTTP_AND_HTTPS`, different
HTTP and HTTPS hostnames still produce one principal: the HTTP name wins when both are
non-literal hostnames. With `HTTPS_ONLY`, the HTTP address is ignored.

If no enabled `*-address` supplies a hostname (the settings are unset or
contain IP literals, including `0.0.0.0`, `[::]`, and concrete IP addresses),
Ozone uses this machine's **canonical hostname**.

**Recommended:** set `*-address` to the FQDN in the keytab; keep `*-bind-host` on
`0.0.0.0` or `::` if needed; open the UI with that FQDN. For **IPv6 bind `::`**, still
set a non-wildcard FQDN in `*-address`. S3 web admin (and Kerberos `/secret/*` when
enabled) follows `ozone.s3g.webadmin.http-address` / `https-address` the same way.

**SPNEGO fails:** check `klist -k -t <keytab>` against `*-address` and the browser URL
(FQDN, short name, and IP are not interchangeable).

See [HDDS-16347](https://issues.apache.org/jira/browse/HDDS-16347) for the code change.

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
| `hdds.scm.http.auth.type` | `kerberos` |
| `hdds.scm.http.auth.kerberos.principal` | `HTTP/_HOST@REALM` |
| `hdds.scm.http.auth.kerberos.keytab` | `/path/to/HTTP.keytab` |

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
| `hdds.scm.http.auth.type` | `simple` |
| `hdds.scm.http.auth.simple.anonymous.allowed` | `false` |

If you don’t want to specify the user.name in the query string parameter, change `hdds.scm.http.auth.simple.anonymous.allowed` to true.

## Enable SIMPLE authentication for Datanode HTTP

| Property | Value |
|----------|-------|
| `ozone.datanode.http.auth.type` | `simple` |
| `ozone.datanode.http.auth.simple.anonymous.allowed` | `false` |

If you don’t want to specify the user.name in the query string parameter, change `hdds.datanode.http.auth.simple.anonymous.allowed` to true.
