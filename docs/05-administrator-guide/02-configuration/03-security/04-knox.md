---
sidebar_label: Apache Knox
---

# Configuring Apache Knox

[Apache Knox](https://knox.apache.org/) is a reverse proxy gateway for Hadoop ecosystem REST APIs and web UIs. Knox 2.0.0 and later can proxy Ozone web UIs (OM, SCM, and Recon). Knox **2.1.0 or later** is required to proxy HttpFS. Knox gives users a single HTTPS entry point while hiding internal cluster hostnames and ports.

Ozone integration was added in [KNOX-2833](https://issues.apache.org/jira/browse/KNOX-2833) (OM, SCM, and Recon UIs) and extended in [KNOX-2914](https://issues.apache.org/jira/browse/KNOX-2914) (HttpFS). Knox does **not** proxy the S3 Gateway today; use a load balancer or direct S3G access instead.

## Supported Ozone services

| Knox service role | Ozone component | Default HTTP port | Knox path prefix |
|---|---|---|---|
| `OZONE` | Ozone Manager UI | 9874 | `/ozone/` |
| `OZONE-SCM` | Storage Container Manager UI | 9876 | `/ozone-scm/` |
| `OZONE-RECON` | Recon UI | 9888 | `/ozone-recon/` |
| `OZONE-HTTPFS` | HttpFS Gateway | 14000 | `/httpfs/` |

## Prerequisites

- Apache Knox **2.0.0 or later** installed and running to proxy Ozone web UIs.
- Apache Knox **2.1.0 or later** if you proxy HttpFS through Knox.
- Ozone HTTP endpoints reachable from the Knox host (`ozone.om.http-address`, `ozone.scm.http-address`, `ozone.recon.http-address`, and HttpFS on port 14000 by default).
- For production: configure TLS on Knox and Kerberos SPNEGO on Ozone HTTP services. See [HTTPS / SPNEGO](./https) and [Kerberos](./kerberos).

## Topology configuration

Knox routes traffic based on **topology** XML files in `{GATEWAY_HOME}/conf/topologies/`. Create a topology (for example `ozone.xml`) that declares authentication providers and Ozone backend URLs.

### Example topology

The following example uses Knox demo LDAP for authentication. Replace hostnames and ports with your cluster values.

```xml
<?xml version="1.0" encoding="utf-8"?>
<topology>
    <gateway>
        <provider>
            <role>authentication</role>
            <name>ShiroProvider</name>
            <enabled>true</enabled>
            <param>
                <name>sessionTimeout</name>
                <value>30</value>
            </param>
            <param>
                <name>main.ldapRealm</name>
                <value>org.apache.knox.gateway.shirorealm.KnoxLdapRealm</value>
            </param>
            <param>
                <name>main.ldapContextFactory</name>
                <value>org.apache.knox.gateway.shirorealm.KnoxLdapContextFactory</value>
            </param>
            <param>
                <name>main.ldapRealm.contextFactory</name>
                <value>$ldapContextFactory</value>
            </param>
            <param>
                <name>main.ldapRealm.userDnTemplate</name>
                <value>uid={0},ou=people,dc=hadoop,dc=apache,dc=org</value>
            </param>
            <param>
                <name>main.ldapRealm.contextFactory.url</name>
                <value>ldap://knox-ldap.example.com:33389</value>
            </param>
            <param>
                <name>main.ldapRealm.contextFactory.authenticationMechanism</name>
                <value>simple</value>
            </param>
            <param>
                <name>urls./**</name>
                <value>authcBasic</value>
            </param>
        </provider>

        <provider>
            <role>identity-assertion</role>
            <name>Default</name>
            <enabled>true</enabled>
        </provider>

        <provider>
            <role>hostmap</role>
            <name>static</name>
            <enabled>true</enabled>
            <param>
                <name>om1.example.com</name>
                <value>om1.internal.example.com</value>
            </param>
        </provider>
    </gateway>

    <service>
        <role>OZONE</role>
        <url>http://om1.internal.example.com:9874</url>
    </service>

    <service>
        <role>OZONE-SCM</role>
        <url>http://scm1.internal.example.com:9876</url>
    </service>

    <service>
        <role>OZONE-RECON</role>
        <url>http://recon.internal.example.com:9888</url>
    </service>

    <service>
        <role>OZONE-HTTPFS</role>
        <url>http://httpfs.internal.example.com:14000/webhdfs/</url>
    </service>
</topology>
```

Place the file in `{GATEWAY_HOME}/conf/topologies/ozone.xml`. Knox automatically redeploys the topology when the file changes.

### High availability

When multiple Ozone Managers or SCMs run in HA, add a `<service>` entry for each instance. Knox uses a `?host={host}` query parameter on OM and SCM UI links so the gateway routes to the correct backend ([KNOX-2930](https://github.com/apache/knox/pull/767)). Configure the `hostmap` provider to rewrite internal hostnames embedded in UI responses.

### Secure clusters

For Kerberized Ozone clusters:

1. Enable SPNEGO on Ozone HTTP services as described in [HTTPS / SPNEGO](./https).
2. Configure Knox authentication with your enterprise identity provider (LDAP, SAML, or Kerberos) instead of demo LDAP.
3. Terminate TLS at Knox and use HTTPS between Knox and Ozone backends where possible.

## Ozone-side configuration

### HttpFS proxy user

When Knox proxies HttpFS, configure a proxy user on the HttpFS service so Knox can impersonate end users. Add the following to `httpfs-site.xml`:

```xml
<property>
  <name>httpfs.proxyuser.knoxuser.hosts</name>
  <value>*</value>
</property>
<property>
  <name>httpfs.proxyuser.knoxuser.groups</name>
  <value>*</value>
</property>
```

Replace `knoxuser` with the Unix or service account Knox uses to connect to HttpFS. Restrict `hosts` and `groups` in production. See [HttpFS Gateway](../../../user-guide/client-interfaces/httpfs#proxy-user-configuration) for details.

### HTTP addresses

Ensure each proxied service publishes the HTTP address Knox will use:

| Property | Example |
|---|---|
| `ozone.om.http-address` | `om1.example.com:9874` |
| `ozone.scm.http-address` | `scm1.example.com:9876` |
| `ozone.recon.http-address` | `recon.example.com:9888` |

## Accessing Ozone through Knox

After Knox and the topology are deployed, users reach Ozone through the Knox gateway URL.

### Knox homepage

Open the Knox homepage to see Ozone service cards:

```text
https://<knox-host>:8443/gateway/homepage/home
```

Authenticate with the credentials configured in the topology (for example, demo LDAP user `guest` with password `guest-password`).

### Web UIs

Direct links follow this pattern. For OM and SCM, the `host` query parameter must be the full backend URL (not just the hostname):

```text
https://<knox-host>:8443/gateway/ozone/ozone/index.html?host=http://<om-host>:9874
https://<knox-host>:8443/gateway/ozone/ozone-scm/index.html?host=http://<scm-host>:9876
https://<knox-host>:8443/gateway/ozone/ozone-recon/index.html
```

Replace `ozone` in the path with your topology name if different. In HA deployments, use the URL of the specific OM or SCM instance you want to reach.

### HttpFS REST API

Access HttpFS through Knox using the `/httpfs/` path prefix:

```bash
curl -ik -u guest:guest-password \
  "https://<knox-host>:8443/gateway/ozone/httpfs/v1/?op=LISTSTATUS&user.name=hadoop"
```

Knox authenticates the caller and rewrites `user.name` to the authenticated Knox user (for example, `guest` in the demo topology). HttpFS performs the operation as that proxied user.

## Docker quickstart

A sample Docker Compose stack that runs Ozone with Knox is available in this repository.

### Download the compose files

```bash
mkdir knox-ozone && cd knox-ozone
curl -O https://raw.githubusercontent.com/apache/ozone-site/master/static/compose/knox-ozone/docker-compose.yaml
curl -O https://raw.githubusercontent.com/apache/ozone-site/master/static/compose/knox-ozone/Dockerfile
mkdir -p conf/topologies
curl -o conf/httpfs-site.xml \
  https://raw.githubusercontent.com/apache/ozone-site/master/static/compose/knox-ozone/conf/httpfs-site.xml
curl -o conf/topologies/ozone.xml \
  https://raw.githubusercontent.com/apache/ozone-site/master/static/compose/knox-ozone/conf/topologies/ozone.xml
curl -o conf/topologies/knoxsso.xml \
  https://raw.githubusercontent.com/apache/ozone-site/master/static/compose/knox-ozone/conf/topologies/knoxsso.xml
```

### Start the stack

```bash
docker compose up -d --scale datanode=1
```

This starts Ozone (SCM, OM, Recon, S3G, HttpFS, one Datanode), Knox demo LDAP, and the Knox gateway with the `ozone` and `knoxsso` topologies mounted. The compose stack mounts `conf/httpfs-site.xml` on the HttpFS service for Knox proxy-user settings. The `knoxsso` topology is required for browser login — it must point LDAP at the `knox-ldap` service hostname, not `localhost`.

### Verify access

1. Wait about one minute for Knox to finish initializing, then open the Knox homepage:

   ```text
   https://localhost:8443/gateway/homepage/home
   ```

2. Log in with `guest` / `guest-password`.

3. Click the Ozone Manager, SCM, or Recon cards to open the proxied UIs. If a card does not load, open the UI directly using the full backend URL in the `host` parameter (for example, `?host=http://om:9874` for OM).

4. Test HttpFS through Knox:

   ```bash
   curl -ik -u guest:guest-password \
     "https://localhost:8443/gateway/ozone/httpfs/v1/?op=LISTSTATUS&user.name=hadoop"
   ```

### Stop the stack

```bash
docker compose down -v
```

## References

- [Apache Knox 2.0 User Guide](https://knox.apache.org/books/knox-2-0-0/user-guide.html)
- [KNOX-2833 — Ozone UI integration](https://issues.apache.org/jira/browse/KNOX-2833)
- [KNOX-2914 — Ozone HttpFS integration](https://issues.apache.org/jira/browse/KNOX-2914)
- [HttpFS Gateway](../../../user-guide/client-interfaces/httpfs)
- [HTTPS / SPNEGO](./https)
