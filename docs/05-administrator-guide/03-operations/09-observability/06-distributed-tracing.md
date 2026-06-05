---
sidebar_label: Distributed tracing
---

# Distributed tracing

Distributed tracing can help to understand performance bottleneck with visualizing end-to-end performance.
Ozone makes use of [OpenTelemetry](https://opentelemetry.io/) API for tracing and uses OTLP with gRPC format for sending traces.
[jaeger](https://jaegertracing.io) tracing library as collector can collect traces from Ozone over default port 4317 (as default).

## Enabling Tracing

Tracing is turned off by default. To enable it across Ozone services, configure the following property in `ozone-site.xml`:

```xml
<property>
   <name>ozone.tracing.enabled</name>
   <value>true</value>
</property>
```

## Configuration Priorities

When resolving configurations for endpoints and sampling strategies, Ozone evaluates sources in the following order of priority:

1. Explicit Configuration Keys (defined in `ozone-site.xml`)
2. Environment Variables
3. Default Internal Values

## Collector Endpoint Configuration

The endpoint specifies the destination where the Jaeger collector is listening.

### Via `ozone-site.xml`

```xml
<property>
   <name>ozone.tracing.endpoint</name>
   <value>http://localhost:4317</value>
</property>
```

### Via Environment Variable

You can also set this environment variable for each Ozone component (OM, SCM, DataNode) and the Ozone client:

```env
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

**Default Value:** `http://localhost:4317` (if neither the configuration key nor the environment variable is provided).

## Sampling Strategies

To minimize performance overhead, Ozone supports sampling at both the trace level and the span level.

### 1. Trace-Level Sampling

This controls the global percentage of end-to-end requests that will be tracked, accepting a ratio from `0.0` (0%) to `1.0` (100%).

#### Via `ozone-site.xml`

```xml
<property>
   <name>ozone.tracing.sampler</name>
   <value>0.01</value>
</property>
```

#### Via Environment Variable

```env
export OTEL_TRACES_SAMPLER_ARG=0.01
```

> **Note:** This configuration records 1% of total requests. If an invalid or negative value is provided, it defaults to `1.0` (100%).

### 2. Span-Level Sampling

This allows you to set sampling for specific, high-interest operations. It accepts a comma-separated list of `spanName:rate` pairings.

#### Via `ozone-site.xml`

```xml
<property>
   <name>ozone.tracing.span.sampling</name>
   <value>createVolume:1.0,getBucket:0.5</value>
</property>
```

#### Via Environment Variable

```env
export OTEL_SPAN_SAMPLING_ARG="createVolume:1.0,getBucket:0.5"
```

> **Note:** In this example, 100% of `createVolume` spans and 50% of `getBucket` spans will be collected.