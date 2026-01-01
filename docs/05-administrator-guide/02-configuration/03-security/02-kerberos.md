---
sidebar_label: Kerberos
---

# Configuring Kerberos

Ozone depends on [Kerberos](https://web.mit.edu/kerberos/) to make the clusters secure. Historically, HDFS has supported running in an isolated secure networks where it is possible to deploy without securing the cluster.

This release of Ozone follows that model, but soon will move to _secure by default._ Today to enable security in ozone cluster, we need to set the configuration `ozone.security.enabled` to `true` and `hadoop.security.authentication` to `kerberos`.

| Property | Value |
|----------|-------|
| `ozone.security.enabled` | `true` |
| `hadoop.security.authentication` | `kerberos` |

## Tokens

Ozone uses a notion of tokens to avoid overburdening the Kerberos server. When you serve thousands of requests per second, involving Kerberos might not work well. Hence once an authentication is done, Ozone issues delegation tokens and block tokens to the clients. These tokens allow applications to do specified operations against the cluster, as if they have kerberos tickets with them. Ozone supports following kinds of tokens.

### Delegation Token

Delegation tokens allow an application to impersonate a users kerberos credentials. This token is based on verification of kerberos identity and is issued by the Ozone Manager. Delegation tokens are enabled by default when security is enabled.

### Block Token

Block tokens allow a client to read or write a block. This is needed so that data nodes know that the user/client has permission to read or make modifications to the block.

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
| `hdds.scm.http.auth.kerberos.principal` | SCM http server service principal if SPNEGO is enabled for SCM http server. |
| `hdds.scm.http.auth.kerberos.keytab` | The keytab file used by SCM http server to login as its service principal if SPNEGO is enabled for SCM http server. |

## Ozone Manager

Like SCM, OM also requires two Kerberos principals, and the corresponding key tab files for both of these principals.

| Property | Description |
|----------|-------------|
| `ozone.om.kerberos.principal` | The OzoneManager service principal. e.g. `om/_HOST@REALM.COM` |
| `ozone.om.kerberos.keytab.file` | The keytab file used by OM daemon to login as its service principal. |
| `ozone.om.http.auth.kerberos.principal` | Ozone Manager http server service principal if SPNEGO is enabled for om http server. |
| `ozone.om.http.auth.kerberos.keytab` | The keytab file used by OM http server to login as its service principal if SPNEGO is enabled for om http server. |

## S3 Gateway

S3 gateway requires one service principal and here the configuration values needed in the `ozone-site.xml`.

| Property | Description |
|----------|-------------|
| `ozone.s3g.kerberos.principal` | S3 Gateway principal. e.g. `s3g/_HOST@REALM` |
| `ozone.s3g.kerberos.keytab.file` | The keytab file used by S3 gateway. e.g. `/etc/security/keytabs/s3g.keytab` |
| `ozone.s3g.http.auth.kerberos.principal` | S3 Gateway principal if SPNEGO is enabled for S3 Gateway http server. e.g. `HTTP/_HOST@EXAMPLE.COM` |
| `ozone.s3g.http.auth.kerberos.keytab` | The keytab file used by S3 gateway if SPNEGO is enabled for S3 Gateway http server. |

## Securing Datanodes

Datanodes under Hadoop is traditionally secured by creating a Keytab file on the datanodes. With Ozone, we have moved away to using datanode certificates. That is, Kerberos on datanodes is not needed in case of a secure Ozone cluster.

However, we support the legacy Kerberos based Authentication to make it easy for the current set of users. The HDFS configuration keys are the following that is setup in `hdfs-site.xml`.

| Property | Description |
|----------|-------------|
| `dfs.datanode.kerberos.principal` | The datanode service principal. e.g. `dn/_HOST@REALM.COM` |
| `dfs.datanode.kerberos.keytab.file` | The keytab file used by datanode daemon to login as its service principal. |
| `hdds.datanode.http.auth.kerberos.principal` | Datanode http server service principal. |
| `hdds.datanode.http.auth.kerberos.keytab` | The keytab file used by datanode http server to login as its service principal. |

### How a datanode becomes secure

Under Ozone, when a datanode boots up and discovers SCM's address, the first thing that datanode does is to create a private key and send a certificate request to the SCM.

#### Certificate Approval via Kerberos

SCM has a built-in CA, and SCM has to approve this request. If the datanode already has a Kerberos key tab, then SCM will trust Kerberos credentials and issue a certificate automatically.

#### Manual Approval

If these are brand new datanodes and Kerberos key tabs are not present at the datanodes, then this request for the datanodes identity certificate is queued up for approval from the administrator (This is work in progress, not committed in Ozone yet). In other words, the chain of trust is established by the administrator of the cluster.

#### Automatic Approval

If you running under an container orchestrator like Kubernetes, we rely on Kubernetes to create a one-time token that will be given to datanode during boot time to prove the identity of the datanode container (This is also work in progress.)

Once a certificate is issued, a datanode is secure and Ozone manager can issue block tokens. If there is no datanode certificates or the SCM's root certificate is not present in the datanode, then datanode will register itself and download the SCM's root certificate as well get the certificates for itself.
