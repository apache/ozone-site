---
sidebar_label: Kerberos
---

# Configuring Kerberos

Ozone depends on [Kerberos](https://web.mit.edu/kerberos/) to make the clusters secure. Historically, HDFS has supported running in an isolated secure networks where it is possible to deploy without securing the cluster.

This release of Ozone follows that model, but soon will move to *secure by default.* Today to enable security in Ozone cluster, we need to set the configuration `ozone.security.enabled` to `true` and `hadoop.security.authentication` to `kerberos`.

| Property | Value |
|----------|-------|
| `ozone.security.enabled` | `true` |
| `hadoop.security.authentication` | `kerberos` |

## Tokens

Ozone uses a notion of tokens to avoid overburdening the Kerberos server. When you serve thousands of requests per second, involving Kerberos might not work well. Hence once an authentication is done, Ozone issues delegation tokens and block tokens to the clients. These tokens allow applications to do specified operations against the cluster, as if they have kerberos tickets with them. Ozone supports following kinds of tokens.

### Delegation Token

Delegation tokens allow an application to impersonate a users kerberos credentials. This token is based on verification of kerberos identity and is issued by the Ozone Manager. Delegation tokens are enabled by default when security is enabled.

### Block Token

Block tokens allow a client to read or write a block. This is needed so that Datanodes know that the user/client has permission to read or make modifications to the block.

### S3AuthInfo

S3 uses a very different shared secret security scheme. Ozone supports the AWS Signature Version 4 protocol, and from the end users perspective Ozone's S3 feels exactly like AWS S3.

The S3 credential tokens are called S3 auth info in the code. These tokens are also enabled by default when security is enabled.

Each of the service daemons that make up Ozone needs a Kerberos service principal name and a corresponding [kerberos key tab](https://web.mit.edu/kerberos/krb5-latest/doc/basic/keytab_def.html) file.

All these settings should be made in `ozone-site.xml`.

## Storage Container Manager

SCM requires two Kerberos principals, and the corresponding key tab files for both of these principals.

| Property | Description |
|----------|-------------|
| `hdds.scm.kerberos.principal` | The SCM service principal. e.g. `scm/_HOST@REALM.COM` |
| `hdds.scm.kerberos.keytab.file` | The keytab file used by SCM daemon to login as its service principal. |
| `hdds.scm.http.auth.kerberos.principal` | SCM HTTP server service principal if SPNEGO is enabled for SCM HTTP server. |
| `hdds.scm.http.auth.kerberos.keytab` | The keytab file used by SCM HTTP server to login as its service principal if SPNEGO is enabled for SCM HTTP server. |

## Ozone Manager

Like SCM, OM also requires two Kerberos principals, and the corresponding key tab files for both of these principals.

| Property | Description |
|----------|-------------|
| `ozone.om.kerberos.principal` | The OzoneManager service principal. e.g. `om/_HOST@REALM.COM` |
| `ozone.om.kerberos.keytab.file` | The keytab file used by OM daemon to login as its service principal. |
| `ozone.om.http.auth.kerberos.principal` | Ozone Manager HTTP server service principal if SPNEGO is enabled for OM HTTP server. |
| `ozone.om.http.auth.kerberos.keytab` | The keytab file used by OM HTTP server to login as its service principal if SPNEGO is enabled for OM HTTP server. |

## S3 Gateway

S3 Gateway requires one service principal and here the configuration values needed in the `ozone-site.xml`.

| Property | Description |
|----------|-------------|
| `ozone.s3g.kerberos.principal` | S3 Gateway principal. e.g. `s3g/_HOST@REALM` |
| `ozone.s3g.kerberos.keytab.file` | The keytab file used by S3 Gateway. e.g. `/etc/security/keytabs/s3g.keytab` |
| `ozone.s3g.http.auth.kerberos.principal` | S3 Gateway principal if SPNEGO is enabled for S3 Gateway HTTP server. e.g. `HTTP/_HOST@EXAMPLE.COM` |
| `ozone.s3g.http.auth.kerberos.keytab` | The keytab file used by S3 Gateway if SPNEGO is enabled for S3 Gateway HTTP server. |

## Securing Datanodes

Datanodes under Hadoop is traditionally secured by creating a Keytab file on the Datanodes. With Ozone, we have moved away to using Datanode certificates. That is, Kerberos on Datanodes is not needed in case of a secure Ozone cluster.

However, we support the legacy Kerberos based Authentication to make it easy for the current set of users. The HDFS configuration keys are the following that is setup in `hdfs-site.xml`.

| Property | Description |
|----------|-------------|
| `dfs.datanode.kerberos.principal` | The Datanode service principal. e.g. `dn/_HOST@REALM.COM` |
| `dfs.datanode.kerberos.keytab.file` | The keytab file used by Datanode daemon to login as its service principal. |
| `hdds.datanode.http.auth.kerberos.principal` | Datanode HTTP server service principal. |
| `hdds.datanode.http.auth.kerberos.keytab` | The keytab file used by Datanode HTTP server to login as its service principal. |

### How a Datanode becomes secure

Under Ozone, when a Datanode boots up and discovers SCM's address, the first thing that Datanode does is to create a private key and send a certificate request to the SCM.

#### Certificate Approval via Kerberos

SCM has a built-in CA, and SCM has to approve this request. If the Datanode already has a Kerberos key tab, then SCM will trust Kerberos credentials and issue a certificate automatically.

#### Manual Approval

If these are brand new Datanodes and Kerberos key tabs are not present at the Datanodes, then this request for the Datanodes identity certificate is queued up for approval from the administrator (This is work in progress, not committed in Ozone yet). In other words, the chain of trust is established by the administrator of the cluster.

#### Automatic Approval

If you running under an container orchestrator like Kubernetes, we rely on Kubernetes to create a one-time token that will be given to Datanode during boot time to prove the identity of the Datanode container (This is also work in progress.)

Once a certificate is issued, a Datanode is secure and Ozone Manager can issue block tokens. If there is no Datanode certificates or the SCM's root certificate is not present in the Datanode, then Datanode will register itself and download the SCM's root certificate as well get the certificates for itself.
