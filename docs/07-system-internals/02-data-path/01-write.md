# Data Write Requests

Trace every part of a write request from beginning to end. This includes:
- Client getting encryption keys
- Client calling OM to create key
- OM validating client's Kerberos princiapl
- OM checking permissions (Ranger or Native ACLs)
- OM allocating blocks from SCM
- OM creating open key
- OM generating block tokens from the shared secret previously retreived from SCM
- OM returning container, blocks, pipeline, block tokens
- Client sending checksums and datanodes validating
- Client sending block tokens and datanode validating based on the shared secret from SCM
- Client sending write chunk and put block requests to the datanodes
    - Include topology choices of which datanodes to use
    - Include EC vs. Ratis datanode write process
    - Include failover handling
- Client allocating more blocks if needed
- Client committing to OM
- OM checking the current namepsace
    - Bucket must still exist
    - Existing key will be overwritten
- OM committing the data and returning to the client

