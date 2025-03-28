# Apache Ozone Changelog

## Release 2.0.0 - 2025-03-27



### NEW FEATURES:

| JIRA | Summary | Priority | Component | Reporter | Contributor |
|:---- |:---- | :--- |:---- |:---- |:---- |
| [HDDS-7593](https://issues.apache.org/jira/browse/HDDS-7593) | Supporting HSync and lease recovery |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-7852](https://issues.apache.org/jira/browse/HDDS-7852) | SCM Decommissioning Support |  Major | SCM | Nandakumar | Nandakumar |
| [HDDS-11070](https://issues.apache.org/jira/browse/HDDS-11070) | Separate KeyCodec responsibilities of being a coder/decoder and handling persistence of keys |  Major | . | Szabolcs Gál | Szabolcs Gál |


### IMPROVEMENTS:

| JIRA | Summary | Priority | Component | Reporter | Contributor |
|:---- |:---- | :--- |:---- |:---- |:---- |
| [HDDS-9880](https://issues.apache.org/jira/browse/HDDS-9880) | Elaborate OM VERSION file mismatch message |  Major | . | Aryan Gupta | Aryan Gupta |
| [HDDS-9937](https://issues.apache.org/jira/browse/HDDS-9937) | Move add response in doubleBuffer from validateAndUpdateCache to handleWriteRequest |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-9986](https://issues.apache.org/jira/browse/HDDS-9986) | Log if there is a problem in closing RocksDB |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-10024](https://issues.apache.org/jira/browse/HDDS-10024) | Fix wrong symbols in ContainerStateMachine |  Minor | Ozone Datanode | JiangHua Zhu | JiangHua Zhu |
| [HDDS-9388](https://issues.apache.org/jira/browse/HDDS-9388) | OM Ratis Write: Move ACL check and Bucket resolution to preExecute |  Major | Ozone Manager | Duong | Duong |
| [HDDS-10082](https://issues.apache.org/jira/browse/HDDS-10082) | Fix typo in StorageContainerManager constructor |  Minor | SCM | JiangHua Zhu | JiangHua Zhu |
| [HDDS-10057](https://issues.apache.org/jira/browse/HDDS-10057) | Snapshot: 'ozone fs -ls' on '.snapshot' dir of a bucket should list only active snapshots |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-10088](https://issues.apache.org/jira/browse/HDDS-10088) | Refine the number of handlers for each RPC of SCM |  Major | SCM | JiangHua Zhu | JiangHua Zhu |
| [HDDS-10105](https://issues.apache.org/jira/browse/HDDS-10105) | Remove duplicate hdds.datanode. prefix from check.empty.container.dir.on.delete |  Minor | DN | Hongbing Wang | Hongbing Wang |
| [HDDS-10107](https://issues.apache.org/jira/browse/HDDS-10107) | Remove the static dbNameToCfHandleMap from RocksDatabase |  Major | db | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10139](https://issues.apache.org/jira/browse/HDDS-10139) | Support to get hosts from stdin when DN is decommissioning, recommissioning or entering maintenance. |  Minor | DN | WangYuanben | WangYuanben |
| [HDDS-10162](https://issues.apache.org/jira/browse/HDDS-10162) | Correct the metric names within OMPerformanceMetrics |  Major | OM | Hongbing Wang | Hongbing Wang |
| [HDDS-10198](https://issues.apache.org/jira/browse/HDDS-10198) | Improve Logging in AbstractFindTargetGreedy |  Major | SCM | Siddhant Sangwan | Siddhant Sangwan |
| [HDDS-10210](https://issues.apache.org/jira/browse/HDDS-10210) | Ensure atomic update in StateContext#updateCommandStatus |  Major | DN, Ozone Datanode | Ivan Andika | Ivan Andika |
| [HDDS-9985](https://issues.apache.org/jira/browse/HDDS-9985) | Do not use Guava Optional |  Major | . | Tsz-wo Sze | Attila Doroszlai |
| [HDDS-10241](https://issues.apache.org/jira/browse/HDDS-10241) | Improve the response for the Deleted Directories Insight Endpoint. |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-10269](https://issues.apache.org/jira/browse/HDDS-10269) | Remove duplicate addCacheEntry in OMDirectoryCreateRequest#getAllParentInfo |  Minor | OFS, OM | Ivan Andika | Ivan Andika |
| [HDDS-9843](https://issues.apache.org/jira/browse/HDDS-9843) | Ozone client high memory (heap) utilization |  Major | Ozone Client, S3, s3gateway | Duong | Duong |
| [HDDS-10301](https://issues.apache.org/jira/browse/HDDS-10301) | Recon - Fold the pipeline info for a DN on Datanode page. |  Major | . | Devesh Kumar Singh | smita |
| [HDDS-10398](https://issues.apache.org/jira/browse/HDDS-10398) | Remove deleted\_blocks table in container schema V2 and V3 definition |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10397](https://issues.apache.org/jira/browse/HDDS-10397) | Restrict legacy bucket directory deletion through sh command |  Major | Ozone CLI | Ashish Kumar | Ashish Kumar |
| [HDDS-10293](https://issues.apache.org/jira/browse/HDDS-10293) | IllegalArgumentException: containerSize Negative |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-10404](https://issues.apache.org/jira/browse/HDDS-10404) | Ozone admin reconfig command fails with security enabled |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10428](https://issues.apache.org/jira/browse/HDDS-10428) | OzoneClientConfig#validate doesn't get called |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10432](https://issues.apache.org/jira/browse/HDDS-10432) | Hadoop FS client write(byte[], int, int) is slow in streaming |  Major | . | Duong | Duong |
| [HDDS-10425](https://issues.apache.org/jira/browse/HDDS-10425) | Increase OM transaction index for non-Ratis based on existing Ratis transactionInfoTable |  Major | OM | Hongbing Wang | Hongbing Wang |
| [HDDS-10144](https://issues.apache.org/jira/browse/HDDS-10144) | Zero-Copy in replication |  Major | Ozone Datanode | GuoHao | GuoHao |
| [HDDS-10019](https://issues.apache.org/jira/browse/HDDS-10019) | Simplify updateLastAppliedIndex in OzoneManagerStateMachine |  Major | OM HA | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10427](https://issues.apache.org/jira/browse/HDDS-10427) | Read retry don't have wait based on retry policy |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-10480](https://issues.apache.org/jira/browse/HDDS-10480) | Avoid proto2 ByteString.toByteArray() calls |  Major | freon, Ozone Client, SCM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10492](https://issues.apache.org/jira/browse/HDDS-10492) | [Doc] Update zh translation to Recon Architecture |  Minor | Ozone Recon | Conway Zhang | Conway Zhang |
| [HDDS-10516](https://issues.apache.org/jira/browse/HDDS-10516) | Add metrics for chunk read from internal ratis |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-7364](https://issues.apache.org/jira/browse/HDDS-7364) | Improved container scanning |  Major | . | Ethan Rose | Ethan Rose |
| [HDDS-10551](https://issues.apache.org/jira/browse/HDDS-10551) | Improve HTTPFS Documentation for Iterative Liststatus Functionality |  Major | documentation | Pratyush Bhatt | Pratyush Bhatt |
| [HDDS-10625](https://issues.apache.org/jira/browse/HDDS-10625) | Remove unused netty-related config options from SCM |  Major | . | Maksim Myskov | Maksim Myskov |
| [HDDS-10690](https://issues.apache.org/jira/browse/HDDS-10690) | SCMStateMachine Override LeaderEventApi.notifyLeaderReady |  Major | SCM | Janus Chow | Janus Chow |
| [HDDS-10605](https://issues.apache.org/jira/browse/HDDS-10605) | Add a configuration option for compliance mode |  Major | . | István Fajth | Szabolcs Gál |
| [HDDS-10705](https://issues.apache.org/jira/browse/HDDS-10705) | Avoid persist duplicate DeleteBlockCommands on DN |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10761](https://issues.apache.org/jira/browse/HDDS-10761) | Add raft close threshold config to OM RaftProperties |  Major | OM | Hongbing Wang | Hongbing Wang |
| [HDDS-10773](https://issues.apache.org/jira/browse/HDDS-10773) | Simplify OM RaftProperties formatting |  Minor | OM | Hongbing Wang | Hongbing Wang |
| [HDDS-10770](https://issues.apache.org/jira/browse/HDDS-10770) | [Hsync] Allow overwrite hsynced file |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10702](https://issues.apache.org/jira/browse/HDDS-10702) | Ozone Recon - Improve Recon startup failure handling and make it more resilient |  Major | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10845](https://issues.apache.org/jira/browse/HDDS-10845) | BaseFreonGenerator allows an empty prefix |  Major | freon | Hongbing Wang | Hongbing Wang |
| [HDDS-10514](https://issues.apache.org/jira/browse/HDDS-10514) | Recon - Provide DN decommissioning detailed status and info inline with current CLI command output |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10898](https://issues.apache.org/jira/browse/HDDS-10898) | Validate OZONE\_CONF\_DIR by presence of ozone-site.xml |  Major | . | Vyacheslav Tutrinov | Vyacheslav Tutrinov |
| [HDDS-10867](https://issues.apache.org/jira/browse/HDDS-10867) | Clean Up Unnecessary Logs in Recon |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-10602](https://issues.apache.org/jira/browse/HDDS-10602) | Configurable whitelists for cryptography parameters |  Major | . | István Fajth |  |
| [HDDS-10967](https://issues.apache.org/jira/browse/HDDS-10967) | Do Not Depend on Contiguous IDs for Proto Enum Initialization |  Major | . | ChenXi | ChenXi |
| [HDDS-10999](https://issues.apache.org/jira/browse/HDDS-10999) | Remove dependency on ratis-server from Ozone Client |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10880](https://issues.apache.org/jira/browse/HDDS-10880) | Duplicate Pipeline ID Detected in ReconContainerManager |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-2887](https://issues.apache.org/jira/browse/HDDS-2887) | Add config to tune replication level of watch requests in Ozone client |  Major | Ozone Client | Shashikant Banerjee | Sammi Chen |
| [HDDS-11025](https://issues.apache.org/jira/browse/HDDS-11025) | Adjust hadoop-hdds/docs/content/start/OnPrem.zh.md format. |  Minor | documentation | StarBoy1005 | StarBoy1005 |
| [HDDS-11059](https://issues.apache.org/jira/browse/HDDS-11059) | Reduce OM DEBUG message |  Major | OM | Tsz-wo Sze | Sarveksha Yeshavantha Raju |
| [HDDS-10604](https://issues.apache.org/jira/browse/HDDS-10604) | Whitelist based compliance check for crypto related configuration options |  Major | . | István Fajth | Zita Dombi |
| [HDDS-10844](https://issues.apache.org/jira/browse/HDDS-10844) | Clarify snapshot create error message |  Minor | . | Wei-Chiu Chuang | Will Xiao |
| [HDDS-11083](https://issues.apache.org/jira/browse/HDDS-11083) | Avoid duplicate creation of RunningDatanodeState |  Major | DN | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11232](https://issues.apache.org/jira/browse/HDDS-11232) | Spare InfoBucket RPC call for the FileSystem#getFileStatus calls for the general case |  Major | . | István Fajth | István Fajth |
| [HDDS-11238](https://issues.apache.org/jira/browse/HDDS-11238) | Converge redundant getBucket calls for FileSystem client delete |  Major | . | Tanvi Penumudy | Tanvi Penumudy |
| [HDDS-11231](https://issues.apache.org/jira/browse/HDDS-11231) | Ozone Recon - Make Recon restart more resilient and handle restart or start failures. |  Major | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10749](https://issues.apache.org/jira/browse/HDDS-10749) | Shutdown datanode when RatisServer is down |  Major | Ozone Datanode | Sammi Chen | Sammi Chen |
| [HDDS-11306](https://issues.apache.org/jira/browse/HDDS-11306) | OM support system audit log |  Major | . | Sumit Agrawal | Sumit Agrawal |
| [HDDS-11302](https://issues.apache.org/jira/browse/HDDS-11302) | Ozone wrapper configurations to increase ipc.server.read.threadpool.size for SCM and Datanode |  Major | Ozone Datanode, SCM | Tanvi Penumudy | Tanvi Penumudy |
| [HDDS-9941](https://issues.apache.org/jira/browse/HDDS-9941) | Do not use heap buffer in KeyValueContainerCheck.verifyChecksum |  Major | Ozone Datanode | Tsz-wo Sze | Chung En Lee |
| [HDDS-11319](https://issues.apache.org/jira/browse/HDDS-11319) | Reduce XceiverClientRatis info log to debug |  Trivial | . | Wei-Chiu Chuang | Ren Koike |
| [HDDS-11310](https://issues.apache.org/jira/browse/HDDS-11310) | Remove EndpointStateMachine.EndPointStates.value |  Minor | common | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-11246](https://issues.apache.org/jira/browse/HDDS-11246) | [Recon] Use optional chaining instead of explicit undefined check for Objects in Container and Pipeline Module |  Major | . | smita | smita |
| [HDDS-11340](https://issues.apache.org/jira/browse/HDDS-11340) | Avoid extra PubBlock call when a full block is closed |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-11331](https://issues.apache.org/jira/browse/HDDS-11331) | Fix Datanode unable to report for a long time |  Major | DN | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11227](https://issues.apache.org/jira/browse/HDDS-11227) | Use OM's KMS from client side when connecting to a cluster and dealing with encrypted data |  Major | . | István Fajth | Saketa Chalamchala |
| [HDDS-11081](https://issues.apache.org/jira/browse/HDDS-11081) | Use thread-local instance of FileSystem in Freon tests |  Major | . | Ivan Andika | Ivan Andika |
| [HDDS-11229](https://issues.apache.org/jira/browse/HDDS-11229) | Recon Code Optimization for use of Optional Chaining Insight Module. |  Major | . | smita | smita |
| [HDDS-11381](https://issues.apache.org/jira/browse/HDDS-11381) | Adding logging to print the sorted datanodes list for topology aware read |  Minor | . | Varsha Ravi | Varsha Ravi |
| [HDDS-11304](https://issues.apache.org/jira/browse/HDDS-11304) | Make up for the missing functionality in CommandDispatcher |  Major | DN | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11401](https://issues.apache.org/jira/browse/HDDS-11401) | Code cleanup in DatanodeStateMachine |  Minor | DN | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11145](https://issues.apache.org/jira/browse/HDDS-11145) | ozone admin om cancelprepare --service-id improvement |  Major | Ozone CLI | Pratyush Bhatt | Pratyush Bhatt |
| [HDDS-10488](https://issues.apache.org/jira/browse/HDDS-10488) | Datanode OOM due to run out of mmap handler |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-11357](https://issues.apache.org/jira/browse/HDDS-11357) | Datanode Usageinfo Support Display Pipelines Count. |  Major | Ozone CLI, Ozone Datanode | Shilun Fan | Shilun Fan |
| [HDDS-11376](https://issues.apache.org/jira/browse/HDDS-11376) | Improve ReplicationSupervisor to record replication metrics |  Major | DN | JiangHua Zhu | JiangHua Zhu |
| [HDDS-10984](https://issues.apache.org/jira/browse/HDDS-10984) | Tool to restore SCM certificates from RocksDB. |  Major | SCM HA, Tools | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-11419](https://issues.apache.org/jira/browse/HDDS-11419) | Error message if checkpoint directory was not existed |  Minor | . | Chung En Lee | Abhishek Pal |
| [HDDS-11464](https://issues.apache.org/jira/browse/HDDS-11464) | Removed unused constants from OzoneConsts |  Minor | common | weiming | weiming |
| [HDDS-11477](https://issues.apache.org/jira/browse/HDDS-11477) | Add configuration description for datanode docs |  Trivial | documentation | Conway Zhang | Conway Zhang |
| [HDDS-11501](https://issues.apache.org/jira/browse/HDDS-11501) | Improve logging in XceiverServerRatis |  Minor | DN | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11444](https://issues.apache.org/jira/browse/HDDS-11444) | Make Datanode Command metrics consistent across all commands |  Major | Ozone Datanode | Stephen O'Donnell | JiangHua Zhu |
| [HDDS-11554](https://issues.apache.org/jira/browse/HDDS-11554) | OMDBDefinition should be singleton |  Major | OM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-11556](https://issues.apache.org/jira/browse/HDDS-11556) | Add a getTypeClass method to Codec |  Major | db | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-11519](https://issues.apache.org/jira/browse/HDDS-11519) | Clean up unused lines in BlockOutputStream |  Minor | . | Chung En Lee | JiaSheng Chen |
| [HDDS-11548](https://issues.apache.org/jira/browse/HDDS-11548) | Add some logging to the StateMachine |  Minor | common | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11486](https://issues.apache.org/jira/browse/HDDS-11486) | SnapshotDiffManager prints ERROR for NativeLibraryNotLoadedException |  Major | Snapshot | Tsz-wo Sze | Chung En Lee |
| [HDDS-11581](https://issues.apache.org/jira/browse/HDDS-11581) | Remove duplicate ContainerStateMachine#RaftGroupId |  Major | DN | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11608](https://issues.apache.org/jira/browse/HDDS-11608) | Client should not retry invalid protobuf request |  Major | Ozone Client | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11649](https://issues.apache.org/jira/browse/HDDS-11649) | Recon ListKeys API: Simplify filter predicates |  Major | Ozone Recon | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-11660](https://issues.apache.org/jira/browse/HDDS-11660) | Recon List Key API: Reduce object creation and buffering memory |  Major | Ozone Recon | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-11668](https://issues.apache.org/jira/browse/HDDS-11668) | Recon List Keys API: Reuse key prefix if parentID is the same |  Major | Ozone Recon | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-10133](https://issues.apache.org/jira/browse/HDDS-10133) | Add a method to check key name in OMKeyRequest |  Minor | OM | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11615](https://issues.apache.org/jira/browse/HDDS-11615) | Add Upgrade Action for Initial Schema Constraints for Unhealthy Container Table in Recon |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11644](https://issues.apache.org/jira/browse/HDDS-11644) | Close OMLayoutVersionManager |  Minor | OM | Ivan Andika | Ivan Andika |
| [HDDS-11769](https://issues.apache.org/jira/browse/HDDS-11769) | Add tools folder into ozone src package |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-11243](https://issues.apache.org/jira/browse/HDDS-11243) | SCM SafeModeRule Support EC |  Major | SCM | Shilun Fan | Shilun Fan |
| [HDDS-11367](https://issues.apache.org/jira/browse/HDDS-11367) | Improve container balancer status info cli command output |  Major | Balancer | Vyacheslav Tutrinov | Alex Juncevich |
| [HDDS-11907](https://issues.apache.org/jira/browse/HDDS-11907) | OzoneSecretKey does not need to implement Writable |  Minor | . | Wei-Chiu Chuang | Chia-Chuan Yu |
| [HDDS-11753](https://issues.apache.org/jira/browse/HDDS-11753) | Deprecate file per chunk layout from datanode code |  Blocker | Ozone Datanode | Ethan Rose | Wei-Chiu Chuang |
| [HDDS-11975](https://issues.apache.org/jira/browse/HDDS-11975) | refactor request validateAndUpdateCache to pass execution context |  Major | Ozone Manager | Sumit Agrawal | Sumit Agrawal |
| [HDDS-12036](https://issues.apache.org/jira/browse/HDDS-12036) | [UI] Add indicators for high disk usage |  Minor | Ozone Recon | Elavarasan Kathirvel | Abhishek Pal |
| [HDDS-12043](https://issues.apache.org/jira/browse/HDDS-12043) | [UI] Currently there is no indicator to show that the first column in tables is not selectable |  Major | . | Omkar Dhayagude | Abhishek Pal |
| [HDDS-12093](https://issues.apache.org/jira/browse/HDDS-12093) | Exclude generated code when verifying import restrictions |  Minor | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12227](https://issues.apache.org/jira/browse/HDDS-12227) | Avoid Clutter in Recon Logs by Reducing Log Level of ContainerSizeCountTask |  Critical | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11953](https://issues.apache.org/jira/browse/HDDS-11953) | Ozone Recon - Improve Recon OM sync process based on continuous pull of OM data |  Major | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10794](https://issues.apache.org/jira/browse/HDDS-10794) | Update docker compose user doc |  Major | . | Wei-Chiu Chuang | Gargi Jaiswal |
| [HDDS-12234](https://issues.apache.org/jira/browse/HDDS-12234) | Improve error "No leader found" |  Minor | . | Wei-Chiu Chuang | Sreeja |
| [HDDS-12330](https://issues.apache.org/jira/browse/HDDS-12330) | Add Comma Formatting to Metrics on Recon Overview Page |  Major | Ozone Recon | Arafat Khan | Abhishek Pal |
| [HDDS-12367](https://issues.apache.org/jira/browse/HDDS-12367) | Change ignorePipeline log level to DEBUG in OmKeyInfo |  Major | . | Hemant Kumar | Chia-Chuan Yu |
| [HDDS-12288](https://issues.apache.org/jira/browse/HDDS-12288) | Improve Bootstrap Logging |  Minor | . | Venkat Sambath | Gargi Jaiswal |
| [HDDS-12410](https://issues.apache.org/jira/browse/HDDS-12410) | Add detailed blocks for AllocateBlock's audit log |  Major | . | Janus Chow | Janus Chow |
| [HDDS-12204](https://issues.apache.org/jira/browse/HDDS-12204) | Improve failover logging |  Major | . | Wei-Chiu Chuang | Chia-Chuan Yu |
| [HDDS-12450](https://issues.apache.org/jira/browse/HDDS-12450) | Enable SimplifiableTestAssertion check in PMD |  Major | . | Maksim Myskov | Maksim Myskov |
| [HDDS-12532](https://issues.apache.org/jira/browse/HDDS-12532) | Support only Enum in ContainerAttribute |  Major | SCM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-12548](https://issues.apache.org/jira/browse/HDDS-12548) | Show safemode rules status irrespective of whether SCM is in safe mode in verbose mode. |  Major | SCM | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-12572](https://issues.apache.org/jira/browse/HDDS-12572) | Remove the ContainerID parameter when it has ContainerReplica |  Major | SCM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-12590](https://issues.apache.org/jira/browse/HDDS-12590) | Use db name as the threadNamePrefix |  Major | db | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-12591](https://issues.apache.org/jira/browse/HDDS-12591) | Include ContainerInfo in ContainerAttribute |  Major | SCM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-12582](https://issues.apache.org/jira/browse/HDDS-12582) | TypedTable support custom ValueCodec |  Major | Ozone Manager | Sumit Agrawal | Sumit Agrawal |
| [HDDS-11754](https://issues.apache.org/jira/browse/HDDS-11754) | Drop support for non-Ratis OM and SCM |  Blocker | . | Ethan Rose |  |


### BUG FIXES:

| JIRA | Summary | Priority | Component | Reporter | Contributor |
|:---- |:---- | :--- |:---- |:---- |:---- |
| [HDDS-9846](https://issues.apache.org/jira/browse/HDDS-9846) | Datanode should not persist cluster ID to global version file until loading all volumes |  Major | . | Ethan Rose | Ashish Kumar |
| [HDDS-9943](https://issues.apache.org/jira/browse/HDDS-9943) | TokenRenewer should close OzoneClient after use |  Major | Ozone Filesystem | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9423](https://issues.apache.org/jira/browse/HDDS-9423) | [snapshot] Throw appropriate error messages when deleting a file in .snapshot path |  Major | Snapshot | Jyotirmoy Sinha | Hemant Kumar |
| [HDDS-9916](https://issues.apache.org/jira/browse/HDDS-9916) | Useless execution of version-info in rocksdb-checkpoint-differ |  Trivial | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9322](https://issues.apache.org/jira/browse/HDDS-9322) | Remove duplicate containers when loading volumes on a datanode |  Major | . | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-9950](https://issues.apache.org/jira/browse/HDDS-9950) | 'ozone fs -ls' on volume shows the volume owner as the bucket owner |  Major | . | Christos Bisias | Christos Bisias |
| [HDDS-9368](https://issues.apache.org/jira/browse/HDDS-9368) | run.sh requires bash 4.2+ |  Minor | docker-compose | Mohamed Ansari | Mohamed Ansari |
| [HDDS-9582](https://issues.apache.org/jira/browse/HDDS-9582) | OM transport factory configuration mismatch |  Critical | . | Attila Doroszlai | Duong |
| [HDDS-9984](https://issues.apache.org/jira/browse/HDDS-9984) | RatisSnapshotInfo is synchronized incorrectly |  Major | OM, SCM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-9876](https://issues.apache.org/jira/browse/HDDS-9876) | OzoneManagerStateMachine should add response to OzoneManagerDoubleBuffer for every write request |  Blocker | OM | Sammi Chen | Sammi Chen |
| [HDDS-10023](https://issues.apache.org/jira/browse/HDDS-10023) | testLockViolations should fail if it does not catch RuntimeException |  Minor | test | TaiJuWu | TaiJuWu |
| [HDDS-9962](https://issues.apache.org/jira/browse/HDDS-9962) | Intermittent timeout in TestBlockDeletion.testBlockDeletion |  Critical | SCM | Attila Doroszlai | ChenXi |
| [HDDS-10027](https://issues.apache.org/jira/browse/HDDS-10027) | NPE in VolumeInfoMetrics.getCommitted() |  Major | Ozone Datanode | Tsz-wo Sze | Attila Doroszlai |
| [HDDS-10007](https://issues.apache.org/jira/browse/HDDS-10007) | Rename ManagedSstFileReader in rocksdb-checkpoint-differ |  Major | Snapshot | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10002](https://issues.apache.org/jira/browse/HDDS-10002) | TestRocksDBCheckpointDiffer leaves artifacts in project root dir |  Minor | test | Attila Doroszlai | TaiJuWu |
| [HDDS-9976](https://issues.apache.org/jira/browse/HDDS-9976) | Ozone StateContext Memory leak for DeleteBlocksCommand when queue is full |  Major | . | ChenXi | ChenXi |
| [HDDS-9683](https://issues.apache.org/jira/browse/HDDS-9683) | Containers belonging to decommissioning or decommissioned nodes, are counted as mis-replicated |  Major | . | Christos Bisias | Christos Bisias |
| [HDDS-10001](https://issues.apache.org/jira/browse/HDDS-10001) | Options not closed properly in rocksdb-checkpoint-differ |  Major | Snapshot | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10056](https://issues.apache.org/jira/browse/HDDS-10056) | Silent failure in unit check |  Critical | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9970](https://issues.apache.org/jira/browse/HDDS-9970) | Recon -  Fix failure of TestReconWithOzoneManager test case testOmDBSyncWithSeqNumberMismatch |  Minor | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-9898](https://issues.apache.org/jira/browse/HDDS-9898) | Recon SCM doesn't store EC containers |  Major | . | Christos Bisias | Arafat Khan |
| [HDDS-8982](https://issues.apache.org/jira/browse/HDDS-8982) | Prevent infinite loop in getContainer which causes log flooded by WritableRatisContainerProvider if pipeline's nodes are not found |  Major | SCM | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10060](https://issues.apache.org/jira/browse/HDDS-10060) | Restrict awaitility to test scope |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10061](https://issues.apache.org/jira/browse/HDDS-10061) | NPE when container is loaded with missing container DB |  Major | . | Sumit Agrawal | Sumit Agrawal |
| [HDDS-9927](https://issues.apache.org/jira/browse/HDDS-9927) | Ozone List keys CLI should co-ordinate between max limit and listCacheSize |  Major | . | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-9848](https://issues.apache.org/jira/browse/HDDS-9848) | Pipeline.nodesInOrder should not be ThreadLocal |  Major | SCM | Tsz-wo Sze | Sumit Agrawal |
| [HDDS-9701](https://issues.apache.org/jira/browse/HDDS-9701) | Shareable /tmp dir doesn't work as sticky-bit with Ranger |  Major | . | Christos Bisias | Christos Bisias |
| [HDDS-9527](https://issues.apache.org/jira/browse/HDDS-9527) | Race condition in RocksDatabase |  Major | db | Tsz-wo Sze | Sumit Agrawal |
| [HDDS-10103](https://issues.apache.org/jira/browse/HDDS-10103) | Snapshot read calls are failing due to SnapshotCache's inconsistency |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-9819](https://issues.apache.org/jira/browse/HDDS-9819) | Recon - Potential memory overflow in Container Health Task |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10117](https://issues.apache.org/jira/browse/HDDS-10117) | ChunkKeyHandler does not close XceiverClient in case of exception |  Minor | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10134](https://issues.apache.org/jira/browse/HDDS-10134) | Avoid false positive ManagedObject leak report |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10138](https://issues.apache.org/jira/browse/HDDS-10138) | NPE for SstFilteringService in OMDBCheckpointServlet.Lock |  Major | OM | Ivan Andika | Ivan Andika |
| [HDDS-9944](https://issues.apache.org/jira/browse/HDDS-9944) | NSSummary commands should close OzoneClient |  Major | Ozone CLI | Attila Doroszlai | Devesh Kumar Singh |
| [HDDS-10014](https://issues.apache.org/jira/browse/HDDS-10014) | Internal Server Error on attempt to generate S3 secret via HTTP |  Major | . | Maksim Myskov | Maksim Myskov |
| [HDDS-10178](https://issues.apache.org/jira/browse/HDDS-10178) | Shaded Jar build failure in case insensitive filesystem |  Major | . | Hemant Kumar | Swaminathan Balachandran |
| [HDDS-10184](https://issues.apache.org/jira/browse/HDDS-10184) | Fix ManagedStatistics not closed properly |  Critical | OM, Ozone Datanode | Hongbing Wang | Hongbing Wang |
| [HDDS-10200](https://issues.apache.org/jira/browse/HDDS-10200) | OM may terminate due to NPE in S3SecretValue proto conversion |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10202](https://issues.apache.org/jira/browse/HDDS-10202) | OmMetadataManagerImpl creates new S3Batcher for each operation |  Major | Ozone Manager | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10191](https://issues.apache.org/jira/browse/HDDS-10191) | Fix some mismatches in LICENSE |  Minor | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10204](https://issues.apache.org/jira/browse/HDDS-10204) | TypedTable.putWithBatch may leak if conversion of value throws |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9645](https://issues.apache.org/jira/browse/HDDS-9645) | Recon doesn't exclude out-of-service nodes when checking for healthy containers |  Major | Ozone Recon | Christos Bisias | Christos Bisias |
| [HDDS-10231](https://issues.apache.org/jira/browse/HDDS-10231) | ContainerStateManager should not finalize the OPEN containers without a Pipeline |  Major | SCM | Pratyush Bhatt | Nandakumar |
| [HDDS-9658](https://issues.apache.org/jira/browse/HDDS-9658) | EC: Recovering container cleanup at DN start is not happening due to NPE. |  Major | . | Uma Maheswara Rao G | Sumit Agrawal |
| [HDDS-9065](https://issues.apache.org/jira/browse/HDDS-9065) | [FSO]ListKeys: Incorrect result when keyPrefix matching multiple exist keys |  Major | . | Hongbing Wang | Sadanand Shenoy |
| [HDDS-10148](https://issues.apache.org/jira/browse/HDDS-10148) | TestOmSnapshotFsoWithNativeLib should be tagged as native test |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10272](https://issues.apache.org/jira/browse/HDDS-10272) | Container Report admin command displays incorrect value immediately after SCM restart |  Major | SCM | Nandakumar | Stephen O'Donnell |
| [HDDS-10294](https://issues.apache.org/jira/browse/HDDS-10294) | Actual client configuration ignored in ECReconstructionCoordinator |  Major | Ozone Datanode | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10229](https://issues.apache.org/jira/browse/HDDS-10229) | Fixes for Dashboards |  Major | Ozone Datanode, Ozone Manager, Ozone Recon, s3gateway | Ritesh Shukla | Ritesh Shukla |
| [HDDS-10296](https://issues.apache.org/jira/browse/HDDS-10296) | orphan blocks during overwrite of key |  Major | Ozone Manager | Sumit Agrawal | Sumit Agrawal |
| [HDDS-10328](https://issues.apache.org/jira/browse/HDDS-10328) | Support cross realm Kerberos out of box |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10333](https://issues.apache.org/jira/browse/HDDS-10333) | RocksDB logger not closed |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10319](https://issues.apache.org/jira/browse/HDDS-10319) | Key path normalization in listKeys API should be done based on bucket layout with fsPath config |  Major | Ozone Manager | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10256](https://issues.apache.org/jira/browse/HDDS-10256) | Block allocation should retry if SCM is in safe mode |  Major | . | Pratyush Bhatt | Ashish Kumar |
| [HDDS-9608](https://issues.apache.org/jira/browse/HDDS-9608) | [MasterNode decommissioning] InvalidStateTransitionException after recommissioning SCM |  Major | SCM | Pratyush Bhatt | Nandakumar |
| [HDDS-10359](https://issues.apache.org/jira/browse/HDDS-10359) | Delete volume recursively shows exception even though it is deleted |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-10369](https://issues.apache.org/jira/browse/HDDS-10369) | Set Times API doesn't work with linked buckets. |  Major | Ozone Filesystem | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-10288](https://issues.apache.org/jira/browse/HDDS-10288) | Checksum to support direct buffers |  Major | Ozone Client | Duong | Duong |
| [HDDS-10385](https://issues.apache.org/jira/browse/HDDS-10385) | Memory leak for thread local usages in OMClientRequest |  Critical | Ozone Manager | Sumit Agrawal | Sumit Agrawal |
| [HDDS-10395](https://issues.apache.org/jira/browse/HDDS-10395) | Fix eTag compatibility issues during MPU |  Major | OM, Ozone Manager, S3 | Ivan Andika | Ivan Andika |
| [HDDS-10363](https://issues.apache.org/jira/browse/HDDS-10363) | HDDS-9388 broke encryption |  Blocker | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10405](https://issues.apache.org/jira/browse/HDDS-10405) | ozone admin has hard-coded info loglevel |  Major | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10399](https://issues.apache.org/jira/browse/HDDS-10399) | Error when listing OBS bucket |  Major | Ozone CLI | Saketa Chalamchala | Saketa Chalamchala |
| [HDDS-10365](https://issues.apache.org/jira/browse/HDDS-10365) | Wrong sub-command description for \`ozone getconf ozonemanagers\` |  Trivial | . | Tejaskriya Madhan | David |
| [HDDS-10423](https://issues.apache.org/jira/browse/HDDS-10423) | Datanode fails to start with invalid checksum size setting |  Major | common | Sammi Chen | Attila Doroszlai |
| [HDDS-10360](https://issues.apache.org/jira/browse/HDDS-10360) | [ERROR] org.apache.hadoop.ozone.om.TestKeyManagerImpl. testListStatus: KEY\_NOT\_FOUND |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-10327](https://issues.apache.org/jira/browse/HDDS-10327) | S3G does not work in a single-node deployment |  Major | . | Arpit Agarwal | Tejaskriya Madhan |
| [HDDS-10413](https://issues.apache.org/jira/browse/HDDS-10413) | Recon - UnsupportedOperationException while merging Incremental Container Reports |  Major | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10149](https://issues.apache.org/jira/browse/HDDS-10149) | Bad file descriptor in TestOmSnapshotFsoWithNativeLib.testSnapshotCompactionDag |  Critical | Snapshot | Attila Doroszlai | Swaminathan Balachandran |
| [HDDS-10370](https://issues.apache.org/jira/browse/HDDS-10370) | Recon - Handle the pre-existing missing empty containers in clusters |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-8683](https://issues.apache.org/jira/browse/HDDS-8683) | Container balancer thread interrupt may not work |  Minor | Balancer | Attila Doroszlai | Tejaskriya Madhan |
| [HDDS-9235](https://issues.apache.org/jira/browse/HDDS-9235) | ReplicationManager metrics not collected after restart |  Major | SCM | Attila Doroszlai | Aswin Shakil |
| [HDDS-10367](https://issues.apache.org/jira/browse/HDDS-10367) | NullPointerException on OzoneManagerProtocolClientSideTranslatorPB.listStatusLight |  Critical | S3 | Ivan Zlenko | Ivan Zlenko |
| [HDDS-10324](https://issues.apache.org/jira/browse/HDDS-10324) | Metadata are not updated when keys are overwritten |  Blocker | S3 | Duong | Arafat Khan |
| [HDDS-10433](https://issues.apache.org/jira/browse/HDDS-10433) | Local prometheus setup does not pick up Datanode Prometheus endpoint |  Major | Ozone Dashboards | Ritesh Shukla | Ritesh Shukla |
| [HDDS-10282](https://issues.apache.org/jira/browse/HDDS-10282) | Fix pagination on the OM DB Insights page in Recon |  Major | Ozone Recon | Zita Dombi | Zita Dombi |
| [HDDS-10430](https://issues.apache.org/jira/browse/HDDS-10430) | Race condition around Pipeline#nodesInOrder |  Major | . | Siyao Meng | Attila Doroszlai |
| [HDDS-10472](https://issues.apache.org/jira/browse/HDDS-10472) | Audit log should include EC replication config |  Major | Ozone Manager | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10482](https://issues.apache.org/jira/browse/HDDS-10482) | OMRequestTestUtils.createOmKeyInfo should set key modification time |  Major | test | Siyao Meng | Siyao Meng |
| [HDDS-10521](https://issues.apache.org/jira/browse/HDDS-10521) | ETag field should not be returned during GetObject if the key does not contain ETag field |  Major | S3, s3gateway | Ivan Andika | Ivan Andika |
| [HDDS-10549](https://issues.apache.org/jira/browse/HDDS-10549) | Spelling mistake in error message thrown on Freon error |  Trivial | freon | Jyotirmoy Sinha | Jyotirmoy Sinha |
| [HDDS-10562](https://issues.apache.org/jira/browse/HDDS-10562) | Ozone fs -ls reached endless loop |  Major | . | Janus Chow | Janus Chow |
| [HDDS-10564](https://issues.apache.org/jira/browse/HDDS-10564) | Make Outputstream writeExecutor daemon threads |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10581](https://issues.apache.org/jira/browse/HDDS-10581) | NPE in SummarySubCommand & DiskUsageSubCommand |  Minor | Ozone CLI | Attila Doroszlai | Arafat Khan |
| [HDDS-10583](https://issues.apache.org/jira/browse/HDDS-10583) | Thread name prefix in ReplicationSupervisor is null |  Minor | Ozone Datanode | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10547](https://issues.apache.org/jira/browse/HDDS-10547) | Failure to write a file if checksum validation is on |  Critical | Ozone Datanode | Kirill Sizov | Kirill Sizov |
| [HDDS-10587](https://issues.apache.org/jira/browse/HDDS-10587) | Reset the thread-local MessageDigest instance during exception |  Major | S3, s3gateway | Ivan Andika | Ivan Andika |
| [HDDS-10594](https://issues.apache.org/jira/browse/HDDS-10594) | File encryption info is not properly set when overwrite a file |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10613](https://issues.apache.org/jira/browse/HDDS-10613) | typo error: misspelled to depepnds in documentation of Snapshots |  Minor | documentation | Raju Balpande | Raju Balpande |
| [HDDS-10636](https://issues.apache.org/jira/browse/HDDS-10636) | Ozone Recon - Filter EMPTY MISSING Containers in UnHealthy State Containers API |  Major | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10230](https://issues.apache.org/jira/browse/HDDS-10230) | Preventing V3 Schema from Creating Container DBs in the Wrong Location |  Major | Ozone Datanode | ChenXi | ChenXi |
| [HDDS-10483](https://issues.apache.org/jira/browse/HDDS-10483) | Container Balancer should only move containers with size greater than 0 bytes |  Critical | SCM | Siddhant Sangwan | Sarveksha Yeshavantha Raju |
| [HDDS-10681](https://issues.apache.org/jira/browse/HDDS-10681) | EC Reconstruction does not issue put block to data index if it is unused |  Major | . | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-10682](https://issues.apache.org/jira/browse/HDDS-10682) | EC Reconstruction creates empty chunks at the end of blocks with partial stripes |  Major | . | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-10692](https://issues.apache.org/jira/browse/HDDS-10692) | ozone s3 getsecret prints some internal details |  Minor | s3gateway | Soumitra Sulav | Attila Doroszlai |
| [HDDS-10680](https://issues.apache.org/jira/browse/HDDS-10680) | Duplicate delete key blocks sent to SCM |  Critical | . | Sammi Chen | Sammi Chen |
| [HDDS-10704](https://issues.apache.org/jira/browse/HDDS-10704) | Do not fail read of EC block if the last chunk is empty |  Major | . | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-10643](https://issues.apache.org/jira/browse/HDDS-10643) | SCM fails to stop gracefully |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-10652](https://issues.apache.org/jira/browse/HDDS-10652) | [Upgrade][EC] Reconstruction failing with "java.io.IOException: None of the block data have checksum" |  Major | EC, ECOfflineRecovery | Pratyush Bhatt | Siddhant Sangwan |
| [HDDS-10614](https://issues.apache.org/jira/browse/HDDS-10614) | Recon fails to start with used space cannot be negative |  Critical | Ozone Recon | Kirill Sizov | Arafat Khan |
| [HDDS-10717](https://issues.apache.org/jira/browse/HDDS-10717) | nodeFailureTimeoutMs should be initialized before syncTimeoutRetry |  Major | DN, Ozone Datanode | Ivan Andika | Ivan Andika |
| [HDDS-10719](https://issues.apache.org/jira/browse/HDDS-10719) | Empty ETag for key created outside of S3 |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10716](https://issues.apache.org/jira/browse/HDDS-10716) | Remove -skipTrash option from IOException message in recursive volume delete |  Minor | Ozone Filesystem | Ashish Kumar | Ashish Kumar |
| [HDDS-10735](https://issues.apache.org/jira/browse/HDDS-10735) | repeat-acceptance-test workflow always builds Ozone with the branch the workflow is run from |  Minor | CI | Ethan Rose | Ethan Rose |
| [HDDS-10753](https://issues.apache.org/jira/browse/HDDS-10753) | OmKeyInfo#acls and WithMetadata#metadata are not thread safe |  Major | OM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10409](https://issues.apache.org/jira/browse/HDDS-10409) | Decommissioning of datanodes -  Duplicate ozone nodes display as dead in Ozone Recon |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10784](https://issues.apache.org/jira/browse/HDDS-10784) | Multipart upload to encrypted bucket fails with ClassCastException |  Major | . | Hemant Kumar | Attila Doroszlai |
| [HDDS-10780](https://issues.apache.org/jira/browse/HDDS-10780) | NullPointerException in watchForCommit |  Major | Ozone Client | Duong | Duong |
| [HDDS-10798](https://issues.apache.org/jira/browse/HDDS-10798) | OMLeaderNotReadyException exception on switch leader |  Major | OM HA | Sumit Agrawal | Sumit Agrawal |
| [HDDS-10097](https://issues.apache.org/jira/browse/HDDS-10097) | Intermittent ManagedChannel not shutdown properly in TestWatchForCommit |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10803](https://issues.apache.org/jira/browse/HDDS-10803) | HttpServer fails to start with wildcard principal |  Major | Security | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10800](https://issues.apache.org/jira/browse/HDDS-10800) | Ozone follower SCM continuously logging "Replication Manager is not ready to run until 300000ms after safemode exit"" |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-10793](https://issues.apache.org/jira/browse/HDDS-10793) | HttpFS gateway should throw unsupported operation for some operations |  Major | . | Zita Dombi | Zita Dombi |
| [HDDS-10777](https://issues.apache.org/jira/browse/HDDS-10777) | S3 gateway error when parsing xml in concurrent execution |  Major | s3gateway | GuoHao | GuoHao |
| [HDDS-10608](https://issues.apache.org/jira/browse/HDDS-10608) | Recon can't get full key when using Recon API |  Blocker | Ozone Recon | Conway Zhang | Arafat Khan |
| [HDDS-10696](https://issues.apache.org/jira/browse/HDDS-10696) | Ozone integration test fails because of empty snapshot installation. |  Major | OM HA | Duong | Hemant Kumar |
| [HDDS-10781](https://issues.apache.org/jira/browse/HDDS-10781) | Do not use OFSPath in O3FS BasicOzoneClientAdapterImpl |  Major | . | Chung En Lee | Chung En Lee |
| [HDDS-10371](https://issues.apache.org/jira/browse/HDDS-10371) | NPE in OzoneAclUtils.isOwner |  Major | . | Soumitra Sulav | Attila Doroszlai |
| [HDDS-10861](https://issues.apache.org/jira/browse/HDDS-10861) | Ozone cli supports default ozone.om.service.id |  Major | Ozone CLI, Ozone Client | WangYuanben | WangYuanben |
| [HDDS-10875](https://issues.apache.org/jira/browse/HDDS-10875) | XceiverRatisServer#getRaftPeersInPipeline should be called before XceiverRatisServer#removeGroup |  Major | DN | Ivan Andika | Ivan Andika |
| [HDDS-10883](https://issues.apache.org/jira/browse/HDDS-10883) | Improve logging in Recon for finalising DN logic |  Major | Ozone Recon | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-10832](https://issues.apache.org/jira/browse/HDDS-10832) | Client should switch to streaming based on OpenKeySession replication |  Major | Ozone Client, s3gateway | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10919](https://issues.apache.org/jira/browse/HDDS-10919) | Change ozone.security.crypto.compliance.mode default value in ozone-default.xml |  Major | . | Zita Dombi | Zita Dombi |
| [HDDS-10918](https://issues.apache.org/jira/browse/HDDS-10918) | NPE in OM when OM leader transfers |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10937](https://issues.apache.org/jira/browse/HDDS-10937) | Ozone Recon - Handle startup failure and log reasons as error due to SCM non-HA scenario |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10973](https://issues.apache.org/jira/browse/HDDS-10973) | TestContainerStateManagerIntegration has assert Statement having misleading message |  Minor | test | Raju Balpande | Raju Balpande |
| [HDDS-9626](https://issues.apache.org/jira/browse/HDDS-9626) | [Recon] Disk Usage page with high number of key/bucket/volume |  Major | Ozone Recon | Pratyush Bhatt | smita |
| [HDDS-11005](https://issues.apache.org/jira/browse/HDDS-11005) | TestEndPoint#testRegisterRpcTimeout fails when run in itself |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-9644](https://issues.apache.org/jira/browse/HDDS-9644) | Ozone admin namespace CLI du command - printing incorrect validation error message |  Major | Ozone CLI, Ozone Recon | Devesh Kumar Singh | Saketa Chalamchala |
| [HDDS-10852](https://issues.apache.org/jira/browse/HDDS-10852) | Recon Heatmap - Not allowing user to select timerange if no data available |  Major | . | smita | smita |
| [HDDS-11032](https://issues.apache.org/jira/browse/HDDS-11032) | Decommissioned datanodes shows up again after removing in Recon Datanodes page |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10942](https://issues.apache.org/jira/browse/HDDS-10942) | OM decommission config support for default serviceID. |  Major | Ozone Manager | Sadanand Shenoy | Aryan Gupta |
| [HDDS-10855](https://issues.apache.org/jira/browse/HDDS-10855) | Handle Null ParentKeyInfo Error in Recon Namespace Summary Task |  Critical | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11044](https://issues.apache.org/jira/browse/HDDS-11044) | Recon Disk Usage  need to remove tool tip |  Major | . | smita | smita |
| [HDDS-11066](https://issues.apache.org/jira/browse/HDDS-11066) | Fix inaccurate \*.http.auth.type config descriptions in ozone-default.xml |  Major | documentation | Siyao Meng | Siyao Meng |
| [HDDS-10983](https://issues.apache.org/jira/browse/HDDS-10983) | EC Key read corruption when the replica index of container in DN mismatches |  Major | EC Client | Karn Kumar Singh | Swaminathan Balachandran |
| [HDDS-10864](https://issues.apache.org/jira/browse/HDDS-10864) | Recon Disk Usage If one volume is large it occupies almost all space of Pie Chart |  Major | . | smita | smita |
| [HDDS-10508](https://issues.apache.org/jira/browse/HDDS-10508) | OmUtils.getAllOMHAAddresses may throw NPE |  Major | common | Tsz-wo Sze | Chung En Lee |
| [HDDS-11095](https://issues.apache.org/jira/browse/HDDS-11095) | Generate fixed length string with Robot builtin |  Minor | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11045](https://issues.apache.org/jira/browse/HDDS-11045) | Recon Decommissioning Info API throws NPE |  Minor | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-11069](https://issues.apache.org/jira/browse/HDDS-11069) | Block location is missing in output of Ozone debug chunkinfo command for EC |  Major | Ozone CLI | Karn Kumar Singh | Sadanand Shenoy |
| [HDDS-11096](https://issues.apache.org/jira/browse/HDDS-11096) | Error creating s3 auth info for request with Authorization: Negotiate |  Major | s3gateway | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11124](https://issues.apache.org/jira/browse/HDDS-11124) | Snapshot create requests failing with OM failover error in a system with 30000 snapshots |  Major | OM, Snapshot | Jyotirmoy Sinha | Hemant Kumar |
| [HDDS-11169](https://issues.apache.org/jira/browse/HDDS-11169) | [Dependabot] Dependabot builds fail after upgrade to pnpm v8 |  Major | build, Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-10907](https://issues.apache.org/jira/browse/HDDS-10907) | DataNode StorageContainerMetrics numWriteChunk is counted multiple times |  Minor | . | Wei-Chiu Chuang | Chung En Lee |
| [HDDS-11191](https://issues.apache.org/jira/browse/HDDS-11191) | Add a config to set max\_open\_files for OM RocksDB. |  Major | OM | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-11150](https://issues.apache.org/jira/browse/HDDS-11150) | Recon Dashboard one api fails other api also fails because of promises |  Major | Ozone Recon | smita | Abhishek Pal |
| [HDDS-11187](https://issues.apache.org/jira/browse/HDDS-11187) | Fix Event Handling Corruption in OMDBUpdatesHandler to Prevent ClassCastException in Recon Server |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11215](https://issues.apache.org/jira/browse/HDDS-11215) | Quota count can go wrong when double buffer flush takes time |  Critical | . | Sumit Agrawal | Sumit Agrawal |
| [HDDS-11140](https://issues.apache.org/jira/browse/HDDS-11140) | Recon Disk Usage Metadata  Details are not working for du api |  Major | . | smita | smita |
| [HDDS-11223](https://issues.apache.org/jira/browse/HDDS-11223) | Datanode checksum validation in EC bucket does not work |  Major | . | Kirill Sizov | Kirill Sizov |
| [HDDS-11136](https://issues.apache.org/jira/browse/HDDS-11136) | Some containers affected by HDDS-8129 may still be in the DELETING state incorrectly |  Major | Ozone Datanode, SCM | Ethan Rose | Siddhant Sangwan |
| [HDDS-11023](https://issues.apache.org/jira/browse/HDDS-11023) | Recon Disk Usage null conditions not handled properly for null response |  Major | . | smita | smita |
| [HDDS-11221](https://issues.apache.org/jira/browse/HDDS-11221) | Resolve potential time discrepancy for expired multipart upload cleanup |  Major | Ozone Manager | Ivan Andika | Ivan Andika |
| [HDDS-11250](https://issues.apache.org/jira/browse/HDDS-11250) | Signal handling broken |  Critical | . | Hemant Kumar | Attila Doroszlai |
| [HDDS-11119](https://issues.apache.org/jira/browse/HDDS-11119) | Unnecessary UPDATE\_VOLUME audit entry for DELETE\_TENANT |  Major | Ozone Manager | Attila Doroszlai | Sumit Agrawal |
| [HDDS-11068](https://issues.apache.org/jira/browse/HDDS-11068) | OM down to Snapshot Chain Corruption |  Critical | Ozone Manager, Snapshot | Jyotirmoy Sinha | Swaminathan Balachandran |
| [HDDS-11201](https://issues.apache.org/jira/browse/HDDS-11201) | worker queue of FullTableCache cleanup consume much memory |  Major | Ozone Manager | Sumit Agrawal | Sumit Agrawal |
| [HDDS-11214](https://issues.apache.org/jira/browse/HDDS-11214) | LOG files for RocksDB ops should be cleaned more frequently for heavy load |  Major | Ozone Manager, Snapshot | Jyotirmoy Sinha | Hemant Kumar |
| [HDDS-11257](https://issues.apache.org/jira/browse/HDDS-11257) | Ozone write does not work when http proxy is set for the JVM. |  Major | . | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-11283](https://issues.apache.org/jira/browse/HDDS-11283) | Refactor KeyValueStreamDataChannel$Buffers$1.class to avoid spurious IDE build issues |  Major | build | Ritesh Shukla | Ritesh Shukla |
| [HDDS-11267](https://issues.apache.org/jira/browse/HDDS-11267) | Ozone Datanode Reporting Negative Container values for UsedBytes and BlockCount parameters |  Major | Ozone Datanode, Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-10874](https://issues.apache.org/jira/browse/HDDS-10874) | Freon tool DNRPCLoadGenerator should not cache client objects |  Major | . | Wei-Chiu Chuang | Attila Doroszlai |
| [HDDS-11301](https://issues.apache.org/jira/browse/HDDS-11301) | Add Missing Utilization Endpoint in ReconApi.md for Ozone Recon Documentation |  Major | . | Arafat Khan | Mohammad Adnan Khan |
| [HDDS-11320](https://issues.apache.org/jira/browse/HDDS-11320) | Update OM, SCM, Datanode conf for RATIS-2135. |  Major | OM HA, Ozone Datanode, SCM HA | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-11324](https://issues.apache.org/jira/browse/HDDS-11324) | Negative value preOpLatencyMs in DN audit log |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-11209](https://issues.apache.org/jira/browse/HDDS-11209) | Avoid insufficient EC pipelines in the container pipeline cache |  Major | EC, OM | Hongbing Wang | Hongbing Wang |
| [HDDS-11349](https://issues.apache.org/jira/browse/HDDS-11349) | Recon volumes and bucket API throws 500 if we query before tables are initialized |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11346](https://issues.apache.org/jira/browse/HDDS-11346) | FS CLI gives incorrect recursive volume deletion prompt |  Major | Ozone CLI | Siyao Meng | Siyao Meng |
| [HDDS-11348](https://issues.apache.org/jira/browse/HDDS-11348) | 'fs -mkdir' is creating directories for OBS type bucket |  Major | Ozone Filesystem | Jyotirmoy Sinha | Tanvi Penumudy |
| [HDDS-11373](https://issues.apache.org/jira/browse/HDDS-11373) | Log for EC reconstruction command lists the missing indexes as ASCII control characters |  Major | . | Varsha Ravi | Attila Doroszlai |
| [HDDS-11372](https://issues.apache.org/jira/browse/HDDS-11372) | No coverage for org.apache.ozone packages |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11375](https://issues.apache.org/jira/browse/HDDS-11375) | DN Startup fails with Illegal configuration |  Major | Ozone Datanode | Pratyush Bhatt | Wei-Chiu Chuang |
| [HDDS-11152](https://issues.apache.org/jira/browse/HDDS-11152) | OMDoubleBuffer error when handling OMRequest: cmdType: SnapshotMoveDeletedKeys |  Major | OM, Snapshot | Jyotirmoy Sinha | Hemant Kumar |
| [HDDS-11350](https://issues.apache.org/jira/browse/HDDS-11350) | NullPointerException thrown on checking container balancer status |  Major | Balancer | Jyotirmoy Sinha | Siddhant Sangwan |
| [HDDS-11391](https://issues.apache.org/jira/browse/HDDS-11391) | Frequent Ozone DN Crashes During OM + DN Decommission with Freon |  Major | Ozone Datanode | Pratyush Bhatt | Wei-Chiu Chuang |
| [HDDS-11365](https://issues.apache.org/jira/browse/HDDS-11365) | Fix the NOTICE file |  Blocker | . | Ayush Saxena | Attila Doroszlai |
| [HDDS-11414](https://issues.apache.org/jira/browse/HDDS-11414) | Key listing for FSO buckets fails with forward client |  Major | . | Tanvi Penumudy | Tanvi Penumudy |
| [HDDS-11441](https://issues.apache.org/jira/browse/HDDS-11441) | ozone sh key put should only accept positive expectedGeneration |  Minor | Ozone CLI | Soumitra Sulav | Attila Doroszlai |
| [HDDS-10985](https://issues.apache.org/jira/browse/HDDS-10985) | EC Reconstruction failed because the size of currentChunks was not equal to checksumBlockDataChunks |  Critical | EC | LiMinyu | Shilun Fan |
| [HDDS-11389](https://issues.apache.org/jira/browse/HDDS-11389) | Incorrect number of deleted containers shown in Recon UI |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11438](https://issues.apache.org/jira/browse/HDDS-11438) | Use try-with-resources or close this "DataInputBuffer" in a "finally" clause |  Minor | common | Wei-Chiu Chuang | Ren Koike |
| [HDDS-11449](https://issues.apache.org/jira/browse/HDDS-11449) | Ambigious "Ignoring ozone.fs.hsync.enabled because HBase enhancements are disallowed" logs |  Major | . | Pratyush Bhatt | Ashish Kumar |
| [HDDS-11457](https://issues.apache.org/jira/browse/HDDS-11457) | Internal error on S3 CompleteMultipartUpload if parts are not specified |  Major | s3gateway | Maksim Myskov | Attila Doroszlai |
| [HDDS-11446](https://issues.apache.org/jira/browse/HDDS-11446) | Issue with ozone key list redundant options |  Major | Ozone CLI | Soumitra Sulav | Ren Koike |
| [HDDS-11396](https://issues.apache.org/jira/browse/HDDS-11396) | NPE due to empty Handler#clusterId |  Major | DN | JiangHua Zhu | JiangHua Zhu |
| [HDDS-11371](https://issues.apache.org/jira/browse/HDDS-11371) | getServerDefaults API call fails when OM version is old |  Major | . | Saketa Chalamchala | Saketa Chalamchala |
| [HDDS-11500](https://issues.apache.org/jira/browse/HDDS-11500) | RootCARotationManager cancelling wrong task in notifyStatusChanged |  Major | . | Szabolcs Gál | Szabolcs Gál |
| [HDDS-11472](https://issues.apache.org/jira/browse/HDDS-11472) | Multiple IOzoneAuthorizer instances may be created at install snapshot failure |  Major | Ozone Manager | István Fajth | Abhishek Pal |
| [HDDS-11502](https://issues.apache.org/jira/browse/HDDS-11502) | Class path contains multiple SLF4J providers |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11518](https://issues.apache.org/jira/browse/HDDS-11518) | [Ozone][Om DBinsights] "iskey" Metadata info is hardcoded to true |  Trivial | Ozone Recon | Arun Sarin | Arafat Khan |
| [HDDS-10909](https://issues.apache.org/jira/browse/HDDS-10909) | OM stops in single-node Docker container with default settings |  Major | docker | Attila Doroszlai | Yuqi Du |
| [HDDS-3498](https://issues.apache.org/jira/browse/HDDS-3498) | Address already in use Should shutdown the datanode with FATAL log and point out the port and configure key |  Minor | Ozone Datanode | Baolong Mao | Daniil |
| [HDDS-11535](https://issues.apache.org/jira/browse/HDDS-11535) | Incomplete SCM roles table header |  Major | SCM Client | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11526](https://issues.apache.org/jira/browse/HDDS-11526) | hdds.datanode.metadata.rocksdb.cache.size default value description is wrong |  Trivial | . | Wei-Chiu Chuang | Sarveksha Yeshavantha Raju |
| [HDDS-11520](https://issues.apache.org/jira/browse/HDDS-11520) | [OM DB Insights] Deleted Directories Key Path Mapping issue |  Minor | Ozone Recon | Arun Sarin | Abhishek Pal |
| [HDDS-11482](https://issues.apache.org/jira/browse/HDDS-11482) | EC Checksum throws IllegalArgumentException because the buffer limit is negative |  Major | . | Aswin Shakil | Aswin Shakil |
| [HDDS-11574](https://issues.apache.org/jira/browse/HDDS-11574) | Ozone client leak in TestS3SDKV1 |  Critical | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11570](https://issues.apache.org/jira/browse/HDDS-11570) | HDDS Docs Build Fails with Hugo v0.135.0 on M1 Mac Pro |  Minor | . | Scolley Huang | Scolley Huang |
| [HDDS-11602](https://issues.apache.org/jira/browse/HDDS-11602) | Ozone cli shows a "tput: command not found" error |  Minor | docker | Rishabh Patel | Rishabh Patel |
| [HDDS-11132](https://issues.apache.org/jira/browse/HDDS-11132) | 1.4 Older client failing to read/write on latest client (master) |  Major | . | Soumitra Sulav | Swaminathan Balachandran |
| [HDDS-11388](https://issues.apache.org/jira/browse/HDDS-11388) | Unnecessary call to the Database in ContainerBalancer |  Major | Balancer, SCM | Siddhant Sangwan | Ivan Andika |
| [HDDS-11594](https://issues.apache.org/jira/browse/HDDS-11594) | OM double buffer exception in debug mode |  Minor | . | Wei-Chiu Chuang | Ashish Kumar |
| [HDDS-11220](https://issues.apache.org/jira/browse/HDDS-11220) | Initialize block length using the chunk list from DataNode before seek |  Major | . | Pratyush Bhatt | Sammi Chen |
| [HDDS-11558](https://issues.apache.org/jira/browse/HDDS-11558) | Make OM client retry idempotent |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-11635](https://issues.apache.org/jira/browse/HDDS-11635) | Memory leak when using Ozone FS via Hadoop FileContext API |  Minor | Ozone Client | Andrey Komarov | Andrey Komarov |
| [HDDS-11642](https://issues.apache.org/jira/browse/HDDS-11642) | MutableQuantiles should be stopped |  Critical | . | Zhihua Deng | Attila Doroszlai |
| [HDDS-11587](https://issues.apache.org/jira/browse/HDDS-11587) | Ozone Manager not processing file put requests while enabling multi-tenancy |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-11652](https://issues.apache.org/jira/browse/HDDS-11652) | [DOC] Fix some errors in SCM-HA doc |  Trivial | documentation | Conway Zhang | Conway Zhang |
| [HDDS-64](https://issues.apache.org/jira/browse/HDDS-64) |  OzoneClientException should extend IOException |  Major | SCM | Anu Engineer | Nandakumar |
| [HDDS-11695](https://issues.apache.org/jira/browse/HDDS-11695) | SCM follower should not log NotLeaderException during Pipeline Report processing |  Major | SCM HA | Pratyush Bhatt | Nandakumar |
| [HDDS-11737](https://issues.apache.org/jira/browse/HDDS-11737) | UnsupportedOperationException in S3 setBucketAcl |  Major | Ozone Client | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11729](https://issues.apache.org/jira/browse/HDDS-11729) | Build fails with -DskipRecon |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11755](https://issues.apache.org/jira/browse/HDDS-11755) | mktemp --suffix does not work on Mac |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11749](https://issues.apache.org/jira/browse/HDDS-11749) | moveToTrash fails as API is not present in client code |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-11780](https://issues.apache.org/jira/browse/HDDS-11780) | Slight Delay in Exiting Safe Mode Due to and Impact on Client Writes |  Major | Ozone Client, SCM | Arafat Khan | Arafat Khan |
| [HDDS-11386](https://issues.apache.org/jira/browse/HDDS-11386) | Multithreading bug in ContainerBalancerTask |  Major | . | Siddhant Sangwan | Sarveksha Yeshavantha Raju |
| [HDDS-11716](https://issues.apache.org/jira/browse/HDDS-11716) | Address Incomplete Upgrade Scenario in Recon Upgrade Framework |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11785](https://issues.apache.org/jira/browse/HDDS-11785) | DataNode aborts state machine because ContainerStateMachine does not know follower's next index |  Critical | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-11811](https://issues.apache.org/jira/browse/HDDS-11811) | rocksdbjni deleted on exit could be used by other components |  Critical | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11810](https://issues.apache.org/jira/browse/HDDS-11810) | Secure acceptance test on arm64 fails with LoginException: Checksum failed |  Major | docker, Security | Sammi Chen | Attila Doroszlai |
| [HDDS-11742](https://issues.apache.org/jira/browse/HDDS-11742) | SCM leadership metric set to null even if the LEADER is defined |  Major | SCM | Vyacheslav Tutrinov | Vyacheslav Tutrinov |
| [HDDS-11656](https://issues.apache.org/jira/browse/HDDS-11656) | Default native ACL limits to user and user's primary group |  Major | . | Wei-Chiu Chuang | Sammi Chen |
| [HDDS-11848](https://issues.apache.org/jira/browse/HDDS-11848) | Serialisation bug in Recon's listKeys API |  Major | Ozone Recon | Siddhant Sangwan | Siddhant Sangwan |
| [HDDS-10821](https://issues.apache.org/jira/browse/HDDS-10821) | Ensure ozone to write all chunk buffer content to FileChannel |  Major | . | Duong | Duong |
| [HDDS-11911](https://issues.apache.org/jira/browse/HDDS-11911) | Return consistent error code when snapshot is not found in the DB or Snapshot Chain. |  Major | . | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-11926](https://issues.apache.org/jira/browse/HDDS-11926) | Inconsistency for bucket-name in bucket info between source and linked volume |  Trivial | . | Jyotirmoy Sinha | Jyotirmoy Sinha |
| [HDDS-11807](https://issues.apache.org/jira/browse/HDDS-11807) | [hsync] hsync key may have cleanup issue due to same client and callId |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-11846](https://issues.apache.org/jira/browse/HDDS-11846) | [Recon] Recon Schema version\_number column is always set as -1 |  Major | Ozone Recon | Abhishek Pal | Arafat Khan |
| [HDDS-11957](https://issues.apache.org/jira/browse/HDDS-11957) | [DU Page] Long path-name wraps to next line for DiskUsage page |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11857](https://issues.apache.org/jira/browse/HDDS-11857) | Freon log flooded by HSync message |  Major | freon | Attila Doroszlai | Chia-Chuan Yu |
| [HDDS-11995](https://issues.apache.org/jira/browse/HDDS-11995) | Acceptance Test test-all script fails to delete old result directories. |  Major | . | Nandakumar | Nandakumar |
| [HDDS-11998](https://issues.apache.org/jira/browse/HDDS-11998) | XceiverClientMetrics#decrPendingContainerOpsMetrics is not called in BlockDataStreamOutput |  Minor | Ozone Client | Ivan Andika | Ivan Andika |
| [HDDS-11987](https://issues.apache.org/jira/browse/HDDS-11987) | Recon UI - Disk Usage : Quota Allowed and Quota In Bytes are same and duplicate |  Major | . | Devesh Kumar Singh | Abhishek Pal |
| [HDDS-12045](https://issues.apache.org/jira/browse/HDDS-12045) | S3 secret admin test fails with HAProxy |  Blocker | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11969](https://issues.apache.org/jira/browse/HDDS-11969) | getFilechecksum() API fails if checksum type is NONE |  Major | . | Wei-Chiu Chuang | Sadanand Shenoy |
| [HDDS-11816](https://issues.apache.org/jira/browse/HDDS-11816) | Ozone stream to support Hsync,Hflush |  Major | . | Wei-Chiu Chuang | Ashish Kumar |
| [HDDS-12049](https://issues.apache.org/jira/browse/HDDS-12049) | Name of Ozone Service ID is incorrect in New & Old Recon UI |  Major | Ozone Recon | Omkar Dhayagude | Abhishek Pal |
| [HDDS-12042](https://issues.apache.org/jira/browse/HDDS-12042) | [UI]Difference in values are seen for Cluster Capacity & Container Pre Allocated Size in New Recon UI |  Major | Ozone Recon | Omkar Dhayagude | Abhishek Pal |
| [HDDS-11300](https://issues.apache.org/jira/browse/HDDS-11300) | Update Swagger Documentation for Recon API |  Major | Ozone Recon | Arafat Khan | Varsha Ravi |
| [HDDS-12131](https://issues.apache.org/jira/browse/HDDS-12131) | NPE in OM when overwriting empty file using multipart upload |  Major | OM | Kohei Sugihara | Kohei Sugihara |
| [HDDS-12114](https://issues.apache.org/jira/browse/HDDS-12114) | Prevent delete commands running after a long lock wait and send ICR earlier |  Major | Ozone Datanode | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-12081](https://issues.apache.org/jira/browse/HDDS-12081) | TestKeyInputStream repeats tests with default container layout |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12115](https://issues.apache.org/jira/browse/HDDS-12115) | RM selects replicas to delete non-deterministically if nodes are overloaded |  Major | SCM | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-12084](https://issues.apache.org/jira/browse/HDDS-12084) | Refreshing the page of old Recon UI switches to new Recon UI |  Major | Ozone Recon | Omkar Dhayagude | Abhishek Pal |
| [HDDS-12127](https://issues.apache.org/jira/browse/HDDS-12127) | RM should not expire pending deletes, but retry instead. |  Major | SCM | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-12040](https://issues.apache.org/jira/browse/HDDS-12040) | "ozone freon cr" does not work |  Major | freon | Ren Koike | Ren Koike |
| [HDDS-12144](https://issues.apache.org/jira/browse/HDDS-12144) | Remove unsupported replication types from config description |  Major | common | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12085](https://issues.apache.org/jira/browse/HDDS-12085) | Local Refresh button for current selected path is missing in new Recon UI |  Major | Ozone Recon | Omkar Dhayagude | Abhishek Pal |
| [HDDS-12073](https://issues.apache.org/jira/browse/HDDS-12073) | Unnecessary parameters Source Volume & Source Bucket are seen in metadata table for bucket in new Recon UI |  Major | Ozone Recon | Omkar Dhayagude | Abhishek Pal |
| [HDDS-12203](https://issues.apache.org/jira/browse/HDDS-12203) | skip() in MultipartInputStream doesn't call initialize() |  Major | . | Star Poon | Star Poon |
| [HDDS-12202](https://issues.apache.org/jira/browse/HDDS-12202) | OpsCreate and OpsAppend metrics not incremented |  Minor | HttpFS GateWay | Attila Doroszlai | Peter Lee |
| [HDDS-12200](https://issues.apache.org/jira/browse/HDDS-12200) | grammatical changes in the following documents - OM High Availability ,Ozone Erasure Coding ,Ozone Snapshot |  Trivial | documentation | Sreeja | Sreeja |
| [HDDS-12195](https://issues.apache.org/jira/browse/HDDS-12195) | Missing skip() Method Causes Performance Issues in OzoneFSInputStream |  Major | . | Star Poon | Star Poon |
| [HDDS-12212](https://issues.apache.org/jira/browse/HDDS-12212) | Fix grammar in Decommissioning and Observability in the doc |  Trivial | documentation | Gargi Jaiswal | Gargi Jaiswal |
| [HDDS-12112](https://issues.apache.org/jira/browse/HDDS-12112) | Fix interval used for Chunk read write Dashboard |  Major | Ozone Dashboards | Ritesh Shukla | Ritesh Shukla |
| [HDDS-12159](https://issues.apache.org/jira/browse/HDDS-12159) | Remove unnecessary iterator seek in fileTable and DirectoryTable uses |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-12231](https://issues.apache.org/jira/browse/HDDS-12231) | Logging in Container Balancer is too verbose |  Major | Balancer, SCM | Siddhant Sangwan | Siddhant Sangwan |
| [HDDS-12228](https://issues.apache.org/jira/browse/HDDS-12228) | Fix Duplicate Key Violation Condition in FileSizeCountTask |  Critical | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-12230](https://issues.apache.org/jira/browse/HDDS-12230) | ozone sh key put Does Not Handle "File Not Found" Error for Missing Files |  Major | . | Sreeja | Sreeja |
| [HDDS-11784](https://issues.apache.org/jira/browse/HDDS-11784) | parent directory not found when abort multi-part upload |  Major | S3 | Shawn | Shawn |
| [HDDS-12175](https://issues.apache.org/jira/browse/HDDS-12175) | Audit logs in SCM shouldn't print delete txns |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-12312](https://issues.apache.org/jira/browse/HDDS-12312) | NodeManager log aggregation to Ozone FileSystem fails |  Major | . | Takanobu Asanuma | Takanobu Asanuma |
| [HDDS-10336](https://issues.apache.org/jira/browse/HDDS-10336) | Fix SCM BackgroundPipelineCreator for ozone.replication=EC |  Major | . | Duong | Saketa Chalamchala |
| [HDDS-12306](https://issues.apache.org/jira/browse/HDDS-12306) | OmMetadataManager metrics are always zero |  Minor | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10760](https://issues.apache.org/jira/browse/HDDS-10760) | SCMExceptions resulting from admin CLI commands are treated as retriable |  Major | . | Ethan Rose | Aswin Shakil |
| [HDDS-12229](https://issues.apache.org/jira/browse/HDDS-12229) | Remove Incorrect Warning for OBS Bucket in Namespace CLI Commands |  Major | . | Arafat Khan | Gargi Jaiswal |
| [HDDS-12331](https://issues.apache.org/jira/browse/HDDS-12331) | BlockOutputStream.failedServers is not thread-safe |  Major | Ozone Client | Attila Doroszlai | Chia-Chuan Yu |
| [HDDS-12335](https://issues.apache.org/jira/browse/HDDS-12335) | ozone admin namespace summary gives incomplete output |  Major | Ozone CLI, Ozone Recon | Devesh Kumar Singh | Gargi Jaiswal |
| [HDDS-12226](https://issues.apache.org/jira/browse/HDDS-12226) | TestSecureOzoneRpcClient test cases are not run |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12065](https://issues.apache.org/jira/browse/HDDS-12065) | Checkpoint directory should be cleared on startup |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-12445](https://issues.apache.org/jira/browse/HDDS-12445) | Remove unused code from ContainerStateMap |  Major | SCM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-12409](https://issues.apache.org/jira/browse/HDDS-12409) | Log an error before increasing the sequence id of a CLOSED container in SCM |  Major | SCM | Siddhant Sangwan | Siddhant Sangwan |
| [HDDS-12543](https://issues.apache.org/jira/browse/HDDS-12543) | Remove duplicate license |  Minor | . | Rishabh Patel | Rishabh Patel |
| [HDDS-12573](https://issues.apache.org/jira/browse/HDDS-12573) | Extra Zero (0) appended at the start of replica index ID |  Trivial | Ozone CLI | Soumitra Sulav | Peter Lee |
| [HDDS-12611](https://issues.apache.org/jira/browse/HDDS-12611) | Snapshot creation is removing extra keys from AOS's DB |  Major | Snapshot | Hemant Kumar | Hemant Kumar |
| [HDDS-12608](https://issues.apache.org/jira/browse/HDDS-12608) | Race condition in datanode version file creation |  Blocker | Ozone Datanode | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12646](https://issues.apache.org/jira/browse/HDDS-12646) | Improve OM decommission check |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-12668](https://issues.apache.org/jira/browse/HDDS-12668) | HSync upgrade test failure |  Blocker | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12662](https://issues.apache.org/jira/browse/HDDS-12662) | Rename upgrade callback directory 1.5.0 to 2.0.0 |  Blocker | . | Wei-Chiu Chuang | Chia-Chuan Yu |
| [HDDS-12671](https://issues.apache.org/jira/browse/HDDS-12671) | Include .editorconfig and .run in source tarball |  Minor | build | Attila Doroszlai | Attila Doroszlai |


### TESTS:

| JIRA | Summary | Priority | Component | Reporter | Contributor |
|:---- |:---- | :--- |:---- |:---- |:---- |
| [HDDS-10329](https://issues.apache.org/jira/browse/HDDS-10329) | [snapshot] Add unit-test for recreating snapshots with deleted snapshot names |  Major | Snapshot | Jyotirmoy Sinha | Jyotirmoy Sinha |
| [HDDS-10414](https://issues.apache.org/jira/browse/HDDS-10414) | ozone acceptance: Recon.Recon-Api.Check if Recon picks up DN heartbeats: failed |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-10612](https://issues.apache.org/jira/browse/HDDS-10612) | Add Robot test to verify Container Balancer for RATIS containers |  Major | test | Anastasia Filippova | Anastasia Filippova |


### SUB-TASKS:

| JIRA | Summary | Priority | Component | Reporter | Contributor |
|:---- |:---- | :--- |:---- |:---- |:---- |
| [HDDS-9098](https://issues.apache.org/jira/browse/HDDS-9098) | Exclude the cleanup of incomplete MPU open keys in getExpiredOpenKeys |  Major | . | Ivan Andika | Ivan Andika |
| [HDDS-9919](https://issues.apache.org/jira/browse/HDDS-9919) | Update version to prepare for Ozone 1.4.0 release |  Major | . | Janus Chow | Janus Chow |
| [HDDS-9881](https://issues.apache.org/jira/browse/HDDS-9881) | Intermittent address already in use in TestSecureContainerServer |  Minor | test | Attila Doroszlai | Arafat Khan |
| [HDDS-9827](https://issues.apache.org/jira/browse/HDDS-9827) | Cryptic response when trying to close non-existent container from CLI |  Minor | Ozone CLI | Attila Doroszlai | Tejaskriya Madhan |
| [HDDS-8882](https://issues.apache.org/jira/browse/HDDS-8882) | Add state management of SCM's DeleteBlocksCommand to avoid sending duplicate delete transactions to the DN |  Major | . | ChenXi | ChenXi |
| [HDDS-5604](https://issues.apache.org/jira/browse/HDDS-5604) | Intermittent failure in TestPipelineClose |  Major | . | Attila Doroszlai | Devesh Kumar Singh |
| [HDDS-9592](https://issues.apache.org/jira/browse/HDDS-9592) | Replication Manager: Save UNHEALTHY replicas with highest BCSID for a QUASI\_CLOSED container |  Critical | SCM | Siddhant Sangwan | Siddhant Sangwan |
| [HDDS-9885](https://issues.apache.org/jira/browse/HDDS-9885) | Checkstyle check passing despite config error |  Critical | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9828](https://issues.apache.org/jira/browse/HDDS-9828) | Do not use Files.createTempFile in tests |  Major | test | Tsz-wo Sze | Attila Doroszlai |
| [HDDS-9807](https://issues.apache.org/jira/browse/HDDS-9807) | [EC][SCM] Incorrect check of available space on datanodes in case of allocating blocks |  Major | EC, SCM | Vyacheslav Tutrinov | Vyacheslav Tutrinov |
| [HDDS-9170](https://issues.apache.org/jira/browse/HDDS-9170) | Deprecate GenericTestUtils#assertExceptionContains and use AssertJ#assertThat |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-9963](https://issues.apache.org/jira/browse/HDDS-9963) | Intermittent failure in TestInterSCMGrpcProtocolService due to port conflict |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10006](https://issues.apache.org/jira/browse/HDDS-10006) | Pass TransactionInfo in OzoneManagerRequestHandler.handleWriteRequest |  Major | OM HA | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10020](https://issues.apache.org/jira/browse/HDDS-10020) | DoubleBufferEntry should not be generic |  Major | OM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-8470](https://issues.apache.org/jira/browse/HDDS-8470) | Intermittent failure in TestStorageContainerManager#testContainerReportQueueTakingMoreTime |  Major | test | Attila Doroszlai | Devesh Kumar Singh |
| [HDDS-9774](https://issues.apache.org/jira/browse/HDDS-9774) | Introduce metrics to store start time of datanode decommissioning |  Major | SCM | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-9005](https://issues.apache.org/jira/browse/HDDS-9005) | Container scanner continues to scan deleted container |  Major | . | George Huang | Saketa Chalamchala |
| [HDDS-10004](https://issues.apache.org/jira/browse/HDDS-10004) | Fix TestOMRatisSnapshots#testInstallIncrementalSnapshotWithFailure |  Major | . | Christos Bisias | Christos Bisias |
| [HDDS-9758](https://issues.apache.org/jira/browse/HDDS-9758) | Intermittent failure in testValidateBlockLengthWithCommitKey |  Minor | . | Attila Doroszlai | Devesh Kumar Singh |
| [HDDS-10070](https://issues.apache.org/jira/browse/HDDS-10070) | Intermittent failure in TestWritableRatisContainerProvider |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10063](https://issues.apache.org/jira/browse/HDDS-10063) | NumKeys metric not decremented on FSO directory delete |  Major | . | Ethan Rose | Ethan Rose |
| [HDDS-10084](https://issues.apache.org/jira/browse/HDDS-10084) | Replace LEGACY in integration test with default layout from config |  Major | test | Ethan Rose | Attila Doroszlai |
| [HDDS-9852](https://issues.apache.org/jira/browse/HDDS-9852) | Intermittent timeout in testCorruptionDetected waiting for container to become unhealthy |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9638](https://issues.apache.org/jira/browse/HDDS-9638) | [hsync] File recovery support in OM |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-9915](https://issues.apache.org/jira/browse/HDDS-9915) | hsync: Interface to retrieve block info and finalize block in DN through ratis |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-10086](https://issues.apache.org/jira/browse/HDDS-10086) | Intermittent timeout in TestSafeMode |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9245](https://issues.apache.org/jira/browse/HDDS-9245) | Add container layout v2 upgrade to v3 tool |  Major | . | GuoHao | GuoHao |
| [HDDS-8650](https://issues.apache.org/jira/browse/HDDS-8650) | Remove duplicate helper methods for getting FSO open key name |  Major | . | Wei-Chiu Chuang | TaiJuWu |
| [HDDS-10093](https://issues.apache.org/jira/browse/HDDS-10093) | Make recoverLease call idempotent |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-9309](https://issues.apache.org/jira/browse/HDDS-9309) | Dashboard for list key operations |  Major | . | Ritesh Shukla | Muskan Mishra |
| [HDDS-10113](https://issues.apache.org/jira/browse/HDDS-10113) | UNHEALTHY replicas of QUASI\_CLOSED container with unique origins should be handled during decommission |  Blocker | SCM | Siddhant Sangwan | Siddhant Sangwan |
| [HDDS-10123](https://issues.apache.org/jira/browse/HDDS-10123) | InaccessibleObjectException in tests using ChecksumByteBufferImpl with Java 17 |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10119](https://issues.apache.org/jira/browse/HDDS-10119) | Assertions on object creationTime fail with Java 17 |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10130](https://issues.apache.org/jira/browse/HDDS-10130) | TestSecureOzoneManager.testSecureOmInitFailure fails with Java 17 |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-8492](https://issues.apache.org/jira/browse/HDDS-8492) | Intermittent timeout in TestStorageContainerManager#testBlockDeletionTransactions |  Minor | . | Attila Doroszlai | Devesh Kumar Singh |
| [HDDS-10131](https://issues.apache.org/jira/browse/HDDS-10131) | TestTarContainerPacker fails with Java 17 |  Trivial | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9967](https://issues.apache.org/jira/browse/HDDS-9967) | Intermittent failure in TestOzoneRpcClientAbstract.testListSnapshot |  Major | . | Attila Doroszlai | Devesh Kumar Singh |
| [HDDS-10157](https://issues.apache.org/jira/browse/HDDS-10157) | Download zlib fails with 403 Forbidden in CI |  Critical | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-3849](https://issues.apache.org/jira/browse/HDDS-3849) | Add tests for show rule status of scm safemode |  Major | test | Dinesh Chitlangia | Sadanand Shenoy |
| [HDDS-7558](https://issues.apache.org/jira/browse/HDDS-7558) | Translate "Topology awareness" doc into Mandarin Chinese |  Major | . | Wei-Chiu Chuang | David |
| [HDDS-10044](https://issues.apache.org/jira/browse/HDDS-10044) | [hsync] File recovery support in Client |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10126](https://issues.apache.org/jira/browse/HDDS-10126) | Remove maxFlushedTransactionsInOneIteration from OzoneManagerDoubleBuffer |  Major | OM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10154](https://issues.apache.org/jira/browse/HDDS-10154) | isKeyPresentInTable should use the constructor with prefix |  Major | OM | Ritesh Shukla | Ritesh Shukla |
| [HDDS-9288](https://issues.apache.org/jira/browse/HDDS-9288) | Intermittent failure in TestSnapshotDeletingService#testMultipleSnapshotKeyReclaim |  Major | test | Attila Doroszlai | Hemant Kumar |
| [HDDS-9181](https://issues.apache.org/jira/browse/HDDS-9181) | Provide documentation for Decommissioning in Ozone in Mandarin |  Major | documentation | Aryan Gupta | David |
| [HDDS-7557](https://issues.apache.org/jira/browse/HDDS-7557) | Translate "Merge Container RocksDB in DN" doc into Mandarin Chinese |  Major | documentation | Wei-Chiu Chuang | David |
| [HDDS-8005](https://issues.apache.org/jira/browse/HDDS-8005) | [disabled] Intermittent failure in TestOmSnapshot.testSnapDiffWithMultipleSSTs |  Major | test | Attila Doroszlai | Hemant Kumar |
| [HDDS-10042](https://issues.apache.org/jira/browse/HDDS-10042) | Show IDs for under-replicated and unclosed containers |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-10121](https://issues.apache.org/jira/browse/HDDS-10121) | GenericTestUtils.getFieldReflection fails with Java 17 |  Major | test | Attila Doroszlai | Devesh Kumar Singh |
| [HDDS-10180](https://issues.apache.org/jira/browse/HDDS-10180) | Add proto.lock files from ozone-1.4 release branch to master |  Major | . | Janus Chow | Janus Chow |
| [HDDS-10141](https://issues.apache.org/jira/browse/HDDS-10141) | [hsync]Support hard limit and auto recovery for hsync file |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-8941](https://issues.apache.org/jira/browse/HDDS-8941) | [disabled] Intermittent timeout in TestContainerBalancerTask |  Major | . | Attila Doroszlai | Arafat Khan |
| [HDDS-9930](https://issues.apache.org/jira/browse/HDDS-9930) | Deleted file reappears after HSync |  Critical | Ozone Manager | Pratyush Bhatt | Siyao Meng |
| [HDDS-9486](https://issues.apache.org/jira/browse/HDDS-9486) | Deadlock between RocksDBCheckpointDiffer#pruneSstFiles and OMDBCheckpointServlet#getCheckpoint. Also causing intermittent fork timeout in TestSnapshotBackgroundServices. |  Major | Snapshot | Attila Doroszlai | Hemant Kumar |
| [HDDS-10199](https://issues.apache.org/jira/browse/HDDS-10199) | Node.js 16 actions are deprecated |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10227](https://issues.apache.org/jira/browse/HDDS-10227) | Intermittent timeout in TestReconAndAdminContainerCLI |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10059](https://issues.apache.org/jira/browse/HDDS-10059) | Intermittent failure in TestOMRatisSnapshots.testInstallSnapshot |  Major | test | Attila Doroszlai | Christos Bisias |
| [HDDS-10077](https://issues.apache.org/jira/browse/HDDS-10077) | Add hsync metadata to hsync'ed keys in OpenKeyTable as well |  Major | . | Siyao Meng | Siyao Meng |
| [HDDS-10228](https://issues.apache.org/jira/browse/HDDS-10228) | Intermittent failure downloading from sourceware.org |  Major | build, CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10225](https://issues.apache.org/jira/browse/HDDS-10225) | Speed up TestSCMHAManagerImpl |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10251](https://issues.apache.org/jira/browse/HDDS-10251) | Intermittent failure in TestKeyDeletingService |  Critical | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10260](https://issues.apache.org/jira/browse/HDDS-10260) | Update OM High Availability documentation |  Minor | documentation | Sarveksha Yeshavantha Raju | Sarveksha Yeshavantha Raju |
| [HDDS-9023](https://issues.apache.org/jira/browse/HDDS-9023) | Intermittent failure in TestSnapshotDeletingService#testSnapshotWithFSO |  Critical | Snapshot | Attila Doroszlai | Aswin Shakil |
| [HDDS-10263](https://issues.apache.org/jira/browse/HDDS-10263) | Intermittent failure in freon/metadata-generate robot test |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9401](https://issues.apache.org/jira/browse/HDDS-9401) | Update last known layout version in SCMNodeManager#processLayoutVersionReport |  Major | SCM | Nandakumar | Nandakumar |
| [HDDS-10246](https://issues.apache.org/jira/browse/HDDS-10246) | Remove KeyValueHandler.checkContainerIsHealthy to improve read performance |  Major | DN | Hongbing Wang | Hongbing Wang |
| [HDDS-10249](https://issues.apache.org/jira/browse/HDDS-10249) | Remove unused, dead code in hdds-common module |  Major | . | István Fajth | István Fajth |
| [HDDS-10173](https://issues.apache.org/jira/browse/HDDS-10173) | Random object created and used only once in TestBlockOutputStreamCorrectness |  Minor | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10289](https://issues.apache.org/jira/browse/HDDS-10289) | Remove unused MiniOzoneCluster.Builder properties |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10287](https://issues.apache.org/jira/browse/HDDS-10287) | Remove unused ozone.trace.enabled config and related code |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10286](https://issues.apache.org/jira/browse/HDDS-10286) | Remove unused RatisTestSuite |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10152](https://issues.apache.org/jira/browse/HDDS-10152) | Field should be static |  Minor | . | Attila Doroszlai | Sarveksha Yeshavantha Raju |
| [HDDS-8627](https://issues.apache.org/jira/browse/HDDS-8627) | Recon - API for Count of deletePending directories |  Major | Ozone Recon | Devesh Kumar Singh | Arafat Khan |
| [HDDS-10340](https://issues.apache.org/jira/browse/HDDS-10340) | Selective checks: skip tests for Dashboard changes |  Major | CI, Ozone Dashboards | Ritesh Shukla | Ritesh Shukla |
| [HDDS-10262](https://issues.apache.org/jira/browse/HDDS-10262) | Encapsulate SnapshotCache inside OmSnapshotManager |  Major | . | Kirill Sizov | Kirill Sizov |
| [HDDS-10344](https://issues.apache.org/jira/browse/HDDS-10344) | Schedule dependabot for weekend |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9738](https://issues.apache.org/jira/browse/HDDS-9738) | Display pipeline and container counts for the decommissioning Datanode |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-10342](https://issues.apache.org/jira/browse/HDDS-10342) | Reduce code duplication in MiniOzoneCluster builders |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10010](https://issues.apache.org/jira/browse/HDDS-10010) | [Snapshot] Support snapshot rename operation |  Major | . | Kirill Sizov | Kirill Sizov |
| [HDDS-10383](https://issues.apache.org/jira/browse/HDDS-10383) | Introduce a Provider for client-side thread resources passing |  Major | Ozone Client | ChenXi | ChenXi |
| [HDDS-10408](https://issues.apache.org/jira/browse/HDDS-10408) | NPE causes OM crash in Snapshot Purge request |  Major | . | Aswin Shakil | Aswin Shakil |
| [HDDS-10394](https://issues.apache.org/jira/browse/HDDS-10394) | Fix parameter number warning in om.helpers |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10415](https://issues.apache.org/jira/browse/HDDS-10415) | Remove duplicate HA MiniOzoneCluster factory method |  Trivial | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10250](https://issues.apache.org/jira/browse/HDDS-10250) | Use SnapshotId as key in SnapshotCache |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-8793](https://issues.apache.org/jira/browse/HDDS-8793) | Confirm Prefix Acl's work properly with snapshots |  Major | . | George Jahad | Hemant Kumar |
| [HDDS-10416](https://issues.apache.org/jira/browse/HDDS-10416) | Move HA-specific settings to MiniOzoneHAClusterImpl.Builder |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10437](https://issues.apache.org/jira/browse/HDDS-10437) | Rename getContainersReplicatedOnNode to getContainersPendingReplication |  Minor | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-9274](https://issues.apache.org/jira/browse/HDDS-9274) | Intermittent crash in tests using ManagedSSTDumpTool |  Critical | . | Attila Doroszlai | Swaminathan Balachandran |
| [HDDS-8818](https://issues.apache.org/jira/browse/HDDS-8818) | Intermittent timeout in TestManagedSstFileReader |  Critical | Snapshot | Attila Doroszlai | Swaminathan Balachandran |
| [HDDS-7810](https://issues.apache.org/jira/browse/HDDS-7810) | Support namespace summaries (du, dist & counts) for OBJECT\_STORE buckets |  Major | Ozone Recon | Ethan Rose | Arafat Khan |
| [HDDS-10041](https://issues.apache.org/jira/browse/HDDS-10041) | Do not start the daemon inside the OzoneManagerDoubleBuffer constructor |  Major | OM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10252](https://issues.apache.org/jira/browse/HDDS-10252) | [hsync] Revisit configuration keys for incremental chunk list after HDDS-9884 |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10487](https://issues.apache.org/jira/browse/HDDS-10487) | Intermittent crash in TestSnapshotDiffManager |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10454](https://issues.apache.org/jira/browse/HDDS-10454) | Make OzoneAcl immutable |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10497](https://issues.apache.org/jira/browse/HDDS-10497) | [hsync] Refresh block token immediately if block token expires |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10440](https://issues.apache.org/jira/browse/HDDS-10440) | Create new cluster ID and config instance in build() |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10120](https://issues.apache.org/jira/browse/HDDS-10120) | BindException in integration tests with Java 17 |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10546](https://issues.apache.org/jira/browse/HDDS-10546) | OM startup failure as leader is not getting ready |  Critical | OM | Soumitra Sulav | Sumit Agrawal |
| [HDDS-10436](https://issues.apache.org/jira/browse/HDDS-10436) | datanode status decommission command should have json output option |  Minor | Ozone CLI | Tejaskriya Madhan | Sarveksha Yeshavantha Raju |
| [HDDS-10477](https://issues.apache.org/jira/browse/HDDS-10477) | Make Rocksdb tools native lib compatible with all chipsets within the arch |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-10118](https://issues.apache.org/jira/browse/HDDS-10118) | hdds-rocks-native fails to build with Java11+ |  Major | build | Attila Doroszlai | Raju Balpande |
| [HDDS-10556](https://issues.apache.org/jira/browse/HDDS-10556) | Checkstyle summary excludes errors with "xml" |  Minor | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10143](https://issues.apache.org/jira/browse/HDDS-10143) | Intermittent failure in testParallelDeleteBucketAndCreateKey |  Major | test | Attila Doroszlai | ChenXi |
| [HDDS-10584](https://issues.apache.org/jira/browse/HDDS-10584) | Exclude proto3 classes from coverage |  Minor | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10586](https://issues.apache.org/jira/browse/HDDS-10586) | Avoid loading network topology layer schema file for every read |  Major | OM, SCM | Tanvi Penumudy | Tanvi Penumudy |
| [HDDS-10518](https://issues.apache.org/jira/browse/HDDS-10518) | Create base Builder in WithMetadata and WithObjectID |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10524](https://issues.apache.org/jira/browse/HDDS-10524) | Snapshot chain corruption |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-9242](https://issues.apache.org/jira/browse/HDDS-9242) | Merge unit and integration checks into a combined one |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10570](https://issues.apache.org/jira/browse/HDDS-10570) | dfs -touch creates directory instead of empty file in FSO bucket |  Major | Ozone Filesystem, S3 | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9534](https://issues.apache.org/jira/browse/HDDS-9534) | Support namespace summaries (du, dist & counts) for LEGACY buckets with file system disabled |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-9130](https://issues.apache.org/jira/browse/HDDS-9130) | [hsync] Combine WriteData and PutBlock requests into one |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10597](https://issues.apache.org/jira/browse/HDDS-10597) | Use MutableGauge for threshold based SafeModeMetrics |  Major | SCM | Sadanand Shenoy | Sadanand Shenoy |
| [HDDS-10590](https://issues.apache.org/jira/browse/HDDS-10590) | SstFilteringService updating snapshotInfo directly |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-9200](https://issues.apache.org/jira/browse/HDDS-9200) | Add more logging for snapshot purge. |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-5567](https://issues.apache.org/jira/browse/HDDS-5567) | interface/Cli.md translation |  Minor | . | Xiang Zhang | Will Xiao |
| [HDDS-10644](https://issues.apache.org/jira/browse/HDDS-10644) | Intermittent failure in testBalancer.robot |  Major | test | Ivan Andika | Anastasia Filippova |
| [HDDS-10560](https://issues.apache.org/jira/browse/HDDS-10560) | Link rocksdb lib to Ozone rocksdb tools lib relative path instead of absolute path |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-5568](https://issues.apache.org/jira/browse/HDDS-5568) | interface/Ofs.md translation |  Minor | . | Xiang Zhang | Will Xiao |
| [HDDS-5569](https://issues.apache.org/jira/browse/HDDS-5569) | recipe/BotoClient.md translation |  Minor | . | Xiang Zhang | Sammi Chen |
| [HDDS-10268](https://issues.apache.org/jira/browse/HDDS-10268) | [hsync] Add OpenTracing traces to client side read path |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10630](https://issues.apache.org/jira/browse/HDDS-10630) | S3A: parent directory not found during CompleteMPU request in FSO bucket |  Major | S3 | Saketa Chalamchala | Saketa Chalamchala |
| [HDDS-10132](https://issues.apache.org/jira/browse/HDDS-10132) | TestStorageContainerManager.testScmProcessDatanodeHeartbeat fails with Java 17 |  Major | test | Attila Doroszlai | Raju Balpande |
| [HDDS-10452](https://issues.apache.org/jira/browse/HDDS-10452) | Improve Recon Disk Usage to fetch and display Top N records based on size. |  Critical | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-10615](https://issues.apache.org/jira/browse/HDDS-10615) | ETag change detected in S3A contract test |  Major | S3 | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10686](https://issues.apache.org/jira/browse/HDDS-10686) | Only bump npm packages for security |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-7252](https://issues.apache.org/jira/browse/HDDS-7252) | Polled source Datanodes are wrongly not re-considered for balancing in Container Balancer |  Major | SCM | Siddhant Sangwan | Tejaskriya Madhan |
| [HDDS-10309](https://issues.apache.org/jira/browse/HDDS-10309) | Speed up TestSnapshotDeletingService |  Major | test | Attila Doroszlai | Raju Balpande |
| [HDDS-10725](https://issues.apache.org/jira/browse/HDDS-10725) | TestContentGenerator#writeWithHsync fails with Java 17 |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10545](https://issues.apache.org/jira/browse/HDDS-10545) | Repeated tests stop if fork does not return |  Minor | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10156](https://issues.apache.org/jira/browse/HDDS-10156) | Optimize Snapshot Cache get and eviction |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-10726](https://issues.apache.org/jira/browse/HDDS-10726) | TestAuditParser.testLoadCommand fails with Java 11+ |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10582](https://issues.apache.org/jira/browse/HDDS-10582) | Intermittent timeout during waitForReplicaCount in TestReconAndAdminContainerCLI |  Major | test | Attila Doroszlai | Raju Balpande |
| [HDDS-10691](https://issues.apache.org/jira/browse/HDDS-10691) | CRYPTO\_COMPLIANCE tag for cryptography parameters |  Major | Security | István Fajth | Szabolcs Gál |
| [HDDS-10745](https://issues.apache.org/jira/browse/HDDS-10745) | Do not use BitSet for OzoneAcl.aclBitSet |  Major | OM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10752](https://issues.apache.org/jira/browse/HDDS-10752) | OmBucketInfo/OmMultipartKeyInfo/OmPrefixInfo should implement CopyObject |  Major | OM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-10701](https://issues.apache.org/jira/browse/HDDS-10701) | Create config option for keystores |  Major | . | Szabolcs Gál | Szabolcs Gál |
| [HDDS-7791](https://issues.apache.org/jira/browse/HDDS-7791) | Support display and persist owner info to DB |  Major | Ozone Manager | ChenXi | ChenXi |
| [HDDS-10769](https://issues.apache.org/jira/browse/HDDS-10769) | Integration check no longer needs Ozone repo |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-5570](https://issues.apache.org/jira/browse/HDDS-5570) | security/SecuringOzoneHTTP.md translation |  Minor | . | Xiang Zhang | Will Xiao |
| [HDDS-10657](https://issues.apache.org/jira/browse/HDDS-10657) | Design Doc for overwriting a key if it has not changed |  Major | . | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-5571](https://issues.apache.org/jira/browse/HDDS-5571) | tools/Admin.md translation |  Minor | . | Xiang Zhang | Will Xiao |
| [HDDS-10709](https://issues.apache.org/jira/browse/HDDS-10709) | Intermittent failure in TestContainerBalancerOperations |  Major | . | Tejaskriya Madhan | Sarveksha Yeshavantha Raju |
| [HDDS-10783](https://issues.apache.org/jira/browse/HDDS-10783) | Close SstFileReaderIterator in RocksDBCheckpointDiffer |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-10787](https://issues.apache.org/jira/browse/HDDS-10787) | Updated RocksdbCheckpointDiffer to use managed RocksDb objects |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-10542](https://issues.apache.org/jira/browse/HDDS-10542) | Replace remaining GSON usage with Jackson |  Major | . | Attila Doroszlai | Arafat Khan |
| [HDDS-10754](https://issues.apache.org/jira/browse/HDDS-10754) | [hsync] lease recovery contract test class not substantiated |  Major | . | Wei-Chiu Chuang | Chung En Lee |
| [HDDS-10820](https://issues.apache.org/jira/browse/HDDS-10820) | Freon tool DN-Echo to support GRPC and Ratis read/write mode |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10774](https://issues.apache.org/jira/browse/HDDS-10774) | [hsync] Show deleted hsync keys in ListOpenFile CLI |  Minor | . | Ashish Kumar | Ashish Kumar |
| [HDDS-10834](https://issues.apache.org/jira/browse/HDDS-10834) | Revert snapshot diff output change added in HDDS-9360 |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-10772](https://issues.apache.org/jira/browse/HDDS-10772) | Stream write mertic is wrong |  Minor | . | GuoHao | GuoHao |
| [HDDS-10434](https://issues.apache.org/jira/browse/HDDS-10434) | Add permission check for snapshot diff |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-10557](https://issues.apache.org/jira/browse/HDDS-10557) | TestBlockOutputStream#testWriteExactlyFlushSize is flaky |  Major | . | Wei-Chiu Chuang | Chung En Lee |
| [HDDS-10811](https://issues.apache.org/jira/browse/HDDS-10811) | Reduce UTF8 string encoding by caching encoding result |  Major | Ozone Datanode | ChenXi | ChenXi |
| [HDDS-10801](https://issues.apache.org/jira/browse/HDDS-10801) | Replace GSON with Jackson in hadoop-ozone classes |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-9039](https://issues.apache.org/jira/browse/HDDS-9039) | Write tests for tarball creation and compaction synchronization |  Critical | . | Hemant Kumar | Hemant Kumar |
| [HDDS-10835](https://issues.apache.org/jira/browse/HDDS-10835) | Show overwritten hsync keys in ListOpenFile CLI |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-10527](https://issues.apache.org/jira/browse/HDDS-10527) | Rewrite key atomically |  Major | . | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-10559](https://issues.apache.org/jira/browse/HDDS-10559) | Add a warning or a check to run repair tool as System user |  Major | . | Hemant Kumar | Dave Teng |
| [HDDS-2643](https://issues.apache.org/jira/browse/HDDS-2643) | TestOzoneDelegationTokenSecretManager#testRenewTokenFailureRenewalTime fails intermittently |  Minor | test | Lokesh Jain | Raju Balpande |
| [HDDS-10899](https://issues.apache.org/jira/browse/HDDS-10899) | Refactor Lease callbacks |  Minor | common | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10422](https://issues.apache.org/jira/browse/HDDS-10422) | Fix some expose internal representation warnings in hdds-common |  Major | common, SCM | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10897](https://issues.apache.org/jira/browse/HDDS-10897) | Refactor OzoneQuota |  Minor | common | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10634](https://issues.apache.org/jira/browse/HDDS-10634) | Recon - listKeys API for listing of OBS , FSO and Legacy bucket keys with filters |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-10921](https://issues.apache.org/jira/browse/HDDS-10921) | Enable Atomic Rewrite in FSO buckets |  Major | . | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-9918](https://issues.apache.org/jira/browse/HDDS-9918) | [hsync] Remove block token from Ratis log once verified |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10938](https://issues.apache.org/jira/browse/HDDS-10938) | flaky-test-check does not list failed iterations |  Minor | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9317](https://issues.apache.org/jira/browse/HDDS-9317) | [snapshot] Ozone snapshot diff should provide an option for displaying output as json format |  Trivial | Ozone CLI, Snapshot | Jyotirmoy Sinha | Hemant Kumar |
| [HDDS-10924](https://issues.apache.org/jira/browse/HDDS-10924) | TestSCMHAManagerImpl#testAddSCM fails on ratis master |  Major | . | Duong | Attila Doroszlai |
| [HDDS-10869](https://issues.apache.org/jira/browse/HDDS-10869) | SCMNodeManager#getUsageInfo memory occupancy optimization |  Major | . | GuoHao | GuoHao |
| [HDDS-10871](https://issues.apache.org/jira/browse/HDDS-10871) | ContainerBalancerSelectionCriteria memory occupancy optimization |  Major | . | GuoHao | GuoHao |
| [HDDS-10870](https://issues.apache.org/jira/browse/HDDS-10870) | moveSelectionToFutureMap cleanup when future complete |  Major | . | GuoHao | GuoHao |
| [HDDS-10990](https://issues.apache.org/jira/browse/HDDS-10990) | Fix memory leak in native lib |  Major | Ozone Manager | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-10889](https://issues.apache.org/jira/browse/HDDS-10889) | Remove certificate revocation related code. |  Major | . | István Fajth | István Fajth |
| [HDDS-10295](https://issues.apache.org/jira/browse/HDDS-10295) | Provide an "ozone repair" subcommand to update the snapshot info in transactionInfoTable |  Major | . | Sammi Chen | Dave Teng |
| [HDDS-10407](https://issues.apache.org/jira/browse/HDDS-10407) | Introduce Metric for deleteKey operation in SCM Service |  Major | . | Muskan Mishra | Muskan Mishra |
| [HDDS-11006](https://issues.apache.org/jira/browse/HDDS-11006) | Selective checks: integration skipped when build not required |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10486](https://issues.apache.org/jira/browse/HDDS-10486) | Recon datanode UI to incorporate explicit removal of DEAD datanodes |  Major | Ozone Recon | Devesh Kumar Singh | smita |
| [HDDS-8942](https://issues.apache.org/jira/browse/HDDS-8942) | Intermittent failure in ITestOzoneContractCreate#testSyncable |  Major | . | Attila Doroszlai | Chung En Lee |
| [HDDS-10888](https://issues.apache.org/jira/browse/HDDS-10888) | Restrict X509CertificateHolder usage to the bare minimum required. |  Major | . | István Fajth | István Fajth |
| [HDDS-10813](https://issues.apache.org/jira/browse/HDDS-10813) | Improve Ozone Recon Debuggability for Snapshot Fetching, Sync Monitoring, and Permission Validation |  Major | . | Arafat Khan | Arafat Khan |
| [HDDS-11030](https://issues.apache.org/jira/browse/HDDS-11030) | Do not throw OperatorCreationException from CertificateApprover#sign |  Major | . | István Fajth | István Fajth |
| [HDDS-11054](https://issues.apache.org/jira/browse/HDDS-11054) | native check fails with Java11+ |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11042](https://issues.apache.org/jira/browse/HDDS-11042) | CI with Ratis ignores Ozone ref |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11101](https://issues.apache.org/jira/browse/HDDS-11101) | Use OZONE\_RUNNER\_IMAGE for httpfs |  Minor | docker-compose | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9874](https://issues.apache.org/jira/browse/HDDS-9874) | Introduce Metrics for listKeys Dashboard |  Major | Ozone Dashboards | Muskan Mishra | Muskan Mishra |
| [HDDS-9977](https://issues.apache.org/jira/browse/HDDS-9977) | Dashboard for create key metrics |  Major | . | Muskan Mishra | Muskan Mishra |
| [HDDS-10941](https://issues.apache.org/jira/browse/HDDS-10941) | Add a few interesting ContainerStateMachine metrics in CSMMetrics |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-9842](https://issues.apache.org/jira/browse/HDDS-9842) | [hsync] Checking disk capacity at every write request is expensive for HBase |  Major | . | Wei-Chiu Chuang | Attila Doroszlai |
| [HDDS-10112](https://issues.apache.org/jira/browse/HDDS-10112) | Dashboard for read key metrics |  Major | . | Muskan Mishra | Muskan Mishra |
| [HDDS-11103](https://issues.apache.org/jira/browse/HDDS-11103) | Do not assume working dir is writable in container |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11052](https://issues.apache.org/jira/browse/HDDS-11052) | HttpFS fails to start when compiled with Java 17 |  Major | HttpFS GateWay | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10841](https://issues.apache.org/jira/browse/HDDS-10841) | Snapshot diff CLI help should prints default value for paramaters |  Major | . | Hemant Kumar | Will Xiao |
| [HDDS-10386](https://issues.apache.org/jira/browse/HDDS-10386) | Introduce Metrics for deletekey operation in OM Service |  Major | Ozone Dashboards | Muskan Mishra | Muskan Mishra |
| [HDDS-11117](https://issues.apache.org/jira/browse/HDDS-11117) | Introduce debug CLI command to show the value schema of any rocksDB |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-11186](https://issues.apache.org/jira/browse/HDDS-11186) | First container log missing from bundle |  Major | docker-compose, test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11179](https://issues.apache.org/jira/browse/HDDS-11179) | DBConfigFromFile#readFromFile result of toIOException not thrown |  Major | . | Nandakumar | Will Xiao |
| [HDDS-10389](https://issues.apache.org/jira/browse/HDDS-10389) | Implement a search feature for users to locate open keys within the Open Keys Insights section. |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11194](https://issues.apache.org/jira/browse/HDDS-11194) | OM missing audit log for upgrade prepare, cancel and finalize |  Major | . | Sumit Agrawal | Sumit Agrawal |
| [HDDS-10658](https://issues.apache.org/jira/browse/HDDS-10658) | Add Object ID and Update ID to OM audit log messages |  Major | . | Ethan Rose | Sumit Agrawal |
| [HDDS-11167](https://issues.apache.org/jira/browse/HDDS-11167) | Use Key/TrustManagers directly for TLS connection instead of factories |  Major | . | Szabolcs Gál | Szabolcs Gál |
| [HDDS-11188](https://issues.apache.org/jira/browse/HDDS-11188) | [UI] Allow Switching between UIs in Recon |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11076](https://issues.apache.org/jira/browse/HDDS-11076) | NoSuchMethodError: ByteBuffer.position compiling with Java 9+, running with Java 8 |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11258](https://issues.apache.org/jira/browse/HDDS-11258) | [hsync] Add new OM layout version |  Blocker | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-11183](https://issues.apache.org/jira/browse/HDDS-11183) | Keys from DeletedTable and DeletedDirTable of Active Object Store should be deleted on batch operation while creating a snapshot |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-10733](https://issues.apache.org/jira/browse/HDDS-10733) | [hsync] Merge HDDS-7593 feature branch into master |  Blocker | . | Wei-Chiu Chuang | Ashish Kumar |
| [HDDS-11270](https://issues.apache.org/jira/browse/HDDS-11270) | [hsync] Add DN layout version (HBASE\_SUPPORT/version 8) upgrade test |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10517](https://issues.apache.org/jira/browse/HDDS-10517) | Recon - Add a UI component for showing DN decommissioning detailed status and info |  Major | Ozone Recon | Devesh Kumar Singh | smita |
| [HDDS-11174](https://issues.apache.org/jira/browse/HDDS-11174) | [hsync] Change XceiverClientRatis.watchForCommit to async |  Major | Ozone Client | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-11154](https://issues.apache.org/jira/browse/HDDS-11154) | [UI] Improve Overview Page UI |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11292](https://issues.apache.org/jira/browse/HDDS-11292) | [hsync] Move HBASE\_SUPPORT layout upgrade test into its own test |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-8784](https://issues.apache.org/jira/browse/HDDS-8784) | Move RocksDB compaction out of disk checker |  Major | . | Ethan Rose | GuoHao |
| [HDDS-11137](https://issues.apache.org/jira/browse/HDDS-11137) | Remove the locks from SnapshotPurge and SnapshotSetProperty APIs |  Major | OM | Hemant Kumar | Hemant Kumar |
| [HDDS-11184](https://issues.apache.org/jira/browse/HDDS-11184) | [hsync] Add a client config to limit write concurrency on the same key |  Major | Ozone Client | Siyao Meng | Siyao Meng |
| [HDDS-11155](https://issues.apache.org/jira/browse/HDDS-11155) | Recon Improve Volumes Page UI |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11322](https://issues.apache.org/jira/browse/HDDS-11322) | [hsync] Block ECKeyOutputStream from calling hsync and hflush |  Major | Ozone Client | Siyao Meng | Siyao Meng |
| [HDDS-10904](https://issues.apache.org/jira/browse/HDDS-10904) | [hsync] Enable PutBlock piggybacking and incremental chunk list by default |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-11284](https://issues.apache.org/jira/browse/HDDS-11284) | non-blocking quota repair while upgrade |  Major | . | Sumit Agrawal | Sumit Agrawal |
| [HDDS-9761](https://issues.apache.org/jira/browse/HDDS-9761) | Intermittent failure in TestOzoneManagerHAWithStoppedNodes due to OMLeaderNotReadyException |  Minor | test | Attila Doroszlai | Raju Balpande |
| [HDDS-11239](https://issues.apache.org/jira/browse/HDDS-11239) | Flakiness in KeyOutputStream exception handling |  Blocker | . | Duong | Duong |
| [HDDS-11208](https://issues.apache.org/jira/browse/HDDS-11208) | Change RatisBlockOutputStream to use HDDS-11174 |  Major | Ozone Client | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-9198](https://issues.apache.org/jira/browse/HDDS-9198) | Snapshot purge should be a atomic operation |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-11190](https://issues.apache.org/jira/browse/HDDS-11190) | Add --fields filter option to ozone debug ldb scan |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-11216](https://issues.apache.org/jira/browse/HDDS-11216) | Replace HAUtils#buildCAX509List usages with other direct usages |  Major | . | Szabolcs Gál | Szabolcs Gál |
| [HDDS-11325](https://issues.apache.org/jira/browse/HDDS-11325) | Intermittent failure in TestBlockOutputStreamWithFailures#testContainerClose |  Major | test | Attila Doroszlai | Wei-Chiu Chuang |
| [HDDS-11164](https://issues.apache.org/jira/browse/HDDS-11164) | [UI] Improve Sidebar/Navbar UI |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11359](https://issues.apache.org/jira/browse/HDDS-11359) | Intermittent timeout in TestPipelineManagerMXBean#testPipelineInfo |  Major | . | Ethan Rose | Chung En Lee |
| [HDDS-11392](https://issues.apache.org/jira/browse/HDDS-11392) | ChecksumByteBufferImpl's static initializer fails with java 17+ |  Major | . | István Fajth | István Fajth |
| [HDDS-11156](https://issues.apache.org/jira/browse/HDDS-11156) | [UI] Improve Buckets Page UI |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11390](https://issues.apache.org/jira/browse/HDDS-11390) | [hsync] Remove hsync and hflush capability check in ContentGenerator |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-11407](https://issues.apache.org/jira/browse/HDDS-11407) | Use OMLayoutFeature.HBASE\_SUPPORT for HSYNC |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-11312](https://issues.apache.org/jira/browse/HDDS-11312) | [hsync] Add upgrade tests |  Major | . | Wei-Chiu Chuang | Hemant Kumar |
| [HDDS-11285](https://issues.apache.org/jira/browse/HDDS-11285) | cli to trigger quota repair and status |  Major | . | Sumit Agrawal | Sumit Agrawal |
| [HDDS-11342](https://issues.apache.org/jira/browse/HDDS-11342) | [hsync] Add a config as HBase-related features master switch |  Major | . | Siyao Meng | Siyao Meng |
| [HDDS-11369](https://issues.apache.org/jira/browse/HDDS-11369) | [hsync] Remove KeyOutputStreamSemaphore logs |  Trivial | . | Wei-Chiu Chuang | Chung En Lee |
| [HDDS-11416](https://issues.apache.org/jira/browse/HDDS-11416) | Ratis submit request refactor avoid code duplicate |  Major | . | Sumit Agrawal | Sumit Agrawal |
| [HDDS-11453](https://issues.apache.org/jira/browse/HDDS-11453) | OmSnapshotPurge should be in a different ozone manager double buffer batch |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11440](https://issues.apache.org/jira/browse/HDDS-11440) | Add a lastTransactionInfo field in SnapshotInfo to check for transactions in flight on the snapshot |  Major | Ozone Manager | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-10479](https://issues.apache.org/jira/browse/HDDS-10479) | Fix RaftPeerId generated by command of "raftMetaConf" to use real PeerId |  Major | . | Dave Teng | Sarveksha Yeshavantha Raju |
| [HDDS-11354](https://issues.apache.org/jira/browse/HDDS-11354) | Intermittent failure in TestOzoneManagerSnapshotAcl#testLookupKeyWithNotAllowedUserForPrefixAcl |  Major | . | Ethan Rose | Chung En Lee |
| [HDDS-10617](https://issues.apache.org/jira/browse/HDDS-10617) | Unexpected number of files in ITestS3AContractGetFileStatusV1List |  Major | S3 | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11458](https://issues.apache.org/jira/browse/HDDS-11458) | Selective checks: trigger checkstyle for properties file changes |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11411](https://issues.apache.org/jira/browse/HDDS-11411) | Snapshot garbage collection should not run when the keys are moved from a deleted snapshot to the next snapshot in the chain |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11408](https://issues.apache.org/jira/browse/HDDS-11408) | Snapshot rename table entries are propagated incorrectly on snapshot deletes |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11423](https://issues.apache.org/jira/browse/HDDS-11423) | Implement equals operation for --filter option to ozone ldb scan |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-11491](https://issues.apache.org/jira/browse/HDDS-11491) | DirectoryDeletion task ignored via ratis |  Major | OM | Sumit Agrawal | Sumit Agrawal |
| [HDDS-11162](https://issues.apache.org/jira/browse/HDDS-11162) | [UI] Improve Disk Usage Page UI |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11127](https://issues.apache.org/jira/browse/HDDS-11127) | [hsync] Improve test coverage for XceiverClientRatis.java |  Major | . | Wei-Chiu Chuang | Chung En Lee |
| [HDDS-11492](https://issues.apache.org/jira/browse/HDDS-11492) | Directory deletion get stuck having millions of directory |  Major | . | Sumit Agrawal | Sumit Agrawal |
| [HDDS-11046](https://issues.apache.org/jira/browse/HDDS-11046) | Coverage decreased due to running tests with Java 17 |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11536](https://issues.apache.org/jira/browse/HDDS-11536) | Bump macOS runner version to macos-13 |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11476](https://issues.apache.org/jira/browse/HDDS-11476) | Implement lesser/greater operation for --filter option of ldb scan command |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-11159](https://issues.apache.org/jira/browse/HDDS-11159) | [UI] Improve Containers Page UI |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-8188](https://issues.apache.org/jira/browse/HDDS-8188) | Support max allowed length in response of ozone admin container list |  Major | . | Ethan Rose | Sarveksha Yeshavantha Raju |
| [HDDS-11546](https://issues.apache.org/jira/browse/HDDS-11546) | Implement regex matching operation for --filter option of ldb scan command |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-10377](https://issues.apache.org/jira/browse/HDDS-10377) | Allow datanodes to do chunk level modifications to closed containers |  Major | . | Ritesh Shukla | Aswin Shakil |
| [HDDS-11545](https://issues.apache.org/jira/browse/HDDS-11545) | [UI] Add OM and SCM ID information |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11205](https://issues.apache.org/jira/browse/HDDS-11205) | Implement a search feature for users to locate keys pending Deletion within the OM Deleted Keys Insights section. |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11600](https://issues.apache.org/jira/browse/HDDS-11600) | Intermittent failure in repro due to ordering differences in builddef.lst |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11160](https://issues.apache.org/jira/browse/HDDS-11160) | [UI] Improve Insights Page UI |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11161](https://issues.apache.org/jira/browse/HDDS-11161) | [UI] Improve OM DB Insights Page UI |  Major | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11507](https://issues.apache.org/jira/browse/HDDS-11507) | ServiceException is not logged when OM delete submission to Ratis fails |  Major | OM | Ethan Rose | Abhishek Pal |
| [HDDS-11601](https://issues.apache.org/jira/browse/HDDS-11601) | Intermittent failure in EC balancer acceptance test |  Major | test | Attila Doroszlai | Daniil |
| [HDDS-11621](https://issues.apache.org/jira/browse/HDDS-11621) | Fix missing HADOOP\_ variables in MR acceptance test |  Minor | docker-compose | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11637](https://issues.apache.org/jira/browse/HDDS-11637) | Compile failure is ignored in build check |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11622](https://issues.apache.org/jira/browse/HDDS-11622) | Support domain socket creation |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-11609](https://issues.apache.org/jira/browse/HDDS-11609) | [UI] Switch to v2 UI as the default and make v1 optional |  Major | . | Abhishek Pal | Abhishek Pal |
| [HDDS-11664](https://issues.apache.org/jira/browse/HDDS-11664) | Hadoop download failure not reported as error |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9781](https://issues.apache.org/jira/browse/HDDS-9781) | Revisit RocksDB configs when creating OMMetadataManager for bootstrapping code |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-11689](https://issues.apache.org/jira/browse/HDDS-11689) | Extract scheduled workflow for populate-cache |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11692](https://issues.apache.org/jira/browse/HDDS-11692) | Skip spotbugs for modules with only generated code |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11705](https://issues.apache.org/jira/browse/HDDS-11705) | Snapshot operations on linked buckets should work on actual underlying bucket |  Critical | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11740](https://issues.apache.org/jira/browse/HDDS-11740) | Add debug command to show internal component versions |  Minor | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11713](https://issues.apache.org/jira/browse/HDDS-11713) | Use seek to reach the start transaction instead of looping table having millions of record |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-11702](https://issues.apache.org/jira/browse/HDDS-11702) | Merge test\_bucket\_encryption into robot compatibility test |  Minor | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11796](https://issues.apache.org/jira/browse/HDDS-11796) | Update documentation to mention that container schemaV3 is default |  Major | . | Tejaskriya Madhan | Tejaskriya Madhan |
| [HDDS-11704](https://issues.apache.org/jira/browse/HDDS-11704) | Hadoop test leaves running containers in case of failure |  Major | docker-compose | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11561](https://issues.apache.org/jira/browse/HDDS-11561) | Refactor Open Key Search Endpoint and Consolidate with OmDBInsightEndpoint Using StartPrefix Parameter |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-11718](https://issues.apache.org/jira/browse/HDDS-11718) | Some CI checks passing despite error |  Critical | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11687](https://issues.apache.org/jira/browse/HDDS-11687) | Robot warning: replace "is not" with "!=" |  Trivial | test | Attila Doroszlai | Nandakumar |
| [HDDS-11266](https://issues.apache.org/jira/browse/HDDS-11266) | [1.4.1]Add proto.lock files from ozone-1.4 release branch to 1.4.1 |  Major | . | ChenXi | ChenXi |
| [HDDS-11833](https://issues.apache.org/jira/browse/HDDS-11833) | Return NotImplemented for S3 put-object-acl request |  Major | S3, s3gateway | Ivan Andika | Ivan Andika |
| [HDDS-11826](https://issues.apache.org/jira/browse/HDDS-11826) | Interactive mode for ozone shell |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11851](https://issues.apache.org/jira/browse/HDDS-11851) | Finer-grained subcommand interface for OzoneDebug and OzoneRepair |  Major | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11830](https://issues.apache.org/jira/browse/HDDS-11830) | Subcommands should not extend GenericCli |  Minor | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11877](https://issues.apache.org/jira/browse/HDDS-11877) | Restore Maven cache for more checks |  Blocker | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11691](https://issues.apache.org/jira/browse/HDDS-11691) | Support object tags in ObjectEndpointStreaming#put |  Major | s3gateway | Ivan Andika | Ivan Andika |
| [HDDS-11605](https://issues.apache.org/jira/browse/HDDS-11605) | Directory deletion service should support multiple threads |  Major | . | Aryan Gupta | Aryan Gupta |
| [HDDS-8101](https://issues.apache.org/jira/browse/HDDS-8101) | Add FSO repair tool to ozone CLI in read-only and repair modes |  Major | Tools | Ethan Rose | Sarveksha Yeshavantha Raju |
| [HDDS-11909](https://issues.apache.org/jira/browse/HDDS-11909) | Intermittent timeout building Hadoop in s3a test |  Major | CI, test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11893](https://issues.apache.org/jira/browse/HDDS-11893) | Fix full snapshot diff fallback logic because of DAG pruning |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11908](https://issues.apache.org/jira/browse/HDDS-11908) | Snapshot diff DAG traversal should not skip node based on prefix presence |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11914](https://issues.apache.org/jira/browse/HDDS-11914) | Snapshot diff should not filter SST Files based by reading SST file reader |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11927](https://issues.apache.org/jira/browse/HDDS-11927) | Intermittent failure in TestContainerBalancerStatusInfo |  Major | test | Attila Doroszlai | Alex Juncevich |
| [HDDS-11906](https://issues.apache.org/jira/browse/HDDS-11906) | Add sortpom dependency, sort root POM |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11712](https://issues.apache.org/jira/browse/HDDS-11712) | Iterate whole scm delete block table in SCMBlockDeletingService before retrying the same transaction again |  Major | . | Ashish Kumar | Ashish Kumar |
| [HDDS-11711](https://issues.apache.org/jira/browse/HDDS-11711) | Add metrics in SCM to print number of delete command sent and response received per datanode |  Major | . | Ashish Kumar | Tejaskriya Madhan |
| [HDDS-11779](https://issues.apache.org/jira/browse/HDDS-11779) | Improve DN metrics to show delete progress/command process |  Major | . | Ashish Kumar | Tejaskriya Madhan |
| [HDDS-11509](https://issues.apache.org/jira/browse/HDDS-11509) | Logging improvements for deletion services |  Major | OM, Ozone Datanode, SCM | Ethan Rose | Tejaskriya Madhan |
| [HDDS-11870](https://issues.apache.org/jira/browse/HDDS-11870) | Fix TestHSync overwrite cases for OM Ratis enabled |  Major | test | Attila Doroszlai | Chia-Chuan Yu |
| [HDDS-11878](https://issues.apache.org/jira/browse/HDDS-11878) | Use CommandSpec to find top-level command |  Major | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11997](https://issues.apache.org/jira/browse/HDDS-11997) | Duplicate snapshot purge request causes NPE |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11880](https://issues.apache.org/jira/browse/HDDS-11880) | Intermediate subcommands do not need to implement Callable |  Major | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-9791](https://issues.apache.org/jira/browse/HDDS-9791) | [Recon][UI][Test] Add tests for Datanodes Page |  Major | . | Abhishek Pal | Abhishek Pal |
| [HDDS-11951](https://issues.apache.org/jira/browse/HDDS-11951) | Enable sortpom in hadoop-hdds  sub-modules : annotations, client, common & config. |  Major | . | Nandakumar | Nandakumar |
| [HDDS-8175](https://issues.apache.org/jira/browse/HDDS-8175) | getFileChecksum() throws exception in debug mode |  Trivial | . | Wei-Chiu Chuang | Chia-Chuan Yu |
| [HDDS-12001](https://issues.apache.org/jira/browse/HDDS-12001) | Create parent class for repair tools |  Major | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11801](https://issues.apache.org/jira/browse/HDDS-11801) | Logs missing if kubernetes check fails before tests |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11864](https://issues.apache.org/jira/browse/HDDS-11864) | Remove config from OM for disabling Ratis |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12011](https://issues.apache.org/jira/browse/HDDS-12011) | Show PID of running service |  Minor | Tools | Attila Doroszlai | Sarveksha Yeshavantha Raju |
| [HDDS-11991](https://issues.apache.org/jira/browse/HDDS-11991) | Use picocli built-in for missing subcommand of GenericCli |  Major | Ozone CLI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12009](https://issues.apache.org/jira/browse/HDDS-12009) | Merge FSORepairTool and FSORepairCLI |  Major | Tools | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11989](https://issues.apache.org/jira/browse/HDDS-11989) | Enable SCM Ratis in tests related to DeletedBlockLog |  Major | test | Chung En Lee | Chung En Lee |
| [HDDS-11511](https://issues.apache.org/jira/browse/HDDS-11511) | OM deletion services should have consistent metrics |  Major | . | Ethan Rose | Tejaskriya Madhan |
| [HDDS-12028](https://issues.apache.org/jira/browse/HDDS-12028) | HTTP header matching should be case insensitive |  Major | . | Rishabh Patel | Rishabh Patel |
| [HDDS-11959](https://issues.apache.org/jira/browse/HDDS-11959) | Remove tests for non-Ratis SCM |  Major | test | Attila Doroszlai | Chung En Lee |
| [HDDS-12007](https://issues.apache.org/jira/browse/HDDS-12007) | BlockDataStreamOutput should only send one PutBlock during close |  Major | Ozone Datanode | Ivan Andika | Tsz-wo Sze |
| [HDDS-12038](https://issues.apache.org/jira/browse/HDDS-12038) | Bump maven-remote-resources-plugin to 3.3.0 |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12012](https://issues.apache.org/jira/browse/HDDS-12012) | Defer ozone repair prompt after subcommand validation |  Major | Tools | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12074](https://issues.apache.org/jira/browse/HDDS-12074) | Enable sortpom in ozone-insight, s3-secret-store, s3gateway and tools |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12082](https://issues.apache.org/jira/browse/HDDS-12082) | CI checks fail with Maven 3.9.9 |  Blocker | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12092](https://issues.apache.org/jira/browse/HDDS-12092) | Enable sortpom in Recon |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12104](https://issues.apache.org/jira/browse/HDDS-12104) | Enable sortpom in ozonefs modules |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12107](https://issues.apache.org/jira/browse/HDDS-12107) | Enable sortpom in ozone-dist and ozone-interface modules |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12030](https://issues.apache.org/jira/browse/HDDS-12030) | Update SCM-HA.zh.md |  Major | . | Nandakumar | Wei-Chiu Chuang |
| [HDDS-12075](https://issues.apache.org/jira/browse/HDDS-12075) | Ozone debug read-replicas command fails when there is a slash character in key names |  Major | . | Rishabh Patel | Rishabh Patel |
| [HDDS-11627](https://issues.apache.org/jira/browse/HDDS-11627) | Support getBlock operation on short-circuit channel |  Major | . | Sammi Chen | Sammi Chen |
| [HDDS-12089](https://issues.apache.org/jira/browse/HDDS-12089) | Move execute\_debug\_tests out of testlib.sh |  Minor | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12032](https://issues.apache.org/jira/browse/HDDS-12032) | Remove DefaultConfigManager from SCM |  Major | SCM HA | Nandakumar | Nandakumar |
| [HDDS-12139](https://issues.apache.org/jira/browse/HDDS-12139) | Reduce duplication in TestSnapshotChainRepair |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12140](https://issues.apache.org/jira/browse/HDDS-12140) | Replace leftover rebot in k8s/examples/test-all.sh |  Major | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12147](https://issues.apache.org/jira/browse/HDDS-12147) | Remove server dependencies from hdds-tools |  Minor | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12010](https://issues.apache.org/jira/browse/HDDS-12010) | Refactor check for running service in ozone repair |  Major | Tools | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12155](https://issues.apache.org/jira/browse/HDDS-12155) | Create new submodule for ozone shell |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12176](https://issues.apache.org/jira/browse/HDDS-12176) | Trivial dependency cleanup |  Trivial | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12186](https://issues.apache.org/jira/browse/HDDS-12186) | Avoid array allocation for table iterator |  Major | common | Attila Doroszlai | Sadanand Shenoy |
| [HDDS-11714](https://issues.apache.org/jira/browse/HDDS-11714) | resetDeletedBlockRetryCount with --all may fail and can cause long db lock in large cluster |  Major | . | Ashish Kumar | Aryan Gupta |
| [HDDS-11442](https://issues.apache.org/jira/browse/HDDS-11442) | Dashboard for memory consumption metrics |  Minor | Ozone Dashboards | Ren Koike | Ren Koike |
| [HDDS-12217](https://issues.apache.org/jira/browse/HDDS-12217) | Remove reference to FileUtil in hdds-common |  Major | common | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12033](https://issues.apache.org/jira/browse/HDDS-12033) | ScmHAUnfinalizedStateValidationAction can be remove as it's not used |  Major | . | Nandakumar | Wei-Chiu Chuang |
| [HDDS-11866](https://issues.apache.org/jira/browse/HDDS-11866) | Remove code paths for non-Ratis OM |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12232](https://issues.apache.org/jira/browse/HDDS-12232) | Move container from QUASI\_CLOSED to CLOSED only when SCM sees all 3 origin node replicas |  Major | . | Uma Maheswara Rao G | Stephen O'Donnell |
| [HDDS-12149](https://issues.apache.org/jira/browse/HDDS-12149) | Do not require dependency-convergence |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12292](https://issues.apache.org/jira/browse/HDDS-12292) | Change log level in SCMNodeManager#getNodesByAddress to debug |  Major | SCM | Nandakumar | Nandakumar |
| [HDDS-12192](https://issues.apache.org/jira/browse/HDDS-12192) | Fix TestOzoneShellHA and extract set-bucket-encryption test case |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12290](https://issues.apache.org/jira/browse/HDDS-12290) | Move custom logic from ci.yml into the check scripts |  Minor | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12302](https://issues.apache.org/jira/browse/HDDS-12302) | Fix parameter number warning in SignatureInfo |  Major | s3gateway | Peter Lee | Peter Lee |
| [HDDS-12309](https://issues.apache.org/jira/browse/HDDS-12309) | Intermittent failure in TestCloseContainerCommandHandler.testThreadPoolPoolSize |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12178](https://issues.apache.org/jira/browse/HDDS-12178) | Expand transitive test dependencies |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12031](https://issues.apache.org/jira/browse/HDDS-12031) | Enable Ratis by default on an upgraded cluster during SCM start-up |  Major | SCM HA | Nandakumar | Nandakumar |
| [HDDS-12161](https://issues.apache.org/jira/browse/HDDS-12161) | Remove code paths for non-Ratis OM in request/response |  Major | Ozone Manager | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12253](https://issues.apache.org/jira/browse/HDDS-12253) | Fix checkstyle for hadoop-hdds/annotations module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12260](https://issues.apache.org/jira/browse/HDDS-12260) | Fix checkstyle for hadoop-hdds/erasurecode module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12262](https://issues.apache.org/jira/browse/HDDS-12262) | Fix checkstyle for hadoop-hdds/managed-rocksdb module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12263](https://issues.apache.org/jira/browse/HDDS-12263) | Fix checkstyle for hadoop-hdds/rocks-native module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12264](https://issues.apache.org/jira/browse/HDDS-12264) | Fix checkstyle for hadoop-hdds/rocksdb-checkpoint-differ module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12326](https://issues.apache.org/jira/browse/HDDS-12326) | Allow Quasi\_Closed to Closed if there is an unhealthy replica \<= highest BCSID |  Major | SCM | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-12311](https://issues.apache.org/jira/browse/HDDS-12311) | flaky-test-check splits exit code is always 1 |  Minor | CI | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12257](https://issues.apache.org/jira/browse/HDDS-12257) | Fix checkstyle for hadoop-hdds/common module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12261](https://issues.apache.org/jira/browse/HDDS-12261) | Fix checkstyle for hadoop-hdds/framework module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12259](https://issues.apache.org/jira/browse/HDDS-12259) | Fix checkstyle for hadoop-hdds/container-service module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12266](https://issues.apache.org/jira/browse/HDDS-12266) | Fix checkstyle for hadoop-hdds/test-utils module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12265](https://issues.apache.org/jira/browse/HDDS-12265) | Fix checkstyle for hadoop-hdds/server-scm module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12267](https://issues.apache.org/jira/browse/HDDS-12267) | Fix checkstyle for hadoop-hdds/tools module |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12268](https://issues.apache.org/jira/browse/HDDS-12268) | Fix checkstyle for hadoop-ozone/cli-shell |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12269](https://issues.apache.org/jira/browse/HDDS-12269) | Fix checkstyle for hadoop-ozone/client |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12270](https://issues.apache.org/jira/browse/HDDS-12270) | Fix checkstyle for hadoop-ozone/common |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12271](https://issues.apache.org/jira/browse/HDDS-12271) | Fix checkstyle for hadoop-ozone/csi |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12272](https://issues.apache.org/jira/browse/HDDS-12272) | Fix license headers and imports for mini-chaos-tests. |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12273](https://issues.apache.org/jira/browse/HDDS-12273) | Fix checkstyle for hadoop-ozone/httpfsgateway |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12274](https://issues.apache.org/jira/browse/HDDS-12274) | Fix checkstyle for hadoop-ozone/insight |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12276](https://issues.apache.org/jira/browse/HDDS-12276) | Fix checkstyle for hadoop-ozone/interface-storage |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12277](https://issues.apache.org/jira/browse/HDDS-12277) | Fix checkstyle for hadoop-ozone/ozone-manager |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12278](https://issues.apache.org/jira/browse/HDDS-12278) | Fix checkstyle for hadoop-ozone/ozonefs |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12279](https://issues.apache.org/jira/browse/HDDS-12279) | Fix checkstyle for hadoop-ozone/ozonefs-common |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12280](https://issues.apache.org/jira/browse/HDDS-12280) | Fix checkstyle for hadoop-ozone/ozonefs-hadoop2 |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12282](https://issues.apache.org/jira/browse/HDDS-12282) | Fix checkstyle for hadoop-ozone/recon |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12285](https://issues.apache.org/jira/browse/HDDS-12285) | Fix checkstyle for hadoop-ozone/s3gateway |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12281](https://issues.apache.org/jira/browse/HDDS-12281) | Fix checkstyle for hadoop-ozone/ozonefs-hadoop3 |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12283](https://issues.apache.org/jira/browse/HDDS-12283) | Fix checkstyle for hadoop-ozone/recon-codegen |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12275](https://issues.apache.org/jira/browse/HDDS-12275) | Fix checkstyle for hadoop-ozone/integration-test |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12284](https://issues.apache.org/jira/browse/HDDS-12284) | Fix checkstyle for hadoop-ozone/s3-secret-store |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12286](https://issues.apache.org/jira/browse/HDDS-12286) | Fix checkstyle for hadoop-ozone/tools |  Major | build | Ivan Zlenko | Ivan Zlenko |
| [HDDS-12343](https://issues.apache.org/jira/browse/HDDS-12343) | Fix spotbugs warnings in Recon |  Major | Ozone Recon | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12362](https://issues.apache.org/jira/browse/HDDS-12362) | Remove file with excludes |  Major | . | Ivan Zlenko | Ivan Zlenko |
| [HDDS-11867](https://issues.apache.org/jira/browse/HDDS-11867) | Remove code paths for non-Ratis SCM |  Major | . | Attila Doroszlai | Nandakumar |
| [HDDS-12375](https://issues.apache.org/jira/browse/HDDS-12375) | Random object created and used only once |  Major | . | Peter Lee | Peter Lee |
| [HDDS-12349](https://issues.apache.org/jira/browse/HDDS-12349) | Speed up hdds integration tests |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12185](https://issues.apache.org/jira/browse/HDDS-12185) | Enhance FileSizeCountTask for Faster Processing |  Major | . | Arafat Khan | Arafat Khan |
| [HDDS-10764](https://issues.apache.org/jira/browse/HDDS-10764) | Tarball creation failing on leader OM node |  Major | . | Hemant Kumar | Sadanand Shenoy |
| [HDDS-12353](https://issues.apache.org/jira/browse/HDDS-12353) | Move SpaceUsage implementations to hdds-server-framework |  Major | common | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12381](https://issues.apache.org/jira/browse/HDDS-12381) | Fix spotbugs warnings in TestHddsUtils |  Major | . | Attila Doroszlai | Peter Lee |
| [HDDS-12388](https://issues.apache.org/jira/browse/HDDS-12388) | Key rewrite tests should be skipped if feature is disabled |  Major | test | Attila Doroszlai | Chia-Chuan Yu |
| [HDDS-9792](https://issues.apache.org/jira/browse/HDDS-9792) | [Recon][UI][Test] Add tests for Pipelines page |  Major | . | Abhishek Pal | Abhishek Pal |
| [HDDS-12380](https://issues.apache.org/jira/browse/HDDS-12380) | Fix spotbugs warnings in hdds-container-service |  Major | . | Attila Doroszlai | Peter Lee |
| [HDDS-12344](https://issues.apache.org/jira/browse/HDDS-12344) | Fix spotbugs warnings in ozone-manager |  Major | Ozone Manager | Attila Doroszlai | Peter Lee |
| [HDDS-12382](https://issues.apache.org/jira/browse/HDDS-12382) | Fix other spotbugs warnings |  Major | . | Attila Doroszlai | Peter Lee |
| [HDDS-12150](https://issues.apache.org/jira/browse/HDDS-12150) | Abnormal container states should not crash the SCM ContainerReportHandler thread |  Critical | SCM | Siyao Meng | Siyao Meng |
| [HDDS-12443](https://issues.apache.org/jira/browse/HDDS-12443) | Intermittent failure in TestContainerBalancerSubCommand |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12448](https://issues.apache.org/jira/browse/HDDS-12448) | Avoid using Jackson1 |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12376](https://issues.apache.org/jira/browse/HDDS-12376) | Remove scmRatisEnabled from ScmInfo |  Major | . | Nandakumar | Nandakumar |
| [HDDS-12193](https://issues.apache.org/jira/browse/HDDS-12193) | Metric timer task is blocking installSnapshotFromLeader on follower node |  Major | . | Hemant Kumar | Saketa Chalamchala |
| [HDDS-12210](https://issues.apache.org/jira/browse/HDDS-12210) | Tarball creation failing with FileNotFoundException |  Major | . | Hemant Kumar | Hemant Kumar |
| [HDDS-12428](https://issues.apache.org/jira/browse/HDDS-12428) | Avoid force closing OPEN/CLOSING replica of a CLOSED Container |  Major | . | Nandakumar | Swaminathan Balachandran |
| [HDDS-12354](https://issues.apache.org/jira/browse/HDDS-12354) | Move Storage and UpgradeFinalizer to hdds-server-framework |  Minor | common | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12236](https://issues.apache.org/jira/browse/HDDS-12236) | ContainerStateMachine should not apply future transactions in the event of failure |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-12489](https://issues.apache.org/jira/browse/HDDS-12489) | Intermittent timeout in TestSCMContainerManagerMetrics.testReportProcessingMetrics |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12488](https://issues.apache.org/jira/browse/HDDS-12488) | S3G should handle the signature calculation with trailers |  Major | . | Ivan Andika | Ivan Andika |
| [HDDS-12435](https://issues.apache.org/jira/browse/HDDS-12435) | [DiskBalancer] Add success move count and fail move count in status report |  Major | . | Sammi Chen | Gargi Jaiswal |
| [HDDS-12383](https://issues.apache.org/jira/browse/HDDS-12383) | Fix spotbugs warnings in prod |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12483](https://issues.apache.org/jira/browse/HDDS-12483) | Quasi Closed Stuck should have 2 replicas of each origin |  Major | SCM | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-12552](https://issues.apache.org/jira/browse/HDDS-12552) | Fix raw use of generic class SCMCommand |  Major | . | Nandakumar | Nandakumar |
| [HDDS-12420](https://issues.apache.org/jira/browse/HDDS-12420) | Move FinalizeUpgradeCommandUtil to hdds-common |  Major | upgrade | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12469](https://issues.apache.org/jira/browse/HDDS-12469) | fail fast for write block stuck |  Major | Ozone Datanode | Sumit Agrawal | Sumit Agrawal |
| [HDDS-12535](https://issues.apache.org/jira/browse/HDDS-12535) | Intermittent failure in TestContainerReportHandling |  Major | test | Attila Doroszlai | Peter Lee |
| [HDDS-12097](https://issues.apache.org/jira/browse/HDDS-12097) | Enhance Container Key Mapper for Faster Processing |  Major | Ozone Recon | Arafat Khan | Arafat Khan |
| [HDDS-12566](https://issues.apache.org/jira/browse/HDDS-12566) | Handle Over replication of Quasi Closed Stuck containers |  Major | SCM | Stephen O'Donnell | Stephen O'Donnell |
| [HDDS-12551](https://issues.apache.org/jira/browse/HDDS-12551) | Replace dnsToUuidMap with dnsToDnIdMap in SCMNodeManager |  Major | SCM | Nandakumar | Chia-Chuan Yu |
| [HDDS-12602](https://issues.apache.org/jira/browse/HDDS-12602) | Intermittent failure in TestContainerStateMachine.testWriteFailure |  Major | . | Attila Doroszlai | Peter Lee |
| [HDDS-12617](https://issues.apache.org/jira/browse/HDDS-12617) | Use DatanodeID as keys in NodeStateMap |  Major | SCM | Tsz-wo Sze | Tsz-wo Sze |
| [HDDS-12327](https://issues.apache.org/jira/browse/HDDS-12327) | Restore non-HA (to HA) upgrade test |  Blocker | test | Attila Doroszlai | Chia-Chuan Yu |


### OTHER:

| JIRA | Summary | Priority | Component | Reporter | Contributor |
|:---- |:---- | :--- |:---- |:---- |:---- |
| [HDDS-10129](https://issues.apache.org/jira/browse/HDDS-10129) | Remove version management of doxia-core and doxia-site-renderer |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10192](https://issues.apache.org/jira/browse/HDDS-10192) | Verify container checksum after downloaded |  Major | . | Dave Teng | Dave Teng |
| [HDDS-10343](https://issues.apache.org/jira/browse/HDDS-10343) | Remove dependency on jsr305 |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10476](https://issues.apache.org/jira/browse/HDDS-10476) | Add metrics to monitor buckets state |  Major | OM | Ivan Zlenko | Ivan Zlenko |
| [HDDS-9085](https://issues.apache.org/jira/browse/HDDS-9085) | Recon Directories Pending for Deletion Inside OMDB Insight |  Major | . | smita | smita |
| [HDDS-10544](https://issues.apache.org/jira/browse/HDDS-10544) | Move LMAX Disruptor to runtime scope |  Trivial | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-10463](https://issues.apache.org/jira/browse/HDDS-10463) | Fail Datanode Maintenance early |  Major | SCM | Siddhant Sangwan | Tejaskriya Madhan |
| [HDDS-11228](https://issues.apache.org/jira/browse/HDDS-11228) | Ozone Recon HeatMap refactoring of code |  Major | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-11368](https://issues.apache.org/jira/browse/HDDS-11368) | Remove babel dependencies from Recon |  Blocker | Ozone Recon | Abhishek Pal | Abhishek Pal |
| [HDDS-11339](https://issues.apache.org/jira/browse/HDDS-11339) | Publishing hadoop metrics immediately in Prometheus sink fills up SinkQueue quickly |  Major | Ozone Manager, Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-11468](https://issues.apache.org/jira/browse/HDDS-11468) | [UI] DB sync button in Recon should allow users to click instead of being disabled when sync is ongoing |  Major | Ozone Recon | Arun Sarin | Abhishek Pal |
| [HDDS-11122](https://issues.apache.org/jira/browse/HDDS-11122) | Fix javadoc warnings |  Major | . | Attila Doroszlai | Daniil |
| [HDDS-11347](https://issues.apache.org/jira/browse/HDDS-11347) | Add rocks\_tools\_native lib check in Ozone CLI checknative subcommand |  Major | Ozone CLI | Siyao Meng | Siyao Meng |
| [HDDS-11329](https://issues.apache.org/jira/browse/HDDS-11329) | Update Ozone images to Rocky Linux-based runner |  Major | docker | Attila Doroszlai | Attila Doroszlai |
| [HDDS-11582](https://issues.apache.org/jira/browse/HDDS-11582) | Bump body-parser to 1.20.3 |  Major | Ozone Recon | Attila Doroszlai |  |
| [HDDS-11697](https://issues.apache.org/jira/browse/HDDS-11697) | Integrate Ozone Filesystem Implementation with Ozone ListStatusLight API |  Major | . | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11708](https://issues.apache.org/jira/browse/HDDS-11708) | Recon ListKeys API should return a proper http response status code if NSSummary rebuild is in progress. |  Minor | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-11650](https://issues.apache.org/jira/browse/HDDS-11650) | ContainerId list to track all containers created in a datanode |  Major | Ozone Datanode | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11667](https://issues.apache.org/jira/browse/HDDS-11667) | Validating DatanodeID on any request to the datanode |  Major | Ozone Datanode | Swaminathan Balachandran | Swaminathan Balachandran |
| [HDDS-11617](https://issues.apache.org/jira/browse/HDDS-11617) | Update hadoop to 3.4.1 |  Blocker | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-11773](https://issues.apache.org/jira/browse/HDDS-11773) | Frequent DataNode Ratis snapshotting |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-10469](https://issues.apache.org/jira/browse/HDDS-10469) | Ozone Manager should continue to work when S3 secret storage is unavailable |  Major | S3 | Kirill Sizov | Kirill Sizov |
| [HDDS-11949](https://issues.apache.org/jira/browse/HDDS-11949) | Ozone Recon - Update Recon OM Sync default configs and docker configs |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-12124](https://issues.apache.org/jira/browse/HDDS-12124) | Disable resource filtering for VI swap files |  Major | build | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12130](https://issues.apache.org/jira/browse/HDDS-12130) | Improve assertion compatibility with old Hadoop |  Major | test | Attila Doroszlai | Attila Doroszlai |
| [HDDS-5739](https://issues.apache.org/jira/browse/HDDS-5739) | Add a command line tool to read data from all block replicas for a key. |  Major | Ozone Client, Ozone Datanode | Aravindan Vijayan | Zita Dombi |
| [HDDS-12110](https://issues.apache.org/jira/browse/HDDS-12110) | Optimize memory overhead for OM background tasks |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-12062](https://issues.apache.org/jira/browse/HDDS-12062) | Recon - Error handling in NSSummaryTask to avoid data inconsistencies |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-12156](https://issues.apache.org/jira/browse/HDDS-12156) | Add container health task metrics in Recon |  Major | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-12456](https://issues.apache.org/jira/browse/HDDS-12456) | Avoid FileInputStream and FileOutputStream |  Major | . | Attila Doroszlai | Attila Doroszlai |
| [HDDS-12168](https://issues.apache.org/jira/browse/HDDS-12168) | Grafana dashboard - Show Cluster growth rate based on last X hours using promQL |  Major | Ozone Recon | Devesh Kumar Singh | Sreeja |
| [HDDS-12377](https://issues.apache.org/jira/browse/HDDS-12377) | Improve error handling of OM background tasks processing in case of abrupt crash of Recon |  Major | Ozone Recon | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-12576](https://issues.apache.org/jira/browse/HDDS-12576) | [Ozone 2.0] Update proto.lock files |  Major | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-12588](https://issues.apache.org/jira/browse/HDDS-12588) | Ozone Recon - Containers page has incorrect label for count for the number of blocks for various unhealthy states of containers |  Major | . | Devesh Kumar Singh | Devesh Kumar Singh |
| [HDDS-12684](https://issues.apache.org/jira/browse/HDDS-12684) | Update NOTICE and LICENSE file |  Blocker | . | Wei-Chiu Chuang | Wei-Chiu Chuang |
| [HDDS-1186](https://issues.apache.org/jira/browse/HDDS-1186) | Ozone S3 gateway (phase III) |  Major | S3 | Marton Elek |  |


