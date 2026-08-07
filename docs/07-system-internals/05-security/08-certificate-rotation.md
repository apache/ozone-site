---
sidebar_label: Certificate Rotation
---

# Certificate Rotation

For **internal mTLS**, Ozone can refresh **Root CA**, **Sub-CA**, and **component** certificates automatically so clusters stay secure **without a full stop**. The flow has three parts:

1. **SCM** rotates the cluster **Root CA** and, in HA, realigns every SCM **Sub-CA**.
2. **Each service** (Datanode, OM, S3 Gateway, Recon, …) **polls SCM** for new root certificates.
3. When a new root appears, the service **renews its own certificate**, swaps files on disk **atomically**, updates persisted metadata, and **reloads** TLS key/trust material in the running process.

:::info Internal cluster traffic only

This page describes certificates for **internal communication** between Ozone components (**mTLS** among SCM, OM, Datanodes, Recon, and related daemon identities). **SCM does not manage** the certificates used for **external** clients reaching the cluster (for example **HTTPS** to the S3 Gateway, REST UI, or other public endpoints). Those are usually **operator- or platform-provided** keystores and CAs, configured separately from the `hdds.x509.*` pipeline below.

:::

Whether automatic Root CA rotation is on, how often SCM checks expiry, and how often clients poll are all **configuration** (`hdds.x509.*`); see the [configuration appendix](../../administrator-guide/configuration/appendix). This page describes behavior, not every knob.

## 1. SCM: Root CA and Sub-CA (orchestration)

SCM runs **`RootCARotationManager`** to own the cluster PKI rotation.

- **When to rotate** — SCM periodically checks whether the **current Root CA** is approaching expiry. The exact schedule and thresholds come from settings such as `hdds.x509.ca.rotation.check.interval` and **`hdds.x509.renew.grace.duration`** (renewal grace period, below). Rotation is started **before** the root expires, in a controlled window—not at the last minute.
- **New Root CA** — SCM generates a **new Root CA** key pair and certificate.
- **Sub-CA (HA)** — With **SCM HA**, **Ratis** coordinates **Sub-CA** rotation: each SCM gets a new Sub-CA key pair and a certificate **signed by the new Root CA**.
- **Post-processing** — Right after rotation, SCM **pauses issuing new certificates** briefly so the **new Root CA** can propagate; then normal signing resumes.

## 2. Discovery: polling SCM

Services use **`RootCaRotationPoller`** inside **`CertificateClient`**.

- **Polling** — Call SCM’s **`getAllRootCaCertificates`** on an interval (for example `hdds.x509.rootca.certificate.polling.interval` in the [appendix](../../administrator-guide/configuration/appendix)).
- **Detection** — If SCM returns a Root CA the service does **not** yet trust, the client starts a **forced renewal** so the service re-issues under the new chain.

## 3. Execution: renew, swap, persist, reload

**`CertificateRenewerService`** performs the work on the service side:

- **CSR** — Generate a new key pair, send a **CSR** to SCM; SCM signs with the **Sub-CA** (under the **current Root CA**).
- **Atomic disk swap** — Typically: move the **active** keys/certs aside as backup, then promote **staged** (“next”) material into the active location.
- **Persist identity** — Update on-disk bookkeeping (for example **`datanodeDetails.setCertSerialId`** and the **VERSION** file where applicable) so restarts see the new certificate.
- **Reload in process** — Load the new keys and trust anchors into **`KeyManager`** / **`TrustManager`** so the **daemon keeps running** and new TLS traffic uses the updated material.

## Key classes

| Class | Role |
| --- | --- |
| `RootCARotationManager` | Root CA and Sub-CA rotation in SCM. |
| `RootCaRotationPoller` | Polls SCM for new Root CAs on DN, OM, etc. |
| `DefaultCertificateClient` | Shared certificate client logic. |
| `CertificateRenewerService` | CSR, signing, atomic swap, renewal flow. |
| `ClientTrustManager` | Trust store updates during rotation. |

## Renewal grace period

**Renewal grace** is how long **before expiry** Ozone aims to **renew** a certificate (used in renewal and rotation scheduling).

| Property | Value |
| --- | --- |
| **Key** | `hdds.x509.renew.grace.duration` |
| **Default** | `P28D` (28 days) |
| **Format** | ISO-8601 durations (e.g. `P28D`, `PT1H`) |

## Primordial SCM vs leader

- **Primordial SCM** — The node that **first** initializes the cluster; it creates the **initial Root CA** at bootstrap. See [SCM high availability](../../administrator-guide/configuration/high-availability/scm-ha).
- **Leader SCM** — The **current Ratis leader** drives **ongoing Root CA rotation** as roots age out; other SCM instances follow the replicated plan and rotate their Sub-CAs as in §1.

Bootstrap trust (primordial) and day-two rotation (leader) are intentionally separate roles.

## See also

- [How Ozone Uses Kerberos](./kerberos) — cluster authentication (orthogonal to internal PKI, often enabled together).
- [Configuration appendix](../../administrator-guide/configuration/appendix) — search `hdds.x509` (rotation enablement, check interval, polling, durations).
