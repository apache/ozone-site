---
sidebar_label: Appendix
---

# Ozone Configuration Parameters Reference

This page provides a comprehensive reference of Apache Ozone configuration parameters in alphabetical order. These parameters can be set in `ozone-site.xml` to override the default values.

Apache Ozone has approximately 495 configuration parameters, covering all aspects of the system. Below are the most important parameters.

For service-specific configurations, see:
- [S3 Gateway Configuration Reference](s3-gateway-configs.md)

| Parameter | Description | Default Value |
|:----------|:------------|:--------------|
| `FILE_SYSTEM_OPTIMIZED` | A value for bucket layout (`ozone.default.bucket.layout`), optimized for filesystem operations | - |
| `hdds.block.token.enabled` | Enables the use of block tokens for authorizing client access to Datanode block operations | `false` |
| `hdds.block.token.expiry.time` | The duration for which a block token remains valid after issuance | `1d` |
| `hdds.command.status.report.interval` | The interval at which Datanodes report the status of executed commands back to SCM | `60s` |
| `hdds.container.action.max.limit` | The maximum number of container-related actions SCM includes in a single heartbeat response to a Datanode | `20` |
| `hdds.container.checksum.verification.enabled` | If true, checksums are verified when reading container data to ensure integrity | `true` |
| `hdds.container.chunk.persistdata` | If true, chunk data written to containers is persisted to disk | `true` |
| `hdds.container.close.threshold` | The utilization threshold at which a container becomes eligible for closing | `0.9` |
| `hdds.container.ipc.port` | The TCP port number the Datanode listens on for container protocol operations | `9859` |
| `hdds.container.ratis.admin.port` | The TCP port number the Datanode listens on for Ratis administrative commands | `9857` |
| `hdds.container.ratis.client.request.timeout` | Timeout duration for client requests sent to a Ratis pipeline | `300s` |
| `hdds.container.ratis.client.request.watch.timeout` | Timeout duration for watching asynchronous Ratis requests on the client side | `180s` |
| `hdds.container.ratis.datastream.enabled` | Enables the Ratis DataStream API for streaming writes | `false` |
| `hdds.container.ratis.datastream.port` | The TCP port number the Datanode listens on for Ratis DataStream requests | `9855` |
| `hdds.container.ratis.election.timeout` | The timeout duration for Ratis leader elections within a pipeline | `1s` |
| `hdds.container.ratis.ipc.port` | The TCP port number the Datanode listens on for Ratis client RPC requests | `9858` |
| `hdds.container.ratis.leader.pending.bytes.limit` | The maximum amount of data allowed to be pending in the Ratis leader's queue | `128MB` |
| `hdds.container.ratis.log.appender.queue.byte-limit` | The maximum size of the queue used by the Ratis log appender on Datanodes | `128MB` |
| `hdds.container.ratis.log.appender.queue.num-elements` | The maximum number of elements allowed in the queue used by the Ratis log appender | `1024` |
| `hdds.container.ratis.log.force.sync.num` | The number of Ratis log entries after which a forced sync to disk is performed | `100` |
| `hdds.container.ratis.log.preallocated.size` | The size of the preallocated Ratis log segment files on Datanodes | `16MB` |
| `hdds.container.ratis.log.purge.enabled` | Enables the automatic purging of Ratis logs once included in a snapshot | `true` |
| `hdds.container.ratis.log.purge.gap` | The minimum number of Ratis log entries to retain after the latest snapshot index | `1000000` |
| `hdds.container.ratis.log.queue.num-elements` | The maximum number of elements allowed in the Ratis log queue on Datanodes | `1024` |
| `hdds.container.ratis.log.segment.size.max` | The maximum size allowed for a single Ratis log segment file | `48MB` |
| `hdds.container.ratis.log.sync` | If true, forces Ratis log entries to be synced to disk before acknowledging | `false` |
| `hdds.container.ratis.rpc.type` | Specifies the RPC implementation used for Ratis communication | `GRPC` |
| `hdds.container.ratis.server.port` | The TCP port number for server-to-server Ratis communication | `9856` |
| `hdds.container.ratis.server.request.timeout` | Timeout duration for requests handled by the Datanode's internal Ratis server | `2m` |
| `hdds.container.ratis.snapshot.auto.trigger.enabled` | Enables automatic triggering of Ratis snapshots based on transaction count | `true` |
| `hdds.container.ratis.snapshot.auto.trigger.threshold` | The number of Ratis transactions after which a snapshot is automatically triggered | `100000` |
| `hdds.container.ratis.statemachinedata.sync.retries` | The number of times the Datanode will retry syncing state machine data to disk upon failure | `-1` |
| `hdds.container.ratis.statemachinedata.sync.timeout` | The timeout duration for syncing Ratis state machine data to disk on Datanodes | `10s` |
| `hdds.container.report.interval` | The interval at which Datanodes send a full report of their containers to SCM | `60m` |
| `hdds.container.token.enabled` | Enables the use of container tokens for authorizing client access to Datanode container operations | `false` |
| `hdds.datanode.block.delete.command.worker.interval` | The interval between DeleteCmdWorker execution of delete commands | `2s` |
| `hdds.datanode.block.delete.max.lock.wait.timeout` | Timeout for the thread used to process the delete block command to wait for the container lock | `100ms` |
| `hdds.datanode.block.delete.queue.limit` | The maximum number of block delete commands queued on a datanode | `5` |
| `hdds.datanode.block.delete.threads.max` | The maximum number of threads used to handle delete blocks on a datanode | `5` |
| `hdds.datanode.check.empty.container.dir.on.delete` | Whether to check container directory to determine if container is empty | `false` |
| `hdds.datanode.chunk.data.validation.check` | Enable safety checks such as checksum validation for Ratis calls | `false` |
| `hdds.datanode.client.address` | The RPC address where the Datanode listens for client protocol requests | `0.0.0.0:19864` |
| `hdds.datanode.client.bind.host` | The network interface address the Datanode client protocol RPC server binds to | `0.0.0.0` |
| `hdds.datanode.client.port` | The port number for the Datanode client protocol RPC server | `19864` |
| `hdds.datanode.container.close.threads.max` | The maximum number of threads used to close containers on a datanode | `3` |
| `hdds.datanode.container.db.dir` | Comma-separated list of directories used to store container metadata | *None* |
| `hdds.datanode.container.delete.threads.max` | The maximum number of threads used to delete containers on a datanode | `2` |
| `hdds.datanode.container.schema.v3.enabled` | Enable use of container schema v3 (one rocksdb per disk) | `true` |
| `hdds.datanode.container.schema.v3.key.separator` | The default separator between Container ID and container meta key name | `\|` |
| `hdds.datanode.delete.container.timeout` | If a delete container request spends more than this time waiting on the container lock or performing pre checks, the command will be skipped | `60s` |
| `hdds.datanode.dir` | Comma-separated list of directories where the Datanode stores container data | *None* |
| `hdds.datanode.dir.du.reserved` | Specifies a fixed amount of reserved disk space for specific Datanode volumes | *None* |
| `hdds.datanode.dir.du.reserved.percent` | The percentage of total disk space on a Datanode volume to reserve | `0.0001` |
| `hdds.datanode.disk.check.io.failures.tolerated` | The number of IO tests out of the last test run that are allowed to fail before the volume is marked as failed | `1` |
| `hdds.datanode.disk.check.io.file.size` | The size of the temporary file that will be synced to the disk | `100B` |
| `hdds.datanode.disk.check.io.test.count` | The number of IO tests required to determine if a disk has failed | `3` |
| `hdds.datanode.disk.check.min.gap` | The minimum gap between two successive checks of the same Datanode volume | `10m` |
| `hdds.datanode.disk.check.timeout` | Maximum allowed time for a disk check to complete | `10m` |
| `hdds.datanode.failed.data.volumes.tolerated` | The number of data volumes that are allowed to fail before a datanode stops offering service | `-1` |
| `hdds.datanode.failed.db.volumes.tolerated` | The number of db volumes that are allowed to fail before a datanode stops offering service | `-1` |
| `hdds.datanode.failed.metadata.volumes.tolerated` | The number of metadata volumes that are allowed to fail before a datanode stops offering service | `-1` |
| `hdds.datanode.handler.count` | The number of RPC handler threads on the Datanode for processing client protocol requests | `10` |
| `hdds.datanode.http-address` | The address for the Datanode's HTTP server | `0.0.0.0:9882` |
| `hdds.datanode.http-bind-host` | The network interface address the Datanode HTTP server binds to | `0.0.0.0` |
| `hdds.datanode.http.auth.type` | Authentication type for the Datanode HTTP endpoint | `simple` |
| `hdds.datanode.http.enabled` | Controls whether the Datanode's HTTP server endpoint is enabled | `true` |
| `hdds.datanode.https-address` | The address for the Datanode's HTTPS server when TLS is enabled | `0.0.0.0:9883` |
| `hdds.datanode.https-bind-host` | The network interface address the Datanode HTTPS server binds to | `0.0.0.0` |
| `hdds.datanode.metadata.rocksdb.cache.size` | The size of the RocksDB block cache used for Datanode metadata databases | `1GB` |
| `hdds.datanode.periodic.disk.check.interval.minutes` | Periodic disk check run interval in minutes | `60` |
| `hdds.datanode.plugins` | Comma-separated list of Datanode ServicePlugin implementation classes to load | *None* |
| `hdds.datanode.ratis.server.request.timeout` | Timeout duration for requests handled by the Datanode's internal Ratis server | `2m` |
| `hdds.datanode.read.chunk.threads.per.volume` | Number of threads per volume that Datanode will use for reading chunks | `10` |
| `hdds.datanode.read.threadpool` | The number of threads in the Datanode's thread pool for handling read operations | `10` |
| `hdds.datanode.replication.outofservice.limit.factor` | Multiplier for queue capacity and executor pool size on decommissioning/maintenance nodes | `2.0` |
| `hdds.datanode.replication.port` | Port used for the server2server replication server | `9886` |
| `hdds.datanode.replication.queue.limit` | The maximum number of queued requests for container replication | `4096` |
| `hdds.datanode.replication.streams.limit` | The maximum number of replication commands a single datanode can execute simultaneously | `10` |
| `hdds.datanode.replication.work.dir` | Datanode working directory for container replication temporary files | Relative to `hdds.datanode.dir` |
| `hdds.datanode.rocksdb.auto-compaction-small-sst-file` | Auto compact small SST files when count exceeds threshold | `true` |
| `hdds.datanode.rocksdb.auto-compaction-small-sst-file-num-threshold` | Auto compaction will happen if the number of small SST files exceeds this threshold | `512` |
| `hdds.datanode.rocksdb.auto-compaction-small-sst-file-size-threshold` | SST files smaller than this configuration will be auto compacted | `1MB` |
| `hdds.datanode.rocksdb.auto-compaction-small-sst-file.interval.minutes` | Auto compact small SST files interval in minutes | `120` |
| `hdds.datanode.rocksdb.auto-compaction-small-sst-file.threads` | Auto compact small SST files threads | `1` |
| `hdds.datanode.rocksdb.delete_obsolete_files_period` | Periodicity when obsolete RocksDB files get deleted | `1h` |
| `hdds.datanode.rocksdb.log.level` | The user log level of RocksDB (DEBUG/INFO/WARN/ERROR/FATAL) | `INFO` |
| `hdds.datanode.rocksdb.log.max-file-num` | The max user log file number to keep for each RocksDB | `64` |
| `hdds.datanode.rocksdb.log.max-file-size` | The max size of each user log file of RocksDB | `32MB` |
| `hdds.datanode.rocksdb.max-open-files` | The total number of files that a RocksDB can open (Schema V3 only) | `1024` |
| `hdds.datanode.slow.op.warning.threshold` | Threshold duration after which a slow Datanode operation triggers a warning log | `500ms` |
| `hdds.datanode.storage.utilization.critical.threshold` | The storage utilization threshold above which a Datanode volume is considered critically full | `0.95` |
| `hdds.datanode.storage.utilization.warning.threshold` | The storage utilization threshold above which a Datanode volume is considered nearly full | `0.75` |
| `hdds.datanode.volume.choosing.policy` | The policy used by Datanode to choose a volume for placing new containers | `org.apache.hadoop.ozone.container.common.volume.CapacityVolumeChoosingPolicy` |
| `hdds.datanode.volume.min.free.space` | The minimum absolute amount of free space required on a Datanode volume | `5GB` |
| `hdds.datanode.volume.min.free.space.percent` | The minimum percentage of free space required on a Datanode volume | *None* |
| `hdds.datanode.wait.on.all.followers` | Whether the leader waits for both followers before removing stateMachineData from the cache | `false` |
| `hdds.db.profile` | Sets a predefined profile to tune RocksDB parameters based on the expected storage hardware | `DISK` |
| `hdds.grpc.tls.enabled` | Enables TLS encryption for all gRPC communication between Ozone components | `false` |
| `hdds.grpc.tls.provider` | Specifies the SSL provider used for gRPC TLS encryption | `OPENSSL` |
| `hdds.grpc.tls.test.cert` | For testing only. If true, use a self-signed test certificate for gRPC TLS | `false` |
| `hdds.heartbeat.interval` | The interval at which Datanodes send heartbeats to SCM | `30s` |
| `hdds.initial.heartbeat.interval` | The interval for the initial heartbeats sent by a Datanode after startup | `2s` |
| `hdds.key.algo` | The cryptographic algorithm used for generating key pairs within Ozone | `RSA` |
| `hdds.key.dir.name` | The name of the subdirectory within the metadata directory where cryptographic keys are stored | `keys` |
| `hdds.key.len` | The bit length for generated cryptographic keys | `2048` |
| `hdds.metadata.dir` | *Deprecated. Use `ozone.metadata.dirs` instead* | *None* |
| `hdds.node.report.interval` | The interval at which Datanodes send a node report to SCM | `60s` |
| `hdds.pipeline.action.max.limit` | The maximum number of pipeline-related actions SCM includes in a single heartbeat response | `20` |
| `hdds.pipeline.report.interval` | The interval at which Datanodes send a pipeline report to SCM | `60s` |
| `hdds.priv.key.file.name` | The file name for the private key stored within the key directory | `private.pem` |
| `hdds.public.key.file.name` | The file name for the public key stored within the key directory | `public.pem` |
| `hdds.recon.heartbeat.interval` | The interval at which Datanodes send heartbeats to the Recon server | `60s` |
| `hdds.recon.initial.heartbeat.interval` | The interval for the initial heartbeats sent by a Datanode to the Recon server | `2s` |
| `hdds.rest.http-address` | The address for the HDDS REST service endpoint | `0.0.0.0:9880` |
| `hdds.scm.safemode.enabled` | If true, SCM enters safe mode on startup | `true` |
| `hdds.scm.safemode.min.datanode` | The minimum number of Datanodes that must register with SCM before exiting safe mode | `1` |
| `hdds.scm.safemode.pipeline.creation` | If true, SCM will not create new pipelines while in safe mode | `true` |
| `hdds.scm.safemode.threshold.pct` | The percentage of containers that must be reported with at least one replica | `0.99` |
| `hdds.scm.wait.time.after.safemode.exit` | The duration SCM waits after exiting safe mode before starting background tasks | `5m` |
| `hdds.secret.key.algorithm` | The algorithm used for generating secret keys | `HmacSHA256` |
| `hdds.secret.key.expiry.duration` | The duration for which a generated secret key remains valid before expiring | `7d` |
| `hdds.secret.key.file.name` | The file name for storing rotated secret keys within the component's key directory | `secret_keys.json` |
| `hdds.secret.key.rotate.check.duration` | How often the system checks if the current secret key needs rotation | `10m` |
| `hdds.secret.key.rotate.duration` | The target lifetime for a secret key | `1d` |
| `hdds.security.provider` | The JCE security provider used for cryptographic operations | `BC` |
| `hdds.x509.ca.cert.expiry.duration` | The validity duration for the root CA certificate generated by SCM | `5y` |
| `hdds.x509.ca.grace.duration` | A grace period added to the expiry of certificates signed by the SCM CA | `30d` |
| `hdds.x509.ca.list.limit` | The maximum number of CA certificates returned in a single list request | `100` |
| `hdds.x509.ca.rootca.cert.filename` | The file name used for storing the root CA certificate | `cacert.pem` |
| `hdds.x509.ca.rootca.cert.rotation.check.interval` | How often SCM checks if the root CA certificate needs rotation | `1d` |
| `hdds.x509.ca.rootca.cert.rotation.time.of.day` | The specific time of day when the root CA certificate rotation check is performed | `03:00:00` |
| `hdds.x509.ca.rootca.required` | If true, requires a root CA certificate to be present for SCM operation | `true` |
| `hdds.x509.ca.scm.cert.expiry.duration` | The validity duration for the SCM's own sub-CA certificate | `5y` |
| `hdds.x509.ca.scm.grace.duration` | A grace period added to the expiry of the SCM's sub-CA certificate | `30d` |
| `hdds.x509.cert.expiry.duration` | The default validity duration for certificates issued by SCM to other services | `365d` |
| `hdds.x509.default.duration` | *Deprecated. Use `hdds.x509.cert.expiry.duration` instead* | `365d` |
| `hdds.x509.max.duration` | The maximum allowed validity duration for any certificate issued by SCM | `5y` |
| `hdds.x509.signature.algo` | The signature algorithm used for signing certificates | `SHA256withRSA` |
| `LEGACY` | A value for bucket layout, representing an older layout version | - |
| `OBJECT_STORE` | A value for bucket layout, optimized for S3 compatibility and general object storage | - |
| `ozone.acl.authorizer.class` | The fully qualified class name of the authorizer implementation used for Ozone ACL checks | `org.apache.hadoop.ozone.security.acl.OzoneAccessAuthorizer` |
| `ozone.acl.enabled` | Enables or disables Ozone's Access Control List (ACL) checks for authorization | `false` |
| `ozone.administrators` | Comma-separated list of user principals who are considered Ozone administrators | *None* |
| `ozone.administrators.groups` | Comma-separated list of groups whose members are considered Ozone administrators | *None* |
| `ozone.block.deleting.service.interval` | The interval at which the Ozone Manager's Block Deleting Service runs | `60s` |
| `ozone.block.deleting.service.timeout` | The maximum time allowed for a single run of the Block Deleting Service | `300s` |
| `ozone.chunk.read.buffer.default.size` | Default capacity for the buffer used when reading data chunks | `1MB` |
| `ozone.chunk.read.mapped.buffer.max.count` | Maximum number of memory-mapped buffers allowed for reading a chunk | `0` |
| `ozone.chunk.read.mapped.buffer.threshold` | The minimum size threshold for a chunk read operation to be considered for memory-mapped buffering | `32KB` |
| `ozone.chunk.read.netty.ChunkedNioFile` | Whether to use Netty's ChunkedNioFile for reading chunk data | `false` |
| `ozone.client.connection.timeout` | Timeout duration when establishing a connection from the client | `5000ms` |
| `ozone.client.ec.grpc.retries.enabled` | Enables automatic retries for failed gRPC calls related to Erasure Coding operations | `true` |
| `ozone.client.ec.grpc.retries.max` | The maximum number of retry attempts for failed Erasure Coding gRPC calls | `3` |
| `ozone.client.ec.grpc.write.timeout` | Timeout duration for client-side gRPC write operations related to Erasure Coding | `30s` |
| `ozone.client.failover.max.attempts` | Maximum number of times the client will attempt to failover to another service instance | `500` |
| `ozone.client.fs.default.bucket.layout` | Default bucket layout used by Ozone File System clients when creating buckets | `FILE_SYSTEM_OPTIMIZED` |
| `ozone.client.key.latest.version.location` | If true, the client will only request location information for the latest version of a key | `true` |
| `ozone.client.key.provider.cache.expiry` | Expiry duration for the client-side cache that stores key provider information | `10d` |
| `ozone.client.list.cache.size` | The size of the client-side cache used for listing operations | `1000` |
| `ozone.client.max.ec.stripe.write.retries` | The maximum number of times the client will retry writing an Erasure Coding stripe upon failures | `10` |
| `ozone.client.read.timeout` | Timeout duration for client read operations | `30s` |
| `ozone.client.required.om.version.min` | The minimum Ozone Manager version that the client requires to establish a connection | `"S3G_PERSISTENT_CONNECTIONS"` |
| `ozone.client.server-defaults.validity.period.ms` | The duration for which the client caches default values obtained from the server | `3600000ms` |
| `ozone.client.socket.timeout` | Timeout for socket-level operations during client communication | `5000ms` |
| `ozone.client.wait.between.retries.millis` | The time duration the client waits before making the next attempt after a failure | `2000ms` |
| `ozone.default.bucket.layout` | The default layout assigned to buckets when created if not specified | `FILE_SYSTEM_OPTIMIZED` |
| `ozone.filesystem.snapshot.enabled` | Enables the snapshot feature for Ozone file systems | `true` |
| `ozone.fs.getfilestatus.cache.size` | The size of the cache used by the Ozone File System client for getFileStatus calls | `1000` |
| `ozone.fs.getobjectinfo.cache.size` | The size of the cache used by the Ozone File System client for getObjectInfo calls | `1000` |
| `ozone.fs.iterate.batch-size` | The number of keys fetched in a single batch when iterating through directory listings | `100` |
| `ozone.fs.keyname.cache.enable` | Enables a client-side cache for mapping file paths to Ozone key names in OFS | `true` |
| `ozone.fs.keyname.cache.size` | The size of the client-side OFS key name cache | `10000` |
| `ozone.fs.listing.page.size` | The maximum number of entries returned in a single page when listing directories | `1024` |
| `ozone.fs.trash.interval` | The time duration after which files moved to trash are permanently deleted | `0` |
| `ozone.http.auth.kerberos.keytab` | *Deprecated. Use component-specific keytab settings* | *None* |
| `ozone.http.auth.kerberos.principal` | *Deprecated. Use component-specific principal settings* | *None* |
| `ozone.http.auth.type` | *Deprecated. Use component-specific auth type settings* | `simple` |
| `ozone.http.filter.initializers` | Comma-separated list of initializer classes for adding custom filters to Ozone HTTP servers | *None* |
| `ozone.http.policy` | Controls the HTTP policy for Ozone services | `HTTP_ONLY` |
| `ozone.http.security.enabled` | *Deprecated. Use `ozone.security.http.kerberos.enabled`* | `false` |
| `ozone.key.deleting.limit.per.task` | Maximum number of keys processed by the Key Deleting Service in one run | `20000` |
| `ozone.metadata.dirs` | Root directory where Ozone components store their metadata | *None* |
| `ozone.metadata.dirs.permissions` | POSIX file permissions for the Ozone metadata directory | `755` |
| `ozone.network.topology.aware.read` | If true, clients attempt to read data from the closest Datanode based on network topology | `true` |
| `ozone.om.address` | The RPC address where the Ozone Manager listens for client requests | `0.0.0.0:9862` |
| `ozone.om.block.allocating.service.interval` | The interval at which the OM's background block allocating service runs | `60s` |
| `ozone.om.block.allocating.service.timeout` | The maximum time allowed for a single run of the block allocating service | `300s` |
| `ozone.om.bucket.limit.per.volume` | The maximum number of buckets allowed within a single volume | `100` |
| `ozone.om.db.dirs` | Directory where the Ozone Manager stores its database files | *None* |
| `ozone.om.db.dirs.permissions` | POSIX file permissions for the OM database directory | `750` |
| `ozone.om.enable.filesystem.paths` | Enables support for filesystem-style paths in addition to standard S3-style paths | `true` |
| `ozone.om.grpc.port` | The TCP port number the Ozone Manager listens on for gRPC requests | `9873` |
| `ozone.om.ha.nodeid` | In an OM HA setup, this specifies the unique identifier for the current OM node | *None* |
| `ozone.om.handler.count.key` | The number of RPC handler threads on the Ozone Manager for processing client requests | `100` |
| `ozone.om.http-address` | The address for the Ozone Manager's HTTP server | `0.0.0.0:9874` |
| `ozone.om.http-bind-host` | The network interface address the OM HTTP server binds to | `0.0.0.0` |
| `ozone.om.http.auth.type` | Authentication type for the OM HTTP endpoint | `simple` |
| `ozone.om.http.enabled` | Controls whether the OM's HTTP server endpoint is enabled | `true` |
| `ozone.om.https-address` | The address for the Ozone Manager's HTTPS server when TLS is enabled | `0.0.0.0:9875` |
| `ozone.om.https-bind-host` | The network interface address the OM HTTPS server binds to | `0.0.0.0` |
| `ozone.om.internal.service.id` | In an OM HA setup, this specifies the service ID that the current OM node belongs to | *None* |
| `ozone.om.kerberos.keytab.file` | Path to the Kerberos keytab file used for Ozone Manager authentication | *None* |
| `ozone.om.kerberos.principal` | The Kerberos principal name used by the Ozone Manager for authentication | *None* |
| `ozone.om.max.volumes.per.user` | The maximum number of volumes a single user is allowed to create | `1000` |
| `ozone.om.nodes` | In an OM HA setup, this key requires a service ID suffix and specifies node IDs | *None* |
| `ozone.om.open.key.cleanup.service.interval` | The interval at which the OM's background service runs to clean up potentially expired open keys | `1h` |
| `ozone.om.open.key.cleanup.service.timeout` | The maximum time allowed for a single run of the open key cleanup service | `5m` |
| `ozone.om.open.key.expire.threshold` | The duration after which an open key is considered expired and eligible for cleanup | `1h` |
| `ozone.om.ratis.enable` | Enables High Availability for Ozone Manager using the Ratis consensus protocol | `false` |
| `ozone.om.ratis.log.appender.queue.byte-limit` | The maximum size of the queue used by the Ratis log appender in OM HA | `32MB` |
| `ozone.om.ratis.log.appender.queue.num-elements` | The maximum number of elements allowed in the queue used by the Ratis log appender in OM HA | `1024` |
| `ozone.om.ratis.log.purge.enabled` | Enables the automatic purging of Ratis logs in OM HA once included in a snapshot | `true` |
| `ozone.om.ratis.log.purge.gap` | The minimum number of Ratis log entries to retain after the latest snapshot index during log purging in OM HA | `1000000` |
| `ozone.om.ratis.minimum.timeout` | The minimum timeout duration allowed for Ratis operations within the Ozone Manager | `1s` |
| `ozone.om.ratis.port` | The TCP port number used for Ratis communication between Ozone Managers in an HA setup | `9872` |
| `ozone.om.ratis.request.timeout` | The timeout duration for Ratis requests made within the Ozone Manager | `3s` |
| `ozone.om.ratis.snapshot.auto.trigger.threshold` | The number of Ratis transactions after which a snapshot of the OM state machine is automatically triggered in an HA setup | `400000` |
| `ozone.om.ratis.snapshot.dir` | Directory where the Ozone Manager stores its Ratis snapshots in an HA setup | Derived from `ozone.om.db.dirs` |
| `ozone.om.read.threadpool` | The number of threads in the Ozone Manager's RPC server for handling read requests | `10` |
| `ozone.om.save.metrics.interval` | The interval at which Ozone Manager metrics are periodically saved | `5m` |
| `ozone.om.security.admin.protocol.acl` | ACL for clients accessing the OM admin protocols | Service Users |
| `ozone.om.security.client.protocol.acl` | ACL for clients accessing the main OM client protocol | `*` |
| `ozone.om.service.ids` | Defines the OM service ID(s) for OM HA configuration | *None* |
| `ozone.om.volume.listall.allowed` | If true, allows non-admin users to list all volumes in the cluster | `false` |
| `ozone.recon.container.db.cache.size` | The size of the RocksDB cache used by Recon for storing container information | `100000` |
| `ozone.recon.db.dir` | Directory where the Recon server stores its database files | *None* |
| `ozone.recon.db.dirs.permissions` | POSIX file permissions for the Recon database directory | `750` |
| `ozone.recon.grpc.port` | The TCP port number the Recon server listens on for gRPC requests | `9887` |
| `ozone.recon.handler.count` | The number of RPC handler threads for the Recon server | `60` |
| `ozone.recon.http-address` | The address for the Recon web UI and REST API | `0.0.0.0:9888` |
| `ozone.recon.http-bind-host` | The network interface address the Recon HTTP server binds to | `0.0.0.0` |
| `ozone.recon.https-address` | The address for the Recon web UI and REST API when TLS is enabled | `0.0.0.0:9889` |
| `ozone.recon.https-bind-host` | The network interface address the Recon HTTPS server binds to | `0.0.0.0` |
| `ozone.recon.kerberos.keytab.file` | Path to the Kerberos keytab file used for Recon server authentication | *None* |
| `ozone.recon.kerberos.principal` | The Kerberos principal name used by the Recon server for authentication | *None* |
| `ozone.recon.om.connection.request.timeout` | Timeout duration for connection requests made from Recon to the Ozone Manager | `5s` |
| `ozone.recon.om.connection.timeout` | Timeout duration when Recon attempts to establish a connection to the Ozone Manager | `5s` |
| `ozone.recon.om.snapshot.task.interval.delay` | The initial delay before the Recon OM Snapshot processing task starts | `1m` |
| `ozone.replication` | **Client-side** default replication factor used when creating keys | `THREE` |
| `ozone.replication.type` | **Client-side** default replication type used when creating keys | `RATIS` |
| `ozone.s3g.auditlog.enabled` | Enables audit logging for requests handled by the S3 Gateway | `true` |
| `ozone.s3g.chunked.transfer.enabled` | Enables support for chunked transfer encoding in S3 Gateway responses | `true` |
| `ozone.s3g.client.buffer.size` | Buffer size used by the S3 Gateway client when reading/writing data | `32KB` |
| `ozone.s3g.default.bucket.layout` | Default bucket layout for buckets created via S3 Gateway | `OBJECT_STORE` |
| `ozone.s3g.domain.name` | Comma-separated list of domain names handled by S3 Gateway for virtual host-style access | *None* |
| `ozone.s3g.filesystem.paths.cache.size` | The size of the cache used by S3 Gateway to store mappings between S3 paths and Ozone key names | `100000` |
| `ozone.s3g.fso.directory.creation` | If true, allows implicit directory creation in FSO buckets via S3 Gateway object PUT requests | `true` |
| `ozone.s3g.handler.count` | The number of handler threads for the S3 Gateway's HTTP server | `100` |
| `ozone.s3g.http-address` | HTTP address for the S3 Gateway service | `0.0.0.0:9878` |
| `ozone.s3g.http-bind-host` | Network interface the S3 Gateway HTTP server binds to | `0.0.0.0` |
| `ozone.s3g.http.auth.type` | Authentication type for the S3 Gateway HTTP endpoint | `simple` |
| `ozone.s3g.http.enabled` | Enables the S3 Gateway HTTP server | `true` |
| `ozone.s3g.https-address` | HTTPS address for the S3 Gateway service | `0.0.0.0:9879` |
| `ozone.s3g.https-bind-host` | Network interface the S3 Gateway HTTPS server binds to | `0.0.0.0` |
| `ozone.s3g.kerberos.keytab.file` | Path to the Kerberos keytab file for the S3 Gateway service principal | *None* |
| `ozone.s3g.kerberos.principal` | The Kerberos principal name for the S3 Gateway service | *None* |
| `ozone.s3g.max.header.size` | The maximum allowed size for HTTP headers in requests processed by the S3 Gateway | `65536` |
| `ozone.s3g.max.threads` | The maximum number of threads the S3 Gateway's underlying web server can use | `2000` |
| `ozone.s3g.multipart.enabled` | Enables support for S3 multipart uploads in the S3 Gateway | `true` |
| `ozone.s3g.socket.idle.time` | The maximum time a connection to the S3 Gateway can remain idle before being closed | `30s` |
| `ozone.s3g.webadmin.http-address` | HTTP address for the S3 Gateway web admin interface | `0.0.0.0:9880` |
| `ozone.s3g.webadmin.http-bind-host` | Network interface the S3 Gateway web admin HTTP server binds to | `0.0.0.0` |
| `ozone.s3g.webadmin.http.enabled` | Enables the S3 Gateway web admin HTTP server | `true` |
| `ozone.s3g.webadmin.https-address` | HTTPS address for the S3 Gateway web admin interface | `0.0.0.0:9881` |
| `ozone.s3g.webadmin.https-bind-host` | Network interface the S3 Gateway web admin HTTPS server binds to | `0.0.0.0` |
| `ozone.scm.address` | RPC address for a specific SCM node in an HA setup | *None* |
| `ozone.scm.block.client.address` | Address SCM listens on for block protocol requests | `0.0.0.0:9861` |
| `ozone.scm.block.client.bind.host` | Network interface SCM binds to for the block client service | `0.0.0.0` |
| `ozone.scm.block.client.port` | Default port for the SCM block client service | `9861` |
| `ozone.scm.block.deletion.max.retry` | Maximum retries SCM attempts when sending delete block commands to Datanodes | `4096` |
| `ozone.scm.block.handler.count.key` | Number of handler threads for the SCM block client RPC server | `100` |
| `ozone.scm.block.read.threadpool` | Number of reader threads for the SCM block client RPC server | `20` |
| `ozone.scm.block.size` | Default size of blocks allocated by SCM | `256MB` |
| `ozone.scm.ca.list.retry.interval` | Interval between retries when fetching the CA list from SCM | `10` |
| `ozone.scm.chunk.size` | Size of data chunks within an Ozone block | `4MB` |
| `ozone.scm.client.address` | Address SCM listens on for client protocol requests | `0.0.0.0:9860` |
| `ozone.scm.client.bind.host` | Network interface SCM binds to for the client service | `0.0.0.0` |
| `ozone.scm.client.handler.count.key` | Number of handler threads for the SCM client RPC server | `100` |
| `ozone.scm.client.port` | Default port for the SCM client service | `9860` |
| `ozone.scm.client.read.threadpool` | Number of reader threads for the SCM client RPC server | `10` |
| `ozone.scm.close.container.wait.duration` | Duration SCM waits before force-closing a container | `150s` |
| `ozone.scm.container.layout` | Storage layout for containers on Datanodes | `SIMPLE` |
| `ozone.scm.container.list.max.count` | Maximum number of containers returned in a list request | `4096` |
| `ozone.scm.container.placement.ec.impl` | Class implementing the placement policy for EC containers | `org.apache.hadoop.hdds.scm.container.placement.algorithms.SCMContainerPlacementRackScatter` |
| `ozone.scm.container.placement.impl` | Class implementing the placement policy for replicated containers | `org.apache.hadoop.hdds.scm.container.placement.algorithms.SCMContainerPlacementRandom` |
| `ozone.scm.container.size` | Default size for containers created by SCM | `5GB` |
| `ozone.scm.datanode.address` | Address SCM listens on for Datanode protocol requests | `0.0.0.0:9862` |
| `ozone.scm.datanode.admin.monitor.interval` | Interval for SCM checking status of Datanodes in maintenance/decommission | `30s` |
| `ozone.scm.datanode.admin.monitor.logging.limit` | Limits container details logged by Datanode Admin Monitor per interval | `1000` |
| `ozone.scm.datanode.bind.host` | Network interface SCM binds to for the Datanode service | `0.0.0.0` |
| `ozone.scm.datanode.disallow.same.peers` | If true, prevents a Datanode from being a peer in multiple Ratis pipelines simultaneously | `false` |
| `ozone.scm.datanode.handler.count.key` | Number of handler threads for the SCM Datanode RPC server | `100` |
| `ozone.scm.datanode.id.dir` | Directory where the Datanode ID file is stored | Relative to `hdds.metadata.dir` |
| `ozone.scm.datanode.pipeline.limit` | Maximum number of pipelines a Datanode can participate in | `2` |
| `ozone.scm.datanode.port` | Default port for the SCM Datanode service | `9862` |
| `ozone.scm.datanode.read.threadpool` | Number of reader threads for the SCM Datanode RPC server | `10` |
| `ozone.scm.db.dirs` | Directory where SCM stores its database files | Defaults to `hdds.metadata.dir` |
| `ozone.scm.db.dirs.permissions` | POSIX file permissions for the SCM database directories | `750` |
| `ozone.scm.dead.node.interval` | Time duration after which SCM considers a Datanode dead if no heartbeat is received | `10m` |
| `ozone.scm.default.service.id` | Specifies the default SCM service ID for clients/services in an HA setup | *None* |
| `ozone.scm.expired.container.replica.op.scrub.interval` | Interval for SCM to scrub expired container replica operations | `5m` |
| `ozone.scm.grpc.port` | Port used for gRPC communication between SCMs in HA | `9893` |
| `ozone.scm.handler.count.key` | Default number of handler threads for SCM RPC servers | `100` |
| `ozone.scm.heartbeat.log.warn.interval.count` | Log a warning every N missed heartbeats from a Datanode | `10` |
| `ozone.scm.heartbeat.rpc-timeout` | RPC timeout for Datanode heartbeat calls to SCM | `5s` |
| `ozone.scm.http-address` | HTTP address for the SCM web UI and REST API | `0.0.0.0:9876` |
| `ozone.scm.http-bind-host` | Network interface the SCM HTTP server binds to | `0.0.0.0` |
| `ozone.scm.http.enabled` | Enables the SCM HTTP server | `true` |
| `ozone.scm.https-address` | HTTPS address for the SCM web UI and REST API | `0.0.0.0:9877` |
| `ozone.scm.https-bind-host` | Network interface the SCM HTTPS server binds to | `0.0.0.0` |
| `ozone.scm.info.wait.duration` | Maximum time clients wait to retrieve SCM info during startup | `600s` |
| `ozone.scm.names` | Comma-separated list of SCM hostnames or IP addresses for client discovery | *None* |
| `ozone.scm.network.topology.schema.file` | Path to the XML file defining the network topology schema | `network-topology-default.xml` |
| `ozone.scm.node.id` | Unique identifier for this SCM node within its HA service group | *None* |
| `ozone.scm.nodes` | Comma-separated list of node IDs for a specific SCM HA service | *None* |
| `ozone.scm.pipeline.allocated.timeout` | Maximum time a pipeline can remain in ALLOCATED state before being destroyed | `5m` |
| `ozone.scm.pipeline.creation.auto.factor.one` | If true, SCM automatically creates Ratis/ONE pipelines | `true` |
| `ozone.scm.pipeline.creation.interval` | Interval for the SCM background pipeline creation thread | `120s` |
| `ozone.scm.pipeline.destroy.timeout` | Timeout after which SCM destroys pipelines marked for closure | `300s` |
| `ozone.scm.pipeline.leader-choose.policy` | Class implementing the policy for choosing Ratis pipeline leaders | `org.apache.hadoop.hdds.scm.pipeline.leader.choose.algorithms.MinLeaderCountChoosePolicy` |
| `ozone.scm.pipeline.owner.container.count` | Default number of containers that can be owned by a single pipeline owner | `3` |
| `ozone.scm.pipeline.scrub.interval` | Interval for scrubbing pipelines stuck in the ALLOCATED state | `150s` |
| `ozone.scm.primordial.node.id` | Node ID of the first SCM that bootstrapped the SCM HA cluster | *None* |
| `ozone.scm.ratis.enable` | Enables High Availability for Storage Container Manager using the Ratis consensus protocol | `false` |
| `ozone.scm.ratis.port` | Port used for Ratis communication between SCMs in HA | `9894` |
| `ozone.scm.ratis.snapshot.dir` | Directory where the Storage Container Manager stores its Ratis snapshots in an HA setup | Derived from `ozone.scm.db.dirs` |
| `ozone.scm.security.handler.count.key` | Number of handler threads for the SCM security RPC server | `5` |
| `ozone.scm.security.read.threadpool` | Number of reader threads for the SCM security RPC server | `5` |
| `ozone.scm.security.service.address` | Address SCM listens on for security protocol requests | `0.0.0.0:9895` |
| `ozone.scm.security.service.bind.host` | Network interface the SCM security service binds to | `0.0.0.0` |
| `ozone.scm.security.service.port` | Default port for the SCM security service | `9895` |
| `ozone.scm.sequence.id.batch.size` | Number of sequence IDs SCM reserves in a batch from the Ratis leader | `1000` |
| `ozone.scm.service.ids` | Comma-separated list of SCM service IDs used in HA configuration | *None* |
| `ozone.scm.skip.bootstrap.validation` | If true, skips cluster ID validation during SCM bootstrap | `false` |
| `ozone.scm.stale.node.interval` | Time duration after which SCM considers a Datanode stale if no heartbeat is received | `5m` |
| `ozone.security.crypto.codec.classes` | Comma-separated list of fully qualified class names for cryptographic codec implementations | `org.apache.hadoop.hdds.security.x509.certificate.client.DNCertificateClient, org.apache.hadoop.hdds.security.x509.certificate.client.OMCertificateClient, org.apache.hadoop.hdds.security.x509.certificate.client.SCMCertificateClient, org.apache.hadoop.hdds.security.x509.certificate.client.CAClientImpl` |
| `ozone.security.enabled` | Enables Kerberos security for the entire Ozone cluster | `false` |
| `ozone.security.http.kerberos.enabled` | Enables Kerberos authentication specifically for Ozone HTTP endpoints | `false` |
| `ozone.server.default.replication` | **Server-side (OM)** default replication factor used if not specified by the client or bucket defaults | `THREE` |
| `ozone.server.default.replication.type` | **Server-side (OM)** default replication type used if not specified by the client or bucket defaults | `RATIS` |
| `ozone.snapshot.deep.cleaning.enabled` | If true, enables deep cleaning for snapshots | `false` |
| `ozone.snapshot.deleting.service.interval` | Interval for the OM Snapshot Deleting Service runs | `30s` |
| `ozone.snapshot.deleting.service.timeout` | Timeout for a single run of the OM Snapshot Deleting Service | `300s` |
| `ozone.snapshot.directory.service.interval` | Interval for the OM Snapshot Directory Deleting Service runs | `24h` |
| `ozone.snapshot.directory.service.timeout` | Timeout for a single run of the OM Snapshot Directory Deleting Service | `300s` |
| `ozone.snapshot.filtering.service.interval` | Interval for the OM SST Filtering Service runs | `60s` |
| `ozone.snapshot.key.deleting.limit.per.task` | Maximum number of keys within deleted snapshots processed by the Snapshot Deleting Service | `20000` |
| `ozone.thread.number.dir.deletion` | Number of threads used by the OM background directory deletion service | `10` |
| `ozone.unsafebyteoperations.enabled` | Enables the use of `sun.misc.Unsafe` for optimized byte buffer operations | `true` |
| `ozone.xceiver.client.metrics.percentiles.intervals.seconds` | Comma-separated list of integers defining time intervals for calculating latency percentiles | *None* |
| `recon.storage.dir` | Internal subdirectory name within `ozone.recon.db.dir` for Recon state files | `recon` |

## See Also

- [S3 Gateway Configuration Reference](s3-gateway-configs.md) - Configuration properties specific to the Ozone S3 Gateway

## Summary

This reference documents the most important configuration parameters for Apache Ozone from the total of approximately 495 different configuration parameters. The parameters cover all aspects of Ozone's functionality including storage, security, networking, performance, service-specific settings, and advanced features.

For the most up-to-date and complete list, refer to the `ozone-default.xml` file in the Ozone distribution.