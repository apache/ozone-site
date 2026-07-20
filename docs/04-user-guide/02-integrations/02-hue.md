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

For an all-in-one **Hue + Ozone** verification stack (HttpFS, Hue, and a Postgres database for Hue users), use the compose files under [`static/compose/hue-ozone/`](https://github.com/apache/ozone-site/tree/master/static/compose/hue-ozone) in this repository:

```bash
cd static/compose/hue-ozone
docker compose up -d --scale datanode=3
./init-demo-data.sh
```

Hue listens on `http://localhost:8888` (default login: `admin` / `admin`). The stack includes a **Postgres** service so Hue persists users and avoids embedded-DB issues during local testing.

Run `./init-demo-data.sh` after the cluster starts. It creates `huevol` / `huevol/huebucket` owned by `admin` so the default Hue login can see them at `ofs://om`. WebHDFS `MKDIRS` alone creates volumes owned by the WebHDFS user (`hue`, `hdfs`, etc.); other Hue users see an empty Ozone root until they have **LIST** access on those volumes.

In the Hue sidebar, open **Ozone** (not **Files**). **Files** is the HDFS browser and is disabled in this stack because there is no NameNode.

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

Hue also issues proxied Ozone RPC calls through HttpFS. Configure matching `hadoop.proxyuser.hue.hosts` and `hadoop.proxyuser.hue.groups` in OM `core-site.xml` (not only in HttpFS `httpfs-site.xml`).

Restrict `hosts` and `groups` in production instead of using `*`. Restart HttpFS after changing `httpfs-site.xml`.

On Docker Compose, set proxy-user properties on the **HttpFS** container with the `HTTPFS-SITE.XML_` prefix (they belong in `httpfs-site.xml`, not `core-site.xml`):

```bash
HTTPFS-SITE.XML_httpfs.proxyuser.hue.hosts=*
HTTPFS-SITE.XML_httpfs.proxyuser.hue.groups=*
```

HttpFS runs as the `hadoop` OS user. WebHDFS curl checks that pass `user.name=hadoop` (or another proxy user) also require:

- `HTTPFS-SITE.XML_httpfs.proxyuser.hadoop.hosts` and `HTTPFS-SITE.XML_httpfs.proxyuser.hadoop.groups` on the HttpFS container
- `CORE-SITE.XML_hadoop.proxyuser.hadoop.hosts` and `CORE-SITE.XML_hadoop.proxyuser.hadoop.groups` on the OM container so OM accepts proxied RPC calls from HttpFS

### Verify HttpFS with curl

Before configuring Hue, confirm WebHDFS works against your HttpFS gateway:

```bash
# After ./init-demo-data.sh in static/compose/hue-ozone (creates admin-owned paths)
curl -i "http://localhost:14000/webhdfs/v1/?op=LISTSTATUS&user.name=admin"
curl -i "http://localhost:14000/webhdfs/v1/huevol?op=LISTSTATUS&user.name=admin"
curl -i "http://localhost:14000/webhdfs/v1/huevol/huebucket?op=LISTSTATUS&user.name=admin"
```

To create paths manually with the Ozone shell (recommended so you control volume owner and bucket layout):

```bash
docker compose exec om ozone sh volume create /huevol -u admin
docker compose exec om ozone sh bucket create /huevol/huebucket --layout fso
```

WebHDFS `MKDIRS` can also create volumes and buckets, but the volume owner is the `user.name` in the request. Hue impersonates the logged-in user, so a volume created as `user.name=hue` is not listed at `ofs://om` for the `admin` Hue account unless `admin` has **LIST** ACLs on that volume.

Additional examples are in [HttpFS Gateway](../client-interfaces/httpfs#getting-started).

## Configure Hue (`hue.ini`)

Add an Ozone filesystem definition under `[[ozone]]` / `[[[default]]]`. Put `fs_defaultfs` in that nested block, not under `[desktop]`. The `webhdfs_url` must point at the **HttpFS gateway**, not the OM HTTP port (`9874`).

Non-secure cluster example:

```ini
[desktop]
# Ozone does not support the /append WebHDFS API; disable chunked uploads.
enable_chunked_file_uploader=false

# Local compose only: Postgres backing store for Hue users (see static/compose/hue-ozone).
[[database]]
engine=postgresql_psycopg2
host=postgres
port=5432
user=hue
password=hue
name=hue

[[ozone]]
[[[default]]]
fs_defaultfs=ofs://om
webhdfs_url=http://httpfs:14000/webhdfs/v1
nice_name=Ozone

[hadoop]
# Disable HDFS/YARN defaults; this stack uses Ozone only.
[[hdfs_clusters]]
[[[default]]]
is_enabled=false

[[yarn_clusters]]
[[[default]]]
is_enabled=false
```

- **`[[database]]`**: Optional for production CDP deployments; required in the bundled `hue-ozone` compose stack so Hue persists users in Postgres instead of an embedded database.

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

### HDFS "Files" shows `/user/admin` or port 50070 errors

Hue ships with a default **HDFS** File Browser that points at `localhost:50070`. In an Ozone-only deployment there is no NameNode, so **Files** fails with connection refused. Use the **Ozone** entry in the left sidebar instead, or disable HDFS in `hue.ini`:

```ini
[hadoop]
[[hdfs_clusters]]
[[[default]]]
is_enabled=false
```

The bundled `static/compose/hue-ozone/hue.ini` already disables HDFS and YARN for this reason.

### Cannot connect / "Could not connect to WebHDFS"

- Confirm `webhdfs_url` points to the **HttpFS** gateway (`/webhdfs/v1`), not OM port `9874`.
- Check network connectivity and firewalls between Hue and HttpFS.
- Verify HttpFS is running and responds to curl `LISTSTATUS` (see [Configure HttpFS](#configure-httpfs)).
- Review HttpFS logs for errors.

### Authentication errors (secure clusters)

- Verify HttpFS Kerberos principal and keytab configuration.
- Set `security_enabled=true` in the `[[[default]]]` Ozone block when HttpFS uses SPNEGO.
- For TLS, set `ssl_cert_ca_verify` and provide CA certificates as required.

### Ozone File Browser is empty at `ofs://om`

- Hue lists volumes visible to the **logged-in Hue user** (HttpFS `doas`). Volumes created with `user.name=hue` or `user.name=hdfs` are owned by that user and do not appear at the root for `admin` unless `admin` has **LIST** ACLs on the volume.
- In `static/compose/hue-ozone`, run `./init-demo-data.sh` after `docker compose up` to recreate `huevol` / `huebucket` owned by `admin`.
- Grant the Hue user **LIST** (or **ALL**) on the volume with `ozone sh volume setacl`, or create the volume with `ozone sh volume create /vol -u <hue-user>`.

### Permission denied / impersonation errors

- Verify `httpfs.proxyuser.<hue_user>.hosts` and `httpfs.proxyuser.<hue_user>.groups` in **`httpfs-site.xml`** (on Docker Compose, use `HTTPFS-SITE.XML_httpfs.proxyuser.<hue_user>.*` on the HttpFS container — not `CORE-SITE.XML_`).
- If Hue reports `User: hue is not allowed to impersonate admin`, HttpFS is missing or not reading the Hue proxy-user settings; recreate the HttpFS container after fixing `httpfs-site.xml`.
- Ensure the **end user** (not only the Hue service user) has Ozone ACLs on the target path.
- Confirm the user's Hue group has `filebrowser.ofs_access`.

### File operations fail

- Check Ozone ACLs and Ranger policies for the impersonated user.
- Prefer **FSO** buckets for directory create, rename, and delete operations.
- Check HttpFS and OM logs for the specific WebHDFS operation that failed.
- On Docker Compose dev clusters, the default SCM block size (256 MB) can prevent small file uploads because datanodes cannot satisfy the reserved space. Lower `ozone.scm.block.size` and `ozone.scm.container.size` in `ozone-site.xml` for local testing, as described in the [Docker Compose guide](../../developer-guide/run/docker-compose#step-3-configure-your-deployment-optional).

### Hue login or user errors (local Docker)

- Ensure the `postgres` service is healthy before Hue starts (`docker compose ps`).
- Confirm `hue.ini` includes the `[[database]]` block with `engine=postgresql_psycopg2` and host `postgres`, matching the compose environment variables.

### Volume or bucket already exists (curl verification)

Re-running the HttpFS `MKDIRS` curl examples against the same volume or bucket name returns HTTP 500 with `Volume already exists` or a similar error. Use new names, or treat the response as confirmation that the path is already present.
