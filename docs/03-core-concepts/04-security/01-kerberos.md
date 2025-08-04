---
sidebar_label: Kerberos Authentication
---

# Kerberos Authentication

When running Apache Ozone in a secure environment, **Kerberos** is the primary mechanism used for strong authentication of users and services. It ensures that only trusted principals can interact with the Ozone cluster.

## Overview

Integrating Ozone with Kerberos involves:

1.  **Kerberos KDC:** A functioning Kerberos Key Distribution Center (KDC) must be available in the environment.
2.  **Service Principals:** Creating unique Kerberos principals for each Ozone service instance (Ozone Manager, Storage Container Manager, Datanodes).
3.  **HTTP Principals (SPNEGO):** Creating separate HTTP principals for the Ozone Manager and SCM web UIs/HTTPFS endpoints to enable browser-based Kerberos authentication.
4.  **Keytab Files:** Generating keytab files for each service and HTTP principal and distributing them securely to the respective hosts.
5.  **Ozone Configuration:** Configuring Ozone services with their principal names, keytab file locations, and enabling security settings.
6.  **Client Configuration:** Ensuring clients have valid Kerberos tickets (obtained via `kinit` or keytabs) before interacting with the secure Ozone cluster.

## Enabling Kerberos

To enable Kerberos authentication in Ozone, set the following properties in `ozone-site.xml` on all nodes:

```xml
<property>
  <name>ozone.security.enabled</name>
  <value>true</value>
  <description>Enable Ozone security features.</description>
</property>

<property>
  <name>hadoop.security.authentication</name>
  <value>kerberos</value>
  <description>Set the authentication mechanism to Kerberos.</description>
</property>
```

## Service Configuration

Each Ozone service needs its Kerberos principal and keytab configured.

**Ozone Manager (OM):**

```xml
<property>
  <name>ozone.om.kerberos.principal</name>
  <value>om/_HOST@YOUR-REALM.COM</value>
</property>
<property>
  <name>ozone.om.kerberos.keytab.file</name>
  <value>/etc/security/keytabs/om.keytab</value> <!-- Path to OM keytab -->
</property>
<!-- For OM Web UI/HTTPFS -->
<property>
  <name>ozone.om.http.kerberos.principal</name>
  <value>HTTP/_HOST@YOUR-REALM.COM</value>
</property>
<property>
  <name>ozone.om.http.kerberos.keytab.file</name>
  <value>/etc/security/keytabs/om-http.keytab</value> <!-- Path to OM HTTP keytab -->
</property>
```

**Storage Container Manager (SCM):**

```xml
<property>
  <name>hdds.scm.kerberos.principal</name>
  <value>scm/_HOST@YOUR-REALM.COM</value>
</property>
<property>
  <name>hdds.scm.kerberos.keytab.file</name>
  <value>/etc/security/keytabs/scm.keytab</value> <!-- Path to SCM keytab -->
</property>
<!-- For SCM Web UI -->
<property>
  <name>hdds.scm.http.kerberos.principal</name>
  <value>HTTP/_HOST@YOUR-REALM.COM</value>
</property>
<property>
  <name>hdds.scm.http.kerberos.keytab.file</name>
  <value>/etc/security/keytabs/scm-http.keytab</value> <!-- Path to SCM HTTP keytab -->
</property>
```

**Datanode:**

```xml
<property>
  <name>hdds.datanode.kerberos.principal</name>
  <value>dn/_HOST@YOUR-REALM.COM</value>
</property>
<property>
  <name>hdds.datanode.kerberos.keytab.file</name>
  <value>/etc/security/keytabs/dn.keytab</value> <!-- Path to Datanode keytab -->
</property>
```

*   Replace `_HOST` with the actual hostname placeholder used in your Kerberos principals (often requires `hadoop.security.dns.interface` or `hadoop.security.dns.nameserver` configuration).
*   Replace `YOUR-REALM.COM` with your actual Kerberos realm.
*   Ensure the specified keytab files exist on the respective nodes with correct permissions.

## Client Authentication

Clients (like the Ozone shell, Java applications, or Hadoop ecosystem tools) need to authenticate using Kerberos before communicating with a secure Ozone cluster. This typically involves:

1.  Running `kinit` with a user principal and password/keytab.
2.  Configuring the application's UGI (UserGroupInformation) to log in using a principal and keytab.

Once authenticated, the client UGI handles the Kerberos negotiation with Ozone services.

## Authentication vs. Authorization

Kerberos provides **authentication** – it verifies *who* the user or service is. It does **not** determine *what* the authenticated user is allowed to do. Authorization in Ozone is handled separately by mechanisms like [ACLs](./02-acls/README.mdx) or Apache Ranger, which operate based on the verified identity provided by Kerberos.
