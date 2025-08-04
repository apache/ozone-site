---
sidebar_label: HTTPFS
---

# HTTPFS

Apache Ozone provides an HTTPFS (HTTP File System) REST API endpoint, offering a way to interact with the Ozone namespace using standard HTTP methods. It's similar in concept to HDFS WebHDFS or HttpFS.

## Overview

The HTTPFS service typically runs as part of the Ozone Manager (OM) process. It exposes REST endpoints that allow clients to perform filesystem-like operations over HTTP/HTTPS.

**Key Features:**

*   **RESTful API:** Provides access via standard HTTP verbs (GET, PUT, POST, DELETE).
*   **Filesystem Operations:** Supports operations like creating files/directories, reading files, listing directories, getting file status, renaming, and deleting.
*   **Compatibility:** Aims for compatibility with the WebHDFS REST API where applicable, allowing some tools built for WebHDFS to potentially work with Ozone's HTTPFS with minimal changes.
*   **Authentication:** Supports Kerberos (SPNEGO) for secure clusters. Simple authentication might be available in non-secure setups.
*   **Bucket Layout:** Primarily interacts with Ozone using filesystem semantics, making it more naturally suited for [FSO buckets](../../03-core-concepts/01-namespace/02-buckets/04-layouts/02-file-system-optimized.md).

## Endpoint URL

The base URL for the HTTPFS API typically follows this pattern:

`http(s)://<om-http(s)-address>/webhdfs/v1`

*   `<om-http(s)-address>`: The HTTP or HTTPS address of the Ozone Manager (e.g., `om.example.com:9874`).

The specific path for operations then includes the Ozone volume, bucket, and key path:

`/webhdfs/v1/<volumeName>/<bucketName>/path/to/key?op=<operation>[&...]`

## Common Operations (`op=...`)

*   `GETFILESTATUS`: Get metadata about a file or directory.
*   `LISTSTATUS`: List the contents of a directory.
*   `OPEN`: Read the content of a file.
*   `CREATE`: Create (or overwrite) a file. Data is usually sent in the request body or via a subsequent redirect.
*   `MKDIRS`: Create a directory (and any parent directories if needed).
*   `RENAME`: Rename a file or directory.
*   `DELETE`: Delete a file or directory.
*   `SETPERMISSION`: Set POSIX-style permissions (less common with Ozone ACLs).
*   `SETOWNER`: Set the owner/group.

*(Note: This is not an exhaustive list, and exact parameter names might vary slightly from WebHDFS.)*

## Usage Example (`curl`)

```bash
# Assuming OM HTTP address is om.example.com:9874 and using non-secure cluster

# Get status of /vol1/bucket1/mydata.txt
curl -i "http://om.example.com:9874/webhdfs/v1/vol1/bucket1/mydata.txt?op=GETFILESTATUS"

# List contents of /vol1/bucket1/
curl -i "http://om.example.com:9874/webhdfs/v1/vol1/bucket1/?op=LISTSTATUS"

# Read the content of /vol1/bucket1/mydata.txt (may involve redirects)
curl -L "http://om.example.com:9874/webhdfs/v1/vol1/bucket1/mydata.txt?op=OPEN"

# Create a directory /vol1/bucket1/newdir
curl -i -X PUT "http://om.example.com:9874/webhdfs/v1/vol1/bucket1/newdir?op=MKDIRS"

# Create a file /vol1/bucket1/newfile.txt (may involve redirects for data upload)
# Note: Actual data upload often requires a second PUT request to a Datanode URL provided in a redirect.
curl -i -X PUT "http://om.example.com:9874/webhdfs/v1/vol1/bucket1/newfile.txt?op=CREATE&overwrite=true"
# (Follow redirect and PUT data if necessary)

# Delete the file
curl -i -X DELETE "http://om.example.com:9874/webhdfs/v1/vol1/bucket1/newfile.txt?op=DELETE"
```

For secure clusters, `curl` would need the `--negotiate -u :` flags for SPNEGO authentication after obtaining a Kerberos ticket.

## When to Use

*   For simple integrations where a full Hadoop client or S3 SDK is not available or desired.
*   For scripting basic file operations using standard HTTP tools.
*   When compatibility with existing WebHDFS-based tools is needed.

HTTPFS provides a basic, universal way to interact with Ozone over HTTP but lacks the performance optimizations and rich features of the native Java API, `ofs`, or the S3 gateway for more demanding use cases.
