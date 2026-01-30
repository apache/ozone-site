---
sidebar_label: Datanodes
---

# Replacing Datanode Disks

## Overview

Ozone Datanodes can manage multiple data volumes (disks) simultaneously. This document describes how volume failures are detected, handled, and how to replace failed disks in an Ozone Datanode.

## Volume Configuration

### Data Volumes

Data volumes are configured using the `hdds.datanode.dir` property. Each directory represents a volume (disk) that the Datanode will manage.

**Example:**

```xml
<property>
  <name>hdds.datanode.dir</name>
  <value>/data1,/data2,/data3</value>
</property>
```

This configuration tells the Datanode to manage three separate volumes: `/data1`, `/data2`, and `/data3`.

### Metadata Volumes

Metadata volumes store Ratis metadata (logs) and are configured using `hdds.container.ratis.datanode.storage.dir`. If not explicitly configured, metadata is stored in the default metadata directories.

### Database Volumes

Database volumes store per-volume RocksDB instances and are configured using `hdds.datanode.container.db.dir`. This is optional - if not specified, RocksDB instances are stored on the same disk as HDDS data.

:::note
By default, metadata and database volumes share the same physical disks as data volumes. They can be configured on separate disks (e.g., SSDs) for better performance, but this is optional.
:::

---

## Volume Failure Tolerance

Ozone Datanodes can tolerate a configurable number of volume failures before stopping service. The following configuration properties control this behavior:

### Data Volume Failure Tolerance

**Property:** `hdds.datanode.failed.data.volumes.tolerated`

**Default:** `-1` (unlimited)

**Description:** The number of data volumes that are allowed to fail before a Datanode stops offering service. When set to `-1`, unlimited failures are tolerated, but **at least one good volume must remain** for the Datanode to continue operating.

**Example:**

```xml
<property>
  <name>hdds.datanode.failed.data.volumes.tolerated</name>
  <value>2</value>
</property>
```

This allows up to 2 data volumes to fail before the Datanode stops service.

### Metadata Volume Failure Tolerance

**Property:** `hdds.datanode.failed.metadata.volumes.tolerated`

**Default:** `-1` (unlimited)

**Description:** The number of metadata volumes that are allowed to fail before a Datanode stops offering service. Similar to data volumes, `-1` means unlimited failures are tolerated, but at least one good metadata volume must remain.

### Database Volume Failure Tolerance

**Property:** `hdds.datanode.failed.db.volumes.tolerated`

**Default:** `-1` (unlimited)

**Description:** The number of database volumes that are allowed to fail before a Datanode stops offering service. When set to `-1`, unlimited failures are tolerated, but at least one good database volume must remain.

---

## Volume Failure Detection

### Startup Checks

During Datanode startup, the system performs comprehensive checks on all configured volumes to determine if any have failed. The initialization process:

1. Parses all volume locations from configuration
2. Attempts to create and access each volume
3. Performs directory existence and permission checks
4. Moves failed volumes to a separate failed volume map

If a volume fails during initialization:

- The volume is immediately marked as failed
- It is moved from the active volume map to the failed volume map
- The Datanode continues startup if enough volumes remain (based on tolerance settings)
- If all volumes fail or tolerance limits are exceeded, the Datanode will abort startup

### Periodic Disk Checks

After startup, the Datanode runs periodic disk health checks to detect volumes that fail during runtime.

**Property:** `hdds.datanode.periodic.disk.check.interval.minutes`

**Default:** `60` (minutes)

**Description:** The interval at which periodic disk checks are performed. These checks verify:

- Directory existence and accessibility
- Directory permissions
- Disk I/O functionality (read/write tests)
- For data volumes with RocksDB: database accessibility

**Example:**

```xml
<property>
  <name>hdds.datanode.periodic.disk.check.interval.minutes</name>
  <value>30</value>
</property>
```

This configures disk checks to run every 30 minutes instead of the default 60 minutes.

### Disk Check Configuration

Additional properties control disk health check behavior:

| Property | Default | Description |
|----------|---------|-------------|
| `hdds.datanode.disk.check.io.test.count` | `3` | Number of IO tests required to determine failure. Set to `0` to disable IO checks. |
| `hdds.datanode.disk.check.io.failures.tolerated` | `1` | IO test failures allowed before marking volume as failed |
| `hdds.datanode.disk.check.io.file.size` | `100B` | Size of temporary file used for I/O health checks |
| `hdds.datanode.disk.check.min.gap` | `10m` | Minimum time gap between successive checks of the same volume |
| `hdds.datanode.disk.check.timeout` | `10m` | Maximum time allowed for a disk check to complete |

## Failed Volume Handling

When a volume fails, it is:

1. Immediately removed from the active volume map and added to the failed volume map
2. Excluded from container allocation (only healthy volumes are considered by volume choosing policies)
3. Tracked in metrics (healthy count decremented, failed count incremented)

If failed volumes exceed the tolerance limit, the Datanode triggers fatal failure handling and may stop offering service.

---

## Replacing Failed Disks

:::note
**Important Limitation: No Hotswap Support**

Ozone Datanodes do not currently support hotswap of disks. To update the disk list (add or remove volumes), you must restart the Datanode process.
:::

### Steps to Replace a Failed Disk

1. **Identify Failed Volumes**
   - Check Datanode logs for volume failure messages
   - Monitor Datanode Web UI or metrics to see volume states
   - Failed volumes will show as "FAILED" in the volume state

2. **Shut Down the Datanode**

   ```bash
   # Stop the Datanode service
   ozone --daemon stop datanode
   ```

3. **Update Configuration**
   - Edit the Datanode configuration file (`ozone-site.xml` or equivalent)
   - Remove the failed volume directory from `hdds.datanode.dir`
   - If replacing with a new disk, add the new volume directory

   **Example - Removing `/data3` and adding `/data4`:**

   ```xml
   <!-- Before -->
   <property>
     <name>hdds.datanode.dir</name>
     <value>/data1,/data2,/data3</value>
   </property>
   
   <!-- After -->
   <property>
     <name>hdds.datanode.dir</name>
     <value>/data1,/data2,/data4</value>
   </property>
   ```

4. **Restart the Datanode**

   ```bash
   # Start the Datanode service
   ozone --daemon start datanode
   ```

5. **Verify Volume Status**
   - Check Datanode logs to confirm volumes are initialized correctly
   - Verify in Web UI that the new volume appears as healthy
   - Monitor metrics to ensure the failed volume is no longer present

### Physical Disk Replacement

When physically replacing a disk:

1. Verify containers have been replicated (handled automatically by Ozone)
2. Shut down the Datanode cleanly
3. Physically replace the disk
4. Format and mount the new disk to the desired path
5. Update `hdds.datanode.dir` configuration
6. Restart the Datanode

---

## Monitoring Volume Health

Volume status can be viewed via:

- **Datanode Web UI:** `http://<datanode-host>:<datanode-http-port>` - Shows volume directory, type, capacity, usage, and state (HEALTHY/FAILED)
- **JMX Metrics:** `http://<datanode-host>:<datanode-http-port>/jmx?qry=Hadoop:service=HddsDatanode,name=VolumeInfoMetrics*` - Exposes per-volume metrics including state

---

## Best Practices

1. Configure tolerance settings based on redundancy requirements (allow 1-2 failures for production)
2. Regularly monitor volume health via Web UI and metrics
3. Plan maintenance windows for disk replacement (hotswap not supported)
4. Verify container replication before removing failed disks
5. Adjust periodic disk check interval based on environment needs
6. Configure tolerance separately for data, metadata, and database volumes
