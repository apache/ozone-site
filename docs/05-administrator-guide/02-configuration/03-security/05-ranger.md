---
sidebar_label: Apache Ranger
---

# Configuring Apache Ranger

Apache Ranger™ is a framework to enable, monitor and manage comprehensive data security across the Hadoop platform and beyond. Apache Ranger has supported authorization for Ozone since version 2.0. However, due to improvements and bug fixes, using the [latest release](https://ranger.apache.org/download.html) is recommended.

To use Apache Ranger, you must have Apache Ranger installed in your Hadoop Cluster. For installation instructions of Apache Ranger, please take a look at the [Apache Ranger website](https://ranger.apache.org/index.html).

If you have a working Apache Ranger installation that is aware of Ozone, then configuring Ozone to work with Apache Ranger is trivial. You have to enable the ACLs support and set the acl authorizer class inside Ozone to be Ranger authorizer. Please add the following properties to the `ozone-site.xml`.

| Property                     | Value                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| `ozone.acl.enabled`          | `true`                                                                   |
| `ozone.acl.authorizer.class` | `org.apache.ranger.authorization.ozone.authorizer.RangerOzoneAuthorizer` |

To use the `RangerOzoneAuthorizer`, you also need to add the following environment variables to `ozone-env.sh`:

```bash
export OZONE_MANAGER_CLASSPATH="${OZONE_HOME}/share/ozone/lib/libext/*"
```

- The location of the ranger-ozone-plugin jars depends on where the Ranger Plugin is installed.

- If the ranger-ozone-plugin jars is installed on another node, copy it to the Ozone installation directory.
