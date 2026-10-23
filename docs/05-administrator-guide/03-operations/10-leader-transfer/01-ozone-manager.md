---
sidebar_label: Ozone Manager
---

# Ozone Manager Leader Transfer

The `ozone admin om transfer` command allows you to manually transfer the leadership of the Ozone Manager (OM) Raft group to a specific OM node or to a randomly chosen follower.

Until [HDDS-17124](https://issues.apache.org/jira/browse/HDDS-17124) is fixed, manual OM and SCM leadership transfer commands have taken approximately 4–13 seconds in five-node tests because of Ratis client retry waits during leader discovery and priority reset. This is an observation, not an upper bound or a guarantee about automatic failover latency. Account for client RPC timeouts; if a command times out, check the current roles before deciding whether to retry.

## Usage

```bash
ozone admin om transfer -id <OM_SERVICE_ID> -n <NEW_LEADER_ID>
ozone admin om transfer -id <OM_SERVICE_ID> -r
```

- `-id, --service-id`: Specifies the Ozone Manager Service ID.
- `-n, --newLeaderId, --new-leader-id`: The node ID of the OM to which leadership will be transferred (e.g., `om1`).
- `-r, --random`: Randomly chooses a follower to transfer leadership to.

## Example

To transfer leadership to `om2` in a cluster with service ID `cluster1`:

```bash
ozone admin om transfer -id cluster1 -n om2
```

To transfer leadership to a random follower:

```bash
ozone admin om transfer -id cluster1 -r
```
