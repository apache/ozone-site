---
sidebar_label: Fairness
---

# Fairness

## What is FairCallQueue?

Fair Call Queue (FCQ) is a multi-level priority queue that schedules RPC requests based on user identity.
It organizes incoming RPC calls into multiple priority queues, allowing the system to process requests from different users in a fair and balanced manner.

FCQ works in conjunction with a scheduler (typically `DecayRpcScheduler`) to:

- Track the call volume and cost per user identity over time
- Assign priority levels to requests based on each user's recent usage patterns
- Distribute processing capacity fairly across all users, preventing any single user from monopolizing system resources

The queue uses a weighted round-robin multiplexer to select which priority queue to service next, ensuring that high-priority queues get more attention while still allowing lower-priority requests to be processed.

In order for `FairCallQueue` to be enabled and used, Hadoop RPC must be used as transport protocol for OM - S3G communication. There is no implementation for gRPC yet.
There is a custom `IdentityProvider` implementation for Ozone that must be specified in the configuration, otherwise there is no S3G impersonation which
makes the `FairCallQueue` ineffective since it's only reading one user, the S3G special user instead of the S3G client user.

## Why is Fairness Important?

Fairness is crucial in multi-tenant environments where multiple users or applications access Ozone through the S3 Gateway. Without fair scheduling:

- A single high-volume user or application can flood the request queue, causing other users' requests to wait indefinitely or timeout
- Users with legitimate but lower-volume workloads may experience unacceptable latency as their requests are delayed behind a backlog of requests from a single dominant user.
- System resources could be monopolized by aggressive clients
- Quality of service (QoS) guarantees cannot be maintained

By implementing fair call queuing, Ozone ensures that all users receive equitable access to OM resources, leading to more predictable performance and better multi-tenancy support.

## Where FCQ should be applied?

FCQ should be applied at the **Ozone Manager (OM)** level, specifically for the communication path between **S3 Gateway (S3G) and Ozone Manager**.

### Communication path: S3G → OM

When S3 Gateway receives requests from S3 clients, it forwards these requests to the Ozone Manager for processing. This is where FCQ provides the most value:

- **Multiple S3 Clients**: Multiple S3 clients connect through one or more S3 Gateway instances, and all their requests ultimately reach the Ozone Manager.
- **User Identification**: Each S3 request is associated with an S3 access ID, which represents a specific user or application. FCQ uses this identity to track and schedule requests per user.
- **Request Prioritization**: The Ozone Manager can prioritize requests based on each user's recent call volume, ensuring fair resource distribution.

## Hadoop FCQ Framework

Ozone leverages Hadoop's `FairCallQueue` framework for implementing fairness. For detailed information about how `FairCallQueue` works, its architecture, and advanced configuration options, refer to the [Hadoop FairCallQueue documentation](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/FairCallQueue.html).

## Configuration

There must be a port specified to which the OM will forward any activity
and the `FairCallQueue` and `DecayRpcScheduler` will listen to.
Furthermore, this port will have to be part of every configuration name.

Port used for below examples : 9862

```xml
<property>
   <name>ozone.om.address</name>
   <value>OMDomain:9862</value>
</property>

<property>
    <name>ozone.om.s3.grpc.server_enabled</name>
    <value>false</value>
</property>

<property>
    <name>ozone.om.transport.class</name>
    <value>org.apache.hadoop.ozone.om.protocolPB.Hadoop3OmTransportFactory</value>
</property>

<property>
   <name>ipc.9862.callqueue.impl</name>
   <value>org.apache.hadoop.ipc_.FairCallQueue</value>
</property>

<property>
   <name>ipc.9862.scheduler.impl</name>
   <value>org.apache.hadoop.ipc_.DecayRpcScheduler</value>
</property>

<property>
   <name>ipc.9862.identity-provider.impl</name>
   <value>org.apache.hadoop.ozone.om.helpers.OzoneIdentityProvider</value>
</property>

<property>
   <name>ipc.9862.scheduler.priority.levels</name>
   <value>2</value>
</property>

<property>
   <name>ipc.9862.backoff.enable</name>
   <value>true</value>
</property>

<property>
   <name>ipc.9862.faircallqueue.multiplexer.weights</name>
   <value>2,1</value>
</property>

<property>
    <name>ipc.9862.decay-scheduler.thresholds</name>
    <value>50</value>
</property>
```

### Validation Steps

1. **Check Logs**: After starting OM, verify in the logs that FCQ is initialized:

   ```text
   FairCallQueue is in use with <N> queues with total capacity of <capacity>
   ```

2. **Verify Metrics**: Check that FCQ metrics are being collected (via JMX or metrics endpoint):
    - `FairCallQueueSize_p<N>` for each priority level
    - `FairCallQueueOverflowedCalls_p<N>` for overflow statistics

3. **Test User Identification**: Send requests from different S3 access IDs and verify that the scheduler is tracking them separately.

## Troubleshooting

1. **FCQ not working**: Verify `OzoneIdentityProvider` is configured, gRPC is disabled (`ozone.om.s3.grpc.server_enabled=false`), and port numbers match across all `ipc.<port>.*` properties.

2. **High latency**: Increase queue capacity (`ipc.server.max.callqueue.length`) or adjust scheduler thresholds (`ipc.<port>.decay-scheduler.thresholds`).

3. **Configuration errors**: Ensure port consistency between `ozone.om.address` and `ipc.<port>.*` properties, and verify all class names are correct.

4. **Monitor metrics**: Check `FairCallQueueSize_p<N>` and `FairCallQueueOverflowedCalls_p<N>` via JMX to diagnose queue behavior.
