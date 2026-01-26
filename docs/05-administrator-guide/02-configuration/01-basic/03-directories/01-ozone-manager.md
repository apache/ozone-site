---
sidebar_label: Ozone Manager
---

# Directory Configurations for Ozone Manager

This section describes the directory-related configuration properties used by Ozone Manager (OM).

```xml
  <property>
    <name>ozone.om.db.dirs</name>
    <value/>
    <tag>OZONE, OM, STORAGE, PERFORMANCE</tag>
    <description>
      Directory where the OzoneManager stores its metadata. This should
      be specified as a single directory. If the directory does not
      exist then the OM will attempt to create it.

      If undefined, then the OM will log a warning and fallback to
      ozone.metadata.dirs. This fallback approach is not recommended for
      production environments.
    </description>
  </property>
  <property>
    <name>ozone.om.db.dirs.permissions</name>
    <value>750</value>
    <description>
      Permissions for the metadata directories for Ozone Manager. The
      permissions have to be octal or symbolic. If the default permissions are not set
      then the default value of 750 will be used.
    </description>
  </property>

<property>
  <name>ozone.om.ratis.storage.dir</name>
  <value/>
  <tag>OZONE, OM, STORAGE, MANAGEMENT, RATIS</tag>
  <description>This directory is used for storing OM's Ratis metadata like
    logs. If this is not set then default metadata dirs is used. A warning
    will be logged if this not set. Ideally, this should be mapped to a
    fast disk like an SSD.
    If undefined, OM ratis storage dir will fallback to ozone.metadata.dirs.
    This fallback approach is not recommended for production environments.
  </description>
</property>

<property>
  <name>ozone.om.ratis.snapshot.dir</name>
  <value/>
  <tag>OZONE, OM, STORAGE, MANAGEMENT, RATIS</tag>
  <description>This directory is used for storing OM's snapshot
    related files like the ratisSnapshotIndex and DB checkpoint from leader
    OM.
    If undefined, OM snapshot dir will fallback to ozone.metadata.dirs.
    This fallback approach is not recommended for production environments.
  </description>
</property>

<property>
  <name>ozone.om.snapshot.diff.db.dir</name>
  <value/>
  <tag>OZONE, OM</tag>
  <description>
    Directory where the OzoneManager stores the snapshot diff related data.
    This should be specified as a single directory. If the directory does not
    exist then the OM will attempt to create it.

    If undefined, then the OM will log a warning and fallback to
    ozone.metadata.dirs. This fallback approach is not recommended for
    production environments.
  </description>
</property>
```
