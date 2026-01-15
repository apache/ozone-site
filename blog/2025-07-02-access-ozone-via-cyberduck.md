---
title: "Accessing Ozone S3 via CyberDuck"
date: 2025-07-02
authors: ["apache-ozone-community"]
tags: [Ozone, S3, CyberDuck]
---

Here's a step‑by‑step guide to mounting and managing your Apache Ozone object store's S3 interface using CyberDuck.

<!-- truncate -->

## Prerequisites

1. **Running Ozone S3 Gateway**
   Make sure your Ozone cluster is up and the S3 Gateway (s3g) is running. By default it listens on port **9878** over HTTP (and 9879 for HTTPS) at the host where you started it.

2. **Credentials**
   - **No security:** You can use any values for AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
   - **With Kerberos security enabled:**

     ```bash
     kinit -kt /etc/security/keytabs/<user>.keytab <user>@YOUR.REALM
     ozone s3 getsecret
     # → awsAccessKey=<user>@YOUR.REALM
     #   awsSecret=<long‑hex‑string>
     ```

   These exports give you the Access Key ID and Secret you'll plug into CyberDuck.

---

## 1. Install CyberDuck

1. Download CyberDuck from https://cyberduck.io and install it on your Mac or Windows machine.
2. Launch CyberDuck.

---

## 2. Create a New S3 Connection

1. The bundled S3 profile in CyberDuck does not permit a custom network port, and does not allow HTTP. You may need to install additional profiles to allow those.
   1. Select a profile from [Ozone S3 CyberDuck profiles](https://gist.github.com/jojochuang/9e15acee99b528ee879f7a280b8f79f7#file-ozone-s3-cyberduck-profiles-md).
   2. For example, download the **[Ozone S3 `HTTP.cyberduckprofile`](https://gist.github.com/jojochuang/9e15acee99b528ee879f7a280b8f79f7#file-ozone-s3-http-cyberduckprofile)** if your gateway is HTTP.
   3. Or download the **[Ozone S3 (HTTP) with path-style `addressing.cyberduckprofile`](https://gist.github.com/jojochuang/9e15acee99b528ee879f7a280b8f79f7#file-ozone-s3-http-with-path-style-addressing-cyberduckprofile)**.
   4. Installing the file by double-clicking a `.cyberduckprofile` file
   5. Check out the [CyberDuck user documentation](https://docs.cyberduck.io/protocols/s3) for more details.
2. In CyberDuck, click **Open Connection** (or press ⌘ N).
3. From the **Protocol** dropdown choose **Ozone S3 (HTTP)** if your gateway is configured for HTTP), or **Apache Ozone S3 HTTP path style** if the gateway is configured with Path-Style Addressing.
4. Fill in the fields:
   - **Server:** `<ozone‑s3‑host>` (e.g. `ozone.example.com`)
   - **Port:** `9878` (or `9879` for HTTPS)
   - **Access Key ID:** the `awsAccessKey` you obtained
   - **Secret Access Key:** the `awsSecret` you obtained
5. Click the little **▶** triangle next to **More Options** and ensure **Use SSL** is unchecked if you're connecting over plain HTTP.
6. **Path‑Style Addressing** (default) vs **Virtual‑Host Style**:
   - By default Ozone uses **path‑style** (`http://host:9878/bucket`).
   - If you've set `ozone.s3g.domain.name` in your `ozone-site.xml`, you can switch to virtual‑host style and CyberDuck will use `bucket.host:9878` URLs.

---

## 3. Save as a Bookmark (Optional)

1. Click the dropdown arrow next to the **Connect** button and choose **Bookmark** ▶ **Add Bookmark**.
2. Give it a name like "Ozone S3" so you can reconnect quickly.

---

## 4. Browsing and Basic Operations

Once connected, your CyberDuck window will list all buckets in the default `/s3v` volume as top‑level entries.

- **List Buckets:** All existing buckets appear as folders.
- **Create Bucket:** Click the "+" (New Folder) icon, enter a bucket name, and press **Return**.
- **Upload Files:** Drag‑and‑drop files from your desktop into a bucket folder.
- **Download Files:** Right‑click an object and choose **Download To…**
- **Delete Objects/Buckets:** Select the file or bucket, press the **Delete** key, and confirm.

---

## 5. Working with Other Volumes

Ozone's namespace includes volumes beyond `/s3v`. To expose a bucket from another volume:

```shell
ozone sh volume create /vol1
ozone sh bucket create /vol1/bucket1
ozone sh bucket link /vol1/bucket1 /s3v/common-bucket
```

After linking, you'll see `common-bucket` in CyberDuck and can manage it just like any other S3 bucket.

---

## 6. Tips & Troubleshooting

- **Permissions:** If you get "Access Denied," double‑check that you've generated or revoked/re‑generated your S3 secret correctly.
- **SSL Errors:** If you enable HTTPS on the gateway, make sure you either trust the certificate in CyberDuck or use a CA‑signed cert.
- **Firewall/Network:** Ensure your machine can reach `<ozone‑s3‑host>:9878` (e.g. `telnet hostname 9878`).
- **Bookmarks Sync:** CyberDuck can sync bookmarks via Dropbox or iCloud so you can share connections across devices.

---

You're all set! Enjoy browsing and managing your Ozone object store through a familiar S3 GUI.
