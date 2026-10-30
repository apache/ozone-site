---
sidebar_label: Overview
---

# HttpFS Gateway Overview

## Architecture

Ozone HttpFS is forked from the HDFS HttpFS endpoint implementation ([HDDS-5448](https://issues.apache.org/jira/browse/HDDS-5448)).
Ozone HttpFS is intended to be added optionally as a role in an Ozone cluster, similar to [S3 Gateway](https://ozone.apache.org/docs/edge/design/s3gateway.html).

Technically, HttpFS is a Jetty-based web application.
It serves as a gateway that translates REST API requests into Hadoop FileSystem API calls to interact with the cluster.
As a separate service, it requires independent startup alongside the core Ozone components.

## Security

HttpFS supports multiple security protocols, including Hadoop pseudo-authentication, Kerberos SPNEGO, and pluggable authentication modules.
It also includes support for Hadoop proxy users.
