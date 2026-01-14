---
sidebar_label: Prometheus
---

# Tracking Metrics With Prometheus

Ozone has native support for Prometheus integration. All internal metrics (collected by Hadoop metrics framework) are published under the `/prom` HTTP endpoint. (For example under http://localhost:9876/prom for SCM).

The Prometheus endpoint is turned on by default but can be turned off by the `hdds.prometheus.endpoint.enabled` configuration variable.

In a secure environment the page is guarded with SPNEGO authentication which is not supported by Prometheus. To enable monitoring in a secure environment, a specific authentication token can be configured

Example `ozone-site.xml`:

```XML
<property>
   <name>hdds.prometheus.endpoint.token</name>
   <value>putyourtokenhere</value>
</property>
```

Example prometheus configuration:

```YAML
scrape_configs:
  - job_name: ozone
    bearer_token: <putyourtokenhere>
    metrics_path: /prom
    static_configs:
     - targets:
         - "127.0.0.1:9876"
```
