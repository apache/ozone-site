---
sidebar_label: Upgrade Compatibility
---

# Developing for Compatibility with Zero Downtime Upgrade

Zero Downtime Upgrade (ZDU) lets the internal components of an Ozone cluster (OM, SCM, Datanode, S3 Gateway, and Recon) run in mixed versions during an upgrade with no interruption to service. To make this safe, the framework enforces one invariant that every developer commit must uphold:

> While a rolling upgrade is in progress, components of the same type may be running different software but must behave as if they are the same version. Two OMs, two SCMs, or two Datanodes at different software versions must persist identical on-disk state and expose identical wire behavior until the cluster finalizes.

Without this guarantee, a rolling upgrade can silently introduce behavior like diverging OM state machines, corrupting a container replica, or leaving a Datanode unable to re-register. This page is a practical guide to what counts as an incompatible change inside the cluster, and how to handle it in each area of the code.

The rationale behind the framework lives in the [ZDU design document](https://github.com/apache/ozone/blob/master/hadoop-hdds/docs/content/design/zdu-design.md). Read it if you want the full model. This page is only focused on day-to-day development.

:::note Scope
This page covers compatibility **between internal Ozone components** during an upgrade. External client ↔ Ozone-server compatibility is a separate concern.
:::

## Background

### Vocabulary

- **Apparent version**: The version a component is *acting as*. It is persisted to disk and determines both the API the component exposes and the on-disk format it writes.

- **Software version**: The highest component version contained in the running code. This is fixed by the bits that are installed.

- **Pre-finalized**: The state a component is in when its apparent version on disk is *less than* its software version. All old features work; new features are blocked; downgrade is allowed.

- **Finalized**: The state a component reaches when its apparent version *equals* its software version. All features are allowed; downgrade is no longer possible.

In summary, any behavior incompatible with an old version's disk layout or API must be mapped to a version and disabled until its corresponding version is finalized.

### Invariants

To maintain consistency during zero downtime upgrade, the following invariants must be maintained:

1. **Components of the same type always operate at the same apparent version**
   - This means they expose the same API surface and persist data in the same format.
2. **For internal client/server relationships, the server is always upgraded before and finalizes before its client.**
   - The only exception is Recon, which is a client of OM but is upgraded ahead of it.
3. **All internal components are running the newest software before finalization begins.**

Only invariant 1 is the focus of this document which needs to be maintained by Ozone feature developers. Invariant 2 is maintained by the admin following the documented component upgrade order. Invariant 3 is loosely enforced by the upgrade framework built in to Ozone, but also falls on the admin to correctly execute.

### Upgrade Order

Components are upgraded in the following order to meet the client/server version invariant:

- SCM
- Recon
- Datanodes
- OM
- S3 and HttpFS Gateways

Feature developers do not need to account for upgrade orders that deviate from this when handling compatibility for a feature. An out of order upgrade is considered user error.

### Finalization Order

Components finalize in the same order they are upgraded. Finalization is triggered by a single admin command and the cluster ensures the correct finalization order internally.

- SCM: Finalized via Ratis
- Datanodes: Finalized asynchronously by SCM after it finalizes itself.
- OM: Finalized via Ratis only once HDDS (SCM and all live Datanodes) have finalized

Stateless gateway components do not need to finalize since they have no disk state to manage on downgrade and do not communicate with each other. Their compatibility is handled solely by the guarantee that the server they call remains backwards compatible with their client version. Recon currently finalizes immediately on upgrade. Downgrade support for Recon may be added in the future.

## Quick Start

Adding a feature means adding an entry to the affected components' version enums. That is where a contributor adding a change makes their first edit:

- [`OzoneManagerVersion.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/java/org/apache/hadoop/ozone/OzoneManagerVersion.java) — used within the OM ring and reported to external clients.
- [`HDDSVersion.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/java/org/apache/hadoop/hdds/HDDSVersion.java) — shared by SCM and Datanodes so SCM can orchestrate Datanode finalization and shared with clients.
- [`ReconVersion.java`](https://github.com/apache/ozone/blob/master/hadoop-ozone/recon/src/main/java/org/apache/hadoop/ozone/recon/upgrade/ReconVersion.java) — Recon's own internal disk-format version which is currently not shared with other components.

:::warning
Do **not** add new entries to `OMLayoutFeature` or `HDDSLayoutFeature`. Those enums are frozen after the migration to ZDU's new versioning framework. Every new version goes into `OzoneManagerVersion`, `HDDSVersion`, or `ReconVersion`.
:::

```java
public enum OzoneManagerVersion implements ComponentVersion {
  // Previous versions...
  MY_NEW_FEATURE(101 /*or next available version integer*/, "My new feature"),
}
```

Most incompatible changes are handled by gating the new behavior on the component's apparent version through its version manager:

```java
if (ozoneManager.getVersionManager().isAllowed(OzoneManagerVersion.MY_NEW_FEATURE)) {
  // All capabilities of MY_NEW_FEATURE can be used, even if they are incompatible with older components.
} else {
  // Must continue to act as the older version without using incompatible changes from MY_NEW_FEATURE.
}
```

`isAllowed(...)` returns true only once the component's apparent version is at least the version you name. Each component has a version manager with an equivalent method.

:::warning
It is incorrect to write the following:

```java
if (!ozoneManager.getVersionManager().needsFinalization()) {
  // Use MY_NEW_FEATURE
} else {
  // Bypass MY_NEW_FEATURE
}
```

New versions will continue be added in subsequent releases after `MY_NEW_FEATURE`. Say `MY_NEW_FEATURE_2` is added in the next release. When upgrading from software version `MY_NEW_FEATURE` to `MY_NEW_FEATURE_2`, `MY_NEW_FEATURE` must remain finalized and usable from the previous upgrade even if the component is not yet finalized for `MY_NEW_FEATURE_2`.
:::

## Surface-by-surface guide

Each surface below follows the same shape: **what is considered incompatible** and **the pattern to handle it**. Note that OM and SCM are finalized via Ratis, but Datanodes finalize asynchronously as they receive the finalize command from SCM.

### New OM Requests (Read or Write)

**Incompatible:** Any new read or write request added to the OM. New write requests will not be able to be applied by all nodes when the cluster is in a mixed version. New read requests may appear and disappear to the client as a mixed version OM Ratis group changes leaders.

**Pattern:** Block new write requests until their feature is finalized by putting `DisallowedUntilOmVersion(OzoneManagerVersion.X)` on the `preExecute` method of its `OMClientRequest` subclass. Block new read requests until their feature is finalized by putting `DisallowedUntilOmVersion(OzoneManagerVersion.X)` on helper method the read delegates to in `OzoneManagerRequestHandler`.

### New Fields or Behavior in Existing OM Requests (Read or Write)

**Incompatible:** Any new option that can be passed in by a client that changes the result of an existing read or write request. For example, adding a new replication type that blocks can be allocated with.

**Pattern:** Intercept the request before the leader OM processes it using a `RequestFeatureValidator`. This is typically it is placed in the `OMClientRequest` subclass for write requests and in `OzoneManagerRequestHandler` for read requests.

```java
  @RequestFeatureValidator(
      conditions = ValidationCondition.CLUSTER_NEEDS_FINALIZATION,
      processingPhase = RequestProcessingPhase.PRE_PROCESS,
      requestType = Type.SetBucketProperty
  )
  public static OMRequest disallowSetBucketPropertyWithECReplicationConfig(
      OMRequest req, ValidationContext ctx) throws OMException {
    if (!ctx.versionManager().isAllowed(OMLayoutFeature.ERASURE_CODED_STORAGE_SUPPORT)) {
      SetBucketPropertyRequest propReq = req.getSetBucketPropertyRequest();
      if (propReq.hasBucketArgs()
          && propReq.getBucketArgs().hasDefaultReplicationConfig()
          && propReq.getBucketArgs().getDefaultReplicationConfig()
          .hasEcReplicationConfig()) {
        throw new OMException("Cluster does not have the Erasure Coded"
            + " Storage support feature finalized yet, but the request contains"
            + " an Erasure Coded replication type. Rejecting the request,"
            + " please finalize the cluster upgrade and then try again.",
            OMException.ResultCodes.NOT_SUPPORTED_OPERATION_PRIOR_FINALIZATION);
      }
    }
    return req;
  }
```

### OM apply transaction / OM RocksDB state

**Incompatible:** any change to what an OM request writes to RocksDB inside `validateAndUpdateCache`. This includes:

- A new column family
- A change to the shape of a persisted value class
- A difference in how a persisted value is calculated, even if the protobuf schema does not change.
  - For example, an update to quota calculation logic would require version gating.

**Pattern:** gate the new persisted behavior in `validateAndUpdateCache` on `ozoneManager.getVersionManager().isAllowed(OzoneManagerVersion.X)` and keep the pre-feature code path for the negative branch. Two OMs can replay the same Ratis transaction while acting as different versions, so the gate keeps their state machines from diverging.

If in doubt, ask: *would an OM acting as apparent v100 and an OM acting as v105, both replaying this transaction from Ratis, arrive at the same DB state?* If not, it needs a gate.

### OM ↔ OM peer RPCs outside Ratis

**Incompatible:** adding a required method, or changing the semantics of an existing method, in [`OMAdminProtocol`](https://github.com/apache/ozone/blob/master/hadoop-ozone/common/src/main/java/org/apache/hadoop/ozone/om/protocol/OMAdminProtocol.java) or [`OMInterServiceProtocol`](https://github.com/apache/ozone/blob/master/hadoop-ozone/common/src/main/java/org/apache/hadoop/ozone/om/protocol/OMInterServiceProtocol.java). During a rolling upgrade, peer OMs can be at mixed software versions, so a new method may not exist on the callee. Unlike an unknown protobuf *field*, an unknown *method* fails the RPC outright.

**Pattern:** Callers must not invoke a new inter-OM method until its version is finalized . The method invocation should only proceed if `ozoneManager.getVersionManager().isAllowed(OzoneManagerVersion.X) == true`. Receivers should not implement gating and process the call regardless of their finalization state. Because all components must be upgraded before finalization is invoked, the existence of a finalized OM making the call means that the receiver is in a new enough software version to be able to process the call, even if it is a slow follower which has not yet finalized.

This pattern also applies to SCM peer RPCs.

### Ratis state-machine snapshots (OM & SCM)

**Incompatible:** anything that makes a follower's installed snapshot unreadable by a peer that has not finalized. Snapshot compatibility *is* RocksDB-schema compatibility.

**Pattern:** if your change adds a new column family, it must not be populated until finalization. Otherwise a follower that installs a snapshot from a new leader ends up holding data an older peer cannot read after a downgrade. Gating the *write* into the new column family on the apparent version is what keeps snapshots portable.

### OM → SCM communication

**Incompatible:** any change to [`ScmBlockLocationProtocol`](https://github.com/apache/ozone/blob/master/hadoop-hdds/framework/src/main/java/org/apache/hadoop/hdds/scm/protocol/ScmBlockLocationProtocol.java) or [`StorageContainerLocationProtocol`](https://github.com/apache/ozone/blob/master/hadoop-hdds/framework/src/main/java/org/apache/hadoop/hdds/scm/protocol/StorageContainerLocationProtocol.java) which does not leave SCM's server backwards compatible with older OM clients.

**Pattern:** SCM is always upgraded before OM, so compatibility is maintained by requiring SCM's server to always remain backwards compatible with older OM clients. Finalization happens in the same order after upgrade is complete. This ordering combined with backwards compatibility guarantees of the SCM server allows OM and SCM to communicate without passing versions between them. Note that OM must still gate any new OM behavior on its own `versionManager.isAllowed(...)`. OM should not start exercising a new feature against SCM until OM itself has finalized, which guarantees that SCM has also finalized.

### SCM state machine / SCM RocksDB

**Incompatible:** renaming a state-manager method invoked over Ratis, changing an argument codec, or changing what a state manager persists to RocksDB. SCM's Ratis protocol is a generic reflective RPC — different from OM's typed `OMRequest` — so the method name and argument types are part of the wire format. A rename or codec swap is a real break, not just a source-level refactor.

**Pattern:** gate the *behavior* the state manager performs on `scm.getVersionManager().isAllowed(HDDSVersion.X)`. Never rename or delete an existing Ratis-invoked method or change its argument encoding. Add a new method instead and gate the switch to it.

### Datanode → SCM heartbeat / reports

**Incompatible:** changing the semantics of an existing report field, or making a new report field *required* by SCM for correct processing.

**Pattern:** SCM's heartbeat protocol server must remain backwards compatible with older Datanode clients. It must allow report formats from old and new Datanodes without regressions when SCM is newer than the Datanodes. The canonical example is `ContainerReplicaProto.isEmpty` (in [`ScmServerDatanodeHeartbeatProtocol.proto`](https://github.com/apache/ozone/blob/master/hadoop-hdds/interface-server/src/main/proto/ScmServerDatanodeHeartbeatProtocol.proto)): a newer Datanode sets it, an older Datanode omits it, and SCM defaults it to `false` — which is the safe assumption.

### SCM → Datanode commands

**Incompatible:** new required fields on `SCMCommandProto`, new command types, or changed semantics for an existing command. Purely additive optional fields are safe.

**Pattern:** If possible, make SCM issue commands in a backwards compatible way, such that Datanodes with an older apparent version can safely no-op the new operations until they are upgraded and finalized. If this is not possible, check the Datanode's apparent version using `DatanodeInfo#getLastKnownApparentVersion` to determine whether the new command can be sent to the node or not. Note that SCM's view of the Datanode's apparent version may be stale, but apparent version can never decrease and using a lower version is always safe.

### Datanode write path

**Incompatible:** any change to how a container replica is written that must be identical across all replicas. This includes a new chunk-checksum scheme, a new container-schema, or new write-RPC semantics.

**Pattern:** Gate new write behavior on the **client-provided write pipeline version**, never on the Datanode's own apparent version. Datanodes are upgraded and finalize asynchronously, so peers may be in different apparent versions and unable to process a new request type even if the current node can. To solve this issue, SCM picks a common apparent version for writes that is supported by all Datanodes in the pipeline, and provides that to the client to forward to Datanodes. Use `ClientCommandsUtils#getWritePipelineVersion` to obtain the version that the Datanode should use to execute the write request.

### Datanode read path

**Incompatible:** Any change that prevents older data from being read. A container's schema is fixed for the container's lifetime once it is created, so Datanodes must be able to serve every schema that was ever written.

**Pattern:** **old data must remain readable forever.** Never remove a read path for a prior schema. A new schema adds a new branch; it never replaces an existing one.

### Datanode ↔ Datanode (replication, EC reconstruction, reconciliation)

TODO

**Incompatible:** any change to how a container replica is copied or created that must be identical across all replicas. This includes `CopyContainerRequestProto`, `SendContainerRequest`, `ReconstructECContainersCommandProto`, and `ReconcileContainerCommandProto`.

**Pattern:** When SCM initiates a replication command, it will attach the minimum supported version of all Datanodes to the command. Receiving Datanodes should execute the replication command using that apparent version, regardless of their actual apparent version. This ensures that peers which are upgraded or finalized asynchronously can still process the command. An example of SCM passing this version to Datanodes is [`ReplicateContainerCommandProto#apparentVersion`](https://github.com/apache/ozone/blob/master/hadoop-hdds/interface-server/src/main/proto/ScmServerDatanodeHeartbeatProtocol.proto).

### Datanode on-disk container schema

**Incompatible:** removing or repurposing an existing container schema (V1/V2/V3). Existing schemas must never disappear.

**Pattern:** a new schema is selected at container-create time from the write pipeline version and fixed for that container's life. Migrating existing containers to a new schema is an optional background process run after the upgrade completes. It is never part of finalization.

### Recon

Recon is a client of both OM and SCM and receives Datanode heartbeats. It is upgraded alongside SCM, so it can be *ahead* of OM. Recon → OM is the one internal relationship where the client is newer than the server.

**Pattern:** Recon code that consumes an OM API must accept an older or pre-finalized OM. There is currently no version passing between Recon and OM, although this may be added later as needed.

Recon also has its own version framework — `ReconVersion` and `ReconVersionManager` — for Recon's own on-disk schema changes. Currently Recon finalizes on startup and does not support downgrade. `ReconVersion`s exist only to to run reformatting actions on upgrade.

### 14. Block tokens & delegation tokens

**Incompatible:** adding a new `AccessModeProto` value to `BlockTokenSecretProto`, or changing token enforcement semantics, in [`hdds.proto`](https://github.com/apache/ozone/blob/master/hadoop-hdds/interface-client/src/main/proto/hdds.proto). Purely additive token fields are safe if an older Datanode is not required to process them.

**Pattern:** a token change whose enforcement depends on new bits being present at the Datanode should be gated on an OM version. OM then refuses to issue tokens using the new mode until OM itself is finalized. Because OM cannot finalize until every active Datanode has finalized, finalizing OM guarantees every active Datanode can already honor the new mode.

## Finalization actions

You can attach an action to run when a version finalizes. The upgrade action is guaranteed to run at least once before the version is finalized and available for use. Register actions through the per-component providers:

- [`OMUpgradeActionProvider`](https://github.com/apache/ozone/blob/master/hadoop-ozone/ozone-manager/src/main/java/org/apache/hadoop/ozone/om/upgrade/OMUpgradeActionProvider.java)
- [`ScmUpgradeActionProvider`](https://github.com/apache/ozone/blob/master/hadoop-hdds/server-scm/src/main/java/org/apache/hadoop/hdds/upgrade/ScmUpgradeActionProvider.java)
- [`DatanodeUpgradeActionProvider`](https://github.com/apache/ozone/blob/master/hadoop-hdds/container-service/src/main/java/org/apache/hadoop/hdds/upgrade/DatanodeUpgradeActionProvider.java)
- [`ReconUpgradeActionProvider`](https://github.com/apache/ozone/blob/master/hadoop-ozone/recon/src/main/java/org/apache/hadoop/ozone/recon/upgrade/ReconUpgradeActionProvider.java)

An upgrade action must be:

- **Constant time.** Finalization is synchronous within a component. An action whose cost grows with cluster or dataset size stalls the whole finalize path. Never do invasive on-disk reformatting here.
- **Idempotent.** It may run again after a restart or partial failure during finalization.
- **Throw on failure.** A thrown exception is what tells the framework that finalization of this feature failed and that the component must crash and be restarted to make progress. An action that swallows its exception and returns will *not* be retried and the version will be finalized without the action completing.

## Testing your change

### Unit Tests

Unit tests run a single version of the code as one process so they are not able to test true cross-version compatibility. However, they can test the finalization phase of the upgrade, which runs after all components are upgraded to the same new version. Unit tests can mock the version manager classes of the required component to act as if they are pre-finalized for a specific version. See `OMVersionManagerTestUtils#mockPreFinalizedOmVersionManager` for an example.

### Integration Tests

Integration tests run a single version of the code as one process so they are not able to test true cross-version compatibility. However, they can test the finalization phase of the upgrade, which runs after all components are upgraded to the same new version. Integration tests can cover pre/post finalization compatibility by injecting arbitrary apparent versions for components to behave as, and then triggering finalization. Apparent versions for each component can be injected with the following configurations:

- OM: `OMStorage#TESTING_INIT_APPARENT_VERSION_KEY`
- SCM: `SCMStorageConfig#TESTING_INIT_APPARENT_VERSION_KEY`
- Datanode: `UniformDatanodesFactory#setApparentVersion`

### Acceptance Tests

The rolling-upgrade acceptance test suite under [`hadoop-ozone/dist/src/main/compose/upgrade/upgrades`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dist/src/main/compose/upgrade/upgrades). Uses Docker images from past releases to test a full upgrade, downgrade, and finalization cycle. It is the only way to truly test mixed version compatibility in addition to finalization. See the [upgrade acceptance test README](https://github.com/apache/ozone/blob/master/hadoop-ozone/dist/src/main/compose/upgrade/README.md) for details on how to add new tests that hook into the upgrade flow.

## See also

- [ZDU design document](https://github.com/apache/ozone/blob/master/hadoop-hdds/docs/content/design/zdu-design.md) — the rationale, invariants, and full step-by-step upgrade walkthrough.
- [Upgrade and Downgrade](../administrator-guide/operations/upgrade-and-downgrade) — the operator-facing guide to running an upgrade.
