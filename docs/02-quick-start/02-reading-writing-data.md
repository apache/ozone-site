# Reading and Writing Data in Ozone

Apache Ozone provides multiple interfaces for reading and writing data, catering to different use cases and client
preferences. This guide explains how to use the three primary interfaces within a Docker environment:

1. **Ozone Shell (`ozone sh`)** - The native command-line interface
2. **ofs (Ozone File System)** - Hadoop-compatible file system interface
3. **S3 API** - Amazon S3 compatible REST interface

All examples assume you already have a running Ozone cluster using Docker Compose as described in
the [Docker Installation Guide](./01-installation/01-docker.md).

## Interface Comparison

| Interface       | Strengths                                                                               | Use Cases                                                                  |
|:----------------|:----------------------------------------------------------------------------------------|:---------------------------------------------------------------------------|
| **Ozone Shell** | - Full feature access Advanced operations Detailed metadata                             | - Administrative tasks Bucket/volume management Quota/ACL management       |
| **ofs**         | - Familiar HDFS-like commands Works with existing Hadoop applications Full cluster view | - Hadoop ecosystem integration Applications that need filesystem semantics |
| **S3 API**      | - Industry standard Works with existing S3 clients Language-independent                 | - Web applications Multi-language environments Existing S3 applications    |

## Using Ozone Shell (ozone sh)

The Ozone Shell provides direct access to all Ozone features through a command-line interface. All commands follow the
pattern:

```bash
ozone sh <object-type> <action> <path> [options]
```

Where `<object-type>` is `volume`, `bucket`, or `key`.

### Accessing the Ozone Shell

To use the Ozone Shell in your Docker environment, execute commands inside the `om` or `ozone-client` container:

```bash
# Example for Docker Compose
docker compose exec om bash
# or
docker compose exec ozone-client bash

# Now you can run 'ozone sh' commands
```

### Working with Volumes

Volumes are the top-level namespace in Ozone.

```bash
# Create a volume
ozone sh volume create /vol1

# List all volumes
ozone sh volume list /

# Get volume details
ozone sh volume info /vol1

# Delete a volume (must be empty)
ozone sh volume delete /vol1

# Delete a volume recursively (deletes all buckets and keys within the volume, then the volume itself)
# WARNING: No recovery option after using this command, and no trash for FSO buckets. Requires confirmation.
ozone sh volume delete -r /vol1
```

### Working with Buckets

Buckets are containers for keys (objects) within volumes.

```bash
# Create a bucket
ozone sh bucket create /vol1/bucket1

# List all buckets in a volume
ozone sh bucket list /vol1

# Get bucket details
ozone sh bucket info /vol1/bucket1

# Delete a bucket (must be empty)
ozone sh bucket delete /vol1/bucket1

# Delete a bucket recursively (deletes all keys within the bucket, then the bucket itself)
# WARNING: No recovery option, deleted keys won't move to trash. Requires confirmation.
ozone sh bucket delete -r /vol1/bucket1
```

### Working with Keys (Objects)

Keys are the actual data objects stored in Ozone.

```bash
# Create a test file locally
echo "Hello Ozone via Shell" > test_shell.txt

# Upload a file (put source to destination)
ozone sh key put /vol1/bucket1/test_shell.txt test_shell.txt

# Upload with specific replication type
# For RATIS: use -r ONE or THREE
ozone sh key put -t RATIS -r THREE /vol1/bucket1/key1_ratis test_shell.txt
# For EC: use format CODEC-DATA-PARITY-CHUNKSIZE (e.g., rs-3-2-1024k, rs-6-3-1024k, rs-10-4-1024k)
ozone sh key put -t EC -r rs-3-2-1024k /vol1/bucket1/key1_ec test_shell.txt

# Download a file (get source to destination)
ozone sh key get /vol1/bucket1/test_shell.txt ./downloaded_shell.txt

# Force overwrite when downloading (use -f or --force)
ozone sh key get --force /vol1/bucket1/test_shell.txt ./downloaded_shell.txt

# Get key information
ozone sh key info /vol1/bucket1/test_shell.txt

# List keys in a bucket
ozone sh key list /vol1/bucket1

# Copy a key within Ozone (not directly supported, use put/get or other interfaces)

# Rename a key
ozone sh key rename /vol1/bucket1 test_shell.txt renamed_shell.txt

# Delete a key
ozone sh key delete /vol1/bucket1/test_shell.txt

# Note: In FSO buckets, deleted keys are moved to trash at /<volume>/<bucket>/.Trash/<user>
# In OBS buckets, deletion is permanent.
```

## Using ofs (Ozone File System)

 ofs provides a Hadoop-compatible file system interface (`ofs://`), making it seamless to use with applications designed
for HDFS.

### Accessing ofs

You can use `ozone fs` commands (a wrapper around `hdfs dfs`) inside the `om` or `ozone-client` container:

```bash
# Inside the OM or ozone-client container
docker compose exec om bash
# or
docker compose exec ozone-client bash
```

### Basic ofs Operations

ofs uses standard Hadoop filesystem commands.

```bash
# Create volume and bucket (using filesystem semantics)
ozone fs -mkdir -p /vol1/bucket_ofs

# Upload a file
echo "Hello from OFS" > local_ofs.txt
ozone fs -put local_ofs.txt /vol1/bucket_ofs/

# Copy from local with explicit destination path
ozone fs -copyFromLocal local_ofs.txt /vol1/bucket_ofs/remote_file.txt

# List files in a bucket
ozone fs -ls /vol1/bucket_ofs/

# List recursively (lists all buckets and keys under /vol1/)
ozone fs -ls -R /vol1/

# Download a file
ozone fs -get /vol1/bucket_ofs/local_ofs.txt ./downloaded_ofs.txt

# Display file contents
ozone fs -cat /vol1/bucket_ofs/local_ofs.txt

# Move a file (rename)
ozone fs -mv /vol1/bucket_ofs/local_ofs.txt /vol1/bucket_ofs/moved_ofs.txt

# Copy a file within the filesystem
ozone fs -cp /vol1/bucket_ofs/moved_ofs.txt /vol1/bucket_ofs/copy_ofs.txt

# Delete a file (moves to trash if enabled and bucket is FSO)
ozone fs -rm /vol1/bucket_ofs/copy_ofs.txt

# Delete a file and skip trash (permanently delete without moving to trash)
ozone fs -rm -skipTrash /vol1/bucket_ofs/moved_ofs.txt

# Create an empty file
ozone fs -touchz /vol1/bucket_ofs/empty_file.txt
```

### Advanced ofs Operations

```bash
# Get file checksum
ozone fs -checksum /vol1/bucket_ofs/moved_ofs.txt

# Set replication factor for a file (NOT SUPPORTED - use 'ozone sh key put' with -t and -r flags for setting replication on write)
# ozone fs -setrep -w 3 /vol1/bucket_ofs/important_file

# Trash configuration is done in core-site.xml (see Ozone docs for details)
```

## Using S3 API

The S3 API provides compatibility with applications designed for Amazon S3. It's accessible via the S3 Gateway service,
typically running on port `9878` in the Docker setup.

### S3 Credentials

In the default non-secure Docker setup, you can use any values for credentials.

```bash
# Set environment variables (can be done outside the containers)
export AWS_ACCESS_KEY_ID=testuser
export AWS_SECRET_ACCESS_KEY=testuser-secret
export AWS_ENDPOINT_URL=http://localhost:9878
```

*(Note: Setting `AWS_ENDPOINT_URL` simplifies the `aws` commands below)*

### Using AWS CLI

The AWS CLI can be used from your local machine (if installed) or from within a container that has it.

```bash
# Ensure AWS CLI is installed locally or use a container with it.

# Create a bucket (maps to /s3v/<bucket-name> in Ozone namespace)
aws s3api create-bucket --bucket=s3bucket

# List buckets
aws s3api list-buckets

# Upload a file
echo "Hello S3" > s3_test.txt
aws s3 cp s3_test.txt s3://s3bucket/

# List objects in a bucket
aws s3 ls s3://s3bucket/

# Download a file
aws s3 cp s3://s3bucket/s3_test.txt ./downloaded_s3.txt

# Delete an object
aws s3 rm s3://s3bucket/s3_test.txt

# Delete a bucket (must be empty)
aws s3api delete-bucket --bucket=s3bucket
```

## Cross-Interface Operations

Ozone allows accessing the same data through different interfaces.

### Namespace Mapping

| Data Location         | Ozone Shell Path         | ofs Path                                         | S3 Path                                                        |
|:----------------------|:-------------------------|:-------------------------------------------------|:---------------------------------------------------------------|
| vol1/bucket1/file.txt | `/vol1/bucket1/file.txt` | `ofs://<ozone service id>/vol1/bucket1/file.txt` | `s3://bucket1/file.txt` <br/>(if S3V configured to serve vol1) |
| s3v/s3bucket/file.txt | `/s3v/s3bucket/file.txt` | `ofs://<ozone service id>/s3v/s3bucket/file.txt` | `s3://s3bucket/file.txt`                                       |

*(Note: `om` in `ofs://` path refers to the Ozone Manager service address)*

### Accessing S3 Data via Ozone Shell/ofs

Objects created via S3 reside in the special `/s3v` volume.

```bash
# Assuming 's3bucket' was created via S3 API and contains 's3_test.txt'

# Access via Ozone Shell (inside om/client container)
docker compose exec om bash
ozone sh key list /s3v/s3bucket
ozone sh key get /s3v/s3bucket/s3_test.txt /tmp/from_s3.txt
exit

# Access via ofs (inside om/client container)
docker compose exec om bash
ozone fs -ls /s3v/s3bucket/
ozone fs -cat /s3v/s3bucket/s3_test.txt
exit
```

### Exposing Non-S3 Buckets via S3 (Bucket Linking)

You can make buckets created outside `/s3v` accessible via the S3 Gateway using links.

```bash
# Inside om/client container
docker compose exec om bash

# Create a regular bucket
ozone sh volume create /myvol
ozone sh bucket create /myvol/mybucket

# Create an S3-accessible link (target must exist, link name becomes S3 bucket name)
ozone sh bucket link /myvol/mybucket /s3v/linkedbucket
exit

# Now access 'linkedbucket' via S3 CLI (outside container)
aws s3 cp local_file.txt s3://linkedbucket/
aws s3 ls s3://linkedbucket/
```

### Bucket Layouts (FSO vs OBS)

Ozone buckets can have different internal layouts:

1. **FILE_SYSTEM_OPTIMIZED (FSO):** Default. Better for hierarchical operations (like `ozone fs -mkdir`), supports trash
   for `ozone fs -rm`. Recommended for Hadoop/filesystem workloads.
2. **OBJECT_STORE (OBS):** Legacy layout. May offer slight performance benefits for flat object access patterns. No
   trash support.

```bash
# Create buckets with specific layouts (inside om/client container)
# Short form
ozone sh bucket create /vol1/fso_bucket --layout fso
ozone sh bucket create /vol1/obs_bucket --layout obs

# Long form
# ozone sh bucket create /vol1/fso_bucket --layout FILE_SYSTEM_OPTIMIZED
# ozone sh bucket create /vol1/obs_bucket --layout OBJECT_STORE
```

Most operations work on both, but FSO is generally preferred unless specific OBS characteristics are needed.

## Summary

You have learned how to perform basic read/write operations in Ozone using three different interfaces: Ozone Shell, ofs,
and the S3 API. Each interface has its strengths, and Ozone's multi-protocol design allows you to choose the best tool
for the job while accessing the same underlying data.
