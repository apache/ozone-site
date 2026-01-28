---
sidebar_label: Web UI HTTPS
---

# Configuring HTTPS for Web UI

Ozone exposes multiple Web UIs (OM, SCM, Datanode, HttpFS, Recon, S3 Gateway). This page describes how to enable HTTPS for these Web UIs and how to configure optional mutual TLS (mTLS) using server and client certificates.

For authentication (Kerberos/SIMPLE) of the HTTP endpoints, see the **Securing HTTP** documentation. This page focuses on transport encryption only.

## 1. Enabling HTTPS endpoints

HTTPS for Web UIs is controlled globally by the `ozone.http.policy` property.

**Configuration key**

| Property | Default | Description |
|----------|---------|--------------|
| `ozone.http.policy` | `HTTP_ONLY` | Controls whether HTTPS is enabled for Ozone daemons' HTTP endpoints. |

**Supported values** (from [`ozone-default.xml`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/resources/ozone-default.xml)):

- `HTTP_ONLY`: Service is provided only over HTTP.
- `HTTPS_ONLY`: Service is provided only over HTTPS.
- `HTTP_AND_HTTPS`: Both HTTP and HTTPS ports are enabled.

To enable HTTPS for Web UIs, set the policy in `ozone-site.xml`, for example:

```xml
<property>
  <name>ozone.http.policy</name>
  <value>HTTPS_ONLY</value>
</property>
```

Or, to keep both HTTP and HTTPS available:

```xml
<property>
  <name>ozone.http.policy</name>
  <value>HTTP_AND_HTTPS</value>
</property>
```

## 2. HTTP vs HTTPS ports for Web UIs

Each service has separate configuration keys for its HTTP and HTTPS Web UI endpoints. HTTPS uses different ports than HTTP.

**Example: Ozone Manager (OM)**

From `ozone-default.xml` and the Network Ports reference:

- `ozone.om.http-address` – default `0.0.0.0:9874` (HTTP Web UI)
- `ozone.om.https-address` – default `0.0.0.0:9875` (HTTPS Web UI)

Example in `ozone-site.xml`:

```xml
<property>
  <name>ozone.om.http-address</name>
  <value>0.0.0.0:9874</value>
</property>

<property>
  <name>ozone.om.https-address</name>
  <value>0.0.0.0:9875</value>
</property>
```

When HA is enabled, append the service ID and node ID to each property, for example: `ozone.om.https-address.service1.om1`.

**Other services**

The same pattern is used for other Web UIs:

- **SCM**: `ozone.scm.http-address`, `ozone.scm.https-address` (defaults 0.0.0.0:9876, 0.0.0.0:9877)
- **Recon**: `ozone.recon.http-address`, `ozone.recon.https-address` (defaults 0.0.0.0:9888, 0.0.0.0:9889)
- **S3 Gateway (S3G)**: `ozone.s3g.http-address`, `ozone.s3g.https-address` (defaults 0.0.0.0:9878, 0.0.0.0:9879)
- **Datanode**: `hdds.datanode.http-address`, `hdds.datanode.https-address` (defaults 0.0.0.0:9882, 0.0.0.0:9883)
- **HttpFS**: use `httpfs.http.port` and corresponding SSL settings (see HttpFS documentation)

See the [Default Ports](../../../basic/network/default-ports) reference for the full list of default ports and keys.

## 3. Server keystore and truststore configuration

Ozone uses standard Hadoop SSL configuration. The main entry point is the server keystore resource.

**Configuration keys**

From [`ozone-default.xml`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/resources/ozone-default.xml):

| Property | Default | Description |
|----------|---------|--------------|
| `ozone.https.server.keystore.resource` | `ssl-server.xml` | Resource file from which server keystore information is read |
| `ssl.server.keystore.location` | *(empty)* | Filesystem path to the server keystore file |
| `ssl.server.keystore.password` | *(empty)* | Password for the server keystore |
| `ssl.server.keystore.keypassword` | *(empty)* | Password for the private key in the keystore |
| `ssl.server.truststore.location` | *(empty)* | Filesystem path to the server truststore file |
| `ssl.server.truststore.password` | *(empty)* | Password for the server truststore |

**Step 1 – Point Ozone to the server SSL resource**

In `ozone-site.xml`, you can override the server SSL resource file name:

```xml
<property>
  <name>ozone.https.server.keystore.resource</name>
  <value>ssl-server.xml</value>
</property>
```

This resource is usually found on the classpath and contains the keystore/truststore definitions.

**Step 2 – Define keystore and truststore in the SSL resource**

In the referenced `ssl-server.xml` (or the file named by `ozone.https.server.keystore.resource`), configure the keystore and truststore locations and passwords:

```xml
<configuration>
  <property>
    <name>ssl.server.keystore.location</name>
    <value>/etc/security/keystores/ozone-server.jks</value>
  </property>

  <property>
    <name>ssl.server.keystore.password</name>
    <value>changeit</value>
  </property>

  <property>
    <name>ssl.server.keystore.keypassword</name>
    <value>changeit</value>
  </property>

  <property>
    <name>ssl.server.truststore.location</name>
    <value>/etc/security/keystores/ozone-truststore.jks</value>
  </property>

  <property>
    <name>ssl.server.truststore.password</name>
    <value>changeit</value>
  </property>
</configuration>
```

**Requirements**

- The keystore must contain a certificate whose hostname matches the Web UI URL.
- All hosts running Ozone Web UI roles must be able to read the keystore and truststore files.
- Use strong passwords and protect these files carefully.

## 4. Enabling mutual TLS (mTLS)

By default, the server does **not** require a client certificate.

**Configuration keys**

From [`ozone-default.xml`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/resources/ozone-default.xml):

| Property | Default | Description |
|----------|---------|--------------|
| `ozone.https.client.need-auth` | `false` | Whether SSL client certificate authentication is required (mTLS). |
| `ozone.https.client.keystore.resource` | `ssl-client.xml` | Resource file describing the client keystore/truststore. |

To require client certificates (mTLS) for HTTPS Web UIs:

```xml
<property>
  <name>ozone.https.client.need-auth</name>
  <value>true</value>
</property>
```

Then configure the client SSL resource:

```xml
<property>
  <name>ozone.https.client.keystore.resource</name>
  <value>ssl-client.xml</value>
</property>
```

In `ssl-client.xml`, define the client keystore and truststore, for example:

```xml
<configuration>
  <property>
    <name>ssl.client.keystore.location</name>
    <value>/etc/security/keystores/ozone-client.jks</value>
  </property>

  <property>
    <name>ssl.client.keystore.password</name>
    <value>changeit</value>
  </property>

  <property>
    <name>ssl.client.truststore.location</name>
    <value>/etc/security/keystores/ozone-client-truststore.jks</value>
  </property>

  <property>
    <name>ssl.client.truststore.password</name>
    <value>changeit</value>
  </property>
</configuration>
```

**mTLS considerations**

- The server truststore (`ssl.server.truststore.location`) must trust the CA that signed client certificates.
- The client truststore must trust the server certificate's CA.
- For browser access, client certificates must be available in the browser's key store or the underlying OS keychain.

## 5. Example minimal configuration

Below is a minimal example that enables HTTPS-only access to the OM Web UI with server-side TLS.

In `ozone-site.xml`:

```xml
<configuration>
  <property>
    <name>ozone.http.policy</name>
    <value>HTTPS_ONLY</value>
  </property>

  <property>
    <name>ozone.om.https-address</name>
    <value>0.0.0.0:9875</value>
  </property>

  <property>
    <name>ozone.https.server.keystore.resource</name>
    <value>ssl-server.xml</value>
  </property>
</configuration>
```

In the referenced `ssl-server.xml`:

```xml
<configuration>
  <property>
    <name>ssl.server.keystore.location</name>
    <value>/etc/security/keystores/ozone-server.jks</value>
  </property>
  <property>
    <name>ssl.server.keystore.password</name>
    <value>changeit</value>
  </property>
  <property>
    <name>ssl.server.keystore.keypassword</name>
    <value>changeit</value>
  </property>
  <property>
    <name>ssl.server.truststore.location</name>
    <value>/etc/security/keystores/ozone-truststore.jks</value>
  </property>
  <property>
    <name>ssl.server.truststore.password</name>
    <value>changeit</value>
  </property>
</configuration>
```

After configuring the server (and optionally client) keystores, restart Ozone services so the HTTPS and mTLS settings take effect.
