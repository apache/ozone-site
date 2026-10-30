---
sidebar_label: Apache Ranger
---

# Configuring Apache Ranger

Apache Ranger™ is a framework to enable, monitor and manage comprehensive data security across the Hadoop platform and beyond. Apache Ranger has supported authorization for Ozone since version 2.0. However, due to improvements and bug fixes, using the [latest release](https://ranger.apache.org/download.html) is recommended.

To use Apache Ranger, you must have Apache Ranger installed in your Hadoop Cluster. For installation instructions of Apache Ranger, please take a look at the [Apache Ranger website](https://ranger.apache.org/index.html).

If you have a working Apache Ranger installation that is aware of Ozone, then configuring Ozone to work with Apache Ranger is trivial. You have to enable the ACLs support and set the acl authorizer class inside Ozone to be Ranger authorizer. Please add the following properties to the `ozone-site.xml`.

| Property | Value |
|----------|-------|
| `ozone.acl.enabled` | `true` |
| `ozone.acl.authorizer.class` | `org.apache.ranger.authorization.ozone.authorizer.RangerOzoneAuthorizer` |

To use the `RangerOzoneAuthorizer`, you also need to add the following environment variables to `ozone-env.sh`:

```bash
export OZONE_MANAGER_CLASSPATH="${OZONE_HOME}/share/ozone/lib/libext/*"
```

## About the ranger-ozone-plugin JARs

The *ranger-ozone-plugin JARs* are the Java libraries that come with the **Apache Ranger Ozone plugin**. They contain the implementation classes (for example `RangerOzoneAuthorizer`) that allow Ozone Manager to delegate authorization checks to Ranger.

You obtain these JARs when you install Apache Ranger and enable the Ozone plugin; see the [Apache Ranger documentation](https://ranger.apache.org/) for installation steps. To make the plugin available to Ozone Manager, ensure that these JARs are on the Ozone Manager classpath. In the example above, the JARs are copied into `${OZONE_HOME}/share/ozone/lib/libext/` and that directory is added to `OZONE_MANAGER_CLASSPATH`.

If your distribution installs the Ranger Ozone plugin into another directory, point `OZONE_MANAGER_CLASSPATH` to that location instead, for example:

```bash
export OZONE_MANAGER_CLASSPATH=/opt/ranger/ozone-plugin/lib/*
```

If Ranger is installed on a different host, copy the Ranger Ozone plugin JARs from that installation to a directory on the Ozone Manager host (such as `share/ozone/lib/libext/`) and reference that directory from `OZONE_MANAGER_CLASSPATH` so that Ozone Manager can load the plugin at startup.

## S3 action-based policies

Requires Apache Ranger 2.9.0 or later.

Ozone S3 Gateway passes the S3 action of each S3 request that has an IAM action (for example `GetObject` or `PutObjectTagging`, without the `s3:` prefix) to the authorizer, whether the STS endpoint enabled or disabled. To restrict a Ranger permission to specific S3 actions, set `ranger.servicedef.ozone.enableActionMatcherInPoliciesCondition` to `true` in `ranger-admin-site.xml` and restart Ranger Admin, then add an `action-matches` condition to the policy. For example, key-level `read` can be limited to `GetObject` so that it does not also authorize `GetObjectTagging`.

- Requests that do not come through S3 Gateway (for example ofs or `ozone sh`) also carry no S3 action. An `action-matches` condition that lists specific actions does not match those requests. A condition that allows any action (`*`) still matches.
- `GetObjectAttributes` is allowed only when Ranger authorizes both the `GetObjectAttributes` and `GetObject` actions. Ozone checks `GetObject` as a dependent action on the same request.

The [STS guide](../../03%2Doperations/07%2Ds3/02%2Dsts.md?#s3-action--ranger-permissions-and-actions) has the S3 action to Ranger permission mapping, including how inline session policies use the same condition.
