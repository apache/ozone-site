# HDDS-4440: S3G gRPC Connections

## Checklist

### 1. stable builds/intermittent test failures

There are no intermittent test failures specific to the **HDDS-4440-S3-performance** feature branch.  On each commit during development, it was ensured that all CI workflow tests passed prior to the commit merge.  To keep the master branch stable, full CI workflow runs are run multiple times on the latest commit prior to the final merge.

### 2. documentation

Documented in Apache Ozone Design docs as HDDS-4440 Proposed persistent OM connection for S3 Gateway.

- [Hadoop-HDDs/docs/content/design/S3-performance.md](https://ci-hadoop.apache.org/view/Hadoop%20Ozone/job/ozone-doc-master/lastSuccessfulBuild/artifact/hadoop-hdds/docs/public/design/s3-performance.html)

### 3. design, attached the docs

Design found in Jira HDDS-4440 and supporting related Jiras HDDS-5881, HDDS-5630.  ASF feature branch slack channel is, \#ozone-s3g-gRPC.

### 4. S3 compatibility

This feature tries to provide 100% S3 compatibility when Ozone.OM.enable.filesystem.paths=false.  This feature branch provides an enhancement to S3 Gateway behavior for handling and relaying S3 errors to the client.

Whereas the existing gateway implementation returns an ambiguous 500 HTTP response code with INTERNAL_ERROR in the event of client connection failures, this feature returns standard S3 errors for most errors.

This holds true except in the event the initial persistent connection cannot be established between the S3 Gateway and the Ozone Manager.  In this case the 500 HTTP response is returned to the caller.

### 5. Docker-compose / acceptance tests

Added enabling Ozone Manager gRPC server service to each Docker-config for the development clusters: Ozone, ozonesecure, Ozone-ha and ozonesecure-ha.

To test the S3 Gateway performance persistent connection gRPC feature with Docker-compose / acceptance tests.   Add the following configuration key settings to the Docker-compose.yaml : OM container - [OZONE-SITE.XML_ozone.OM](http://OZONE-SITE.XML_ozone.om).S3.gRPC.server_enabled: "true" & s3g container - [OZONE-SITE.XML_ozone.](http://OZONE-SITE.XML_ozone.om)OM.transport.class : "[org.apache.Hadoop.ozone.OM](http://org.apache.hadoop.ozone.om).protocolPB.GrpcOmTransportFactory".

Then run acceptance tests, test.sh, for development cluster configured including Ozone, ozonesecure, Ozone-ha and ozonesecure-ha.

Also, with development cluster configured for s3g gRPC can load test the S3 Gateway using the endpoint, localhost:9878.  Load testers used include freon and warp.

### 6. support of containers / Kubernetes

NA. Deployment model for OzoneManager remains as earlier.

### 7. coverage/code quality

[Sonar master branch code coverage.](https://sonarcloud.io/component_measures?metric=coverage&view=list&id=hadoop-ozone)

[Sonar HDDS-4440-S3-performance feature branch code coverage.](https://sonarcloud.io/component_measures?metric=coverage&view=list&branch=HDDS-4440-s3-performance&id=hadoop-ozone)

Code coverage is nearly unchanged from master to feature branch, from 76.5% to 75.7%.  In addition the feature branch has no Duplications nor Security vulnerabilities.  Further, the feature branch has a better Maintainability number than the master, 26 vs 207 (lower better).

### 8. build time

**Recent Master branch build time:**

**Current HDDS-4440-S3-performance feature branch build time:** .

Building on a local machine with ubuntu linux six-core i5 Coffee Lake and 64Gb Ram (\$ mvn clean install -DskipTests):

|                                                          |               |
|----------------------------------------------------------|---------------|
| **Master branch build time:**                            | 06:22 min     |
| **Feature branch HDDS-4440-S3-performance build time:** | **06:16 min** |

**\**

### 9. possible incompatible changes

The S3g gRPC Persistent Connections feature is enabled through two s3g gRPC specific configuration keys.  One configuration key is to enable the gRPC server service on the Ozone Manager, OM, and the other is to enable the gRPC client on the S3 Gateway, s3g.  By default the S3 Gateway gRPC client is off and communication between the s3g and OM is though the existing Hadoop RPC.

To enable this feature set,

1. [ozone.OM](http://OZONE-SITE.XML_ozone.om).S3.gRPC.server_enabled set to true in *ozone-site.xml*. (enable service on OM)
2. [ozone.](http://OZONE-SITE.XML_ozone.om)OM.transport.class set to [org.apache.Hadoop.ozone.OM](http://org.apache.hadoop.ozone.om).protocolPB.GrpcOmTransportFactory in *ozone-site.xml*. (enable gRPC on s3g client)

With these two configuration keys disabled, the S3 Gateway \ Ozone Manager channel operates in legacy mode with the existing Hadoop RPC.  This can used in the upgrade period to turn off the feature when the feature is unstable and operate in legacy mode (Hadoop RPC communication).

### 10. third party dependencies/license changes

For the S3-performance gRPC feature, network transport related jars are added to support native encryption on the wire, TLS:

|                                               |
|-----------------------------------------------|
| Added to License.txt                          |
| \+   io.Netty:netty-tcnative-boringssl-static |
| \+   io.Netty:netty-tcnative                  |

### 11. performance

We compare the performance of the S3 Gateway using the gRPC persistent connection with TLS to the existing Hadoop RPC, hRPC connections with encryption on the wire for metadata requests.  We find that in load testing the S3 performance feature branch with gRPC and encryption on the wire outperforms the existing hRPC connection ***both*** encrypted and in plaintext.  This is particularly evident in the comparison of gRPC with TLS to encrypted wire Hadoop RPC where the increase is greater than 2X.

| # | s3g Transport Type | Description | Load Test Performance for Metadata throughput, Objects / sec (objs/sec) |
|---|---|---|---|
| 1 | gRPC TLS (feature branch) | s3g ↔︎ Ozone Manager connection over gRPC with encryption on the wire, TLS. Persistent connection. | 9026.12 |
| 2 | hRPC plaintext (current) | s3g ↔︎ Ozone Manager connection over Hadoop RPC plaintext. Persistent connection (HDDS-5881). | 6508.85 |
| 3 | hRPC encrypted wire (current) | s3g ↔︎ Ozone Manager connection over Hadoop RPC with encryption on the wire (privacy configuration). Persistent connection (HDDS-5881). | 3989.35 |

Load test used: minio Warp S3 benchmarking tool.  

```bash
./warp stat --host=\ --duration=1m –bucket bucket1 --concurrent=64 --noclear --obj.size=1KiB --access-key=$AWS_ACCESS_KEY --secret-key=$AWS_SECRET_ACCESS_KEY
```

Test cluster consists of native Ozone deployment, bare-metal.  OM-SCM on one node, S3 Gateway on separate node.

### 12. security considerations

This feature branch supports gRPC encryption channel communication between the S3 Gateway and Ozone Manager through TLS.  Encryption on the wire for the gRPC channel is configured by the Ozone-site.xml key,

1. `hdds.grpc.tls.enabled` set to `true`

  A new security model is introduced for S3 Gateway persistent connections and was implemented in supporting Jira master branch patch, HDDS-5881.  This branch uses the same security model for S3 user authentication on a per request basis.
