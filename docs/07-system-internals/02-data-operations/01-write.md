---
sidebar_label: Write
---

# Implementation of Write Operations

**TODO:** File a subtask under [HDDS-9862](https://issues.apache.org/jira/browse/HDDS-9862) and complete this page or section.

## Writing Metadata

## Writing Data

Trace every part of a write request from beginning to end. This includes:
- Client getting encryption keys
- Client calling OM to create key
- OM validating client's Kerberos principal
- OM checking permissions (Ranger or Native ACLs)
- OM allocating blocks from SCM
- OM creating open key
    - Mention open key cleanup service, and that if key is not committed within a given time it will be picked up for [deletion](./delete#deleting-data)
- OM generating block tokens from the shared secret previously retrieved from SCM
- OM returning container, blocks, pipeline, block tokens
- Client sending checksums and datanodes validating
- Client sending block tokens and datanode validating based on the shared secret from SCM
- Client sending write chunk and put block requests to the datanodes
    - For Ratis:
        - Include topology choices of which datanodes to use
        - Include failover handling
    - For [EC](../features/erasure-coding) and Ratis streaming, link to their feature pages.
- Client allocating more blocks if needed
- Client committing to OM
- OM checking the current namespace
    - Bucket must still exist
    - Existing key will be overwritten
- OM committing the data and returning to the client

