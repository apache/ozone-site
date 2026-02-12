---
sidebar_label: Distributed tracing
---

# Distributed tracing

Distributed tracing can help to understand performance bottleneck with visualizing end-to-end performance.
Ozone makes use of [OpenTelemetry](https://opentelemetry.io/) API for tracing and uses OTLP with gRPC format for sending traces.
[jaeger](https://jaegertracing.io) tracing library as collector can collect traces from Ozone over default port 4317 (as default).

Tracing is turned off by default, but can be turned on with `hdds.tracing.enabled` from `ozone-site.xml`

```xml
<property>
   <name>hdds.tracing.enabled</name>
   <value>true</value>
</property>
```

Below are the configuration steps for setting the collector endpoint and sampling strategy. Set these environment variables to be set for each Ozone component (OM, SCM, Datanode) and for the Ozone client to enable tracing.

```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_TRACES_SAMPLER_ARG=0.01
```

This configuration will record 1% of the requests to limit the performance overhead.
