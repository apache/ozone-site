# HDDS-4944: S3 Multi-Tenancy

Feature branch HDDS-4944 has been merged to master on May 29.

Git branch: https://github.com/apache/ozone/tree/HDDS-4944

Compare: https://github.com/apache/ozone/compare/master...HDDS-4944

For a quick intro to the S3 multi-tenancy feature, here is an excerpt from the documentation:

> Before Ozone multi-tenancy, all S3 access to Ozone (via S3 Gateway) are
> confined to a single designated S3 volume (that is volume `s3v`, by default).
>
> Ozone multi-tenancy allows multiple S3-accessible volumes to be created.
> Each volume can be managed separately by their own tenant admins via CLI for user operations, and via Apache Ranger for access control.

For more, please check out the [full documentation](https://github.com/apache/ozone/blob/HDDS-4944/hadoop-hdds/docs/content/feature/S3-Multi-Tenancy.md?plain=1#L26). The doc has [feature overview](https://github.com/apache/ozone/blob/HDDS-4944/hadoop-hdds/docs/content/feature/S3-Multi-Tenancy.md), [setup guide](https://github.com/apache/ozone/blob/HDDS-4944/hadoop-hdds/docs/content/feature/S3-Multi-Tenancy-Setup.md), [CLI guide](https://github.com/apache/ozone/blob/HDDS-4944/hadoop-hdds/docs/content/feature/S3-Tenant-Commands.md) and [access control guide](https://github.com/apache/ozone/blob/HDDS-4944/hadoop-hdds/docs/content/feature/S3-Multi-Tenancy-Access-Control.md) (best viewed locally rendered using `hugo serve` command under `./hadoop-hdds/docs/` , as it is not published to the website yet).

Requirements to enable S3 multi-tenancy:

1. [Use Apache Ranger](https://ozone.apache.org/docs/1.2.1/security/securitywithranger.html)
2. [Enable Ozone security and use Kerberos](https://ozone.apache.org/docs/1.2.1/security/secureozone.html) authentication

To enable multi-tenancy (with Ranger Basic HTTP authentication), in addition to the requirements above, the following configs need to be added to Ozone Manager's `ozone-site.xml`, as documented [here](https://github.com/apache/ozone/blob/HDDS-4944/hadoop-hdds/docs/content/feature/S3-Multi-Tenancy-Setup.md?plain=1#L40) in the doc as well:

```xml

<property>
   <name>ozone.om.multitenancy.enabled</name>
   <value>true</value>
</property>
<property>
    <name>ozone.om.ranger.https-address</name>
    <value>https://RANGER_HOST:6182</value>
</property>
<property>
    <name>ozone.om.ranger.https.admin.api.user</name>
    <value>RANGER_ADMIN_USERNAME</value>
</property>
<property>
    <name>ozone.om.ranger.https.admin.api.passwd</name>
    <value>RANGER_ADMIN_PASSWORD</value>
</property>
```

To enable multi-tenancy with Ranger Java client ( [HDDS-5836](https://issues.apache.org/jira/browse/HDDS-5836) ), clear text Ranger admin user name and password will no longer be necessary. Rather the Ranger Java client (re)uses the existing OM Kerberos principal and keytab config when enabling Ozone security with Kerberos auth. Therefore, only two extra config keys are necessary to enable the feature:

```xml
<property>
   <name>ozone.om.multitenancy.enabled</name>
   <value>true</value>
</property>
<property>
    <name>ozone.om.ranger.https-address</name>
    <value>https://RANGER_HOST:6182</value>
</property>
```

`ozone.OM.kerberos.principal` and `ozone.OM.kerberos.keytab.file` should have been [configured](https://ozone.apache.org/docs/1.2.1/security/secureozone.html#:~:text=ozone.om.kerberos.principal) already.

NOTE: Ranger Java client patch is merged. BUT the authorizer implementation switch hasn't happened. Partially due to Ranger 2.3.0 hasn't been released yet. Therefore, as of now it can only use the Ranger Basic HTTP authentication approach. Further patch will be done to complete the switch.

## 1. builds/intermittent test failures

No additional flaky tests have been introduced by the feature branch.

But there is one flaky upgrade/SCM acceptance test worth mentioning here that comes from the master branch: [HDDS-6546](https://issues.apache.org/jira/browse/HDDS-6546) This is frequently observed while running CIs on the S3 multi-tenancy branch. Spent quite a few hours on it but haven't found the root cause yet (see Jira comments). Note: the S3 multi-tenancy feature branch does not change SCM code at all.

## 2. documentation

Documentation has been added since [HDDS-6275](https://issues.apache.org/jira/browse/HDDS-6275) and is under constant revision.

The doc (`S3-Multi-Tenancy.md`, `S3-Tenant-Commands.md` and so on) can be found under

## 3. design, attached the docs

The design docs can be found under the Attachments section in the umbrella Jira: [HDDS-4944](https://issues.apache.org/jira/browse/HDDS-4944)

## 4. S3 compatibility

S3 multi-tenancy feature does not break any existing S3 API compatibility. And all S3 secret key pairs generated with the existing `ozone s3 getsecret`  command can still be used the same way (still confined to default s3v volume) after the OM upgrade.

## 5. Docker-compose / acceptance tests

Acceptance test cases can be found in:

## 6. support of containers / Kubernetes

No addition. There is plan to bring Apache Ranger to a new set of cluster config in order to better test the multi-tenancy functionality, but is not done yet. Though this would not be a merge blocker.

## 7. coverage/code quality

[Current feature branch coverage](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-4944) is **82.0%** (vs [62.8% of master branch](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=master))

## 8. build time

No significant build time difference has been observed.

master branch succeeded 20 days ago in 9m 45s:

Feature branch succeeded 19 days ago in 9m 28s:

## 9. possible incompatible changes/used feature flag

There should not be any incompatible changes introduced with this feature.

A global enable/disable switch for the S3 multi-tenancy feature is to be added in [HDDS-6612](https://issues.apache.org/jira/browse/HDDS-6612) .

## 10. third party dependencies/license changes

[HDDS-5836](https://issues.apache.org/jira/browse/HDDS-5836) Ranger Java client would include new dependency `org.apache.ranger.ranger-intg`

## 11. performance

S3 Gateway performance to be tested. Performance has been considered during development. For example, in order to for the client (S3 Gateway) to select the correct decryption key based on the actual user principal (S3 Gateway) and without introducing extra round trip, the user principal is piggy-backed in `RpcClient#getS3Volume` .

Ozone Java RPC client performance should not be affected.

## 12. security considerations

For the tenant user assign CLI, there were a discussion on whether to allow admins to specify the access ID (rather than in the auto-generated form of `tenantName$userName` ) to be assigned to the user. But out of security concern (possible key pair leak), it has been disabled on the server side. Additional input validation will need to be added in the future to allow it to be safely enabled again.
