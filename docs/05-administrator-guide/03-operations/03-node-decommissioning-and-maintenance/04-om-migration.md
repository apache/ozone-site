---
sidebar_label: OM migration approaches
---

# Ozone Manager migration approaches

When you move an **Ozone Manager (OM)** role from one host to another in an HA deployment, clients and other services must continue to reach the **current Ratis leader** and the **correct set of OM peers**. Two common patterns are **configuration-based** migration and **DNS-based** cutover.

For background on OM HA, see [Ozone Manager High Availability](../../../core-concepts/high-availability/om-ha). For **removing** an OM from the Ratis ring (decommission), see [Decommissioning an Ozone Manager](./ozone-manager). For **adding** or changing OM addresses in config, see [OM HA configuration](../../configuration/high-availability/om-ha).

## Configuration-based migration

**Idea:** Update `ozone-site.xml` (and any client config) so that OM RPC/HTTP addresses reflect the **new** hosts. Bootstrap or join the new OM node per your HA procedure, then decommission or retire the old node using the normal OM workflow.

**Pros**

- **Safer:** Each client and service explicitly uses the configured OM endpoints. There is no hidden dependency on a shared hostname resolving differently on different machines.

**Cons**

- **Slower operationally:** Every client, gateway, and integration that embeds OM settings must be updated and rolled in a coordinated way.
- **Broader blast radius:** Mis-timed or partial config rollout can cause confusing errors until all parties pick up the new addresses.

## DNS-based migration

**Idea:** Keep a **stable logical hostname** for each OM (for example `om1.example.com`) in client and server configuration. When you move the OM process to new hardware, change **DNS** (or equivalent name resolution) so that the same name resolves to the **new** IP—for example `om1-host` changing from `10.0.0.1` to `10.0.0.4`. Clients that only reference the hostname can keep the same `ozone-site.xml` values.

**Pros**

- **Faster cutover:** Once DNS and the OM service on the new host are ready, many clients need **no** config file change.
- **Same configs:** Reduces churn where OM addresses are duplicated across many apps.

**Cons**

- **Riskier:** Resolution is now a shared dependency; mistakes or skew show up as intermittent connectivity or “wrong leader” behavior.

**Practical risks to plan for**

1. **`/etc/hosts` and hardcoded IPs**  
   Some clients or jobs bypass DNS or pin the old IP. They will **not** follow a DNS change until fixed. Audit automation, edge nodes, and legacy clients.

2. **DNS caching and TTL**  
   Resolvers and applications cache answers. A low TTL before the change and awareness of **maximum propagation time** reduce the window where different nodes see different addresses for the same OM name.

3. **Leader election vs. client view**  
   After DNS points at the **new** machine, the **old** OM instance may still run or may rejoin the Ratis group until fully decommissioned. An **unplanned leader election** could elect a leader on a host that **clients no longer resolve** to the same address as the Ratis peer list expects, or that is no longer the intended entry point—clients may then be unable to reach the **current** leader even though the cluster is healthy internally. Mitigate by **fully decommissioning** the old OM, ensuring peer addresses in configuration match reality, and validating failover **before** relying on DNS cutover in production.

:::note
DNS-based migration is a **deployment pattern**, not a separate Ozone feature. The OM HA ring still must be operated with valid Ratis membership, correct `ozone.om.address` / related settings for peers, and procedures such as [decommission](./ozone-manager) when removing nodes.
:::

## Choosing an approach

| Concern | Configuration-based | DNS-based |
| ------- | ------------------- | --------- |
| Client rollout | All configs updated | Prefer hostname-based configs; watch hosts files and caches |
| Operational safety | Higher | Lower unless DNS and decommission are tightly controlled |
| Speed of cutover | Often slower | Often faster after DNS and services are ready |

Many teams use **configuration-based** migration for major OM changes or where few clients exist, and reserve **DNS-based** cutover for environments where OM hostnames are already canonical and DNS operational practice is strong.
