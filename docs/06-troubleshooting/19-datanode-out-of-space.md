---
sidebar_label: Datanode space
---

# Datanode running out of space

Insufficient storage space can cause writes to slow down or fail. When too few Datanodes have enough space for the required replication, SCM cannot allocate new containers or pipelines and clients may retry their writes.

## Check storage usage

1. Open the SCM web UI and examine the Datanode table. Sort by **Used Space Percent** to find nodes approaching capacity.
2. Follow a Datanode's hostname link to its web UI. In **Volume Information**, compare usage across individual disks. A node's overall utilization can hide a full disk.
3. Compare **Ozone Available**, **Filesystem Available**, **Reserved**, and **Non-Ozone Used**. Other files on the same filesystem can reduce the space available to Ozone.
4. Check the Datanode logs for storage errors, such as `No volumes have enough space for a new container`. Check the filesystems holding Ratis transaction logs as well as those holding container data.

A filesystem can have free space while Ozone cannot place another container on it. Space committed to open containers and minimum free-space requirements also affect whether a volume can accept a new container.

## Restore data capacity

If the cluster is approaching capacity, follow the [Cluster expansion guide](../administrator-guide/operations/cluster-expansion) to add Datanodes or disks.

For an existing Datanode, follow [Add a disk to an existing Datanode](../administrator-guide/operations/cluster-expansion#add-a-disk-to-an-existing-datanode). This includes adding the new path to `hdds.datanode.dir` and restarting the Datanode. SCM learns the additional capacity through storage reports.

Adding a disk does not redistribute existing containers. The default `hdds.datanode.volume.choosing.policy` is `org.apache.hadoop.ozone.container.common.volume.CapacityVolumeChoosingPolicy`. It randomly selects two candidate volumes with sufficient space and chooses the one with lower utilization. A new, empty disk can therefore receive a larger share of new containers and traffic.

Run the [Disk Balancer](../administrator-guide/operations/data-balancing/disk-balancer) to redistribute existing eligible containers among disks on the same Datanode. If capacity is uneven across Datanodes, use the [Container Balancer](../administrator-guide/operations/data-balancing/container-balancer). Balancing requires available destination space; it does not add storage capacity.

## Check Ratis log space

Ratis transaction logs also require free disk space. Available space on a data disk does not resolve a full Ratis filesystem when the two use separate storage.

The SCM property `ozone.scm.datanode.ratis.volume.free-space.min` defaults to `1GB`. For new Ratis pipeline placement, a Datanode needs at least one Ratis volume with more free space than this configured minimum.

This property is an allocation check; it does not reserve disk space or guarantee enough space for ongoing log growth. Restore free capacity on the affected filesystem and monitor it according to the workload.

## Verify recovery

- Confirm that SCM has received the updated capacity and that the affected volumes show available space in the Datanode web UI.
- Retry a representative write and confirm that allocation or disk-space errors no longer recur.
- After balancing, check that disk utilization is becoming more even and continue monitoring both data and Ratis storage.
