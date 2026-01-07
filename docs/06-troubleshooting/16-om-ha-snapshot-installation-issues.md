---
sidebar_label: OM HA snapshot installation
---

# Troubleshooting OM HA snapshot installation issues

When a new Ozone Manager (OM) is added to an existing OM HA cluster, it needs to obtain the latest OM DB snapshot from the leader OM.
In cases where the OM DB is very large, the new OM may get stuck in a loop trying to download the snapshot.
This can happen if the leader OM purges the Raft logs associated with the snapshot before the new OM can finish downloading it.
When this happens, the new OM will have to restart the snapshot download, and the process can repeat indefinitely.

To avoid this issue, you can configure the following properties on the leader OM:

1. Set <code>ozone.om.ratis.log.purge.preservation.log.num</code> to a high value (e.g. 1000000).
This property controls how many Raft logs are preserved on the leader OM.
By setting it to a high value, you can prevent the leader from purging the logs that the new OM needs to catch up. This is a more balanced approach to ensure that some logs are preserved so that they can be replicated to the slow follower (instead of installing snapshot), but if the number of logs exceeded this amount, OM leader will purge the logs to prevent disk to be full.
2. Set <code>ozone.om.ratis.log.purge.upto.snapshot.index</code> to <code>false</code>.
This property prevents the leader OM from purging any logs until all followers have installed the latest snapshot.
This ensures that the new OM will have enough time to download and install the snapshot without the logs being purged. This is a more risky approach since it might cause the Raft logs to increase indefinitely when the OM follower is down for a long time, which can cause OM metadata dir to be full.
</br>Note: If <code>ozone.om.ratis.log.purge.preservation.log.num</code> is set to a non-zero number, it is recommended to keep <code>ozone.om.ratis.log.purge.upto.snapshot.index</code> to <code>true</code> (default value) since <code>ozone.om.ratis.log.purge.upto.snapshot.index</code> will override the preservation configuration. Therefore, these two properties should not be set together.


By tuning these two parameters, you can avoid the OM snapshot installation loop and successfully add new OMs to your HA cluster.