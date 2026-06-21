---
sidebar_label: Storage Container Manager
---

# Decommissioning a Storage Container Manager

Storage Container Manager (SCM) decommissioning is the process in which you can gracefully remove one of the SCM from the SCM HA Ring.

To decommission an SCM and remove the node from the SCM HA ring, the following steps need to be executed.

```shell
ozone admin scm decommission [-hV] [--service-id=<scmServiceId>] -nodeid=<nodeId>
```

You can obtain the `nodeId` by executing this command, `ozone admin scm roles`

## Leader SCM

If you want to decommission the **leader** SCM, you must first transfer the leadership to a different SCM and then decommission the node.

To transfer the leader, we can execute below command,

```shell
ozone admin scm transfer [--service-id=<scmServiceId>] -n=<nodeId>
```

After successful leadership change you can proceed with decommissioning.

## Primordial SCM

If you want to decommission the **primordial** SCM, you have to change the `ozone.scm.primordial.node.id` property to point to a different SCM and then proceed with decommissioning.

### Note

During SCM decommissioning the private key of the decommissioned SCM should be manually deleted. The private keys can be found inside `hdds.metadata.dir`.

Manual deletion is needed until we have certificate revocation support (HDDS-8399)
