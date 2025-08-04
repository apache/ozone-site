# Configuration Files

Apache Ozone uses XML-based configuration files, similar to other Hadoop ecosystem components. These files define the behavior and settings for various Ozone services like the Ozone Manager (OM), Storage Container Manager (SCM), Datanodes, S3 Gateway, and Recon.

## Main Configuration Files

There are two primary configuration files administrators need to be aware of:

### `ozone-site.xml`

This is the core configuration file specifically for Ozone. It contains properties that control the operation of Ozone services. You define overrides to the default Ozone settings within this file. For example, you would configure the addresses for your OM and SCM nodes, define metadata and data directories, and set security parameters here.

Ozone services load their configuration from `ozone-site.xml` found in the configuration directory. Default values for all Ozone configuration properties are defined internally, often sourced from a file named `ozone-default.xml` packaged within the Ozone JAR files (specifically in `hadoop-hdds-common`). You typically do not edit `ozone-default.xml` directly; instead, you place your site-specific overrides in `ozone-site.xml`.

### `core-site.xml`

This is a standard Hadoop configuration file. While Ozone can operate independently, `core-site.xml` is sometimes necessary, particularly for configuring client-side interactions or integrations. For example:

*   Setting up Hadoop Compatible FileSystem interfaces like OFS (`fs.ofs.impl`) or S3A (`fs.s3a.impl`).
*   Configuring common Hadoop properties required by integrated components (e.g., Kerberos settings, HDFS client properties if interacting with HDFS).

If present in the configuration directory, Ozone components may load settings from `core-site.xml` as well.

## Configuration Directory

Both `ozone-site.xml` and `core-site.xml` (if used) should reside in Ozone's configuration directory. The location of this directory depends on the deployment method:

*   **Bare-metal/Tarball installs:** Often `/etc/ozone/conf` or `$OZONE_HOME/etc/hadoop`.
*   **Docker/Kubernetes:** Typically mounted into the container, often at `/etc/hadoop/conf`.

Refer to your specific deployment documentation for the exact path.

## Generating Configuration Files using CLI

Ozone provides a command-line utility to help bootstrap the necessary configuration files, especially `ozone-site.xml`, for a new cluster setup. This is particularly useful for generating initial configurations for High Availability (HA) setups.

The command is `ozone genconf`.

```bash
ozone genconf <path_to_output_conf_dir> [options]
```

This command generates the basic `ozone-site.xml` file in the specified output directory. It can automatically include essential properties like OM/SCM node IDs and addresses based on provided options, simplifying the initial setup process. Consult the tool's help (`ozone genconf --help`) or the relevant documentation for specific usage details and options.

After generating the initial files, you will typically need to review and customize them further according to your specific cluster requirements and hardware.

*(Specific configuration keys and their detailed usage are documented in the subsequent sections of the Administrator Guide.)*
