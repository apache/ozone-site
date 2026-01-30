---
sidebar_label: Ozone Manager
---

# Decommissioning an Ozone Manager

Ozone Manager (OM) decommissioning is the process in which you gracefully remove one of the OM from the OM HA Ring.

To decommission an OM and remove the node from the OM HA ring, the following steps need to be executed.

1. Add the _OM NodeId_ of the OM Node to be decommissioned to the `ozone.om.decommissioned.nodes.<omServiceId>` property in `ozone-site.xml` of all
   other OMs.
2. Run the following command to decommission an OM node.

```shell
ozone admin om decommission -id=<om-service-id> -nodeid=<decommissioning-om-node-id> -hostname=<decommissioning-om-node-address> [optional --force]
```

The _force_ option will skip checking whether OM configurations in `ozone-site.xml` have been updated with the decommissioned node added to
`ozone.om.decommissioned.nodes` property.

**Note** - It is recommended to bootstrap another OM node before decommissioning one to maintain HA.
