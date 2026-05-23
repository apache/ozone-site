---
sidebar_label: OM migration approaches
---

# Ozone Manager migration approaches

This page describes two approaches for moving Ozone Manager (OM) roles to new hosts in an HA deployment:

- Configuration-based migration, where every new OM has its own unique host address and clients update `ozone-site.xml` before and after the migration.
- DNS-based migration, where clients keep stable OM hostnames and operators remap DNS from each old OM host to a new OM host.

Both approaches use the same Ratis membership operations: bootstrap the new OMs, make sure the OM being removed is not leader, decommission the old OMs, and clean up obsolete configuration. The main difference is where the cutover happens: in client configuration or in DNS.

## Comparing the strategies

| Concern | Configuration-based migration | DNS-based migration |
| ------- | ----------------------------- | ------------------- |
| Client changes | Clients must update configuration before the migration to include the new OMs, then update again after cleanup to remove the old OMs. | Clients can keep the same logical OM hostnames if they already rely on DNS. |
| Host identity | Each OM has a unique configured host address. There is no period where one OM hostname intentionally points to different machines. | Each logical hostname is remapped from an old OM host to a new OM host. |
| Migration order | Multiple new OMs can be added to configuration and bootstrapped before decommissioning the old OMs. | Migrate one logical OM hostname at a time: bootstrap one new OM, remap one hostname, decommission one old OM, then repeat. |
| Leadership handling | Transfer leadership away from each old OM before decommissioning it. After all clients have the expanded config, any new OM can safely become leader. | Keep leadership on an OM that clients can still resolve until the DNS remap for the replacement is propagated. After each remap and decommission, transfer leadership to the replacement OM to validate client failover. |
| Safety | Safer and easier to reason about because OM peer identity and network address stay explicit. | More sensitive to DNS caches, `/etc/hosts`, resolver skew, and clients that do not refresh name resolution quickly. |
| Operational speed | Slower when many clients, gateways, and integrations need coordinated config updates. | Faster when DNS is reliable and client configs already use stable hostnames. |
| Failure mode | Partial config rollout can leave some clients unaware of the new OMs or still using old OMs after cleanup. | Partial DNS propagation can make different clients resolve the same OM hostname to different hosts. |

Use configuration-based migration when safety and explicit host identity are more important than migration speed, or when the client population is small enough to roll configuration predictably.

Use DNS-based migration when client configuration is hard to update, OM hostnames are already stable DNS names, and the team can audit hosts files, DNS TTLs, and name-resolution behavior before cutover.

## Migration order

Configuration-based migration can bootstrap multiple new OMs at once because clients and OMs are explicitly updated with the expanded peer list before any old OM is removed. In the example below, the cluster temporarily has six OMs (`om1` through `om6`), then the old three are decommissioned.

DNS-based migration must be done one logical OM hostname at a time. Clients still know only the original logical hostnames (`om1.example.com`, `om2.example.com`, and `om3.example.com`). If multiple new OMs are bootstrapped before their corresponding hostnames are remapped, a new OM can become leader while clients still cannot resolve any configured hostname to it. For DNS migration, complete the bootstrap, DNS remap, decommission, and validation for one OM before starting the next.

## Leadership transfer and rollback

Before decommissioning an OM, verify that it is not the current leader:

```shell
ozone admin om roles -id=prod
```

If the OM being removed is leader, transfer leadership to an OM that should remain available:

```shell
ozone admin om transfer -id prod -n om4
```

The `-n` option names the target OM node ID. If any follower is acceptable, Ozone also supports a random transfer:

```shell
ozone admin om transfer -id prod -r
```

For DNS-based migration, a leadership transfer to the replacement OM after DNS propagation is also a useful validation step. It forces clients to reconnect or fail over to the current leader through the remapped logical hostname.

Rollback depends on how far the migration has progressed:

- Before the old OM is decommissioned, transfer leadership back to an old OM if needed, revert the config or DNS change, and stop or decommission the newly bootstrapped replacement.
- After the old OM is decommissioned, do not try to bring it back with the same node ID. Bootstrap a replacement OM with a new node ID, then point the client configuration or DNS record to that replacement.
- If the replacement OM needs to be rolled back after it has joined the ring, decommission the replacement OM using the normal OM decommission procedure.

## Configuration-based migration

Configuration-based migration gives each new OM its own unique address in `ozone-site.xml`. Clients and Ozone services learn about the new OMs through configuration rollout, not DNS remapping.

The examples below use an OM service ID of `prod` and migrate all three OMs from `om1`, `om2`, and `om3` to `om4`, `om5`, and `om6`.

| OM node | Hostname | Initial state |
| ------- | -------- | ------------- |
| `om1` | `om1.example.com` | Existing OM to be replaced |
| `om2` | `om2.example.com` | Existing OM to be replaced |
| `om3` | `om3.example.com` | Existing OM to be replaced |
| `om4` | `om4.example.com` | New OM host |
| `om5` | `om5.example.com` | New OM host |
| `om6` | `om6.example.com` | New OM host |

### Step 1: Publish the expanded OM configuration

#### OM node configuration

Add all new OMs to the OM HA configuration used by the existing OMs and the new OMs:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om1,om2,om3,om4,om5,om6</value>
</property>
<property>
  <name>ozone.om.address.prod.om4</name>
  <value>om4.example.com</value>
</property>
<property>
  <name>ozone.om.address.prod.om5</name>
  <value>om5.example.com</value>
</property>
<property>
  <name>ozone.om.address.prod.om6</name>
  <value>om6.example.com</value>
</property>
```

The existing OMs do not need to restart only because the new peer entries are present. During bootstrap, Ozone verifies that existing OMs have the new OM details in their on-disk configuration and can reload those details for the bootstrap request.

#### Client and service configuration

Roll the same expanded OM list to clients and services that connect to OM, such as S3 Gateway, OFS clients, Recon, and application jobs:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om1,om2,om3,om4,om5,om6</value>
</property>
<property>
  <name>ozone.om.address.prod.om4</name>
  <value>om4.example.com</value>
</property>
<property>
  <name>ozone.om.address.prod.om5</name>
  <value>om5.example.com</value>
</property>
<property>
  <name>ozone.om.address.prod.om6</name>
  <value>om6.example.com</value>
</property>
```

Clients should receive this first configuration update before any old OM is decommissioned. If a new OM later becomes leader, clients that still only know `om1`, `om2`, and `om3` may be unable to reach the current leader.

#### New OM preparation

Apply the expanded configuration to the new OM hosts. Before bootstrapping, copy or synchronize the OM metadata database to each new host according to the normal OM bootstrap procedure for your deployment. Keep the database copies fresh enough that each bootstrap can catch up safely.

#### Validation

Check that the configuration on each existing OM contains all new node IDs and addresses. If your configuration distribution system has separate server and client packages, confirm that both packages now include `om4`, `om5`, and `om6`.

### Step 2: Bootstrap the new OMs

#### OM node configuration

No additional OM configuration changes are required after Step 1.

#### Client and service configuration

No additional client or service configuration changes are required in this step.

#### New OM action

Run bootstrap on each new OM host:

```shell
# On om4.example.com
ozone om --bootstrap
ozone --daemon start om

# On om5.example.com
ozone om --bootstrap
ozone --daemon start om

# On om6.example.com
ozone om --bootstrap
ozone --daemon start om
```

The new OMs can be bootstrapped before any old OM is decommissioned because both OM-side and client-side configuration already include the expanded peer list.

#### Validation

Validate the OM roles:

```shell
ozone admin om roles -id=prod
```

The expected state at this point is that the old OMs and new OMs are all in the ring:

```text
om1 : FOLLOWER (om1.example.com)
om2 : LEADER (om2.example.com)
om3 : FOLLOWER (om3.example.com)
om4 : FOLLOWER (om4.example.com)
om5 : FOLLOWER (om5.example.com)
om6 : FOLLOWER (om6.example.com)
```

Check OM logs for abnormal Ratis, snapshot, or peer-connection errors before decommissioning the old OMs.

### Step 3: Decommission the old OMs

#### OM node configuration

Add the old OM node IDs to the decommissioned nodes list used by the retained OMs:

```xml
<property>
  <name>ozone.om.decommissioned.nodes.prod</name>
  <value>om1,om2,om3</value>
</property>
```

The decommission command checks that each decommissioned node is listed in OM configuration. If your deployment distributes one common OM config file, it is fine for the old OM hosts to receive the same update before the commands are run.

#### Client and service configuration

Do not remove `om1`, `om2`, or `om3` from client configuration yet. During decommission, clients can safely carry both old and new OM addresses as long as the retained OMs are reachable.

#### Old OM action

Decommission the old OMs in a controlled sequence. Before each command, confirm that the target OM is not the leader; if needed, transfer leadership to a retained OM:

```shell
ozone admin om transfer -id prod -n om4
```

```shell
ozone admin om decommission -id=prod -nodeid=om1 -hostname=om1.example.com
ozone admin om decommission -id=prod -nodeid=om2 -hostname=om2.example.com
ozone admin om decommission -id=prod -nodeid=om3 -hostname=om3.example.com
```

#### Validation

The decommissioned OMs should stop and disappear from `ozone admin om roles` output:

```text
om4 : LEADER (om4.example.com)
om5 : FOLLOWER (om5.example.com)
om6 : FOLLOWER (om6.example.com)
```

Validate client traffic and OM logs again after each decommission command and after the full old-OM set has been removed.

### Step 4: Clean up the old OM configuration

#### OM node configuration

After the old OMs have been decommissioned, remove obsolete entries from the retained OM configuration:

- `ozone.om.decommissioned.nodes.prod`
- `ozone.om.address.prod.om1`
- `ozone.om.address.prod.om2`
- `ozone.om.address.prod.om3`
- the old node IDs from `ozone.om.nodes.prod`

The resulting OM node list should contain only retained OMs:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om4,om5,om6</value>
</property>
```

When convenient, restart OMs so the cleaned configuration is reflected consistently.

#### Client and service configuration

Roll the cleanup configuration to clients and services so they no longer carry the retired OM addresses:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om4,om5,om6</value>
</property>
```

Restart or reload clients and services according to their deployment model.

#### Validation

Confirm that clients can reach OM using the cleaned configuration and that no expected traffic still targets `om1.example.com`, `om2.example.com`, or `om3.example.com`. Do not shut down or repurpose the old machines until clients have picked up the cleanup configuration.

## DNS-based migration

DNS-based migration moves OM roles while keeping client-side OM hostnames stable. It is useful when many clients already reference logical OM hostnames and updating every client configuration would make the migration slow or hard to coordinate.

DNS-based migration changes name resolution for one OM hostname at a time. The OM HA ring still relies on correct Ratis membership and valid OM peer addresses, so the migration must be coordinated with OM bootstrap and decommission operations.

The examples below use an OM service ID of `prod` and migrate three logical hostnames to three new OM hosts:

| Logical hostname | Old OM node | Old IP | New OM node | New IP |
| ---------------- | ----------- | ------ | ----------- | ------ |
| `om1.example.com` | `om1` | `10.0.0.1` | `om4` | `10.0.0.4` |
| `om2.example.com` | `om2` | `10.0.0.2` | `om5` | `10.0.0.5` |
| `om3.example.com` | `om3` | `10.0.0.3` | `om6` | `10.0.0.6` |

Move only one logical OM hostname at a time. Clients usually know only the configured logical hostnames. If a newly bootstrapped OM becomes leader before clients can resolve an existing logical hostname to it, clients may be unable to reach the current leader even though the OM quorum is healthy.

### Step 1: Migrate `om1.example.com` from `om1` to `om4`

#### OM node configuration

Add only the first replacement OM to the server-side `ozone-site.xml` used by OMs. Use addresses that remain stable for OM-to-OM communication while DNS is being remapped. IP addresses are the clearest option:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om1,om2,om3,om4</value>
</property>
<property>
  <name>ozone.om.address.prod.om1</name>
  <value>10.0.0.1</value>
</property>
<property>
  <name>ozone.om.address.prod.om4</name>
  <value>10.0.0.4</value>
</property>
```

Apply the same server-side peer-address convention to Recon and other Ozone services that track OM peers directly. Do not add `om5` or `om6` yet.

#### Client and service configuration

Client-facing configuration continues to use the original logical hostnames:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om1,om2,om3</value>
</property>
<property>
  <name>ozone.om.address.prod.om1</name>
  <value>om1.example.com</value>
</property>
```

Do not add `om4` to client configuration for this strategy. Clients follow the migration when `om1.example.com` resolves to the new IP.

#### New OM action

Apply the server-side configuration to `om4`, copy or synchronize the OM metadata database, then make sure `om1` is not leader. Run bootstrap on `om4`:

```shell
ozone om --bootstrap
ozone --daemon start om
```

Validate that `om4` is in the ring and is not leader:

```shell
ozone admin om roles -id=prod
```

#### DNS action

Update DNS for the first logical hostname:

| Hostname | Before | After |
| -------- | ------ | ----- |
| `om1.example.com` | `10.0.0.1` | `10.0.0.4` |

Wait for the DNS TTL and maximum resolver propagation window used in your environment. Validate from representative hosts, edge nodes, and application containers that `om1.example.com` resolves to `10.0.0.4`.

#### Old OM action

After DNS is consistent and `om1` is not leader, add `om1` to the decommissioned nodes list and decommission it:

```xml
<property>
  <name>ozone.om.decommissioned.nodes.prod</name>
  <value>om1</value>
</property>
```

```shell
ozone admin om decommission -id=prod -nodeid=om1 -hostname=10.0.0.1
```

#### Validation

Confirm that the retained OM ring contains `om2`, `om3`, and `om4`, and that client traffic remains normal. After DNS has propagated and `om1` has been decommissioned, transfer leadership to `om4` to validate that clients can reach the replacement through `om1.example.com`:

```shell
ozone admin om transfer -id prod -n om4
```

Do not begin the next hostname migration until this validation is complete.

### Step 2: Migrate `om2.example.com` from `om2` to `om5`

#### OM node configuration

Clean up the server-side configuration for the removed `om1`, then add `om5`:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om2,om3,om4,om5</value>
</property>
<property>
  <name>ozone.om.address.prod.om2</name>
  <value>10.0.0.2</value>
</property>
<property>
  <name>ozone.om.address.prod.om5</name>
  <value>10.0.0.5</value>
</property>
```

#### Client and service configuration

Client-facing configuration still uses the original logical hostnames:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om1,om2,om3</value>
</property>
<property>
  <name>ozone.om.address.prod.om2</name>
  <value>om2.example.com</value>
</property>
```

Do not add `om5` to client configuration.

#### New OM action

Apply the server-side configuration to `om5`, copy or synchronize the OM metadata database, then make sure `om2` is not leader. Run bootstrap on `om5`:

```shell
ozone om --bootstrap
ozone --daemon start om
```

#### DNS action

Update DNS for the second logical hostname:

| Hostname | Before | After |
| -------- | ------ | ----- |
| `om2.example.com` | `10.0.0.2` | `10.0.0.5` |

Wait for DNS propagation and validate representative clients.

#### Old OM action

After DNS is consistent and `om2` is not leader, add `om2` to the decommissioned nodes list and decommission it:

```xml
<property>
  <name>ozone.om.decommissioned.nodes.prod</name>
  <value>om2</value>
</property>
```

```shell
ozone admin om decommission -id=prod -nodeid=om2 -hostname=10.0.0.2
```

#### Validation

Confirm that the retained OM ring contains `om3`, `om4`, and `om5`, and that client traffic remains normal. After DNS has propagated and `om2` has been decommissioned, transfer leadership to `om5` to validate that clients can reach the replacement through `om2.example.com`:

```shell
ozone admin om transfer -id prod -n om5
```

Do not begin the next hostname migration until this validation is complete.

### Step 3: Migrate `om3.example.com` from `om3` to `om6`

#### OM node configuration

Clean up the server-side configuration for the removed `om2`, then add `om6`:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om3,om4,om5,om6</value>
</property>
<property>
  <name>ozone.om.address.prod.om3</name>
  <value>10.0.0.3</value>
</property>
<property>
  <name>ozone.om.address.prod.om6</name>
  <value>10.0.0.6</value>
</property>
```

#### Client and service configuration

Client-facing configuration still uses the original logical hostnames:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om1,om2,om3</value>
</property>
<property>
  <name>ozone.om.address.prod.om3</name>
  <value>om3.example.com</value>
</property>
```

Do not add `om6` to client configuration.

#### New OM action

Apply the server-side configuration to `om6`, copy or synchronize the OM metadata database, then make sure `om3` is not leader. Run bootstrap on `om6`:

```shell
ozone om --bootstrap
ozone --daemon start om
```

#### DNS action

Update DNS for the third logical hostname:

| Hostname | Before | After |
| -------- | ------ | ----- |
| `om3.example.com` | `10.0.0.3` | `10.0.0.6` |

Wait for DNS propagation and validate representative clients.

#### Old OM action

After DNS is consistent and `om3` is not leader, add `om3` to the decommissioned nodes list and decommission it:

```xml
<property>
  <name>ozone.om.decommissioned.nodes.prod</name>
  <value>om3</value>
</property>
```

```shell
ozone admin om decommission -id=prod -nodeid=om3 -hostname=10.0.0.3
```

#### Validation

Confirm that the retained OM ring contains only the new OMs:

```text
om4 : LEADER (10.0.0.4)
om5 : FOLLOWER (10.0.0.5)
om6 : FOLLOWER (10.0.0.6)
```

After DNS has propagated and `om3` has been decommissioned, transfer leadership to `om6` to validate that clients can reach the replacement through `om3.example.com`:

```shell
ozone admin om transfer -id prod -n om6
```

Validate client traffic and OM logs after the final old OM is removed.

### Step 4: Clean up after DNS migration

#### OM node configuration

After all old OMs have been decommissioned, remove obsolete entries from the retained OM configuration:

- `ozone.om.decommissioned.nodes.prod`
- `ozone.om.address.prod.om1`
- `ozone.om.address.prod.om2`
- `ozone.om.address.prod.om3`
- the old node IDs from `ozone.om.nodes.prod`

The retained OM configuration should contain only the new OMs:

```xml
<property>
  <name>ozone.om.nodes.prod</name>
  <value>om4,om5,om6</value>
</property>
```

When convenient, restart OMs so the cleaned configuration is reflected consistently.

#### Client and service configuration

Client configuration can remain unchanged if it intentionally uses `om1.example.com`, `om2.example.com`, and `om3.example.com` as stable logical addresses for the replacement OMs. Services that use server-side peer addresses, such as Recon, should receive the same cleanup as the OMs.

#### Validation

Confirm that all logical hostnames resolve to the new IPs:

| Hostname | Expected IP |
| -------- | ----------- |
| `om1.example.com` | `10.0.0.4` |
| `om2.example.com` | `10.0.0.5` |
| `om3.example.com` | `10.0.0.6` |

Confirm that no expected traffic still connects to the old IP addresses. Do not shut down or repurpose the old machines until you are confident no clients still connect to the old IPs. If clients still try to use an old host and the machine is offline, they may wait for connection timeouts before failing over. Stopping only the OM process allows clients to detect that OM is unavailable and fail over more quickly.
