---
sidebar_label: OM metadata backup
---

# OM metadata backup (including bucket snapshots)

This procedure describes how to take a **consistent tarball backup of Ozone Manager (OM) metadata**, including **bucket snapshot** RocksDB state. It uses the same checkpoint mechanism that OM HA bootstrap and Ratis snapshot installation rely on internally ([OM bootstrapping with snapshots](../../../system-internals/features/om-bootstrapping-with-snapshots)).

## What is backed up

When `includeSnapshotData=true`, the leader OM streams a tar archive containing:

- The Active Object Store (AOS) RocksDB checkpoint (`om.db`).
- All bucket snapshot RocksDB directories registered in the snapshot metadata table.
- Snapshot compaction backup and compaction log directories required to interpret snapshot SST files.
- Snapshot-local property files used by snapshot defragmentation.
- A `hardLinkFile` mapping so hard-linked SST files can be reconstructed on restore.
- An `OZONE_RATIS_SNAPSHOT_COMPLETE` sentinel on the **final** batch when the transfer finishes.

This is **OM namespace metadata only** (volumes, buckets, keys, snapshot definitions, and related RocksDB state). It does **not** replace Datanode block backups or SCM metadata backups.

## Prerequisites

1. An OM HA cluster with a reachable **leader** OM HTTP(S) endpoint (default port `9874`).
2. A caller identity in `ozone.administrators` when `ozone.security.enabled=true` (Kerberos SPNEGO or equivalent HTTP auth).
3. Sufficient disk space on the backup host for the tarball(s). The leader sets response header `X-Ozone-Om-Checkpoint-Estimated-Sst-Bytes` with an uncompressed SST size estimate; plan for at least **2×** that value to allow for tar overhead and unpack headroom (same guidance as [OM HA](../../../system-internals/components/ozone-manager/high-availability)).
4. Ozone **2.2+** with inode-based checkpoint transfer enabled (default):

```xml
<property>
  <name>ozone.om.db.checkpoint.use.inode.based.transfer</name>
  <value>true</value>
</property>
```

## Important: include snapshot data explicitly

A checkpoint request **without** `includeSnapshotData=true` returns **AOS metadata only** and omits bucket snapshots. This was the limitation of older backup procedures.

Always pass:

| Query parameter         | Required value | Purpose                                                       |
| ----------------------- | -------------- | ------------------------------------------------------------- |
| `includeSnapshotData`   | `true`         | Include bucket snapshot RocksDB directories and related files |
| `flushBeforeCheckpoint` | `true`         | Flush memtables before taking the AOS checkpoint              |

## Single-batch backup (small to medium metadata)

Use when total snapshot SST size fits in one batch (typically when snapshot SST footprint is below `ozone.om.ratis.snapshot.max.total.sst.size`, default **10 GB**).

Replace `<om-leader-host>`, `<port>`, and auth flags for your environment.

**Secure cluster (Kerberos):**

```shell
kinit -k -t /path/to/admin.keytab admin@REALM
curl -f --negotiate -u : \
  -X POST \
  "https://<om-leader-host>:<port>/v2/dbCheckpoint?includeSnapshotData=true&flushBeforeCheckpoint=true" \
  -F "toExcludeSST[]=" \
  -o "om-metadata-$(date +%Y%m%d-%H%M%S).tar"
```

**Non-secure cluster:**

```shell
curl -f \
  -X POST \
  "http://<om-leader-host>:<port>/v2/dbCheckpoint?includeSnapshotData=true&flushBeforeCheckpoint=true" \
  -F "toExcludeSST[]=" \
  -o "om-metadata-$(date +%Y%m%d-%H%M%S).tar"
```

### Verify the archive

The tarball uses inode-based file names during transfer. On the **final** batch, expect:

- `hardLinkFile` — tab-separated mapping of relative paths to inode identifiers
- `OZONE_RATIS_SNAPSHOT_COMPLETE` — completion sentinel

If your backup stopped after one batch but lacks the completion sentinel, the snapshot set is **incomplete** (see multi-batch section below).

## Multi-batch backup (large snapshot footprint)

When snapshot SST data exceeds `ozone.om.ratis.snapshot.max.total.sst.size`, the leader splits the transfer across multiple POST responses. Each batch excludes inode IDs already received via the `toExcludeSST[]` multipart form field.

Use the helper script in this directory (same logic as OM bootstrap's `OmRatisSnapshotProvider` / `HAUtils.getExistingFiles`):

```shell
chmod +x om-metadata-backup.sh

# Secure cluster (run kinit first)
./om-metadata-backup.sh --kerberos \
  --base-url "https://<om-leader-host>:<port>" \
  --archive "om-metadata-$(date +%Y%m%d-%H%M%S).tar.gz"

# Non-secure cluster
./om-metadata-backup.sh \
  --base-url "http://<om-leader-host>:<port>" \
  --staging-dir "/backup/om-metadata-staging"
```

The script:

1. POSTs to `/v2/dbCheckpoint` with `includeSnapshotData=true` and `flushBeforeCheckpoint=true`.
2. Saves each response tarball, extracts it into a staging directory, and collects file basenames (inode IDs) already on disk.
3. Repeats with `toExcludeSST[]=<inodeId>` for each collected file until `OZONE_RATIS_SNAPSHOT_COMPLETE` appears in the staging directory.

Optional flags: `--staging-dir`, `--archive` (gzip tarball of the final staging tree), and `--max-batches` as a safety limit. Run `./om-metadata-backup.sh --help` for the full list.

Verify the staging directory contains `hardLinkFile` and `OZONE_RATIS_SNAPSHOT_COMPLETE` before treating the backup as complete.

## Legacy v1 endpoint

The v1 `/dbCheckpoint` endpoint (selected when `ozone.om.db.checkpoint.use.inode.based.transfer=false`) transfers **AOS (`om.db`) metadata only**. It does **not** include bucket snapshot RocksDB state in the checkpoint, even when `includeSnapshotData=true` is passed.

**New deployments should run Ozone 2.2+** with inode-based transfer enabled (the default) and use `/v2/dbCheckpoint` for backups that include bucket snapshots. Reserve v1 only for legacy clusters that have not yet migrated to inode-based transfer.

## Restore scenarios

### Add or replace an OM node in an existing HA cluster

Use `ozone om --bootstrap` (downloads a fresh checkpoint from the live leader, including snapshots). See [Replacing Ozone Manager disks](../disk-replacement/ozone-manager).

### Cold restore from an offline tarball without a live leader

Use when **no OM leader is available** to serve bootstrap—for example, total metadata loss on a standalone OM, or every HA OM lost its metadata volume. This installs a previously saved **v2** checkpoint tarball manually, following the same hardlink reconstruction and directory layout that `ozone om --bootstrap` applies after download.

**Requirements**

- Backup taken from `/v2/dbCheckpoint` with `includeSnapshotData=true` on Ozone **2.2+**.
- Extracted staging tree contains `hardLinkFile` and `OZONE_RATIS_SNAPSHOT_COMPLETE`.
- Plan for **cluster downtime** while OM metadata is offline.

**Procedure**

1. **Stop writers.** Stop all Ozone Manager processes, clients, and services that write to the cluster.

2. **Verify the backup.** For multi-batch backups, confirm the staging directory contains `hardLinkFile` and `OZONE_RATIS_SNAPSHOT_COMPLETE`. Do not proceed with an incomplete transfer.

3. **Extract the archive** into a clean staging directory:

```shell
mkdir -p /restore/om-checkpoint-staging
tar -xf om-metadata-YYYYMMDD.tar -C /restore/om-checkpoint-staging
# If you used om-metadata-backup.sh --archive:
tar -xzf om-metadata-YYYYMMDD.tar.gz -C /restore/om-checkpoint-staging
```

4. **Reconstruct hard links.** v2 checkpoints store many files under inode IDs; `hardLinkFile` maps logical paths (for example `om.db/000012.sst`) to those IDs:

```shell
STAGING=/restore/om-checkpoint-staging

while IFS=$'\t' read -r dest src; do
  [[ -z "$dest" ]] && continue
  install -d "$(dirname "$STAGING/$dest")"
  ln "$STAGING/$src" "$STAGING/$dest"
done < "$STAGING/hardLinkFile"

while IFS=$'\t' read -r dest src; do
  [[ -z "$src" ]] && continue
  if [[ -d "$STAGING/$src" ]]; then
    rm -rf "$STAGING/$src"
  else
    rm -f "$STAGING/$src"
  fi
done < "$STAGING/hardLinkFile"

rm -f "$STAGING/hardLinkFile" "$STAGING/OZONE_RATIS_SNAPSHOT_COMPLETE"
```

5. **Validate layout.** Expect top-level items such as `om.db` and, when bucket snapshots were backed up, `db.snapshots`. Confirm `om.db/CURRENT` exists.

6. **Install into OM metadata storage.** Let `OM_DB_DIRS` be the path configured in `ozone.om.db.dirs` (or `ozone.metadata.dirs`). Back up any recoverable existing metadata, then install checkpoint items:

```shell
OM_DB_DIRS=/var/lib/ozone/om/metadata   # your ozone.om.db.dirs

# Optional: preserve the om/ VERSION subtree if the disk is partially readable
# before replacing RocksDB directories.

mkdir -p "$OM_DB_DIRS"
for name in om.db db.snapshots; do
  if [[ -e "$STAGING/$name" ]]; then
    rm -rf "$OM_DB_DIRS/$name"
    mv "$STAGING/$name" "$OM_DB_DIRS/"
  fi
done
# Move any remaining top-level checkpoint items (compaction backup dirs, etc.)
find "$STAGING" -mindepth 1 -maxdepth 1 -exec mv -t "$OM_DB_DIRS" {} +
```

Preserve the existing `om/` VERSION subdirectory under `OM_DB_DIRS` when it survives disk failure. Do not delete OM cluster identity files unless you are intentionally rebuilding the OM from scratch.

7. **Standalone OM:** Start SCM (if required), then start the Ozone Manager. Verify with `ozone sh volume list` and spot-check buckets and keys.

8. **HA OM (all peers lost metadata):** The tarball replaces RocksDB metadata only; Ratis state lives under `ozone.om.ratis.storage.dir` on each node. After installing the checkpoint on a designated seed OM:

   - Clear `ozone.om.ratis.storage.dir` on **every** OM node (empty directory or fresh disk).
   - Start the seed OM and confirm it serves reads.
   - Bootstrap remaining OMs from the seed with `ozone om --bootstrap` once the seed is healthy. If the Ratis ring cannot reform, engage the [Ozone community](https://ozone.apache.org/community/) before forcing further metadata changes.

**Limitations**

- v1 (`/dbCheckpoint`) backups omit bucket snapshot data; use them only for AOS-only recovery on legacy clusters.
- There is no single supported CLI for cold install. Validate the procedure on a non-production clone before relying on it for production DR.

Store tarball backups off-cluster (object store, NFS, or backup appliance) according to your retention policy.

## Operational notes

- Run backups against the **leader** OM. Followers redirect or reject checkpoint creation.
- Checkpoint creation takes a short-lived snapshot cache lock when snapshot data is included. Schedule backups during low snapshot activity when possible.
- Recon's OM sync uses `includeSnapshotData=false` by design; do **not** use Recon as a full-metadata backup source.
- Bucket **Ozone Snapshots** (user-visible point-in-time bucket images) are included in this backup. **Ratis snapshots** (OM HA replication checkpoints) are a related but separate concept; see [OM high availability](../../../system-internals/components/ozone-manager/high-availability).

## Related configuration

| Property | Default | Relevance |
| ---------- | --------- | --------- |
| `ozone.om.db.checkpoint.use.inode.based.transfer` | `true` | Use `/v2/dbCheckpoint` |
| `ozone.om.ratis.snapshot.max.total.sst.size` | `10GB` | Batch size threshold for snapshot SST transfer |
| `ozone.om.bootstrap.min.space` | `5GB` | Follower disk pre-check fallback (bootstrap) |
| `ozone.om.bootstrap.checkpoint.estimated.space.headroom.ratio` | `2.0` | Follower disk pre-check vs leader SST estimate |
| `ozone.administrators` | (none) | HTTP checkpoint access in secure mode |

## See also

- [OM bootstrapping with snapshots (design)](../../../system-internals/features/om-bootstrapping-with-snapshots)
- [OM HA configuration](../../configuration/high-availability/om-ha)
- [Replacing Ozone Manager disks](../disk-replacement/ozone-manager)
- [Troubleshooting OM HA snapshot installation](../../../troubleshooting/om-ha-snapshot-installation-issues)
- [Snapshots overview](../snapshots/overview)
