# Configuration Files

Apache Ozone services are configured using XML files. These configuration files define various parameters that control the behavior of Ozone Managers (OM), Storage Container Managers (SCM), Datanodes (DN), and other related services like S3 Gateway and HttpFS.

The primary configuration files for an Ozone server are:

*   **`ozone-site.xml`**: This file contains Ozone-specific configurations. Most of the parameters you'll set for your Ozone cluster will reside here.
*   **`core-site.xml`**: This file contains core configurations that are common across various services that integrate with or run alongside Ozone. Parameters related to file system client behavior, I/O settings, and some security aspects might be defined here.
*   **`httpfs-site.xml`**: This file is specific to the HttpFS service, which provides a REST HTTP gateway to Ozone. It contains configurations related to the HttpFS server, such as its port, authentication settings, and proxy user definitions.

## Basic Format

All these configuration files follow a standard XML format, consisting of a `<configuration>` root element, inside which each configuration property is defined using `<property>` tags. Each `<property>` tag contains a `<name>` tag for the property key and a `<value>` tag for its value.

Example:

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>ozone.om.address</name>
    <value>0.0.0.0:9862</value>
  </property>
  <property>
    <name>ozone.scm.client.address</name>
    <value>0.0.0.0:9850</value>
  </property>
</configuration>
```

## Where Configuration Files Are Read From

Ozone services read their configuration from files typically located in a designated `conf` directory. When running Ozone directly, this usually means the `etc/hadoop` directory within your Ozone installation path. The `OZONE_CONF_DIR` environment variable can be used to specify a custom location for this directory.

The loading order and precedence of configuration files are as follows:

1.  **Default Configurations**: Each service has a set of default configurations embedded within its JAR files (e.g., [`ozone-default.xml`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/resources/ozone-default.xml)). These provide baseline settings.
2.  **Site-Specific Configurations**: Files like `ozone-site.xml`, `core-site.xml`, and `httpfs-site.xml` located in the `conf` directory override the default settings. These are where administrators customize the cluster's behavior.

For example, if Ozone is installed at `/opt/ozone`, the configuration files would typically be located at `/opt/ozone/etc/hadoop/`.

When deploying with Docker or Kubernetes, the configuration files are usually mounted into the container's designated configuration directory (e.g., `/opt/ozone/etc/hadoop` inside a Docker container).

Specific configuration keys will be documented in later sections.

