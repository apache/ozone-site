---
sidebar_label: Storage Container Manager
---

# Storage Container Manager Leader Transfer

The `ozone admin scm transfer` command allows you to manually transfer the leadership of the Storage Container Manager (SCM) Raft group to a specific SCM node or to a randomly chosen follower.

Be aware of the node's status(eg. Safemode, Operational status), Ozone currently has no ability to check the target node's status before transferring the leadership.

Until [HDDS-17124](https://issues.apache.org/jira/browse/HDDS-17124) is fixed, manual OM and SCM leadership transfer commands have taken approximately 4–13 seconds in five-node tests because of Ratis client retry waits during leader discovery and priority reset. This is an observation, not an upper bound or a guarantee about automatic failover latency. Account for client RPC timeouts; if a command times out, check the current roles before deciding whether to retry.

## Usage

```bash
ozone admin scm transfer -id <SCM_SERVICE_ID> -n <NEW_LEADER_ID>
ozone admin scm transfer -id <SCM_SERVICE_ID> -r
```

- `-id, --service-id`: Specifies the SCM Service ID.
- `-n, --newLeaderId, --new-leader-id`: The SCM UUID (Raft peer ID) of the SCM to which leadership will be transferred (e.g., `e6877ce5-56cd-4f0b-ad60-4c8ef9000882`).
- `-r, --random`: Randomly chooses a follower to transfer leadership to.

## Example

To transfer leadership to a specific SCM in a cluster with service ID `cluster1`:

```bash
ozone admin scm transfer -id cluster1 -n e6877ce5-56cd-4f0b-ad60-4c8ef9000882
```

To transfer leadership to a random follower:

```bash
ozone admin scm transfer -id cluster1 -r
```
