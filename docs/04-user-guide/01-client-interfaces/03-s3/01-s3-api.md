---
sidebar_label: Overview
---

# Overview

Ozone provides S3 compatible REST interface to use the object store data with any S3 compatible tools.
S3 buckets are stored under the `/s3v` volume.

## Getting started

S3 Gateway is a separated component which provides the S3 compatible APIs. It should be started additional to the regular Ozone components.
You can start a Docker based cluster, including the S3 Gateway from the release package.

Go to the `compose/ozone` directory, and start the server:

```bash
docker-compose up -d --scale datanode=3
```

Alternatively, use the bundled `run.sh` script, which sets the number of Datanodes with the `OZONE_DATANODES` environment variable:

```bash
OZONE_DATANODES=3 ./run.sh -d
```

You can access the S3 Gateway at `http://localhost:9878`

## URL Schema

Ozone S3 Gateway supports both the virtual-host-style URL S3 bucket addresses (eg. http://bucketname.host:9878) and the path-style addresses (eg. http://host:9878/bucketname)
By default it uses the path-style addressing. To use virtual host style URLs set your main domain name in your `ozone-site.xml`:

```xml
<property>
   <name>ozone.s3g.domain.name</name>
   <value>s3g.internal</value>
</property>
```

## Implemented REST Endpoints

The Ozone S3 Gateway implements a substantial subset of the Amazon S3 REST API. The tables below summarize each API’s support status, its feature, and any relevant notes, including known deviations from AWS S3 behavior.

### Bucket Operations

| **API Name** | **Feature** | **Note** |
| --------------------------------------------------------------------------------------------------- | ------------- | ---------- |
| ✅ [ListBuckets](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html) | Lists all buckets owned by the authenticated user. | Without pagination parameters, returns the full bucket list. Supports pagination with `max-buckets` (up to 10000) and `continuation-token`. |
| ✅ [ListDirectoryBuckets](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListDirectoryBuckets.html) | Lists the directory buckets owned by the authenticated user. | Ozone treats FSO buckets as directory buckets. The S3 Gateway serves this API on `GET /` when the request is signed with the `s3express` service name. Supports `max-directory-buckets` (up to 1000) and `continuation-token`. |
| ✅ [CreateBucket](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html) | Creates a new bucket. | **Non-compliant behavior:** The default bucket ACL may include extra group permissions instead of being strictly private. Bucket names must adhere to S3 naming conventions. |
| ✅ [HeadBucket](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html) | Checks for the existence of a bucket. | Returns a 200 status if the bucket exists. |
| ✅ [DeleteBucket](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucket.html) | Deletes a bucket. | Bucket must be empty before deletion. |
| ✅ [GetBucketAcl](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketAcl.html) | Retrieves the access control list of a bucket. | Converts the Ozone native ACLs of the bucket to S3 grants. |
| ✅ [PutBucketAcl](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketAcl.html) | Sets the access control list of a bucket. | Accepts grants in the request body or in `x-amz-grant-*` headers. Each request replaces all existing ACLs on the bucket. **Non-compliant behavior:** Only user grantees (`id=`) are supported; other grantee types, such as groups, return `NotImplemented`. |

### Object Operations

| **API Name** | **Feature** | **Note** |
| ------------------------------------------------------------------------------------------- | ------------- | ---------- |
| ✅ [GetObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html) | Retrieves the contents of an object. | Supports `Range` requests (returns `206 Partial Content`) and the `partNumber` parameter for objects uploaded with multipart upload. A missing object returns `404` with a `NoSuchKey` XML error body. See [Conditional requests](#conditional-requests). |
| ✅ [HeadObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html) | Retrieves metadata for an object. | Supports the `partNumber` parameter. A missing object returns `404` without a body, as defined for `HEAD` requests. See [Conditional requests](#conditional-requests). |
| ✅ [PutObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html) | Uploads a new object. | Supports both single PUT and multipart uploads. In FSO buckets, a zero-length PUT to a key that ends with `/` creates a directory (controlled by `ozone.s3g.fso.directory.creation`, enabled by default). See [Conditional requests](#conditional-requests). **Non-compliant behavior:** ACL headers in the request, such as `x-amz-acl`, are ignored. |
| ✅ [DeleteObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObject.html) | Deletes a single object. | Returns `204 No Content`, also when the object does not exist, as AWS S3 does. Supports `If-Match`; if the object does not exist or its ETag does not match, returns `412 Precondition Failed`. |
| ✅ [DeleteObjects](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html) | Deletes multiple objects in one request. | Bulk delete operation with aggregated error reporting. |
| ✅ [CopyObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html) | Copies an object (intra- or inter-bucket). | Supports metadata directives (COPY/REPLACE). See [Conditional requests](#conditional-requests). **Non-compliant behavior:** Self-copying for metadata updates may differ slightly from AWS S3. |
| ✅ [ListObjects](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html) | Lists objects in a bucket (version 1). | Served by the same `GET /{bucket}` endpoint as ListObjectsV2. Used when `list-type` is absent or `1`. Supports prefix, delimiter, and marker. |
| ✅ [ListObjectsV2](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) | Lists objects in a bucket with filtering and pagination. | Used when `list-type=2`. Supports prefix, delimiter, `start-after`, and continuation tokens. Object owners are returned only when `fetch-owner=true`. |
| ✅ [ListObjectVersions](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectVersions.html) | Lists the versions of the objects in a bucket. | Bucket versioning is not supported, so each object is listed once, with `VersionId` set to the literal string `null`. `DeleteObject`, `DeleteObjects` and the object tagging operations accept `null` as the version ID for the current object. |

### Bucket Tagging Operations

| **API Name** | **Feature** | **Note** |
| ------------ | ----------- | -------- |
| ✅ [PutBucketTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketTagging.html) | Sets the tag set for a bucket. | Fully supported; each request replaces all bucket tags and does not append to the existing tag set. |
| ✅ [GetBucketTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketTagging.html) | Retrieves the tag set of a bucket. | Returns the tag set as defined by the S3 API. |
| ✅ [DeleteBucketTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucketTagging.html) | Removes the tag set from a bucket. | Clears all tags associated with the bucket. |

### Bucket Lifecycle Operations

| **API Name** | **Feature** | **Note** |
| ------------ | ----------- | -------- |
| ✅ [PutBucketLifecycleConfiguration](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketLifecycleConfiguration.html) | Sets the lifecycle configuration of a bucket. | Supports the `Expiration` and `AbortIncompleteMultipartUpload` actions, with prefix, tag, and `And` filters. **Non-compliant behavior:** `Transition` actions return `NotImplemented`. |
| ✅ [GetBucketLifecycleConfiguration](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLifecycleConfiguration.html) | Retrieves the lifecycle configuration of a bucket. | Returns the configuration as defined by the S3 API. |
| ✅ [DeleteBucketLifecycle](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucketLifecycle.html) | Removes the lifecycle configuration from a bucket. | Removes all lifecycle rules of the bucket. |

Lifecycle rules take effect only when the lifecycle service is enabled on the OM (`ozone.lifecycle.service.enabled`, disabled by default). For details, see [Object Lifecycle Management](../../../administrator-guide/operations/object-lifecycle).

### Object Tagging Operations

| **API Name** | **Feature** | **Note** |
| ------------ | ----------- | -------- |
| ✅ [PutObjectTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObjectTagging.html) | Adds or updates tags on an object. | Fully supported; updates replace any existing tag set. |
| ✅ [GetObjectTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectTagging.html) | Retrieves the tag set of an object. | Returns the tag set as defined by the S3 API. |
| ✅ [DeleteObjectTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjectTagging.html) | Removes the tag set from an object. | Clears all tags associated with the object. |

### Object Attributes Operations

| **API Name** | **Feature** | **Note** |
| ------------ | ----------- | -------- |
| ✅ [GetObjectAttributes](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectAttributes.html) | Returns selected metadata about an object without the object body. | Served as `GET /{bucket}/{key}?attributes`. Use the `x-amz-object-attributes` header to request `ETag`, `ObjectSize`, `StorageClass`, `ObjectParts`, and `Checksum`. For multipart objects, `x-amz-max-parts` and `x-amz-part-number-marker` paginate part metadata. **Non-compliant behavior:** `Checksum` is accepted in the request but not returned, because Ozone does not persist `x-amz-checksum-*` on upload. The `versionId` query parameter and SSE-C headers are ignored. On OBS and LEGACY buckets, `ObjectParts` omits per-part `Part` elements unless an additional checksum was stored at upload time; FSO buckets always return part details. |

### Multipart Upload Operations

| **API Name** | **Feature** | **Note** |
| ------------ | ----------- | -------- |
| ✅ [CreateMultipartUpload](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html) | Starts a multipart upload session. | Returns an UploadId for subsequent parts. |
| ✅ [UploadPart](https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html) | Uploads an individual part for a multipart upload. | Part numbering and ETag computation follow AWS semantics. |
| ✅ [UploadPartCopy](https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPartCopy.html) | Uploads a part by copying data from an existing object. | Uses the `x-amz-copy-source` header, and supports `x-amz-copy-source-range` to copy a byte range of the source object. |
| ✅ [ListMultipartUploads](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListMultipartUploads.html) | Lists in-progress multipart uploads in a bucket. | Up to 1000 multipart uploads are returned in a batch by default. |
| ✅ [ListParts](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListParts.html) | Lists uploaded parts for an in-progress multipart upload. | Supports pagination if many parts exist. |
| ✅ [CompleteMultipartUpload](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html) | Assembles all uploaded parts into a final object. | Returns an ETag that follows AWS multipart rules. See [Conditional requests](#conditional-requests). |
| ✅ [AbortMultipartUpload](https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html) | Aborts an in-progress multipart upload. | Frees up storage used by uploaded parts. The OM automatically aborts incomplete multipart uploads that are older than `ozone.om.open.mpu.expire.threshold` (default 30 days). To abort them earlier for a bucket, use a lifecycle rule with `AbortIncompleteMultipartUpload`. |

### Additional Operations

| **API Name** | **Feature** | **Note** |
| -------------------------- | ------------- | ---------- |
| ✅ Generate Presigned URL | Generates a temporary URL for accessing an object. | Uses AWS Signature V4. **Non-compliant behavior:** The generated URL may include a fixed default region rather than dynamically reflecting the bucket’s location. The S3 Gateway accepts presigned URLs (AWS Signature V4 query authentication) for all supported operations, such as `GetObject`, `PutObject`, `DeleteObject`, `HeadObject`, `HeadBucket`, and the multipart upload operations. |

### Conditional Requests

The S3 Gateway partially supports [conditional requests](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html):

- **GetObject and HeadObject:** Support `If-Match`, `If-None-Match`, `If-Modified-Since`, and `If-Unmodified-Since`. A failed `If-Match` or `If-Unmodified-Since` returns `412 Precondition Failed`. A matching `If-None-Match` or a failed `If-Modified-Since` returns `304 Not Modified`.
- **CopyObject:** Supports `x-amz-copy-source-if-match`, `x-amz-copy-source-if-none-match`, `x-amz-copy-source-if-modified-since`, and `x-amz-copy-source-if-unmodified-since` on the source object. A failed condition returns `412 Precondition Failed`.
- **PutObject, CopyObject, and CompleteMultipartUpload:** Support `If-Match` with an ETag, to write only if the existing object matches, and `If-None-Match: *`, to write only if the object does not exist. `If-None-Match` with a specific ETag is not supported and returns `InvalidRequest`. `If-Match` and `If-None-Match` cannot be used together.
- **DeleteObject:** Supports `If-Match`.

### Operations Not Implemented

The S3 Gateway returns `501 NotImplemented` for the operations below, except where noted as partial support:

| **API Name** | **Note** |
| ------------ | -------- |
| ❌ [GetBucketLocation](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLocation.html) | |
| ❌ [GetObjectAcl](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectAcl.html), [PutObjectAcl](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObjectAcl.html) | Use bucket ACLs or Ozone native ACLs instead. |
| ❌ [GetObjectTorrent](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectTorrent.html) | |
| ❌ [Bucket CORS](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketCors.html), [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketPolicy.html), [website](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketWebsite.html), [encryption](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketEncryption.html), [replication](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketReplication.html), [notification](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketNotificationConfiguration.html), and [logging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLogging.html) configuration | Ozone uses its own permission model (Ozone native ACLs or Apache Ranger) instead of bucket policies. |
| ❌ [Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html) ([PutObjectLockConfiguration](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObjectLockConfiguration.html), [GetObjectLockConfiguration](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectLockConfiguration.html), [PutObjectRetention](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObjectRetention.html), [GetObjectRetention](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectRetention.html), [PutObjectLegalHold](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObjectLegalHold.html), [GetObjectLegalHold](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectLegalHold.html)) | In the design discussion phase. Tracked in [HDDS-15945](https://issues.apache.org/jira/browse/HDDS-15945). |
| ❌ [GetBucketVersioning](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketVersioning.html), [PutBucketVersioning](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketVersioning.html) | In the implementation phase. See the [design document](https://docs.google.com/document/d/1uT3Hzss5gJkiuxzzeZYVUB_UqjSbqROUApY5pH6k8TI/edit?usp=sharing) and the AWS [versioning overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html). |
| ❌ [DeleteObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObject.html), [DeleteObjects](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html), [PutObjectTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObjectTagging.html), [GetObjectTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectTagging.html), and [DeleteObjectTagging](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjectTagging.html) with a `versionId` other than `null` | Bucket versioning is not supported. `null` is accepted as the version ID of the current object. |

:::note Additional Notes

- **Not supported:** [S3 Select](https://docs.aws.amazon.com/AmazonS3/latest/API/API_SelectObjectContent.html), Server-Side Encryption headers ([SSE-S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html), [SSE-KMS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html), [SSE-C](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerSideEncryptionCustomerKeys.html)), [cross-region replication](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html), and [S3 event notifications](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html).
- **Bucket owner check:** Bucket and object operations honor the `x-amz-expected-bucket-owner` header, and copy operations also honor `x-amz-source-expected-bucket-owner`. If the header does not match the bucket owner, the request fails with `403 Access Denied`.
- **Temporary credentials:** The S3 Gateway can issue temporary credentials with the [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) API, and supports [GetCallerIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html), on a separate STS endpoint (port 9880, set by `ozone.s3g.sts.http-address`). The STS endpoint is disabled by default; enable it with `ozone.s3g.sts.http.enabled`. For details, see [Ozone S3 Security Token Service (STS)](../../../administrator-guide/operations/s3/sts).
- While Ozone S3 Gateway provides extensive support for common S3 operations, users should be aware of the above non-compliant behaviors and limitations when integrating with applications expecting full AWS S3 functionality.
- While Ozone S3 Gateway does not support S3 Server-Side Encryption, it does support encrypted buckets using Apache Ranger KMS. For more information, see the [Transparent Data Encryption](../../../administrator-guide/configuration/security/encryption/transparent-data-encryption) documentation.
:::

## Security

If security is not enabled, you can *use* **any** AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

If security is enabled, you can get the key and the secret with the `ozone s3 getsecret` command (*Kerberos based authentication is required).

```bash
kinit -kt /etc/security/keytabs/testuser.keytab testuser/scm@EXAMPLE.COM
ozone s3 getsecret
awsAccessKey=testuser/scm@EXAMPLE.COM
awsSecret=c261b6ecabf7d37d5f9ded654b1c724adac9bd9f13e247a235e567e8296d2999
```

:::note
Starting in Ozone 1.4.0, the secret will be **shown only once** when generated with `getsecret`. If the secret is lost, the user would have to `revokesecret` first before regenerating a new secret with `getsecret`.
:::

Now, you can use the key and the secret to access the S3 endpoint:

```bash
export AWS_ACCESS_KEY_ID=testuser/scm@EXAMPLE.COM
export AWS_SECRET_ACCESS_KEY=c261b6ecabf7d37d5f9ded654b1c724adac9bd9f13e247a235e567e8296d2999
aws s3api --endpoint http://localhost:9878 create-bucket --bucket bucket1
```

To invalidate/revoke the secret, use `ozone s3 revokesecret` command. Parameter '-y' can be appended to skip the interactive confirmation.

```bash
ozone s3 revokesecret
Enter 'y' to confirm S3 secret revocation for 'testuser/scm@EXAMPLE.COM': y
S3 secret revoked.
```

Ozone Manager administrators can run `ozone s3 getsecret` and `ozone s3 revokesecret` command with `-u` parameter to specify another users.

```bash
# Obtained Kerberos TGT for testuser/scm@EXAMPLE.COM with kinit,
# testuser/scm@EXAMPLE.COM is an OM admin.
ozone s3 getsecret -u om/om@EXAMPLE.COM
awsAccessKey=om/om@EXAMPLE.COM
awsSecret=1e9379d0424cce6669b1a501ff14834e46dee004ee868b41a313b49eabcfb68f

ozone s3 revokesecret -u om/om@EXAMPLE.COM -y
S3 secret revoked.
```

## Health check

The S3 Gateway serves two unauthenticated health endpoints on its web admin server (default port `19878`), separate from the S3 listener (`9878`). Because they are served on the admin port, they do not collide with S3 bucket names and do not require AWS SigV4 signing, so a load balancer can poll them directly.

### Liveness

```bash
curl http://localhost:19878/health/live
OK
```

Returns `200 OK` while the gateway process is up and its web admin server can serve requests. It does not check OM reachability.

### Readiness

```bash
curl http://localhost:19878/health/ready
READY
```

Returns `200 READY` only when the gateway can reach OM, and `503 NOT READY` during startup or while OM is unreachable. A background probe refreshes OM reachability off the request path, so the endpoint always responds immediately and cannot be blocked by a slow OM. The probe cadence and its timeout are tunable with `ozone.s3g.health-check.probe.interval` and `ozone.s3g.health-check.probe.timeout`.

When S3 Gateway is horizontally scaled, point the load balancer's HTTP health check at the readiness endpoint so it only routes S3 traffic to gateways that can serve it; see the bundled `compose/common/s3-haproxy.cfg` for a worked HAProxy example. Both endpoints can be turned off with `ozone.s3g.health-check.enabled=false`, which removes them entirely. Note that the bundled Kubernetes manifests and HAProxy configs probe `/health/live` and `/health/ready` unconditionally, so if you disable the endpoints you must also remove those probes from your deployment; otherwise Kubernetes restarts the pods on failed liveness checks and HAProxy marks every backend down.

## Expose any volume

Ozone has one more element in the name-space hierarchy compared to S3: the volumes. By default, all the buckets of the `/s3v` volume can be accessed with S3 interface but only the (Ozone) buckets of the `/s3v` volumes are exposed.

To make any other buckets available with the S3 interface a "symbolic linked" bucket can be created:

```bash
ozone sh volume create /s3v
ozone sh volume create /vol1

ozone sh bucket create /vol1/bucket1
ozone sh bucket link /vol1/bucket1 /s3v/common-bucket
```

This example expose the `/vol1/bucket1` Ozone bucket as an S3 compatible `common-bucket` via the S3 interface.

:::note
The implementation details of the bucket-linking feature can be found in the [design doc](https://ozone.apache.org/docs/edge/design/volume-management.html).
:::

## Clients

### AWS CLI

`aws` CLI could be used by specifying the custom REST endpoint.

```bash
aws s3api --endpoint http://localhost:9878 create-bucket --bucket buckettest
```

Or

```bash
aws s3 ls --endpoint http://localhost:9878 s3://buckettest
```

#### Supported AWS CLI Versions

- AWS CLI v1 (1.37.0 and above) and AWS CLI v2 (2.23.0 and above) are supported. These are the versions in which AWS enabled [default data integrity protections](https://github.com/aws/aws-cli/issues/9214) that automatically calculate a `CRC32` checksum for S3 uploads; Ozone added handling for that flow in 2.1 and later.
- [AWS has announced AWS CLI v1 enters maintenance mode on July 15, 2026](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/); users are encouraged to upgrade to AWS CLI v2. Ozone may drop support for AWS CLI v1 at some point in the future.

## Compatible third-party applications

Ozone's S3 Gateway enables integration with a wide range of cloud-native and analytics applications. Here are some examples of tools and platforms known to work with Ozone (in alphabetical order):

- [Clickhouse](https://clickhouse.com/docs/en/integrations/s3)
- [Fluentd](https://docs.fluentd.org/output/s3) can send logs directly to Ozone via the S3 Gateway.
- [JuiceFS](https://juicefs.com/docs/community/s3_gateway/)
- [Starburst](https://docs.starburst.io/latest/connector/starburst-ozone.html) (Starburst also supports Ozone `ofs://`)
- [Teradata NOS](https://docs.teradata.com/r/Enterprise_IntelliFlex_VMware/Teradata-VantageTM-Native-Object-Store-Getting-Started-Guide-17.20)
- [CyberDuck](https://cyberduck.io/) See the [tutorial page](https://ozone.apache.org/docs/edge/interface/cyberduckozones3.html)

This list is not exhaustive—any application that supports the S3 protocol can potentially connect to Ozone, making it easy to adopt Ozone in modern data pipelines and cloud-native workflows.
