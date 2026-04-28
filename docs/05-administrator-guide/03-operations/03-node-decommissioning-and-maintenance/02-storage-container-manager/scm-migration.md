---
sidebar_label: SCM migration
---

# SCM migration

This guide describes how to move an Ozone cluster from one Storage Container Manager (SCM) HA membership (for example logical nodes `scm1`, `scm2`, `scm3`) to another (`scm4`, `scm5`, `scm6`) while avoiding a full rolling restart of every DataNode for configuration changes.

For background on SCM HA configuration and bootstrap, see [SCM High Availability](../../../../administrator-guide/configuration/high-availability/scm-ha). For decommissioning SCM instances, see [Storage Container Manager decommission](./decommission) (SCM decommission). For the `ozone admin reconfig` command, see [Dynamic Property Reload](../../../../administrator-guide/operations/dynamic-property-reload).

## Why this matters

Historically, operators had to change `ozone.scm.nodes.<scmServiceId>` twice and roll DataNodes twice: first to include both old and new SCM node IDs, then again after the old SCMs were gone. Rolling the entire DataNode fleet can take a long time on large clusters.

DataNodes can now apply changes to the SCM node list dynamically: the running process computes the SCM node IDs that were added and removed, opens connections to new endpoints, then closes connections to removed ones. Together with deploying full `ozone-site.xml` definitions for each SCM logical node ID, this avoids those restarts for SCM endpoint migration ([HDDS-13890](https://issues.apache.org/jira/browse/HDDS-13890)).

## Principles

**Use two phases instead of cutting over in one step.** Add and validate the new SCMs while old ones remain, then migrate leadership if needed, decommission the old SCMs, and finally shrink `ozone.scm.nodes` to only the surviving members. Separating expansion and shrinking reduces risk and makes rollback simpler if something fails before the old nodes are torn down.

**Configure addresses before IDs.** Each DataNode resolves SCM RPC targets from `ozone.scm.nodes.<scmServiceId>` together with address properties keyed by node ID (`ozone.scm.address.<scmServiceId>.<scmNodeId>` and the DataNode RPC port for SCM, documented under [Configuration](../../../../administrator-guide/configuration/high-availability/scm-ha#configuration)). Every SCM node ID you list in `ozone.scm.nodes` must already have matching address settings in configuration that DataNodes will load; otherwise reconfiguration fails or skips additions.

## Phase 1: Add new SCMs and expand membership

1. **Deploy new SCM hosts** according to [Bootstrap](../../../../administrator-guide/configuration/high-availability/scm-ha#bootstrap). Use `ozone scm --bootstrap` on each additional node (respecting [`ozone.scm.primordial.node.id`](../../../../administrator-guide/configuration/high-availability/scm-ha#auto-bootstrap) and security notes in [SCM HA Security](../../../../administrator-guide/configuration/high-availability/scm-ha#scm-ha-security)). Start the SCM service on each new instance.
2. **Update configuration everywhere** (OM, SCM, DataNodes, clients) so that for your `scmServiceId` you include:
   - `ozone.scm.nodes.<scmServiceId>` with **both** existing and new logical node IDs (for example `scm1,scm2,scm3,scm4,scm5,scm6`).
   - For **each** of those node IDs, the usual `ozone.scm.address.<scmServiceId>.<scmNodeId>` (and DataNode RPC port settings in `ozone.scm.datanode.address.*` or defaults, as in your environment).
3. **Reload SCM address keys on DataNodes.** Keys whose names match `ozone.scm.address.<scmServiceId>.*` are dynamically reconfigurable; apply those first so running DataNodes can resolve endpoints for newly added SCM node IDs ([Dynamic Property Reload](../../../../administrator-guide/operations/dynamic-property-reload)). Ensure any auxiliary keys your deployment uses for SCM DataNode RPC addresses are consistent with what you deployed in `ozone-site.xml`.

4. **Expand `ozone.scm.nodes` on DataNodes without restart:** after the address properties are visible to each DataNode process, reload `ozone.scm.nodes.<scmServiceId>` through the DataNode reconfiguration path (see below).

5. **Validate**  
   Wait until new SCM replicas have joined the Ratis group, the SCM role you expect exists (for example [`ozone admin scm roles`](../../../../administrator-guide/configuration/high-availability/scm-ha#verify-scm-ha-setup)), and SCM has exited safemode. Confirm DataNodes reach a healthy heartbeat relationship with SCMs—for example inspect DataNode logs and SCM UI or metrics—and that replicated metadata looks normal before you rely on only the new set.

Plan two configuration waves (`ozone admin reconfig` after expanding `ozone.scm.nodes`, then again after decommission narrows membership), mirroring validated migration flows rather than flipping unrelated keys in one edit.

### Applying DataNode SCM list changes dynamically

Deploy the updated `ozone-site.xml` on each DataNode host, then trigger reload from that file:

```shell
ozone admin reconfig --service=DATANODE --address=<dn-host>:<dn-rpc-port> start
ozone admin reconfig --service=DATANODE --address=<dn-host>:<dn-rpc-port> status
```

To push the same on-disk configuration to every `IN_SERVICE` DataNode at once:

```shell
ozone admin reconfig --service=DATANODE --in-service-datanodes start
ozone admin reconfig --service=DATANODE --in-service-datanodes status
```

Use `ozone admin reconfig --service=DATANODE --address=... properties` (or the batch form) to confirm that `ozone.scm.nodes.<scmServiceId>` and the `ozone.scm.address.<scmServiceId>.*` keys are listed as reconfigurable on your version.

## Phase 2: Move leadership off nodes you will remove

If any SCM you plan to decommission is the current Raft leader, transfer leadership to a node that will stay (usually one of the new SCMs). See [Leader SCM](./decommission#leader-scm) and [SCM Leader Transfer](../../../../administrator-guide/configuration/high-availability/scm-ha#scm-leader-transfer).

If you must change which node is **primordial** (metadata and certificate implications), follow [Primordial SCM](./decommission#primordial-scm) and the security discussion in [Primordial SCM under SCM HA Security](../../../../administrator-guide/configuration/high-availability/scm-ha#primordial-scm) before decommissioning.

## Phase 3: Decommission old SCMs

Decommission each old SCM using the cluster administration command and cluster state described in [SCM decommission](./decommission#scm-decommission), including manual handling of private keys noted there.

## Phase 4: Remove old node IDs from DataNode configuration

1. Update `ozone.scm.nodes.<scmServiceId>` to list **only** the surviving logical node IDs (for example `scm4,scm5,scm6`). Remove properties for decommissioned SCM node IDs from `ozone-site.xml` when they are no longer needed elsewhere.
2. Deploy the file and run DataNode reconfiguration again (`ozone admin reconfig` as in phase 1). The DataNode removes RPC connections to retired endpoints after a successful removal.

## Behavior and limitations (DataNode)

Reconfiguration runs only when the DataNode state machine is in the `RUNNING` state. The service compares the previous and new SCM node ID sets, resolves addresses for **add** and **remove** sets, **adds** new SCM connections first, then **removes** dropped ones, and resizes internal thread pools to match the number of SCM (and Recon) endpoints.

If an SCM hostname cannot be resolved for an **add**, that endpoint is skipped with a warning until DNS or configuration is fixed; you can retry after correcting the environment. If some adds or removes fail (for example I/O error), the effective node ID list returned by the reconfiguration callback reflects what actually connected or disconnected so a later retry can succeed without duplicating work.

Setting `ozone.scm.nodes.<scmServiceId>` to an empty value is rejected. Future releases may add stricter checks (for example around leader SCM); follow release notes when upgrading.

## Legacy behavior (without dynamic reconfiguration)

Without dynamic reload, the same logical migration still requires:

1. Set `ozone.scm.nodes` to the union of old and new IDs, then restart every DataNode (or roll once through the fleet).
2. After old SCMs are removed from the cluster, set `ozone.scm.nodes` to the final list and restart every DataNode again.

Using `ozone admin reconfig` for `ozone.scm.nodes.<scmServiceId>` and related address keys removes the need for those restarts when updating SCM membership.
