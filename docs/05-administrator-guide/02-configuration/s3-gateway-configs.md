# S3 Gateway Configuration Reference

This document lists configuration properties specific to the Ozone S3 Gateway. For a complete configuration reference, see [Ozone Configuration Reference](05-appendix.md).

| Property | Description | Default | Notes |
|----------|-------------|---------|-------|
| `ozone.s3g.auditlog.enabled` | Enables audit logging for requests handled by the S3 Gateway | `true` |  |
| `ozone.s3g.chunked.transfer.enabled` | Enables support for chunked transfer encoding in S3 Gateway responses | `true` |  |
| `ozone.s3g.client.buffer.size` | Buffer size used by the S3 Gateway client when reading/writing data | `32KB` |  |
| `ozone.s3g.default.bucket.layout` | Default bucket layout for buckets created via S3 Gateway | `OBJECT_STORE` |  |
| `ozone.s3g.domain.name` | Comma-separated list of domain names handled by S3 Gateway for virtual host-style access | *None* |  |
| `ozone.s3g.filesystem.paths.cache.size` | The size of the cache used by S3 Gateway to store mappings between S3 paths and Ozone key names | `100000` |  |
| `ozone.s3g.fso.directory.creation` | If true, allows implicit directory creation in FSO buckets via S3 Gateway object PUT requests | `true` |  |
| `ozone.s3g.handler.count` | The number of handler threads for the S3 Gateway's HTTP server | `100` |  |
| `ozone.s3g.http-address` | HTTP address for the S3 Gateway service | `0.0.0.0:9878` |  |
| `ozone.s3g.http-bind-host` | Network interface the S3 Gateway HTTP server binds to | `0.0.0.0` |  |
| `ozone.s3g.http.auth.type` | Authentication type for the S3 Gateway HTTP endpoint | `simple` |  |
| `ozone.s3g.http.enabled` | Enables the S3 Gateway HTTP server | `true` |  |
| `ozone.s3g.https-address` | HTTPS address for the S3 Gateway service | `0.0.0.0:9879` |  |
| `ozone.s3g.https-bind-host` | Network interface the S3 Gateway HTTPS server binds to | `0.0.0.0` |  |
| `ozone.s3g.kerberos.keytab.file` | Path to the Kerberos keytab file for the S3 Gateway service principal | *None* |  |
| `ozone.s3g.kerberos.principal` | The Kerberos principal name for the S3 Gateway service | *None* |  |
| `ozone.s3g.max.header.size` | The maximum allowed size for HTTP headers in requests processed by the S3 Gateway | `65536` |  |
| `ozone.s3g.max.threads` | The maximum number of threads the S3 Gateway's underlying web server can use | `2000` |  |
| `ozone.s3g.multipart.enabled` | Enables support for S3 multipart uploads in the S3 Gateway | `true` |  |
| `ozone.s3g.socket.idle.time` | The maximum time a connection to the S3 Gateway can remain idle before being closed | `30s` |  |
| `ozone.s3g.webadmin.http-address` | HTTP address for the S3 Gateway web admin interface | `0.0.0.0:9880` |  |
| `ozone.s3g.webadmin.http-bind-host` | Network interface the S3 Gateway web admin HTTP server binds to | `0.0.0.0` |  |
| `ozone.s3g.webadmin.http.enabled` | Enables the S3 Gateway web admin HTTP server | `true` |  |
| `ozone.s3g.webadmin.https-address` | HTTPS address for the S3 Gateway web admin interface | `0.0.0.0:9881` |  |
| `ozone.s3g.webadmin.https-bind-host` | Network interface the S3 Gateway web admin HTTPS server binds to | `0.0.0.0` |  |