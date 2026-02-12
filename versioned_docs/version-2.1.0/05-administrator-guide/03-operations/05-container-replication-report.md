# Container Replication Report

Ozone continuously monitors the health of containers to handle the loss of disks or nodes and re-replicates data to maintain a healthy replication count. The status of this replication can be viewed with the *Container Report* command which can be run as follows:

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

The most pertinent container states of interest to an administrator are `UNDER_REPLICATED`, `MISSING` and `UNHEALTHY`.

## Key Container States Explained

### Under Replicated

Under-Replicated containers have less than the number of expected replicas, likely due to decommissioning operations or node/disk failures which are routine in large clusters. This is usually a transient state and indicates that Ozone is currently working to restore these containers to full health.

### Missing

A container is missing if there are not enough replicas available to read it. This state is usually reached if we had multiple disk or node failures across the cluster in a short amount of time. It may resolve automatically if some of the hardware failures were transient. Else, manual intervention will be needed to restore the failed hardware to a working state in order to recover these containers.

### Unhealthy

A container is unhealthy if it is not missing and there are insufficient healthy replicas to allow the container to be read completely.

This state can be reached if all available replicas became unhealthy or corrupted in a short amount of time. This should be a rare scenario. Recovery may be possible with the Reconciler feature.
