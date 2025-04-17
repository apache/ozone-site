# Hardware and Sizing

**TODO:** File a subtask under [HDDS-9859](https://issues.apache.org/jira/browse/HDDS-9859) and complete this page or section.


1. Metadata nodes
2. Datanodes
   3. High density nodes.

# Datanoes
Ozone supports spindle based hard drives, SSDs and NVMe for capacity
Each Datanodes should have one SSD or NVMe drive
to store replication transaction information it is not used to store data and only store metadata about replication related
transactional information.

