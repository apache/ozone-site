---
sidebar_label: Upgrade Compatibility
---

# Developing for Compatiblity with Zero Downtime Upgrade

Zero Downtime Upgrade (ZDU) lets the internal components of an Ozone cluster (OM, SCM, Datanode, S3 Gateway, and Recon) run in mixed versions during an upgrade, with no interruption to service. To make this safe, the framework enforces one invariant that every developer commit must uphold:

> While a rolling upgrade is in progress, components of the same type may be running different software but must behave as if they are the same version. Two OMs, two SCMs, or two Datanodes at different software versions must persist identical on-disk state and expose identical wire behaviour until the cluster finalizes.

Get this wrong and a rolling upgrade can silently diverge OM state machines, corrupt a container replica, or leave a Datanode unable to re-register. This page is a practical guide to keeping that invariant: what counts as an incompatible change *inside* the cluster, and — surface by surface — where the versioning already lives and what a correct gate looks like.

The rationale behind the framework lives in the [ZDU design document](https://github.com/apache/ozone/blob/master/hadoop-hdds/docs/content/design/zdu-design.md); read it if you want the full model. This page is only focused on day-to-day development.

:::note Scope
This page covers compatibility **between internal Ozone components** during an upgrade. External client ↔ Ozone-server compatibility is a separate concern.
:::

## Vocabulary

- **Apparent version**: The version a component is *acting as*. It is persisted to disk and determines both the API the component exposes and the on-disk format it writes. During an upgrade the apparent version lags the software version until the cluster finalizes.

- **Software version**: The highest component version contained in the running code. This is fixed by the bits that are installed.

- **Pre-finalized**: The state a component is in when its apparent version on disk is *less than* its software version. All old features work; new features are blocked; downgrade is allowed.

- **Finalized**: The state a component reaches when its apparent version *equals* its software version. All features are allowed; downgrade is no longer possible.

In summary, any behavior incompatible with an old version's disk layout or API must be mapped to a version and disabled until its corresponding version is finalized.

## Invariants

Everything below follows from three invariants the framework maintains for internal components:

- **Components of the same type always operate at the same apparent version**
  - This means they expose the same API surface and persist data in the same format.
- **For internal client/server relationships, the server is always upgraded before and finalizes before its client.**
  - The only exception is Recon, which is a client of OM but is upgraded ahead of it.
- **All internal components are running the newest software before finalization begins.**

## Quick Start

Adding a feature means adding an entry to your component's version enum. That is where a contributor adding a change makes their first edit:

- [`OzoneManagerVersion.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/java/org/apache/hadoop/ozone/OzoneManagerVersion.java) — used within the OM ring and reported to external clients.
- [`HDDSVersion.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/java/org/apache/hadoop/hdds/HDDSVersion.java) — shared by SCM and Datanodes so SCM can orchestrate Datanode finalization.
- [`ReconVersion.java`](https://github.com/apache/ozone/blob/master/hadoop-ozone/recon/src/main/java/org/apache/hadoop/ozone/recon/upgrade/ReconVersion.java) — Recon's own disk-format versioning.

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

## Surface-by-surface guide

Each surface below follows the same shape: **what is considered incompatible** and **the pattern to handle it**.

### New OM Requests (Read or Write)

**Incompatible:** Any new read or write request added to the OM. New write requests will not be able to be applied by all nodes when the cluster is in a mixed version. New read requests may appear and disappear to the client as a mixed version OM Ratis group changes leaders.

**Pattern:** Block new write requests using the `DisallowedUntilOmVersion` annotation. Block new read requests by throwing an exception when they are received if  `!ozoneManager.getVersionManager().isAllowed(OzoneManagerVersion.X)`.


### OM apply transaction / OM RocksDB state

**Incompatible:** any change to what an OM request writes to RocksDB inside `validateAndUpdateCache`. This includes:
- Any new column family
- Any change to the shape of a persisted value class
- A difference in how a persisted value is calculated, even if the protobuf schema does not change.

**Pattern:** gate the new persisted behavior on `ozoneManager.getVersionManager().isAllowed(OzoneManagerVersion.X)` and keep the pre-feature code path for the negative branch. A new column family must not be written to until the cluster is finalized. Two OMs can replay the same Ratis transaction while acting as different versions, so the gate keeps their state machines from diverging.

The mental test: *would an OM acting as apparent v100 and an OM acting as v105, both replaying this transaction from Ratis, arrive at the same DB state?* If not, it needs a gate.

### OM ↔ OM peer RPCs (outside Ratis)

**Incompatible:** adding a required method — or changing the semantics of an existing method — on [`OMAdminProtocol`](https://github.com/apache/ozone/blob/master/hadoop-ozone/common/src/main/java/org/apache/hadoop/ozone/om/protocol/OMAdminProtocol.java) or [`OMInterServiceProtocol`](https://github.com/apache/ozone/blob/master/hadoop-ozone/common/src/main/java/org/apache/hadoop/ozone/om/protocol/OMInterServiceProtocol.java).

**Pattern:** during a rolling upgrade, peer OMs can be at mixed software versions, so a new method may not exist on the callee. Unlike an unknown protobuf *field*, an unknown *method* fails the RPC outright. A new peer RPC must therefore either version-gate on the caller or degrade gracefully when the callee does not implement it.

### OM → SCM communication

**Incompatible:** any change to [`ScmBlockLocationProtocol`](https://github.com/apache/ozone/blob/master/hadoop-hdds/framework/src/main/java/org/apache/hadoop/hdds/scm/protocol/ScmBlockLocationProtocol.java) or [`StorageContainerLocationProtocol`](https://github.com/apache/ozone/blob/master/hadoop-hdds/framework/src/main/java/org/apache/hadoop/hdds/scm/protocol/StorageContainerLocationProtocol.java) which does not leave SCM's server backwards compatible with older OM clients

**Pattern:** SCM is always upgraded before OM, so compatibility is maintained by requiring SCM's server to always remain backwards compatible with older clients. Finalization happens in the same order after upgrade is complete. This ordering combined with bakcwards compatibility guarantees of the SCM server allows OM and SCM to communicate without passing versions between them. Note that OM must still gate any new OM behavior on its own `versionManager.isAllowed(...)`. OM should not start exercising a new feature against SCM until OM itself has finalized, which guarantees that SCM has also finalized.

### SCM state machine / SCM RocksDB

**Incompatible:** renaming a state-manager method invoked over Ratis, changing an argument codec, or changing what a state manager persists to RocksDB. SCM's Ratis protocol is a generic reflective RPC — different from OM's typed `OMRequest` — so the method name and argument types are part of the wire format. A rename or codec swap is a real break, not just a source-level refactor.

**Pattern:** gate the *behavior* the state manager performs on `scm.getVersionManager().isAllowed(HDDSVersion.X)`. Never rename or delete an existing Ratis-invoked method or change its argument encoding; add a new method instead and gate the switch to it.

### SCM → Datanode commands

**Incompatible:** new required fields on `SCMCommandProto`, new command types, or changed semantics for an existing command. Purely additive optional fields are safe.

**Pattern:** when a command's behaviour depends on the target Datanode's apparent version, SCM stamps that apparent version onto the command proto. The Datanode keys its behaviour off the stamped value (floored at `HDDSVersion.ZDU`), never off its own version — because the target may be finalized while the command was computed for an older peer. The [`ReplicateContainerCommandProto.apparentVersion`](https://github.com/apache/ozone/blob/master/hadoop-hdds/interface-server/src/main/proto/ScmServerDatanodeHeartbeatProtocol.proto) field is the shape to imitate.

### Datanode → SCM heartbeat / reports

**Incompatible:** changing the semantics of an existing field, or making a new field *required* for correct SCM processing.

**Pattern:** an additive report field where SCM's default handles a pre-upgrade Datanode correctly needs no gate. The canonical example is `ContainerReplicaProto.isEmpty` (in [`ScmServerDatanodeHeartbeatProtocol.proto`](https://github.com/apache/ozone/blob/master/hadoop-hdds/interface-server/src/main/proto/ScmServerDatanodeHeartbeatProtocol.proto)): a newer Datanode sets it, an older Datanode omits it, and SCM defaults it to `false` — which is the safe assumption. Contrast that with a field whose presence would change SCM's behavior in a way that diverges from the pre-upgrade result. That does need a gate.

### Datanode write path

**Incompatible:** any change to how a container replica is written that must be identical across all replicas. This includes a new chunk-checksum scheme, a new container-schema selection, or new write-RPC semantics.

**Pattern:** Gate new write behavior on the **client-provided write pipeline version**, never on the Datanode's own apparent version. All Datanodes in a pipeline must write with the same version, and a finalized Datanode may still have peers that have not finalized, so the version has to come from the client (SCM computes the lowest common apparent version across the pipeline and clients forward it). [`ClientCommandsUtils.java`](https://github.com/apache/ozone/blob/master/hadoop-hdds/common/src/main/java/org/apache/hadoop/hdds/scm/utils/ClientCommandsUtils.java) is where the Datanode resolves that version.

### Datanode read path

**Incompatible:** Any change that prevents older data from being read. A container's schema is fixed for the container's lifetime once it is created, so Datanodes must be able to serve every schema that was ever written.

**Pattern:** **old data must remain readable forever.** Never remove a read path for a prior schema. A new schema adds a new branch; it never replaces an existing one.

### Datanode ↔ Datanode (replication, EC reconstruction, reconcile)

**Incompatible:** the same rules as the write path, applied to the inter-Datanode commands and requests — `CopyContainerRequestProto`, `SendContainerRequest`, `ReconstructECContainersCommandProto`, and `ReconcileContainerCommandProto`.

**Pattern:** SCM stamps the lowest Datanode's apparent version onto the command, and source and target Datanodes both execute the request at that version. It is always the newer component's job to handle compatibility. A newer target will not break existing APIs, so an older source keeps working.

### Datanode on-disk container schema

**Incompatible:** removing or repurposing an existing container schema (V1/V2/V3). Existing schemas must never disappear.

**Pattern:** a new schema is selected at container-create time from the write pipeline version and fixed for that container's life. Migrating existing containers to a new schema is an optional background process run after the upgrade completes. It is never part of finalization.

### Ratis state-machine snapshots (OM & SCM)

**Incompatible:** anything that makes a follower's installed snapshot unreadable by a peer that has not finalized. Snapshot compatibility *is* RocksDB-schema compatibility.

**Pattern:** if your change adds a new column family, it must not be populated until finalization. Otherwise a follower that installs a snapshot from a new leader ends up holding data an older peer cannot read after a downgrade. Gating the *write* into the new column family on the apparent version is what keeps snapshots portable.

### Recon

Recon is a client of both OM and SCM and receives Datanode heartbeats. It is upgraded alongside SCM (step 2 of the upgrade order), so it can be *ahead* of OM. Recon → OM is the one internal relationship where the client is newer than the server.

**Pattern:** Recon code that consumes an OM API must accept an older or pre-finalized OM. There is currently no version passing between Recon and OM, although this may be added later as needed.

Recon also has its own version framework — `ReconVersion` and `ReconVersionManager` — for Recon's own on-disk schema changes. Its job is to stop Recon from writing disk state that a downgraded Recon could not read. Adding a Recon feature that changes what Recon persists means adding a `ReconVersion` entry and gating the write on it, the same way OM and SCM gate their persisted changes.

### 14. Block tokens & delegation tokens

**Incompatible:** adding a new `AccessModeProto` value to `BlockTokenSecretProto`, or changing token enforcement semantics, in [`hdds.proto`](https://github.com/apache/ozone/blob/master/hadoop-hdds/interface-client/src/main/proto/hdds.proto). Purely additive token fields are safe.

**Pattern:** a token change whose enforcement depends on new bits being present should be gated on an OM version. OM refuses to *issue* tokens using the new mode until OM itself is finalized. Because OM cannot finalize until every active Datanode has finalized, "OM is finalized" guarantees every active Datanode can already honor the new mode.

## What is *not* an incompatible change

Not every change needs a gate. These are safe on their own:

- Additive protobuf fields with a safe default on the receiver side.
- New optional command types on `SCMCommandProto` that older Datanodes simply ignore.
- Refactors, log messages, comments, and metrics with independent state.
- Anything Recon writes to its own tables, provided that state can be rebuilt from a fresh OM snapshot.

## Finalization actions

You can attach an action to run when a version finalizes. The upgrade action is guaranteed to run at least once before the version is finalized and available for use. Register actions through the per-component providers:

- [`OMUpgradeActionProvider`](https://github.com/apache/ozone/blob/master/hadoop-ozone/ozone-manager/src/main/java/org/apache/hadoop/ozone/om/upgrade/OMUpgradeActionProvider.java)
- [`ScmUpgradeActionProvider`](https://github.com/apache/ozone/blob/master/hadoop-hdds/server-scm/src/main/java/org/apache/hadoop/hdds/upgrade/ScmUpgradeActionProvider.java)
- [`DatanodeUpgradeActionProvider`](https://github.com/apache/ozone/blob/master/hadoop-hdds/container-service/src/main/java/org/apache/hadoop/hdds/upgrade/DatanodeUpgradeActionProvider.java)
- [`ReconUpgradeActionProvider`](https://github.com/apache/ozone/blob/master/hadoop-ozone/recon/src/main/java/org/apache/hadoop/ozone/recon/upgrade/ReconUpgradeActionProvider.java)

An upgrade action must be:

- **Constant time.** Finalization is synchronous within a component. An action whose cost grows with cluster or dataset size stalls the whole finalize path. Never do invasive on-disk reformatting here.
- **Idempotent.** It may run again after a restart or partial failure during finalization.
- **Willing to throw on error.** A thrown exception is what tells the framework that finalization of this feature failed and that the component must crash and be restarted to make progress. An action that swallows its exception and returns will *not* be retried and the version will be finalized without the action completing.

## Testing your change

- Unit and integration tests exercise a feature at a chosen apparent version by injecting it into the component's version manager. Unit tests typically mock it, and cross-version tests set it before the component starts. Start from the version manager for the component you are touching: [`OMVersionManager`](https://github.com/apache/ozone/blob/master/hadoop-ozone/ozone-manager/src/main/java/org/apache/hadoop/ozone/om/upgrade/OMVersionManager.java), [`ScmVersionManager`](https://github.com/apache/ozone/blob/master/hadoop-hdds/server-scm/src/main/java/org/apache/hadoop/hdds/scm/server/upgrade/ScmVersionManager.java), [`DatanodeVersionManager`](https://github.com/apache/ozone/blob/master/hadoop-hdds/container-service/src/main/java/org/apache/hadoop/ozone/container/upgrade/DatanodeVersionManager.java), or [`ReconVersionManager`](https://github.com/apache/ozone/blob/master/hadoop-ozone/recon/src/main/java/org/apache/hadoop/ozone/recon/upgrade/ReconVersionManager.java).
- Any incompatible feature that touches an internal wire or on-disk format should also get coverage in the rolling-upgrade acceptance suite under [`hadoop-ozone/dist/src/main/compose/upgrade/upgrades`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dist/src/main/compose/upgrade/upgrades).

## See also

- [ZDU design document](https://github.com/apache/ozone/blob/master/hadoop-hdds/docs/content/design/zdu-design.md) — the rationale, invariants, and full step-by-step upgrade walkthrough.
- [Upgrade and Downgrade](../administrator-guide/operations/upgrade-and-downgrade) — the operator-facing guide to running an upgrade.
