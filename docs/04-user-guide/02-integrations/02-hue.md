---
sidebar_label: Hue
---

# Integrating Apache Hue with Ozone

Apache Hue provides a user-friendly web interface for interacting with various Hadoop ecosystem components, including file browsing. Hue can be configured to browse and manage data stored in Apache Ozone, leveraging Ozone's **HttpFS** interface, which offers WebHDFS-compatible REST endpoints.

## How Hue Interacts with Storage

Hue's File Browser and other components rely on Hadoop-compatible filesystem interfaces to:

- Browse directory structures.
- List files and directories with their metadata.
- Upload and download files.
- Perform basic file management operations (create directory, rename, move, copy, delete).
- Provide paths for data access to integrated query engines (like Hive, Impala).

## Ozone's HttpFS Interface for Hue

Ozone enables Hue integration through its built-in **HttpFS service**, which typically runs as part of the Ozone Manager (OM).

- **WebHDFS Compatibility:** The HttpFS service exposes a REST API at `/webhdfs/v1` that mimics the HDFS WebHDFS API. Hue uses this API to perform filesystem operations.
- **Translation:** HttpFS receives HTTP requests from Hue and translates them into Ozone RPC calls to the Ozone Manager.
- **Authentication:** Supports Kerberos (SPNEGO) for secure clusters, allowing Hue to authenticate securely.
- **Impersonation:** Supports Hadoop's proxy user mechanism, allowing the Hue service user to perform operations on behalf of the logged-in Hue user.

:::info Note
While Hue might be configured with `ofs://` as its default filesystem (`fs_defaultfs`) for linking with query engines, the **File Browser** functionality primarily uses the **HttpFS/WebHDFS** endpoint (`webhdfs_url`) to interact with Ozone's namespace.
:::

## Configuration Requirements

### 1. Ozone HttpFS Configuration

Ensure the Ozone Manager's HTTP/HTTPS interface is enabled and configured correctly in `ozone-site.xml`. HttpFS runs as part of the OM.

```xml
<configuration>

  <!-- Ensure OM HTTP(S) address is configured -->
  <property>
    <name>ozone.om.http.address</name>
    <value>om-host.example.com:9874</value>
    <description>Ozone Manager HTTP address.</description>
  </property>
  <property>
    <name>ozone.om.https.address</name>
    <value>om-host.example.com:9875</value>
    <description>Ozone Manager HTTPS address.</description>
  </property>
  <property>
    <name>ozone.om.http.enabled</name>
    <value>true</value> <!-- Or false if only using HTTPS -->
    <description>Enable OM HTTP endpoint.</description>
  </property>
  <property>
    <name>hdds.http.policy</name>
    <value>HTTP_ONLY</value> <!-- Or HTTPS_ONLY, HTTP_AND_HTTPS -->
    <description>Policy for HTTP/HTTPS endpoints.</description>
  </property>

  <!-- Kerberos Authentication for HttpFS (if cluster is secure) -->
  <property>
    <name>ozone.om.http.auth.type</name>
    <value>kerberos</value>
    <description>Authentication type for OM HTTP endpoint.</description>
  </property>
  <property>
    <name>ozone.om.http.kerberos.principal</name>
    <value>HTTP/om-host.example.com@YOUR-REALM.COM</value>
    <description>OM HTTP Kerberos principal (SPNEGO).</description>
  </property>
  <property>
    <name>ozone.om.http.kerberos.keytab.file</name>
    <value>/etc/security/keytabs/om-http.keytab</value> <!-- Path to OM HTTP keytab -->
    <description>OM HTTP Kerberos keytab file.</description>
  </property>

</configuration>
```

- Adjust hostnames, ports, security settings, and keytab paths according to your cluster setup.
- Restart Ozone Manager after making changes.

### 2. Hadoop Proxy User Configuration for Hue

To allow the Hue service user (e.g., `hue`) to impersonate end-users when accessing Ozone via HttpFS, configure Hadoop's proxy user settings in the `core-site.xml` used by the Ozone Manager.

```xml
<configuration>

  <property>
    <name>hadoop.proxyuser.hue.hosts</name>
    <!-- List of hosts where Hue service runs, or '*' for any host -->
    <value>hue-host.example.com,*</value>
    <description>Allow the 'hue' user to proxy requests from these hosts.</description>
  </property>

  <property>
    <name>hadoop.proxyuser.hue.groups</name>
    <!-- List of groups whose members the 'hue' user can impersonate, or '*' for any group -->
    <value>*</value>
    <description>Allow the 'hue' user to impersonate users belonging to these groups.</description>
  </property>

  <!-- Repeat for other proxy users if necessary -->

</configuration>
```

- Replace `hue` with the actual OS user running the Hue service.
- Replace `hue-host.example.com`with the actual hostname(s) where Hue runs. Using`*` is less secure but often simpler for initial setup.
- Restart Ozone Manager after modifying `core-site.xml`.

### 3. Hue Configuration (`hue.ini`)

Configure Hue to use Ozone's HttpFS endpoint and optionally set the default filesystem path. Edit the `[desktop]`and`[[ozone]]`sections in`hue.ini`:

```ini
[desktop]
# Define the default filesystem for Hue applications (e.g., Hive, Impala jobs)
# Use ofs:// with your OM Service ID for HA or OM address for non-HA
fs_defaultfs=ofs://ozonecluster/

# Secret key for session signing (ensure this is set securely)
secret_key=YourSecretKeyForHueSessionSigning

[[ozone]]
# This section configures the Ozone filesystem interface in Hue

  # URL for the Ozone Manager's HttpFS (WebHDFS compatible) endpoint
  # Use https:// if TLS is enabled for OM HTTP endpoint
  webhdfs_url=http://om-host.example.com:9874/webhdfs/v1

  # For secure clusters using Kerberos/SPNEGO for HttpFS:
  # security_enabled=true

  # For secure clusters using TLS/SSL:
  # Set to the path of the CA certificate bundle if using custom CAs,
  # or set to false to disable server certificate verification (INSECURE!).
  # ssl_cert_ca_verify=true
  # [[ssl]]
  # cacerts=/path/to/ca_bundle.pem

  # Set the default cluster name (optional, cosmetic)
  # nice_name="My Ozone Cluster"

```

- Replace `ofs://ozonecluster/`with your correct`ofs` path prefix (using your OM service ID).
- Replace `http://om-host.example.com:9874` with the actual HTTP(S) address of your Ozone Manager.
- Uncomment and configure `security_enabled`and`ssl_cert_ca_verify` as needed for secure clusters.
- Restart the Hue service after modifying `hue.ini`.

## Using Hue with Ozone via HttpFS (Recommended for Browsing)

After successful configuration using HttpFS, users logging into Hue should be able to use the **File Browser** application to navigate the Ozone namespace with filesystem semantics.

- **Browsing:** Navigate through volumes, buckets, and directories (especially in FSO buckets).
- **Operations:** Upload, download, create directories, rename, move, copy, delete files/directories (subject to user permissions in Ozone and limitations based on bucket layout).
- **File Viewing/Editing:** View and edit text-based files directly.

Data stored in Ozone can also be accessed by other Hue applications like the **Hive** and **Impala** query editors by referencing tables whose `LOCATION`points to`ofs://`paths (configured via`fs_defaultfs` or explicitly in table definitions).

## Using Hue with Ozone via S3 API (Alternative)

Hue also supports browsing S3-compatible storage directly. You can configure Hue to connect to Ozone's S3 Gateway endpoint. This method is primarily useful for browsing **OBS (Object Store)** buckets or when S3 access patterns are preferred.

### Hue Configuration for S3 (`hue.ini`)

Add or modify the `[[[s3]]]`section within `[desktop][[filebrowser]]`:

```ini
[desktop]
[[filebrowser]]
  [[[s3]]]
    # S3 API endpoint for the Ozone S3 Gateway
    host=ozone-s3g.example.com:9878 # Replace with your S3 Gateway host and port

    # Set to false if using HTTP, true for HTTPS
    use_ssl=false

    # AWS Region (often arbitrary for Ozone, but might be needed by Hue)
    region=us-east-1

    # Authentication Type: Set to 'AWS_V4' for standard S3 auth
    auth_provider_type=AWS_V4

    # Credentials can be sourced from environment variables, EC2 metadata,
    # or explicitly set here (less secure). For explicit setting:
    # access_key_id=YOUR_OZONE_S3_ACCESS_KEY
    # secret_access_key=YOUR_OZONE_S3_SECRET_KEY

    # Path style access is usually required for Ozone S3 Gateway
    use_path_style=true
```

- Replace `ozone-s3g.example.com:9878` with your S3 Gateway address.
- Configure `use_ssl` based on your S3 Gateway setup.
- Ensure Hue has access to the necessary S3 credentials (e.g., via environment variables `AWS_ACCESS_KEY_ID`and`AWS_SECRET_ACCESS_KEY`for the Hue process, or by configuring them directly in`hue.ini`).

### Considerations for S3 Browsing

- **Bucket Layout:** Browsing via S3 works best with **OBS buckets** due to their flat namespace matching S3 semantics. Browsing FSO buckets via S3 will show objects with `/` delimiters, but directory operations will have the limitations described previously (non-atomic, performance impact).
- **Functionality:** The Hue S3 browser might offer slightly different features compared to the HDFS/WebHDFS browser (e.g., regarding permission display or specific operations).
- **Primary Use:** This method is suitable if your primary interaction with certain Ozone buckets is through the S3 API and you want a consistent browsing experience within Hue for those buckets.

**In summary, while both HttpFS and S3 can be used to connect Hue to Ozone, HttpFS with FSO buckets provides a richer, more performant filesystem browsing experience, whereas S3 is better suited for interacting with OBS buckets.**

## Bucket Layout Considerations

- **FSO Recommended (via HttpFS):** For the best experience with Hue's File Browser using the default HttpFS/WebHDFS connection, use **File System Optimized (FSO)** buckets. FSO provides the hierarchical directory structure and filesystem semantics that Hue expects, leading to more intuitive browsing and efficient operations.
- **OBS (via S3):** If browsing **Object Store (OBS)** buckets, configuring Hue to connect directly via the S3 API is generally preferred, as it aligns better with OBS's flat namespace and object semantics.
- **FSO via S3:** Browsing FSO buckets via Hue's S3 connector is possible but inherits the limitations of S3 access to FSO (non-atomic directory operations, potential performance issues for directory-heavy tasks).

## Troubleshooting

- **Cannot Connect / "Could not connect to WebHDFS":**
  - Verify the `webhdfs_url`in`hue.ini` is correct and points to the running OM HTTP(S) endpoint.
  - Check network connectivity and firewalls between Hue and OM nodes.
  - Ensure the OM HTTP endpoint is enabled (`ozone.om.http.enabled`or`hdds.http.policy`).
  - Check OM logs for errors related to HttpFS.
- **Authentication Errors (Secure Clusters):**
  - Verify Kerberos principal and keytab settings for `ozone.om.http.kerberos.*`in`ozone-site.xml`.
  - Ensure the Hue server has a valid Kerberos ticket if `security_enabled=true`in`hue.ini`.
  - Check SPNEGO negotiation logs in OM.
- **Permission Denied / Impersonation Errors:**
  - Verify `hadoop.proxyuser.<hue_user>.*`settings in OM's`core-site.xml`.
  - Check Ozone ACLs for the user attempting the operation via Hue. Ensure the *end-user* (not just the Hue service user) has the necessary permissions on the target Ozone path.
  - If using Ranger, check Ranger policies.
- **File Operations Fail:**
  - Check Ozone ACLs/Ranger policies.
  - Ensure the target bucket is an **FSO bucket** for operations relying on directory semantics.
  - Check OM logs for specific error messages related to the failed operation.
