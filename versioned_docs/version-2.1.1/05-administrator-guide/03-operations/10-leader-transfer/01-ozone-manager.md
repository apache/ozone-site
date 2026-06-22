---
sidebar_label: Ozone Manager
---

# Ozone Manager Leader Transfer

The `ozone admin om transfer` command allows you to manually transfer the leadership of the Ozone Manager (OM) Raft group to a specific OM node or to a randomly chosen follower.

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
