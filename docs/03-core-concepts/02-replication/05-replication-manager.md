# Replication Manager

Replication Manager (RM) is a thread which runs inside the leader SCM daemon in an Ozone cluster. Its role is to periodically check the health of all the containers in the cluster, and take action for any containers which are not healthy. Often that action involves arranging for new replicas of the container to be created, but it can also involve closing the replicas, deleting empty replicas and so on.

## Architecture

The RM process is split into stages - one to check containers and identify those with problems and another to process the problem containers.

### Container Check Stage

The check phase runs periodically at 5 minute intervals. First it gathers a list of all containers on the cluster, and each container is passed through a chain of rules to identify if it has any problems. These rules are arranged in a similar way to the “Chain of Responsibility” design pattern, where the first rule which “matches” causes the chain to exit. Each type of check is implemented in a standalone Java class, and the checks are processed in a defined order:

```java
containerCheckChain = new OpenContainerHandler(this);
containerCheckChain
   .addNext(new ClosingContainerHandler(this, clock))
   .addNext(new QuasiClosedContainerHandler(this))
   .addNext(new MismatchedReplicasHandler(this))
   .addNext(new EmptyContainerHandler(this))
   .addNext(new DeletingContainerHandler(this))
   .addNext(ecReplicationCheckHandler)
   .addNext(ratisReplicationCheckHandler)
   .addNext(new ClosedWithUnhealthyReplicasHandler(this))
   .addNext(ecMisReplicationCheckHandler)
   .addNext(new RatisUnhealthyReplicationCheckHandler())
   .addNext(new VulnerableUnhealthyReplicasHandler(this));
```

## ReplicationManager Report

Each time the check phase of the Replication Manager runs, it generates a report which can be accessed via the command “ozone admin container report”. This report provides details of all containers in the cluster which have an issue to be corrected by the Replication Manager.

The output of the command looks as follows:

```text
# ozone admin container report
Container Summary Report generated at 2023-08-14T13:01:43Z
==========================================================


Container State Summary
=======================
OPEN: 10
CLOSING: 0
QUASI_CLOSED: 4
CLOSED: 95
DELETING: 0
DELETED: 298
RECOVERING: 0


Container Health Summary
========================
UNDER_REPLICATED: 69
MIS_REPLICATED: 0
OVER_REPLICATED: 0
MISSING: 11
UNHEALTHY: 0
EMPTY: 4
OPEN_UNHEALTHY: 0
QUASI_CLOSED_STUCK: 0


First 100 UNDER_REPLICATED containers:
#1001, #2003, #4001, #4002, #4004, #4005, #5002, #6006, #6009, #7003, #7006, #9004, #9006, #10002, #11001


First 100 MISSING containers:
#6010, #7004, #7005, #24002, #24003, #24004, #28001, #31001, #34003, #54001, #61003


First 100 EMPTY containers:
#52005, #54003, #55001, #55002
```

### Container State Summary

The first section of the report “Container State Summary” summarizes the state of all containers in the cluster. Containers can move through these states as they are opened, filled with block data and have data removed over time. A container should only be in one of these states at any time, and the sum of the containers in this section should equal the number of containers in the cluster. Each state is explored in the following sections.

#### Open

Open containers are available for writes into the cluster.

#### Closing

Closing containers are in the process of being closed. They will transition to closing when they have enough data to be considered full, or there is a problem with the write pipeline, such as a Datanode going down.

#### Quasi Closed

A container moves to quasi closed when a Datanode attempts to close the replica, but it was not able to close it cleanly due to the Ratis Pipeline being unavailable. This could happen if a Datanode goes down unexpectedly, for example. Replication Manager will attempt to close the container by identifying the replica with the highest Block Commit Sequence ID (BCSID) and close it. As replicas with older BCSID are stale, new copies will be made from the closed replica before removing the stale replicas.

#### Closed

Closed containers have successfully transitioned from closing to closed. This is a normal state for containers to move to, and the majority of containers in the cluster should be in this state.

#### Deleting

Containers which were closed and had all blocks deleted over time leaving them empty transition to deleting. The containers remain in this state until all the replicas have been removed from the Datanodes.

#### Deleted

When the “deleting” process completes and all replicas have been removed, the container will move to the deleted state and remain there.

#### Recovering

Recovering is a temporary state container replicas can go into on the Datanodes, and is related to EC reconstruction. The report should always have a count of zero for this state, as the state is not managed by the Replication Manager.

### Container Health Summary

The next section of the report lists the number of containers in various health states on the cluster. Note that a count of “healthy” containers is not presented, only degraded states.  In an otherwise healthy cluster, the Replication Manager should work to correct the state of any containers in the states listed, except for Missing and Unhealthy which it cannot repair.

#### Under Replicated

Under-Replicated containers have less than the number of expected replicas. This could be caused by decommissioning or maintenance mode transitions on the Datanode, or due to failed disks or failed nodes within the cluster. Unhealthy replicas also make a container under-replicated, as they have a problem which must be corrected. See the Unhealthy section below for more details on the unhealthy state. The Replication Manager will schedule commands to make additional copies of the under replicated containers.

#### Mis-Replicated

If the container has the correct number of replicas, but they are not spread across sufficient racks to meet the requirements of the container placement policy, the container is Mis-Replicated. Again, Replication Manager will work to move replicas to additional racks by making new copies of the relevant replicas and then removing the excess.

#### Over Replicated

Over Replicated containers have too many replicas. This could occur due to correcting mis-replication, or if a decommissioned or down host is returned to the cluster after the under replication has been corrected. Replication Manager will schedule delete replica commands to remove the excess replicas while maintaining the container placement policy rules around rack placement.

#### Missing

A container is missing if there are not enough replicas available to read it. For a Ratis container, that would mean zero copies are online. For an EC container, it is marked as missing if less than “data number” of replicas are available. Eg, for a RS-6-3 container, having less than 6 replicas online would render it missing. For missing containers, the Replication Manager cannot do anything to correct them. Manual intervention will be needed to bring lost nodes back into the cluster, or take steps to remove the containers from SCM and any related keys from OM, as the data will not be accessible.

#### Unhealthy

A container is unhealthy, if it is not missing and there are insufficient healthy replicas to allow the container to be read completely.

A replica can get marked as unhealthy by the scanner process on the Datanode for various reasons. For example, it can detect if a block in the container has an invalid checksum and mark the replica unhealthy. For a Ratis container, it will be marked as unhealthy if all its container replicas are unhealthy with no healthy replicas available. Note that it may be possible to read most of the data in an unhealthy container. For Ratis, each replica could have a different problem affecting a different block in each replica, for example a checksum violation on read. The Ozone client would catch the read error and try the read again from another replica. However data recovery will depend on the number and level of corruption, and whether the same blocks are corrupted in all replicas.

#### Unhealthy Ratis

A Ratis container with 3 replicas, Healthy, Healthy, Unhealthy is still fully readable and hence recoverable, so it will be marked as under replicated as the unhealthy replica needs to be replaced. A Ratis container with 3 Unhealthy replicas will be marked as unhealthy. It is not missing, as there are replicas available and it is not under-replicated as it has all 3 copies. A Ratis container with only 2 unhealthy replicas is both unhealthy and under replicated, and it will be marked as both Unhealthy and Under-Replicated. The Replication Manager will attempt to make an additional copy of the unhealthy container to resolve the under replication, but it will not be able to correct the unhealthy state without manual intervention, as there is no good copy to copy from.

#### Unhealthy EC

EC containers are similar. They are only marked unhealthy if they are not missing (at least data number of replicas available), but there isn’t at least “data number” of healthy replicas. See the following tables for examples:

| Index = 1 | Index = 2            | Index = 3 | Index = 4 | Index = 5 | State     |
| --------- | -------------------- | --------- | --------- | --------- | --------- |
| Healthy   | Healthy              | Healthy   | Unhealthy | Unhealthy | Under-Rep |
| Healthy   | Healthy              | Healthy   |           |           | Under-Rep |
| Healthy   | Healthy              | Unhealthy |           |           | Unhealthy |
| Healthy   | Healthy              |           |           |           | Missing   |
| Healthy   | Healthy + Unhealthy  |           |           |           | Missing and Over Replicated |
| Healthy   | Healthy + Unhealthy  | Healthy   |           |           | Under and Over Replicated |

Note it is possible for an EC container to be both Unhealthy and Over Replicated, as there may be two copies of the same index, one healthy and one unhealthy.

If a container is unhealthy, the Replication Manager will not be able to correct it without some manual intervention, as unhealthy replicas cannot be used in reconstruction. It may be possible to read much of the data from the container as an unhealthy container may only have a problem with a single block, but if there are legitimate corruptions in an unhealthy EC container it is likely at least some of the data is unreadable.

#### Empty

A container is marked as empty if it has been closed and then all data blocks stored in the container have been removed. When this is detected, the container transitions from CLOSED to DELETING and therefore containers should only stay in the Empty state until the next Replication Manager check stage.

#### Open Unhealthy

When a container is open, it is expected that all the replicas are also in the same open state. If a problem occurs, which causes a replica to move from the open state, the Replication Manager will mark the container as Open Unhealthy and trigger the close process. Normally such a container will have transitioned to Closing or Closed by the next Replication Manager check stage.

#### Quasi Closed Stuck

This is relevant only for Ratis containers. When a container is in the Quasi Closed state, the Replication Manager needs to wait for the majority of replicas (2 out of 3) to reach the Quasi Closed state before it can transition the container to closed. While this is not the case, the container will be marked as Quasi Closed Stuck.

#### Unhealthy Container Samples

To facilitate investigating problems with degraded containers, the report includes a sample of the first 100 container IDs in each state and includes them in the report. Given these IDs, it is possible to see if the same containers are continuously stuck, and also get more information about the container via the “ozone admin container info ID” command.

## Replication Task Throttling

To protect the cluster from being overloaded with replication tasks, it is important that a limited number of replication tasks run on the cluster at any time. The load on Datanodes can change over time and this will impact their speed at processing the tasks. In addition to throttling concurrent work, it is important the replication coordinator (SCM) does not queue too many tasks on Datanodes. If tasks are queued on a slow Datanode, then SCM cannot reschedule the task elsewhere until it times out. It is preferable to schedule the work on the Datanodes in smaller increments, with a goal of giving the Datanode enough work to keep it busy for a heartbeat duration.

Datanodes are given replication tasks in the response to their periodic heartbeat. Included in the heartbeat from the Datanode, is a report detailing the number of each type of command currently queued on the Datanode. Any commands queued on SCM in the “Datanode Command Queue” are sent to the Datanode in the heartbeat response, and the Datanode command count is stored in the SCM NodeManager. The command count stored in Node Manager is the sum of the count reported by the Datanode and the number of commands sent in the heartbeat response.

Replication Manager can use the stored command counts to limit the number of commands queued on a Datanode.

Replication Manager schedules 3 types of commands which must be throttled:

1. Replicate Container Commands - Used to correct Ratis under replication, both Ratis and EC mis-replication and to make extra copies of a container during decommission and maintenance for both Ratis and EC containers.
2. Delete Container Replica Commands - Used to resolve over replication and also to delete containers in unexpected states.
3. EC Reconstruction - These are the most expensive commands which are used to recover lost EC replicas.

The following sections will explore the throttling use for each of the major command types.

### Replicate Container Commands

In the Legacy Replication Manager, a replicate container command was sent to the node which will receive the new target, and the command would contain a list of available sources it can download from. When the under replicated containers were concentrated on a few source nodes, this resulted in commands running on lots of targets attempting to download from a limited number of sources at the same time, overloading them.

Now, the commands are sent to the source node and instructed to send the command to the new target. Normally, the target nodes are quite random, but in the case of decommission, and especially with EC containers on a decommissioning node, the sources can be concentrated on only a single or few nodes, so this tends to work better.

To balance and throttle the load of Replicate Commands on each Datanode, replication manager uses the current command count stored in Node Manager. Any source nodes which have too many commands scheduled are filtered out and those that remain are sorted based on the number of commands queued. The command is sent to the Datanode with the least commands queued.

If all sources have too many commands queued, the container cannot be replicated, and the command is requeued to be tried again later.

Note there are two types of replication commands - simple replication and EC Reconstruction. On the Datanode they share the same Datanode queue and worker thread pool, so it makes sense to have a single combined limit. As EC Reconstruction commands are more expensive to process than replication commands, they are given a weighting so that queuing one command counts 1 * weight to the limit. The default weight is currently 3.

#### The Balancer and Low Priority Commands

The Balancer process also sends replicate commands via the Replication Manager API to even out the space used on nodes across the cluster. The Balancer works using the concept of an iteration. It assesses the state of the cluster and decides which nodes are over and under utilized. Then it schedules a large number of move commands to move data from the overused nodes to underused nodes. These commands are scheduled on the Datanodes, initially as Replicate Container Commands, and as they complete as Delete Container Replica commands.

This can create a large number of commands on the Datanode queues and may also impact the more important replication of containers if some nodes go offline. To combat this, the Replicate Container Commands can be sent with two priorities - Normal and Low. The Balancer always sends Low priority Replicate Container commands, while Replication Manager always sends Normal priority commands. Low priority commands do not count toward the queue size reported in the Datanode heartbeat. If the Datanode has Normal priority commands queued, the Low priority commands will not be processed. That way, if there is a large amount of Balancer work scheduled, and some essential replication work is required, it will get priority.

The Balancer also schedules commands with a larger timeout, to give time for the large iteration of work to complete and also to cater for any higher priority commands which may slow its progress.

### Delete Container Replica Commands

Deleting a container is a less resource intensive operation than replicating a container, but as a container can have many small block files, it can still take a bit of time to run on a Datanode, and therefore should be throttled.

Depending on container placement, type and the placement policy, to resolve an over-replicated container a Delete Container Replica command may need to be sent to a specific Datanode or it could be sent to any node hosting a copy of the replica. For example, with EC, an over replicated container would indicate at least 2 copies of at least one replica index. In this case, the delete command could be sent to either replica, but container placement may restrict that to a single replica.

The delete container commands are throttled in much the same way as for Replicate Container Commands. When a delete command is attempted, the current command count is checked and if the Datanode is overloaded, another replica is tried or the container will be requeued and attempted again later.

#### The Balancer and Delete Commands

Unlike with Replication commands, there is no priority ordering for delete container replica commands, for several reasons:

1. Delete is less important than replication, as a delayed delete cannot result in data loss.
2. The balancer delete commands are triggered by the completion of a replicate command and this rate of completion naturally throttles the delete.
3. Delete commands are less resource intensive, and hence the Datanode should be able to deal with a large number quickly.

### EC Reconstruction Commands

EC Reconstruction commands are the most expensive commands scheduled on Datanodes. A reconstruction command will recover between 1 and EC scheme parity number replicas and read from EC scheme data number replicas.

For an EC 6-3 container, 6 Datanodes will be used as sources to read data from, while between 1 and 3 target Datanodes will receive the recovered data. One of the target Datanodes will also act as the coordinator and read from the sources, perform the EC reconstruction calculation and write the recovered data to a new local container and also to remote containers if there are multiple replicas being recovered.

The coordinator node will receive the command and the total number of commands queued on a Datanode can be throttled in the same way as before, using the command count queue in Node Manager. With replication commands, the command must be sent to an existing source, so the nodes which can receive the command are limited. With EC Reconstruction, the command is sent to a target, and the target is selected somewhat randomly from the spare nodes on the cluster.

For this reason it makes sense to track the nodes which have reached their command limit, and avoid selecting them as a target. This is achieved by updating an exclude list in the replication manager when the last schedule command reached the limit for that node. There is a callback which tells the replication manager the Datanode has heartbeat via replicationManager.DatanodeCommandCountUpdate() to remove nodes from the exclude list. At this time the exclude list is only used when selecting targets for reconstruction commands, not for replication commands.

EC Reconstruction commands share the same limits on the Datanodes as replication commands, but reconstruction commands are given a weighting (default 3 at the current time) as they are more expensive for the coordinator node to run.

#### Limitations of EC Reconstruction Throttling

For EC Reconstruction, there are many other nodes involved in a reconstruction command. The command coordinator will need to read from several sources and write to itself and possibly other nodes if more than one replica is being reconstructed. Limiting the number of commands queued on a given node may not provide sufficient throttling if many nodes are attempting EC reconstruction simultaneously.

For replication, the entire container must be tarred and sent in a single stream to a new target. EC will read a container block by block, more like a client reading from the cluster, therefore the read load it places on hosts is likely to be less intensive and spread over a longer period than replication, allowing more requests to be interleaved without performance problems.

EC container groups should also be larger than Ratis containers. The combined data size in a group can be up to 10 times larger than a Ratis container (EC-10-4), so there are likely to be fewer EC containers in a cluster for a given data size than Ratis, resulting in fewer reconstruction commands being required.

At the current time, the plan is to continue with the simple throttling as described above and monitor how well it works in practice. There will also be a global replication limit, as described before to limit the total number of inflight operations.

#### EC and Decommissioning

When a node hosting a Ratis container is decommissioned, there are generally 3 sources available for the container replicas. One on the decommissioning host, and then 2 others on somewhat random nodes across the cluster. This allows the decommissioning load and hence speed of decommission to be shared across many more nodes.

For an EC container, the decommissioning host is likely the only source of the replica which needs to be copied and hence the decommission will be slower.

A host which is decommissioning is generally not used for Ratis reads unless there are no other nodes available, but it would still be used for EC reads to avoid online reconstruction. As decommission progresses on the node, and new copies are formed, the read load will decline over time. Furthermore, decommissioning nodes are not used for writes, so they should be under less load than other cluster nodes.

Due to the reduced load on a decommissioning host, it is possible to increase the number of commands queued on a decommissioning host and also increase the size of the executor thread pool to process the commands.

When a Datanode switches to a decommissioning state, it will adjust the size of the replication supervisor thread pool higher, and if the node returns to the In Service state, it will return to the lower thread pool limit.

Similarly when scheduling commands, SCM can allocate more commands to the decommissioning host, as it should process them more quickly due to the lower load and increased thread pool.

### Global Replication Command Limit

As well as the above Datanode limits, it is possible to configure a global replication limit, limiting the number of inflight containers pending creation. A larger cluster would be capable of having more inflight replication than a smaller cluster, so the limit should be a function of the number of Datanodes on the cluster, and the limit of the number of commands which can be queued per Datanode and some weighting factor.

For example, if each Datanode can queue 20 replication commands, and there are 100 nodes in the cluster, then the natural limit is 20 * 100. However, that assumes that commands are queued evenly across all Datanodes, which is unlikely. With a global limit we would prefer that all Datanodes are not fully loaded with replication commands simultaneously, so we may want to impose a limit of half that number, with a factor of 0.5, eg 20 \* 100 \* 0.5 = 1k pending replications.

At one extreme this would result in all Datanodes in the cluster having half their maximum tasks queued, but in practice, some DNs are likely to be at their limit while others have zero or less than half queued.

If the limits were perfectly defined, such that in a single heartbeat a Datanode can complete all its queued work just at the end of the heartbeat interval, then reducing the number of queued commands by half would make the Datanode busy for only half its heartbeat interval. As the Datanodes will all heartbeat at different times, all the busy and non-work periods across all the Datanodes would combine in a load profile that would show some Datanodes are always idle, reducing the overall load on the cluster.

Datanodes have a queue limit, but they process the queue with a thread pool (default 10). So even if they have a queue of 20,10 would be running concurrently. Furthermore, if the queue is filled with EC Reconstruction commands, with weighting factor of 3, then the limit is ceil(20 / 3) which is 7, reducing the commands running in parallel when they are more expensive. Another way to reduce or increase the replication load in the cluster is by adjusting the Datanode replication thread pool size. Ideally, the Datanode thread pool is sized to a level that allows the Datanode to replicate “thread pool” number of tasks simultaneously with little impact on client workloads. While network bandwidth can become a limiting factor, the number of disks is more likely to be the first bottleneck, and therefore the thread pool size should ideally be based on the number of disks on the node.

Rather than using command counts to set the global limit, the ContainerReplicaPendingOps table inside SCM can be used. It keeps a running count of the number of replicas pending creation on the cluster, and is updated in a close to real time way via the Incremental Container Reports from SCM. It also handles EC Reconstruction commands that may create several replicas as it keeps a record of each container being added, so we can count the real number of containers being added, rather than just the command count.

### Global Delete Limit

Container replica deletes tend to be targeted to a single node, and the Datanode already has a thread pool to handle them, which limits the number running concurrently. There is also no network impact when deleting a container. Therefore, there is no global command limit for delete commands.

## Relevant Configuration Parameters

Defaults are given in brackets after the parameter.

* `hdds.scm.replication.datanode.replication.limit`  - (20) Total number of replication commands that can be queued on a Datanode. The limit is made up of number_of_replication_commands + reconstruction_weight * number_of_reconstruction_commands
* `hdds.scm.replication.datanode.reconstruction.weight` - (3) The weight to apply to multiple reconstruction commands before adding to the Datanode.replication.limit.
* `hdds.scm.replication.datanode.delete.container.limit` - (40) The total number of delete container commands to queue on a given Datanode.
* `hdds.scm.replication.inflight.limit.factor` - (0.75) The overall replication task limit on a cluster is the number of healthy nodes, times the Datanode.replication.limit. This factor, which should be between zero and 1, scales that limit down to reduce the overall number of replicas pending creation on the cluster. A setting of zero disables global limit checking. A setting of 1 effectively disables it, by making the limit equal to the above equation. However if there are many decommissioning nodes on the cluster, the decommission nodes will have a higher than normal limit, so the setting of 1 may still provide some limit in extreme circumstances.
* `hdds.datanode.replication.outofservice.limit.factor` - (2.0) When a Datanode is decommissioning its replication thread pool (`hdds.datanode.replication.streams.limit (10)`) is multiplied by this factor to allocate more threads for replication . On SCM, the limit for any Datanode which is not IN_SERVICE (ie decommission or maintenance) is also increased by the same factor. This allows the node to dedicate more resources to replication as it will not be used to writes and will be reduced in priority for reads.
* `hdds.scm.replication.event.timeout` - (300 seconds) The amount of time SCM allows for a task scheduled on a Datanode to complete. After this duration, the Datanode will discard the command and SCM will assume it has been lost and schedule another if still relevant.

## Future Ideas

### Limiting Ops per node

For EC Reconstruction, there are so many other nodes involved in a reconstruction command it may not be sufficient to throttle only on the target node. The targets are likely to be quite random across the cluster, and if every node on the cluster got a few reconstruction commands, it would possibly overload the cluster as it tries to perform all the operations on the other nodes.

For replication commands, if the sources are quite random, and for some reason there are only a few target nodes, it is not good if all the sources are replicating to the same target.

For these two reasons, should we attempt to limit the number of commands referencing nodes other than the command targets? Eg a replication command is sent to a single source and it copies a container to a target. We could count 1 toward the target node and perhaps count 1 toward the source. An EC Reconstruction would reference EC Data number sources and up to EC parity number targets. We could count 1 against each of those nodes.

If the count against a given node is beyond some threshold, then that node should be excluded as a target, or being used as an EC source.

The under replication handler thread currently runs in a loop, and it processes its queue until the queue is empty and then sleeps. Any failed tasks are held in a list and added back to the queue after the iteration completes.

We could keep this list of “used nodes” for an iteration and then reset it. It would not be perfect, but the goal is to have the Datanodes complete their work in a heartbeat or two. If we have the sleep interval set at 2 x heartbeat interval, then it may work quite well.

It is not simple to have a persisted set of node usage counts, as we don’t get any feedback on when commands complete.

### Dynamically Adjusting the Datanode Replication Thread Pool

In theory it would be possible for SCM to send commands to a Datanode to tell it to adjust its thread pool size to scale up or down the number of simultaneous replication tasks which can run. If SCM noted a lot of under replication on the cluster, it could decide to increase the Datanode thread pool size to give priority to the cluster repairing under replication rather than client workloads.

### Datanode Replication Thread Pool based on number of disks

A Datanode with more disks should be able to handle more replication tasks simultaneously than a Datanode with few disks. It is also possible to have mixed sized nodes in a cluster, and Datanodes with a large number of disks would ideally have a different replication thread pool size than nodes with fewer disks. As it stands, the replication thread pool size is a static value, but it could be make into a simple function on the number of disks, eg 2 * number of disks, with a max value.

Similarly, on SCM it would be able to queue more commands on these larger nodes and ideally SCM queue limits would be adjusted higher for larger nodes, and also take that into consideration in any global limit for replication tasks. At the moment, I believe SCM is not aware of the disk count on a Datanode, but if that information was included in the heartbeat, then SCM could have a queue limit based on the disk count (and replication thread pool size).

Alternatively, the Datanode could include the replication thread pool size in the heartbeat, and then SCM could impose the replication limit based on that.
