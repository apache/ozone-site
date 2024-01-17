# Data Read Requests

Trace every part of a read request from beginning to end. This includes:
- Client getting encryption keys
- Client calling OM to create key
- OM validating client's Kerberos princiapl
- OM checking permissions (Ranger or Native ACLs)
- OM generating block tokens from the shared secret previously retreived from SCM
- OM getting block locations from SCM or from its cache.
- OM returning container, blocks, pipeline, block tokens
- Client sending block tokens and datanode validating based on the shared secret from SCM
- Client sending read chunk requests to datanode to fetch the data.
    - Include topology choices of which datanodes to use
    - Include EC vs. Ratis datanode write process
    - Include failover handling
- Client validating checksums

