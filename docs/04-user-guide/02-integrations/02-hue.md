---
sidebar_label: Hue
---

# Hue

[Cloudera Hue](https://docs.gethue.com/) provides a web interface for browsing files, running SQL, and working with data across many storage and query engines. Hue's **File Browser** can browse Apache Ozone volumes, buckets, and paths when Ozone is exposed through the **Ozone HttpFS gateway** and its WebHDFS-compatible REST API.

Hue does **not** browse Ozone through the Ozone Manager (OM) HTTP endpoint or through the Ozone S3 Gateway. HttpFS is a separate Ozone role; see the [HttpFS Gateway](../client-interfaces/httpfs) documentation.

## Architecture

```text
Cloudera Hue (File Browser) --WebHDFS REST--> Ozone HttpFS gateway --Ozone RPC--> Ozone Manager
```

## Prerequisites

- A running Ozone cluster with the **HttpFS** role enabled.
- Network connectivity from the Hue server to the HttpFS host and port (Docker Compose exposes HttpFS on port **14000** by default).
- For secure clusters: Kerberos (SPNEGO) on HttpFS and TLS as required by your deployment.

To try the steps locally, start an Ozone cluster with Docker Compose as described in the [Docker quick start](../../quick-start/installation/docker) or [developer Docker Compose guide](../../developer-guide/run/docker-compose). The default stack includes an `httpfs` service on `localhost:14000`.

## Configure HttpFS

Ensure the HttpFS gateway is running and reachable at `http(s)://<httpfs-host>:<port>/webhdfs/v1`.

### Proxy user for Hue

Hue runs as a service user (for example `hue`) and performs File Browser operations on behalf of the logged-in Hue user. Configure HttpFS proxy-user settings in **`httpfs-site.xml`**, not in OM `core-site.xml`. See [Proxy User Configuration](../client-interfaces/httpfs#proxy-user-configuration) and [apache/ozone#9596](https://github.com/apache/ozone/pull/9596) (HDDS-14352).

Replace `hue` with the OS user that runs the Hue process:

```xml
<property>
  <name>httpfs.proxyuser.hue.hosts</name>
  <value>*</value>
</property>
<property>
  <name>httpfs.proxyuser.hue.groups</name>
  <value>*</value>
</property>
```

Restrict `hosts` and `groups` in production instead of using `*`. Restart HttpFS after changing `httpfs-site.xml`.

On Docker Compose, you can set the same properties through HttpFS environment variables (for example `CORE-SITE.XML_httpfs.proxyuser.hue.hosts=*`).

### Verify HttpFS with curl

Before configuring Hue, confirm WebHDFS works against your HttpFS gateway:

```bash
# Create a volume
curl -i -X PUT "http://localhost:14000/webhdfs/v1/huevol?op=MKDIRS&user.name=hdfs"

# Create a bucket
curl -i -X PUT "http://localhost:14000/webhdfs/v1/huevol/huebucket?op=MKDIRS&user.name=hdfs"

# List the bucket
curl -i "http://localhost:14000/webhdfs/v1/huevol/huebucket?op=LISTSTATUS&user.name=hdfs"
```

Additional examples are in [HttpFS Gateway](../client-interfaces/httpfs#getting-started).

## Configure Hue (`hue.ini`)

Add an Ozone filesystem definition under `[[ozone]]` / `[[[default]]]`. Put `fs_defaultfs` in that nested block, not under `[desktop]`. The `webhdfs_url` must point at the **HttpFS gateway**, not the OM HTTP port (`9874`).

Non-secure cluster example:

```ini
[desktop]
# Ozone does not support the /append WebHDFS API; disable chunked uploads.
enable_chunked_file_uploader=false

[[ozone]]
[[[default]]]
fs_defaultfs=ofs://om
webhdfs_url=http://httpfs:14000/webhdfs/v1
```

- **`fs_defaultfs`**: Use `ofs://<service-id>` for HA (`ozone.service.id`) or `ofs://<om-host>` for a single OM. Docker Compose uses `ofs://om`.
- **`webhdfs_url`**: HttpFS WebHDFS base URL, for example `http://localhost:14000/webhdfs/v1` from the host or `http://httpfs:14000/webhdfs/v1` on the Docker network.

Secure cluster additions:

```ini
[[ozone]]
[[[default]]]
fs_defaultfs=ofs://ozonecluster
webhdfs_url=https://httpfs-host.example.com:14000/webhdfs/v1
security_enabled=true
ssl_cert_ca_verify=true
```

Optional settings from the [Cloudera Hue Ozone guide](https://docs.cloudera.com/cdp-private-cloud-base/7.1.9/administering-hue/topics/hue-browse-ozone-fs.html):

- **`upload_chunk_size`**: Increase the upload chunk size (in bytes) for large files. Default is 64 MB.
- **`[[[default]]]` `nice_name`**: Display name for the Ozone filesystem in Hue.

Restart Hue after editing `hue.ini`.

## Hue user permissions

After Ozone is configured in `hue.ini`, grant users access to the Ozone File Browser. Log in to Hue as an administrator, open **Administer Users**, go to the **Groups** tab, select the target group, and enable:

`filebrowser.ofs_access` — Access to OFS from filebrowser and filepicker

Click **Update group** to save. Non-admin users cannot browse Ozone until this permission is granted to their group. See the [Cloudera Hue Ozone guide](https://docs.cloudera.com/cdp-private-cloud-base/7.1.9/administering-hue/topics/hue-browse-ozone-fs.html).

## Using Hue with Ozone

After HttpFS, `hue.ini`, and permissions are configured:

1. Sign in to Hue and open **File Browser**.
2. Select the **Ozone** filesystem in the left navigation.
3. Browse volumes, buckets, and directories (especially in **FSO** buckets).
4. Upload, download, create directories, and perform other supported file operations subject to Ozone ACLs and Hue limitations below.

Query engines integrated with Hue (for example Hive or Impala) can reference `ofs://` paths in table `LOCATION` values when `fs_defaultfs` is set correctly. See [Hive](./hive) for Ozone table examples.

## Limitations

Hue supports browsing Ozone through HttpFS, but some operations are limited. See the [Cloudera limitations documentation](https://docs-archive.cloudera.com/cdw-runtime/1.5.1/administering-hue/topics/hue-browse-ozone-fs-limitations.html).

- **Copy size**: Hue skips files larger than the upload chunk size (default 64 MB) when copying directories recursively. Increase `upload_chunk_size` in `hue.ini` if needed.
- **Append / chunked upload**: Ozone does not implement WebHDFS `/append`. Set `enable_chunked_file_uploader=false` so Hue uploads each file as a single chunk.
- **User home**: Users default to the `ofs://` root when opening Ozone in File Browser.
- **Volumes and buckets**: Hue can create the default volume and bucket only; other volume/bucket management uses the Ozone CLI or Recon.
- **Erasure Coding**: Hue cannot create EC-enabled buckets. Create EC buckets with the Ozone CLI and browse them from Hue.

## Bucket layout

- **FSO (recommended)**: File System Optimized buckets provide hierarchical directories and work best with Hue File Browser over HttpFS/WebHDFS.
- **OBS**: Object Store buckets use a flat key namespace. Hue File Browser is intended for filesystem semantics over HttpFS; use FSO buckets for directory-oriented browsing.

## Troubleshooting

### Cannot connect / "Could not connect to WebHDFS"

- Confirm `webhdfs_url` points to the **HttpFS** gateway (`/webhdfs/v1`), not OM port `9874`.
- Check network connectivity and firewalls between Hue and HttpFS.
- Verify HttpFS is running and responds to curl `LISTSTATUS` (see [Configure HttpFS](#configure-httpfs)).
- Review HttpFS logs for errors.

### Authentication errors (secure clusters)

- Verify HttpFS Kerberos principal and keytab configuration.
- Set `security_enabled=true` in the `[[[default]]]` Ozone block when HttpFS uses SPNEGO.
- For TLS, set `ssl_cert_ca_verify` and provide CA certificates as required.

### Permission denied / impersonation errors

- Verify `httpfs.proxyuser.<hue_user>.hosts` and `httpfs.proxyuser.<hue_user>.groups` in `httpfs-site.xml`.
- Ensure the **end user** (not only the Hue service user) has Ozone ACLs on the target path.
- Confirm the user's Hue group has `filebrowser.ofs_access`.

### File operations fail

- Check Ozone ACLs and Ranger policies for the impersonated user.
- Prefer **FSO** buckets for directory create, rename, and delete operations.
- Check HttpFS and OM logs for the specific WebHDFS operation that failed.
