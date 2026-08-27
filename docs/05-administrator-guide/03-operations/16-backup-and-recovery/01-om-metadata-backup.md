---
sidebar_label: OM metadata backup
---

# OM metadata backup (including bucket snapshots)

Back up **Ozone Manager (OM) namespace metadata**, including **bucket snapshot** RocksDB state, with `ozone repair om download` ([HDDS-16171](https://issues.apache.org/jira/browse/HDDS-16171)). This is not a substitute for Datanode block or SCM metadata backups.

The command uses the same v2 checkpoint transfer as OM follower bootstrap ([design doc](../../../system-internals/features/om-bootstrapping-with-snapshots)). It handles multi-batch download and hard link reconstruction, and writes a ready-to-install tree under `--output-dir`.

Requires Ozone **2.2+** with HDDS-16171.

## What is included

- `om.db` — volumes, buckets, keys, and related AOS metadata
- `db.snapshots` — bucket snapshot RocksDB state (when snapshots exist on the leader)
- Compaction backup and log directories needed to read snapshot SST files

## Backup

**Requirements:** `ozone-site.xml` on the host; `kinit` in secure clusters (`ozone.administrators`).

```shell
ozone repair om download --output-dir /backup/om-metadata --overwrite

# OM HA — add --service-id; --node-id targets a specific OM (leader recommended)
ozone repair om download \
  --service-id <om-service-id> \
  --node-id <om-node-id> \
  --output-dir /backup/om-metadata \
  --overwrite

tar -czf om-metadata-$(date +%Y%m%d).tar.gz -C /backup om-metadata
```

Store archives off-cluster according to your retention policy.

## Restore

Stop the **target** OM before installing metadata. If a live OM is still up, re-run `ozone repair om download`. Otherwise extract a saved archive:

```shell
mkdir -p /restore
tar -xzf om-metadata-YYYYMMDD.tar.gz -C /restore

OM_DB_DIRS=/var/lib/ozone/om/metadata
rm -rf "$OM_DB_DIRS/om.db" "$OM_DB_DIRS/db.snapshots"
rsync -a /restore/om-metadata/ "$OM_DB_DIRS/"

# Start OM; verify with: ozone sh volume list
```

For HA with an intact Ratis ring, prefer `ozone om --bootstrap` over manual install. See [Replacing Ozone Manager disks](../disk-replacement/ozone-manager) and [Ozone Repair](../tools/ozone-repair#download).

## Operational notes

- When using `--node-id`, target the **leader** OM.
- Schedule backups during low snapshot activity; including snapshot data takes a short-lived cache lock.
- Do **not** use Recon as a backup source (`includeSnapshotData=false` by design).
- User-visible **Ozone Snapshots** are included. **Ratis snapshots** (OM HA replication) are a separate concept — see [OM high availability](../../../system-internals/components/ozone-manager/high-availability).

## Related configuration

| Property | Default | Relevance |
| ---------- | --------- | --------- |
| `ozone.om.db.checkpoint.use.inode.based.transfer` | `true` | Required for snapshot-inclusive backup |
| `ozone.administrators` | (none) | CLI access in secure mode |

## See also

- [OM bootstrapping with snapshots (design)](../../../system-internals/features/om-bootstrapping-with-snapshots)
- [OM HA configuration](../../configuration/high-availability/om-ha)
- [Replacing Ozone Manager disks](../disk-replacement/ozone-manager)
- [Troubleshooting OM HA snapshot installation](../../../troubleshooting/om-ha-snapshot-installation-issues)
- [Snapshots overview](../snapshots/overview)
