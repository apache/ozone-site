---
sidebar_label: Kerberos
---

# How Ozone Uses Kerberos

## 1. Kerberos

Ozone depends on [Kerberos](https://web.mit.edu/kerberos/) to make the
clusters secure. Historically, HDFS has supported running in an isolated
secure networks where it is possible to deploy without securing the cluster.

This release of Ozone follows that model, but soon will move to *secure by
default.*  Today to enable security in Ozone cluster, we need to set the
configuration `ozone.security.enabled` to `true` and `hadoop.security.authentication`
to `kerberos`.

| Property                         | Value      |
| -------------------------------- | ---------- |
| `ozone.security.enabled`         | `true`     |
| `hadoop.security.authentication` | `kerberos` |

## 2. Kerberos and SPNEGO in Apache Ozone

Apache Ozone uses Kerberos for strong authentication across its services and clients. This ensures that only authenticated users and services can access Ozone resources.

### Kerberos Authentication

Ozone relies on the **Java SASL (Simple Authentication and Security Layer)** framework using the **GSS-API** mechanism for Kerberos authentication.

At startup, each Ozone service role (such as OM, SCM, or Datanode):

- Uses its **service principal** and **keytab** to authenticate with the Kerberos Key Distribution Center (KDC).
- Uses the local Kerberos client configuration in `/etc/krb5.conf`.
- Assumes that all hosts in the same Ozone cluster typically belong to the same **Kerberos realm**.

Ozone also supports **cross-realm authentication**. Applications and services in different Kerberos realms can communicate securely if cross-realm trust is properly configured between the realms.

### SPNEGO for HTTP Access

**SPNEGO (Simple and Protected GSS-API Negotiation Mechanism)** is the Kerberos-based authentication mechanism used for HTTP access to Ozone services, such as the Ozone Manager (OM) web endpoints.

SPNEGO is widely supported by modern tools and clients, including:

- Web browsers (Chrome, Firefox, Safari)
- Command-line tools such as curl

Example using `curl` with **SPNEGO**:

```bash
curl --negotiate -u : http://om-host.example.com:9874/
```

In this mode, the client automatically uses the user's Kerberos credentials to authenticate to the Ozone HTTP service without requiring usernames or passwords.

## 3. Securing Datanodes

Datanodes under Hadoop is traditionally secured by creating a Keytab file on the Datanodes. With Ozone, we have moved away to using Datanode certificates. That is, Kerberos on Datanodes is not needed in case of a secure Ozone cluster.

However, we support the legacy Kerberos based Authentication to make it easy for the current set of users. The HDFS configuration keys are the following that is setup in `hdfs-site.xml`.

| Property                                     | Description                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `dfs.datanode.kerberos.principal`            | The Datanode service principal. e.g. `dn/_HOST@REALM.COM`                       |
| `dfs.datanode.kerberos.keytab.file`          | The keytab file used by Datanode daemon to login as its service principal.      |
| `hdds.datanode.http.auth.kerberos.principal` | Datanode HTTP server service principal.                                         |
| `hdds.datanode.http.auth.kerberos.keytab`    | The keytab file used by Datanode HTTP server to login as its service principal. |

### How a Datanode becomes secure

Under Ozone, when a Datanode boots up and discovers SCM's address, the first thing that Datanode does is to create a private key and send a certificate request to the SCM.

#### Certificate Approval via Kerberos

SCM has a built-in CA, and SCM has to approve this request. If the Datanode already has a Kerberos key tab, then SCM will trust Kerberos credentials and issue a certificate automatically.

#### Manual Approval

If these are brand new Datanodes and Kerberos key tabs are not present at the Datanodes, then this request for the Datanodes identity certificate is queued up for approval from the administrator (This is work in progress, not committed in Ozone yet). In other words, the chain of trust is established by the administrator of the cluster.

#### Automatic Approval

If you are running under a container orchestrator like Kubernetes, we rely on Kubernetes to create a one-time token that will be given to Datanode during boot time to prove the identity of the Datanode container (This is also work in progress.)

Once a certificate is issued, a Datanode is secure and Ozone Manager can issue block tokens. If there is no Datanode certificates or the SCM's root certificate is not present in the Datanode, then Datanode will register itself and download the SCM's root certificate as well get the certificates for itself.

## 4. Kerberos Configurations for SCM, OM, and S3G

### Storage Container Manager

SCM requires **two Kerberos principals**, and the corresponding key tab files for both of these principals.

| Property                                | Default Value                          | Description                                                                                                         |
| --------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `hdds.scm.kerberos.principal`           | `SCM/_HOST@REALM`                      | The SCM service principal. e.g. `scm/_HOST@REALM.COM`                                                               |
| `hdds.scm.kerberos.keytab.file`         | `/etc/security/keytabs/SCM.keytab`     | The keytab file used by SCM daemon to login as its service principal.                                               |
| `hdds.scm.http.auth.kerberos.principal` | `HTTP/_HOST@REALM`                     | SCM HTTP server service principal if SPNEGO is enabled for SCM HTTP server.                                         |
| `hdds.scm.http.auth.kerberos.keytab`    | `/etc/security/keytabs/HTTP.keytab`    | The keytab file used by SCM HTTP server to login as its service principal if SPNEGO is enabled for SCM HTTP server. |

### Ozone Manager

Like SCM, OM also requires **two Kerberos principals**, and the corresponding key tab files for both of these principals.

| Property                                | Default Value                      | Description                                                                                                       |
| --------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ozone.om.kerberos.principal`           | `OM/_HOST@REALM`                   | The OzoneManager service principal. e.g. `om/_HOST@REALM.COM`                                                     |
| `ozone.om.kerberos.keytab.file`         | `/etc/security/keytabs/OM.keytab`  | The keytab file used by OM daemon to login as its service principal.                                              |
| `ozone.om.http.auth.kerberos.principal` | `HTTP/_HOST@REALM`                 | Ozone Manager HTTP server service principal if SPNEGO is enabled for OM HTTP server.                              |
| `ozone.om.http.auth.kerberos.keytab`    | `/etc/security/keytabs/HTTP.keytab`| The keytab file used by OM HTTP server to login as its service principal if SPNEGO is enabled for OM HTTP server. |

### S3 Gateway

S3 Gateway requires **one service principal** and here the configuration values needed in the `ozone-site.xml`.

| Property                                 | Default Value                      | Description                                                                                         |
| ---------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ozone.s3g.kerberos.principal`           | `s3g/_HOST@REALM`                  | S3 Gateway principal. e.g. `s3g/_HOST@REALM`                                                        |
| `ozone.s3g.kerberos.keytab.file`         | `/etc/security/keytabs/s3g.keytab`  | The keytab file used by S3 Gateway. e.g. `/etc/security/keytabs/s3g.keytab`                         |
| `ozone.s3g.http.auth.kerberos.principal` | `HTTP/_HOST@REALM`                 | S3 Gateway principal if SPNEGO is enabled for S3 Gateway HTTP server. e.g. `HTTP/_HOST@EXAMPLE.COM` |
| `ozone.s3g.http.auth.kerberos.keytab`    | `/etc/security/keytabs/HTTP.keytab`| The keytab file used by S3 Gateway if SPNEGO is enabled for S3 Gateway HTTP server.                 |

:::note
`_HOST` is replaced with the actual hostname at runtime, and `REALM` should be replaced with your Kerberos realm (e.g., `EXAMPLE.COM`).
:::
