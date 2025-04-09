# Web UIs

Apache Ozone provides web interfaces for each component that allow administrators to monitor and manage the system. These web UIs offer valuable insights into the cluster's health, configuration, and performance metrics.

## Common Web UI Features

All Ozone component web UIs provide the following common endpoints:

| Endpoint | Description |
|----------|-------------|
| `/` | Home page with component-specific dashboard |
| `/jmx` | JMX metrics browser showing all available metrics |
| `/conf` | View current configuration settings |
| `/logLevel` | View and modify log levels dynamically |
| `/prom` | Prometheus metrics endpoint |
| `/stacks` | Thread stack traces for debugging |
| `/prof` | Profiling capabilities (if enabled) |

## Component-Specific Web UIs

### Ozone Manager (OM)

The Ozone Manager web UI provides insights into namespace operations and metadata management.

**Default ports:**
- HTTP: 9874
- HTTPS: 9875

**Port configuration:**
```xml
<!-- Change the HTTP port -->
<property>
  <name>ozone.om.http-address</name>
  <value>0.0.0.0:9874</value>
</property>

<!-- Change the HTTPS port -->
<property>
  <name>ozone.om.https-address</name>
  <value>0.0.0.0:9875</value>
</property>
```

**Key features:**
- Namespace statistics (volumes, buckets, keys)
- Recent operations and their status
- Leader/follower status in HA deployments
- RocksDB metrics and statistics
- Active client sessions

Access the OM web UI at `http://om-host:9874/` or `https://om-host:9875/` when HTTPS is enabled.

### Storage Container Manager (SCM)

The SCM web UI focuses on container management and datanode coordination.

**Default ports:**
- HTTP: 9876
- HTTPS: 9877

**Port configuration:**
```xml
<!-- Change the HTTP port -->
<property>
  <name>ozone.scm.http-address</name>
  <value>0.0.0.0:9876</value>
</property>

<!-- Change the HTTPS port -->
<property>
  <name>ozone.scm.https-address</name>
  <value>0.0.0.0:9877</value>
</property>
```

**Key features:**
- Container statistics and state information
- Pipeline management status
- Datanode registration and health
- Replication and EC status
- Leader/follower information in HA deployments

Access the SCM web UI at `http://scm-host:9876/` or `https://scm-host:9877/` when HTTPS is enabled.

### DataNode

DataNode web UIs provide information about local container storage and operations.

**Default ports:**
- HTTP: 9882
- HTTPS: 9883

**Port configuration:**
```xml
<!-- Change the HTTP port -->
<property>
  <name>ozone.datanode.http-address</name>
  <value>0.0.0.0:9882</value>
</property>

<!-- Change the HTTPS port -->
<property>
  <name>ozone.datanode.https-address</name>
  <value>0.0.0.0:9883</value>
</property>
```

**Key features:**
- Container inventory on the node
- Disk usage and capacity information
- Active pipelines and their status
- Volume storage statistics
- IO operations metrics

Access the DataNode web UI at `http://datanode-host:9882/` or `https://datanode-host:9883/` when HTTPS is enabled.

### S3 Gateway

The S3 Gateway web UI provides information about S3-compatible API operations.

**Default ports:**
- HTTP: 9878
- HTTPS: 9879
- Web Admin HTTP: 19878
- Web Admin HTTPS: 19879

**Port configuration:**
```xml
<!-- Change the HTTP port -->
<property>
  <name>ozone.s3g.http-address</name>
  <value>0.0.0.0:9878</value>
</property>

<!-- Change the HTTPS port -->
<property>
  <name>ozone.s3g.https-address</name>
  <value>0.0.0.0:9879</value>
</property>

<!-- Change the Web Admin HTTP port -->
<property>
  <name>ozone.s3g.webadmin.http-address</name>
  <value>0.0.0.0:19878</value>
</property>

<!-- Change the Web Admin HTTPS port -->
<property>
  <name>ozone.s3g.webadmin.https-address</name>
  <value>0.0.0.0:19879</value>
</property>
```

**Key features:**
- Authentication status
- Active S3 operations
- Performance metrics for S3 API calls
- Error statistics

Access the S3 Gateway web UI at `http://s3g-host:9878/` or `https://s3g-host:9879/` when HTTPS is enabled.
Access the S3 Gateway Web Admin UI at `http://s3g-host:19878/` or `https://s3g-host:19879/` when HTTPS is enabled.

### HTTP FileSystem Gateway

The HTTPFS web UI provides information about REST API operations.

**Default ports:**
- HTTP: 14000

**Port configuration:**
```xml
<!-- Change the HTTP port -->
<property>
  <name>httpfs.http.port</name>
  <value>14000</value>
</property>

<!-- Change the hostname -->
<property>
  <name>httpfs.http.hostname</name>
  <value>0.0.0.0</value>
</property>

<!-- Enable HTTPS -->
<property>
  <name>httpfs.ssl.enabled</name>
  <value>true</value>
</property>
```

**Key features:**
- Active operations
- Authentication status
- Performance metrics

Access the HTTPFS web UI at `http://httpfs-host:14000/` when using HTTP. For HTTPS access, enable SSL with the `httpfs.ssl.enabled` property.

### Recon

Recon provides a comprehensive web UI for monitoring the entire Ozone cluster. For detailed information, see [Recon Web UI](./02-recon/01-recon-web-ui.md).

**Default ports:**
- HTTP: 9888
- HTTPS: 9889

**Port configuration:**
```xml
<!-- Change the HTTP port -->
<property>
  <name>ozone.recon.http-address</name>
  <value>0.0.0.0:9888</value>
</property>

<!-- Change the HTTPS port -->
<property>
  <name>ozone.recon.https-address</name>
  <value>0.0.0.0:9889</value>
</property>
```

**Key features:**
- Cluster-wide dashboard
- Container management
- Datanode status and health
- Namespace analysis
- Metrics visualization
- REST API with Swagger documentation at `/swagger-ui`

Access the Recon web UI at `http://recon-host:9888/` or `https://recon-host:9889/` when HTTPS is enabled.

## Common Web UI Configurations

### Port Configuration

Each Ozone component has specific properties for configuring their web UI ports. These configuration properties should be added to `ozone-site.xml`.

The pattern for port configuration is:
- `ozone.[component].http-address` for HTTP endpoints
- `ozone.[component].https-address` for HTTPS endpoints

The address format is typically `0.0.0.0:port` where `0.0.0.0` means the server will listen on all network interfaces.

### Disabling Web UIs

In production environments, you may want to disable web UIs for security reasons. You can disable the web UI for any component by setting its HTTP address to port 0:

```xml
<property>
  <name>ozone.om.http-address</name>
  <value>0.0.0.0:0</value>
</property>
```

## Web UI Security

The Ozone web UIs can be secured in the following ways:

### Authentication

Ozone web UIs can be configured to use Kerberos authentication. When enabled, users must have valid credentials to access the web interfaces.

To enable Kerberos authentication for web UIs, ensure the following properties are set in `ozone-site.xml`:

```xml
<property>
  <name>ozone.security.enabled</name>
  <value>true</value>
</property>
<property>
  <name>hadoop.http.filter.initializers</name>
  <value>org.apache.hadoop.security.AuthenticationFilterInitializer</value>
</property>
<property>
  <name>hadoop.http.authentication.type</name>
  <value>kerberos</value>
</property>
```

### HTTPS Support

All web UIs can be configured to use HTTPS instead of HTTP for secure communication. To enable HTTPS, configure the following properties in `ozone-site.xml`:

```xml
<property>
  <name>ozone.http.ssl.enabled</name>
  <value>true</value>
</property>
<property>
  <name>ozone.http.ssl.keystore.location</name>
  <value>/path/to/keystore.jks</value>
</property>
<property>
  <name>ozone.http.ssl.keystore.password</name>
  <value>keystore-password</value>
</property>
```

## Accessing Web UIs via CLI

Ozone CLI provides a convenient way to access web UI endpoints using the `ozone freon` command:

```bash
ozone freon --http -v metrics
```

This command fetches metrics from the component specified in the configuration.

## Best Practices for Web UI Management

1. **Secure web UIs in production environments:**
   - Always enable Kerberos authentication
   - Use HTTPS instead of HTTP
   - Consider placing web UIs behind a firewall or proxy

2. **Set up monitoring:**
   - Configure Prometheus to scrape metrics from the `/prom` endpoints
   - Create Grafana dashboards for visualization
   - Set up alerts for critical metrics

3. **Control administrative access:**
   - Limit access to sensitive endpoints like `/logLevel` and `/conf`
   - Use proper authentication and authorization

4. **Regularly review logs and metrics:**
   - Check for abnormal patterns in operation metrics
   - Review error statistics for potential issues
   - Monitor resource utilization trends

## Troubleshooting Web UI Issues

Common issues with web UIs and their solutions:

- **UI not accessible**: Verify the component service is running and ports are properly configured
- **Authentication failures**: Check Kerberos configuration and credential validity
- **Slow UI responses**: Look for resource constraints (CPU, memory) on the host
- **Missing metrics**: Verify the component's metrics system is properly initialized
- **HTTPS certificate errors**: Ensure certificates are valid and trusted by browsers