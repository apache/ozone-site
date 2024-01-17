---
sidebar_label: Delete
---

# Implementation of Delete Operations

**TODO:** File a subtask under [HDDS-9862](https://issues.apache.org/jira/browse/HDDS-9862) and complete this page or section.

## Deleting Metadata

## Deleting Data

Trace every part of a delete request from beginning to end. This includes:
- Client getting encryption keys
- Client calling OM to delete the key
- OM validating client's Kerberos princiapl
- OM checking permissions (Ranger or Native ACLs)
- OM marking the key for deletion and removing it from the namespace.
- OM acking to the client
- OM sending blocks to delete to SCM
- SCM sending blocks to delete to the datanode
- Datanode removes data

Note that delete works the same regardless of replication type. Also document timing of background services and their batch size to estimate the rate of deletion.

