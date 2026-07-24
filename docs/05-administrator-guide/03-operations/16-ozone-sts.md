---
sidebar_label: Ozone S3 STS
---

# Ozone S3 Security Token Service (STS)

This guide explains how to enable, configure, and use Ozone STS to issue short-lived S3 credentials through the AWS-compatible (at least for the supported features) **AssumeRole** API. Ozone STS is designed for scenarios such as data-lake workloads that need temporary, scoped access to Ozone buckets and keys without distributing long-lived credentials.

## Background

Ozone S3 credentials are normally tied to a Kerberos identity. STS adds a programmatic path to obtain **temporary** credentials (access key, secret key, and session token) that inherit permissions from a Ranger **role**, optionally narrowed further by an inline **IAM session policy**.

The initial implementation:

- Exposes a dedicated STS endpoint on the S3 Gateway (separate from the S3 object API port).
- Support the **AssumeRole** API.
- Requires **Apache Ranger** for authorization. 

## How Ozone STS Works

1. A user with permanent S3 credentials calls **AssumeRole** on the STS endpoint.
2. Ozone validates the request signature and asks Ranger whether the caller may assume the target role.
3. If an optional inline session policy (`Policy` parameter) is supplied, Ozone converts it to Ranger permissions and actions via the `IamSessionPolicyResolver` Java class.
4. On success, Ozone returns temporary credentials:
   - **AccessKeyId** — begins with `ASIA`
   - **SecretAccessKey**
   - **SessionToken** — opaque, server-side stateless token 
5. Subsequent S3 API calls use the temporary credentials and must include the session token in the `x-amz-security-token` header.  If an optional inline session policy was supplied in the initial AssumeRole call, the permissions and actions for the inline policy will be intersected with the role's permissions for authorization.  Otherwise, the role's permissions only will be used for authorization.

Temporary credential lifetime is **15 minutes to 12 hours** (900–43,200 seconds). If `DurationSeconds` is omitted, the token's expiration defaults to 3600 seconds (1 hour) per the AWS specification.

## Prerequisites

Before using STS, you need:

1. **Secure Ozone cluster** with Kerberos and Ranger enabled.
2. **Ranger Ozone plugin** installed on OM/S3G with `RangerOzoneAuthorizer` configured (see [Configuring Apache Ranger](../configuration/security/ranger)).
3. **Permanent S3 credentials** for the calling user:

```shell
kinit my-service-user
ozone s3 getsecret
# awsAccessKey=...
# awsSecret=...
```

4. **Ranger roles and policies**:
   - Create a Ranger **role** for each role that can be assumed.
   - Grant the calling user **assume_role** permission on that role.
   - Grant the role the resource permissions and actions it needs (volume/bucket/key) via resource policies.

The role name in `RoleArn` must match the Ranger role name:

```
arn:aws:iam::123456789012:role/my-data-reader-role
                              ^^^^^^^^^^^^^^^^^^^^
                              Ranger role name
```

The account ID (`123456789012`) is accepted for AWS compatibility but is not used for authorization.

Set environment variable `RANGER_URL` to your Ranger Admin base URL (for example `http://localhost:6080`) and environment variable `RANGER_SERVICE` to your Ozone Ranger service name (for example `dev_ozone`). The curl examples below authenticate to Ranger Admin with `-u admin:rangerR0cks!` (replace with your Ranger Admin username and password).

---

## Enabling STS

### Ozone feature flag

STS is disabled by default. Enable it in `ozone-site.xml`:

```xml
<property>
  <name>ozone.s3g.sts.http.enabled</name>
  <value>true</value>
  <description>Enable the Ozone S3 Gateway STS endpoint.</description>
</property>
```
Restart Ozone after changing this property to have it take effect.

### Additional Configurable Properties

| Property | Default        | Description                                                     |
| --- |----------------|-----------------------------------------------------------------|
| `ozone.s3g.sts.http.enabled` | `false`        | Feature flag for the STS endpoint                               |
| `ozone.s3g.sts.http-address` | `0.0.0.0:9880` | HTTP STS bind address                                           |
| `ozone.s3g.sts.https-address` | `0.0.0.0:9881` | HTTPS STS bind address                                          |
| `ozone.s3g.sts.http-bind-host` | `0.0.0.0`      | HTTP bind host (overrides hostname portion of `http-address`)   |
| `ozone.s3g.sts.https-bind-host` | `0.0.0.0`      | HTTPS bind host                                                 |
| `ozone.om.sts.token.cleanup.service.interval` | `3h`           | Interval for cleaning revoked token entries older than 12 hours |
| `ozone.om.sts.token.cleanup.service.timeout` | `15m`          | Timeout for a cleanup run                                       |

After enabling, the STS endpoint is available at:

```
http://<s3g-host>:9880/sts
https://<s3g-host>:9881/sts
```

The S3 object API remains on the existing S3G port (typically `9878`).

### Ranger feature flag (action-matches Policy Condition)

To enforce **S3 action-level** restrictions in Ranger policies (required for fine-grained STS behavior such as separating `GetObject` from `GetObjectTagging` at the same key path), enable the Ozone service-def option in Ranger Admin:

```xml
<!-- ranger-admin-site.xml -->
<property>
  <name>ranger.servicedef.ozone.enableActionMatcherInPoliciesCondition</name>
  <value>true</value>
</property>
```

Property in `ranger-admin-site.xml`:

`ranger.servicedef.ozone.enableActionMatcherInPoliciesCondition`

<div style={{overflowX: 'auto'}}>

| Default | When `false`                                                                                                                                                                                                                | When `true` |
| --- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| --- |
| `false` | Ranger evaluates only Ozone access types (`read`, `write`, `create`, etc.). S3 actions from session policies are not enforced at action granularity, neither is it possible to specify granular actions on the role itself. | Enables the **Action** (`action-matches`) policy condition. The S3 Gateway passes the IAM action (for example `PutObject`) to Ranger on each request. |

</div>

When this flag is enabled:

- Ranger policies can use the **Action** condition with values such as `PutObject`, `GetObject`, `ListBucket`, or wildcards like `Get*`.
- Inline session policies from AssumeRole carry S3 action constraints that Ranger enforces alongside ACL permissions.

Restart Ranger Admin after changing this property so the updated Ozone service definition (including the `action-matches` condition) is loaded.

---

## IAM Session Policy to Ranger Permission/Action Mapping

When a caller passes a `Policy` parameter to AssumeRole, Ozone parses the AWS IAM session policy JSON and maps each supported S3 action to Ranger permissions and actions at **volume**, **bucket**, and **key** levels. Ranger then authorizes based on the intersection:

```
authorized permissions = role permissions ∩ session policy permissions
```

### Supported session policy subset

| IAM element | Supported | Notes                                                                                                                                    |
| --- | --- |------------------------------------------------------------------------------------------------------------------------------------------|
| `Effect` | `Allow` only | `Deny` and other effects are rejected                                                                                                    |
| `Action` | Supported S3 actions and wildcards (`s3:*`, `s3:Get*`, `s3:Put*`, `s3:List*`, `s3:Create*`, `s3:Delete*`) | Unknown actions are **silently ignored** similar to AWS behavior (AssumeRole still succeeds; credentials simply won't grant that action) |
| `Resource` | `arn:aws:s3:::` prefix or `*` | Other ARN prefixes are rejected                                                                                                          |
| `Condition` | `StringEquals` or `StringLike` with key `s3:prefix` | Only one condition operator per statement; only applies to `s3:ListBucket`                                                               |
| Policy size | ≤ 2048 characters | Matches AWS AssumeRole limit                                                                                                             |

### S3 action → Ranger permissions and actions

The table below is derived from the `IamSessionPolicyResolver` Java class. For each S3 action, it shows which Ranger permissions and actions are required at each resource level when that action appears in a session policy.

Each applicable resource level must also include a matching `action-matches` condition for that S3 action (for example `PutObject` at volume, bucket, and key for object-scoped actions). If `action-matches` is omitted at a level, the ACL permission applies to **every** S3 action that requires that ACL at that level. For example, key-level `READ` without `action-matches` authorizes both `GetObject` and `GetObjectTagging`. It is **imperative** (for security reasons) to specify the action at every applicable level.

<div style={{overflowX: 'auto'}}>

| S3 Action | Scope | Volume | Bucket | Key |
| --- | --- | --- | --- | --- |
| `s3:AbortMultipartUpload` | Object | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `AbortMultipartUpload`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `AbortMultipartUpload`</span> | Permission: `WRITE`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `AbortMultipartUpload`</span> |
| `s3:CreateBucket` | Bucket | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `CreateBucket`</span> | Permission: `CREATE`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `CreateBucket`</span> | — |
| `s3:DeleteBucket` | Bucket | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `DeleteBucket`</span> | Permission: `DELETE`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `DeleteBucket`</span> | — |
| `s3:DeleteObject` | Object | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `DeleteObject`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `DeleteObject`</span> | Permission: `DELETE`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `DeleteObject`</span> |
| `s3:DeleteObjectTagging` | Object | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `DeleteObjectTagging`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `DeleteObjectTagging`</span> | Permission: `WRITE`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `DeleteObjectTagging`</span> |
| `s3:GetBucketAcl` | Bucket | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `GetBucketAcl`</span> | Permission: `READ`, `READ_ACL`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `GetBucketAcl`</span> | — |
| `s3:GetObject` | Object | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `GetObject`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `GetObject`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `GetObject`</span> |
| `s3:GetObjectTagging` | Object | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `GetObjectTagging`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `GetObjectTagging`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `GetObjectTagging`</span> |
| `s3:ListAllMyBuckets` | Volume | Permission: `READ`, `LIST`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListAllMyBuckets`</span> | — | — |
| `s3:ListBucket` | Bucket | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListBucket`</span> | Permission: `READ`, `LIST`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListBucket`</span> | Permission: `READ`†<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListBucket`</span> |
| `s3:ListBucketMultipartUploads` | Bucket | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListBucketMultipartUploads`</span> | Permission: `READ`, `LIST`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListBucketMultipartUploads`</span> | — |
| `s3:ListMultipartUploadParts` | Object | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListMultipartUploadParts`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListMultipartUploadParts`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `ListMultipartUploadParts`</span> |
| `s3:PutBucketAcl` | Bucket | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `PutBucketAcl`</span> | Permission: `READ`, `READ_ACL`, `WRITE_ACL`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `PutBucketAcl`</span> | — |
| `s3:PutObject` | Object | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `PutObject`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `PutObject`</span> | Permission: `CREATE`, `WRITE`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `PutObject`</span> |
| `s3:PutObjectTagging` | Object | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `PutObjectTagging`</span> | Permission: `READ`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `PutObjectTagging`</span> | Permission: `WRITE`<br/><span style={{whiteSpace: 'nowrap'}}>Action: `PutObjectTagging`</span> |

</div>

† For `s3:ListBucket`, key-level **READ** is granted on the listed prefix (or `*` if no `s3:prefix` condition is present).

#### Simplifying bucket and key policies with `All`

You can often simplify **bucket** and **key** policies by granting **`All`** instead of individual access types such as `write` or `delete`. The `action-matches` condition restricts which S3 action the permission applies to, so `All` with Action: `PutObject` does not broadly authorize unrelated operations at that resource level.

At the **volume** level, prefer **specific** access types such as `read` and `list` rather than `All`. Volume-level permissions apply even when a request has no mapped S3 action (similar to bucket-level and key-level permissions), so granting `All` on a volume could unintentionally allow destructive operations such as volume deletion.

#### Example: IAM permission policy mapped to Ranger policies

Suppose a role should support this IAM permission policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::reports/*"
  }]
}
```

The corresponding Ranger role needs matching policies at each level:

| Level | Resource | Permission         | Action-matches Policy Condition |
| --- | --- |--------------------|---------------------------------|
| Volume | `s3v` | `READ`             | `GetObject`                     |
| Bucket | `reports` | `READ` (or `All`‡) | `GetObject`                     |
| Key | `*` (under `reports`) | `READ` (or `All`‡) | `GetObject`                     |

‡ When using `All` at bucket or key level, the `action-matches: GetObject` condition is what prevents unrelated S3 actions from being authorized at that level.

Example Ranger policy item for the key level (specific read permission):

```json
{
  "accesses": [{ "type": "read", "isAllowed": true }],
  "roles": ["my-data-reader-role"],
  "conditions": [{ "type": "action-matches", "values": ["GetObject"] }]
}
```

Equivalent simplified key-level policy using `all`:

```json
{
  "accesses": [{ "type": "all", "isAllowed": true }],
  "roles": ["my-data-reader-role"],
  "conditions": [{ "type": "action-matches", "values": ["GetObject"] }]
}
```

**WARNING**: Without `action-matches` on the volume, bucket and key policies, the same key-level `read` grant would also authorize `GetObjectTagging` and any other read-scoped S3 action at that path.


#### `s3:prefix` condition (ListBucket only)

If an IAM session policy or role permission policy statement includes a Condition, **only `s3:ListBucket`** from that statement takes effect (similar to AWS behavior).

| Operator | Behavior |
| --- | --- |
| `StringEquals` | Exact prefix match; wildcard values in `s3:prefix` are ignored |
| `StringLike` | Prefix pattern match; supports `*` wildcards |

The caller must supply a matching `prefix` (and optionally `delimiter`) on ListObjects/ListObjectsV2 or access is denied.

---

## Ranger Policy Setup

This section walks through how to configure Ranger via example. Replace `RANGER_URL`, `RANGER_SERVICE`, and the `-u` credentials before running the commands (see Prerequisites section above).

### 1. Create the Ranger user (service principal)

The `/service/xusers/secure/users` endpoint is required so `userPermList` can be set; without it the user cannot be added to Ranger policies.

```shell
curl --silent --show-error --location -u admin:rangerR0cks! \
  --request POST \
  --header "Content-Type: application/json" \
  --header "accept: application/json" \
  --data '{
    "loginId": "my-service-user",
    "name": "my-service-user",
    "password": "Password123",
    "firstName": "My Service",
    "lastName": "User",
    "emailAddress": "my-service-user@example.com",
    "userRoleList": ["ROLE_USER"],
    "userPermList": [
      { "moduleId": 1, "isAllowed": 1 },
      { "moduleId": 3, "isAllowed": 1 },
      { "moduleId": 7, "isAllowed": 1 }
    ]
  }' \
  "${RANGER_URL}/service/xusers/secure/users"
```

### 2. Create the Ranger role

```shell
curl --silent --show-error --location -u admin:rangerR0cks! \
  --request POST \
  --header "Content-Type: application/json" \
  --header "accept: application/json" \
  --data '{
    "name": "my-data-read-write-role",
    "description": "Read-write data access role for STS"
  }' \
  "${RANGER_URL}/service/roles/roles"
```

### 3. Assume role policy (caller → role)

Grant the service user permission to call AssumeRole for the role:

```shell
curl --silent --show-error --location -u admin:rangerR0cks! \
  --request POST \
  --header "Content-Type: application/json" \
  --header "accept: application/json" \
  --data '{
    "isEnabled": true,
    "service": "'"${RANGER_SERVICE}"'",
    "name": "my-data-read-write-role assume role policy",
    "policyType": 0,
    "policyPriority": 0,
    "isAuditEnabled": true,
    "resources": {
      "role": {
        "values": ["my-data-read-write-role"],
        "isExcludes": false,
        "isRecursive": false
      }
    },
    "policyItems": [{
      "accesses": [{ "type": "assume_role", "isAllowed": true }],
      "users": ["my-service-user"],
      "delegateAdmin": false
    }],
    "serviceType": "ozone",
    "isDenyAllElse": false
  }' \
  "${RANGER_URL}/service/public/v2/api/policy"
```

### 4. Role resource policies (what the role can do)

Let's use the following IAM permission policy and make equivalent Ranger policies as an example:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject","s3:PutObject"],
    "Resource": "arn:aws:s3:::reports/*"
  }]
}
```

**Volume** (prefer specific access types — not `All`):

```shell
curl --silent --show-error --location -u admin:rangerR0cks! \
  --request POST \
  --header "Content-Type: application/json" \
  --header "accept: application/json" \
  --data '{
    "isEnabled": true,
    "service": "'"${RANGER_SERVICE}"'",
    "name": "read/write volume access",
    "policyType": 0,
    "policyPriority": 0,
    "isAuditEnabled": true,
    "resources": {
      "volume": {
        "values": ["s3v"],
        "isExcludes": false,
        "isRecursive": false
      }
    },
    "policyItems": [{
      "accesses": [{ "type": "read", "isAllowed": true }],
      "roles": ["my-data-read-write-role"],
      "conditions": [{ "type": "action-matches", "values": ["GetObject", "PutObject"] }],
      "delegateAdmin": false
    }],
    "serviceType": "ozone",
    "isDenyAllElse": false
  }' \
  "${RANGER_URL}/service/public/v2/api/policy"
```

**Bucket** (`READ` or `All` both work when paired with `action-matches`):

```shell
curl --silent --show-error --location -u admin:rangerR0cks! \
  --request POST \
  --header "Content-Type: application/json" \
  --header "accept: application/json" \
  --data '{
    "isEnabled": true,
    "service": "'"${RANGER_SERVICE}"'",
    "name": "read/write bucket access",
    "policyType": 0,
    "policyPriority": 0,
    "isAuditEnabled": true,
    "resources": {
      "volume": {
        "values": ["s3v"],
        "isExcludes": false,
        "isRecursive": false
      },
      "bucket": {
        "values": ["reports"],
        "isExcludes": false,
        "isRecursive": false
      }
    },
    "policyItems": [{
      "accesses": [{ "type": "all", "isAllowed": true }],
      "roles": ["my-data-read-write-role"],
      "conditions": [{ "type": "action-matches", "values": ["GetObject", "PutObject"] }],
      "delegateAdmin": false
    }],
    "serviceType": "ozone",
    "isDenyAllElse": false
  }' \
  "${RANGER_URL}/service/public/v2/api/policy"
```

**Key** (`READ, CREATE, WRITE` or `All` both work when paired with `action-matches`):

```shell
curl --silent --show-error --location -u admin:rangerR0cks! \
  --request POST \
  --header "Content-Type: application/json" \
  --header "accept: application/json" \
  --data '{
    "isEnabled": true,
    "service": "'"${RANGER_SERVICE}"'",
    "name": "read/write key access",
    "policyType": 0,
    "policyPriority": 0,
    "isAuditEnabled": true,
    "resources": {
      "volume": {
        "values": ["s3v"],
        "isExcludes": false,
        "isRecursive": false
      },
      "bucket": {
        "values": ["reports"],
        "isExcludes": false,
        "isRecursive": false
      },
      "key": {
        "values": ["*"],
        "isExcludes": false,
        "isRecursive": true
      }
    },
    "policyItems": [{
      "accesses": [{ "type": "all", "isAllowed": true }],
      "roles": ["my-data-read-write-role"],
      "conditions": [{ "type": "action-matches", "values": ["GetObject", "PutObject"] }],
      "delegateAdmin": false
    }],
    "serviceType": "ozone",
    "isDenyAllElse": false
  }' \
  "${RANGER_URL}/service/public/v2/api/policy"
```
---

## Sample Ozone STS Usage

### Step 1: Obtain permanent credentials

```shell
kinit my-service-user
ozone s3 getsecret
export PERM_AWS_ACCESS_KEY_ID=<awsAccessKey from output>
export PERM_AWS_SECRET_ACCESS_KEY=<awsSecret from output>
export AWS_ACCESS_KEY_ID=$PERM_AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$PERM_AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION=<region such as us-east-1>
```

### Step 2: Create the reports bucket in Ozone and upload sample object

`my-service-user` does not have permission to read the `s3v` volume or create buckets. Switch to a Kerberos identity that does (for example the default `hdfs` user), create the `reports` bucket referenced in the Ranger policies above, upload a sample object for `GetObject` tests in later steps, then switch back to `my-service-user`.

```shell
kinit hdfs
ozone sh bucket create /s3v/reports
printf 'sample data for GetObject test\n' > /tmp/file.parquet
ozone sh key put /s3v/reports/data/file.parquet /tmp/file.parquet
kinit my-service-user
```

### Step 3: Assume a role (full role permissions)

AssumeRole must be invoked with the caller's permanent credentials (`PERM_AWS_*` from Step 1):

```shell
CREDS=$(AWS_ACCESS_KEY_ID=$PERM_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$PERM_AWS_SECRET_ACCESS_KEY \
  AWS_SESSION_TOKEN= \
  aws sts assume-role \
  --endpoint-url http://<s3g-host>:9880/sts \
  --role-arn arn:aws:iam::123456789012:role/my-data-read-write-role \
  --role-session-name catalog-session \
  --duration-seconds 3600 \
  --output json)

export AWS_ACCESS_KEY_ID=$(echo "$CREDS" | jq -r .Credentials.AccessKeyId)
export AWS_SECRET_ACCESS_KEY=$(echo "$CREDS" | jq -r .Credentials.SecretAccessKey)
export AWS_SESSION_TOKEN=$(echo "$CREDS" | jq -r .Credentials.SessionToken)
export AWS_ENDPOINT_URL_S3=http://<s3g-host>:9878
```

Remember to replace `<s3g-host>` with the correct value for your server (for example localhost).  The temporary access key ID in the response starts with `ASIA`. `Expiration` in the response reflects the requested duration.

### Step 4: Use temporary credentials for S3

```shell
# Read allowed
aws s3api get-object \
  --endpoint-url "$AWS_ENDPOINT_URL_S3" \
  --bucket reports --key data/file.parquet /tmp/file.parquet

# Write allowed as well
printf 'new data for PutObject test\n' > /tmp/new.parquet
aws s3api put-object \
  --endpoint-url "$AWS_ENDPOINT_URL_S3" \
  --bucket reports --key data/new.parquet --body /tmp/new.parquet
```

### Step 5: Assume a role with an inline session policy

In this example, even though the role has read/write permissions in Ranger, use an inline session policy to limit authorization to read-only via GetObject.

AssumeRole must be invoked with the caller's **permanent** credentials. After Step 3, the shell holds temporary role credentials in `AWS_*`.  Use the saved `PERM_AWS_*` values and clear `AWS_SESSION_TOKEN` for this call (same pattern as Step 3):

```shell
SESSION_POLICY='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"s3:GetObject","Resource":"arn:aws:s3:::reports/*"}]}'

CREDS=$(AWS_ACCESS_KEY_ID=$PERM_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$PERM_AWS_SECRET_ACCESS_KEY \
  AWS_SESSION_TOKEN= \
  aws sts assume-role \
  --endpoint-url http://<s3g-host>:9880/sts \
  --role-arn arn:aws:iam::123456789012:role/my-data-read-write-role \
  --role-session-name scoped-read \
  --policy "$SESSION_POLICY" \
  --output json)

export AWS_ACCESS_KEY_ID=$(echo "$CREDS" | jq -r .Credentials.AccessKeyId)
export AWS_SECRET_ACCESS_KEY=$(echo "$CREDS" | jq -r .Credentials.SecretAccessKey)
export AWS_SESSION_TOKEN=$(echo "$CREDS" | jq -r .Credentials.SessionToken)
export AWS_ENDPOINT_URL_S3=http://<s3g-host>:9878
```

Remember to replace `<s3g-host>` with the correct value for your server (for example localhost).

### Step 6: Use temporary credentials for S3

```shell
# Read allowed
aws s3api get-object \
  --endpoint-url "$AWS_ENDPOINT_URL_S3" \
  --bucket reports --key data/file.parquet /tmp/file.parquet

# Write denied since session policy only allowed GetObject
aws s3api put-object \
  --endpoint-url "$AWS_ENDPOINT_URL_S3" \
  --bucket reports --key data/new.parquet --body /tmp/new.parquet
# → AccessDenied
```

### Revoke a session token

Only the token creator or an S3/tenant admin may revoke:

```shell
ozone s3 revokeststoken -t "$(echo "$CREDS" | jq -r .Credentials.SessionToken)" -y
```

Revoking a user's permanent secret also invalidates all outstanding STS tokens for that user:

```shell
ozone s3 revokesecret -u my-service-user -y
```

---

## Considerations

- **Multi-tenancy**: In S3 multi-tenant deployments, the volume in resource policies may differ from `s3v`.
- **Ranger policy refresh**: Allow time for policy cache refresh (up to 30 seconds) after creating/modifying resource policies before calling AssumeRole.

---

## Further Reading

- [AWS STS Design for Ozone S3](https://github.com/apache/ozone/blob/master/hadoop-hdds/docs/content/design/ozone-sts.md) — architecture, session token format, and design rationale
- [Configuring Apache Ranger](../configuration/security/ranger) — base Ranger/Ozone integration
- [Securing S3](../../../user-guide/client-interfaces/s3/securing-s3) — Kerberos, S3 secrets, and S3 Gateway security
