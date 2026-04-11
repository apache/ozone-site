---
sidebar_label: Storage Container Manager
---

# Directory Configurations for Storage Container Manager

This section describes directory-related configuration properties used by the Storage Container Manager (SCM).

| Property Name                     | Description                                                                                                                                 | Tags                                         | Default/Example Value                     | Sample Value                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------- | ---------------------------- |
| `ozone.scm.db.dirs`               | SCM metadata directory (set one path). SCM creates it if missing. If unset, SCM warns and uses `ozone.metadata.dirs`—avoid in production.                                                               | OZONE, SCM, STORAGE, PERFORMANCE             | Empty (uses `ozone.metadata.dirs`)      | `/var/data/ozone/scm`        |
| `ozone.scm.db.dirs.permissions`   | Permissions for SCM metadata dirs (octal or symbolic).                                                                                                                                                |                                              | `700`                                     | `700`                        |
| `ozone.metadata.dirs`             | Fallback metadata root for SCM, OM, Recon, and Datanodes when component-specific dirs are unset. Fine for test/PoC; in production set `ozone.scm.db.dirs`, `ozone.om.db.dirs`, and Datanode data dirs. | OZONE, OM, SCM, CONTAINER, STORAGE, REQUIRED | Empty                                     | `/data/ozone/metadata`       |
| `ozone.scm.ha.ratis.storage.dir`  | Ratis **log** directory for SCM when SCM HA is enabled. Prefer fast, durable disks (for example SSD).                                                                 | OZONE, SCM, HA, RATIS                        | Empty                                     | `/var/data/ozone/scm/ratis`  |
| `ozone.scm.ha.ratis.snapshot.dir` | Ratis **snapshot** directory for SCM when SCM HA is enabled.                                                                                                                                            | OZONE, SCM, HA, RATIS                        | Empty                                     | `/var/data/ozone/scm/snapshot` |
| `hdds.key.dir.name`               | Subdirectory **name** (relative to the SCM/HDDS metadata directory) where the SCM CA stores key material.                                                                                                 | SCM, HDDS, X509, SECURITY                    | `keys`                                    | `keys`                       |

For all keys and defaults, see the [configuration appendix](../../appendix).
