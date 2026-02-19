---
sidebar_label: CLI
---

# CLI

## ozone insight

Ozone insight is a swiss-army-knife tool for checking the current state of Ozone cluster. It can show logging, metrics and configuration for a particular component.

To check the available components use `ozone insight list`:

```shell
> ozone insight list

Available insight points:

  scm.node-manager                     SCM Datanode management related information.
  scm.replica-manager                  SCM closed container replication manager
  scm.event-queue                      Information about the internal async event delivery
  scm.protocol.block-location          SCM Block location protocol endpoint
  scm.protocol.container-location      SCM Container location protocol endpoint
  scm.protocol.security                SCM Block location protocol endpoint
  om.key-manager                       OM Key Manager
  om.protocol.client                   Ozone Manager RPC endpoint
  datanode.pipeline                    More information about one ratis datanode ring.
```  

### Configuration

`ozone insight config` can show configuration related to a specific component (supported only for selected components).

```shell
> ozone insight config scm.replica-manager

Configuration for `scm.replica-manager` (SCM closed container replication manager)

>>> hdds.scm.replication.thread.interval
       default: 300s
       current: 300s

There is a replication monitor thread running inside SCM which takes care of replicating the containers in the cluster. This property is used to configure the interval in which that thread runs.


>>> hdds.scm.replication.event.timeout
       default: 30m
       current: 30m

Timeout for the container replication/deletion commands sent  to datanodes. After this timeout the command will be retried.

```

### Metrics

`ozone insight metrics` can show metrics related to a specific component (supported only for selected components).

```shell
> ozone insight metrics scm.protocol.block-location
Metrics for `scm.protocol.block-location` (SCM Block location protocol endpoint)

RPC connections

  Open connections: 0
  Dropped connections: 0
  Received bytes: 1267
  Sent bytes: 2420


RPC queue

  RPC average queue time: 0.0
  RPC call queue length: 0


RPC performance

  RPC processing time average: 0.0
  Number of slow calls: 0


Message type counters

  Number of AllocateScmBlock: ???
  Number of DeleteScmKeyBlocks: ???
  Number of GetScmInfo: ???
  Number of SortDatanodes: ???
```

### Logs

`ozone insight logs` can connect to the required service and show the DEBUG/TRACE log related to one specific component. For example to display RPC message:

```shell
> ozone insight logs om.protocol.client

[OM] 2020-07-28 12:31:49,988 [DEBUG|org.apache.hadoop.ozone.protocolPB.OzoneManagerProtocolServerSideTranslatorPB|OzoneProtocolMessageDispatcher] OzoneProtocol ServiceList request is received
[OM] 2020-07-28 12:31:50,095 [DEBUG|org.apache.hadoop.ozone.protocolPB.OzoneManagerProtocolServerSideTranslatorPB|OzoneProtocolMessageDispatcher] OzoneProtocol CreateVolume request is received
```

Using `-v` flag the content of the protobuf message can also be displayed (TRACE level log):

```shell
> ozone insight logs -v om.protocol.client

[OM] 2020-07-28 12:33:28,463 [TRACE|org.apache.hadoop.ozone.protocolPB.OzoneManagerProtocolServerSideTranslatorPB|OzoneProtocolMessageDispatcher] [service=OzoneProtocol] [type=CreateVolume] request is received:
cmdType: CreateVolume
traceID: ""
clientId: "client-A31DF5C6ECF2"
createVolumeRequest {
  volumeInfo {
    adminName: "hadoop"
    ownerName: "hadoop"
    volume: "vol1"
    quotaInBytes: 1152921504606846976
    volumeAcls {
      type: USER
      name: "hadoop"
      rights: "200"
      aclScope: ACCESS
    }
    volumeAcls {
      type: GROUP
      name: "users"
      rights: "200"
      aclScope: ACCESS
    }
    creationTime: 1595939608460
    objectID: 0
    updateID: 0
    modificationTime: 0
  }
}

[OM] 2020-07-28 12:33:28,474 [TRACE|org.apache.hadoop.ozone.protocolPB.OzoneManagerProtocolServerSideTranslatorPB|OzoneProtocolMessageDispatcher] [service=OzoneProtocol] [type=CreateVolume] request is processed. Response:
cmdType: CreateVolume
traceID: ""
success: false
message: "Volume already exists"
status: VOLUME_ALREADY_EXISTS
```

:::warning
Under the hood `ozone insight` uses HTTP endpoints to retrieve the required information (`/conf`, `/prom` and `/logLevel` endpoints). It's not yet supported in secure environment.
:::
