---
sidebar_label: Recon
---

# Directory Configurations for Recon

This section describes the directory-related configuration properties used by Recon.

| Property Name                     | Description                                                                                                                | Tags | Default/Example Value                         | Sample Value               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------- | -------------------------- |
| `ozone.recon.db.dir`              | Directory where the Recon Server stores its metadata. If not defined, falls back to `ozone.metadata.dirs`. | OZONE, RECON, STORAGE, PERFORMANCE             | Empty (creates directory if it doesn't exist) | `/var/data/ozone/recon`    |
| `ozone.recon.db.dirs.permissions` | Permissions for the Recon metadata directories. Values may be octal or symbolic.                                           |                                                  | `700`                                         | `700`                      |
| `ozone.recon.om.db.dir`           | Directory where the Recon Server stores its OM snapshot DB. If not defined, falls back to `ozone.metadata.dirs`.           | OZONE, RECON, STORAGE                            | Empty (creates directory if it doesn't exist) | `/var/data/ozone/recon/om` |
| `ozone.metadata.dirs`             | General fallback location used by SCM, OM, Recon, and DataNodes for metadata when more specific directories are not set. | OZONE, OM, SCM, CONTAINER, STORAGE, REQUIRED     | Empty                                         | `/var/data/ozone/metadata` |
