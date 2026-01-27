---
sidebar_label: Ozone Manager
---

# Directory Configurations for Ozone Manager

This section describes the directory-related configuration properties used by Ozone Manager (OM).

| Property Name                   | Description                                                                                                | Tags                                  | Default/Example Value                            | Sample Value               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ | -------------------------- |
| `ozone.om.db.dirs`              | Directory where the OzoneManager stores its metadata. If not defined, falls back to `ozone.metadata.dirs`. | OZONE, OM, STORAGE, PERFORMANCE       | Empty (creates directory if it doesn't exist)    | `/var/data/ozone/om`       |
| `ozone.om.db.dirs.permissions`  | Permissions for the metadata directories for Ozone Manager. Defaults to `750` if not defined.              |                                       | `750`                                            | `750`                      |
| `ozone.om.ratis.storage.dir`    | Directory for storing OM's Ratis metadata like logs. Should use fast storage like SSD.                     | OZONE, OM, STORAGE, MANAGEMENT, RATIS | Falls back to `ozone.metadata.dirs` if undefined | `/var/data/ozone/ratis`    |
| `ozone.om.ratis.snapshot.dir`   | Directory for storing OM's snapshot-related files like the `ratisSnapshotIndex` and DB checkpoint.         | OZONE, OM, STORAGE, MANAGEMENT, RATIS | Falls back to `ozone.metadata.dirs` if undefined | `/var/data/ozone/snapshot` |
| `ozone.om.snapshot.diff.db.dir` | Directory where OzoneManager stores snapshot diff-related data.                                            | OZONE, OM                             | Falls back to `ozone.metadata.dirs` if undefined | `/var/data/ozone/diff`     |
