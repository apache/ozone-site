# Deployment Architecture

**TODO:** File a subtask under [HDDS-9859](https://issues.apache.org/jira/browse/HDDS-9859) and complete this page or section.


This page should cover

1. Required Metadata nodes include 
   1. Ozone Manager
   2. Storage Container Manager
2. Optional Metadata nodes include 
   1. Recon
   2. Prometheus
   3. Ranger
   4. Knox
   5. KMS
3. Datanodes span multiple racks

# Datanode

Each datanode has a bunch of drives that are mounted as direct attached drives.
Since Ozone supports configurable replication configuration, it does not need pre defined erasure coding setup or
replication setup.
Ozone is rack aware and supports topology aware placement.
Insert link to topology related documentation pages


# S3G

Typically each Datanode has a S3Gateway deployed.
Loadbalancer is needed in front of the laodbalancer

# 