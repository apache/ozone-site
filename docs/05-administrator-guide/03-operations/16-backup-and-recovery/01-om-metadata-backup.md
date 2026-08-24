---
sidebar_label: OM metadata backup
---

# OM metadata backup (including bucket snapshots)

Back up **Ozone Manager (OM) namespace metadata**, including **bucket snapshot** RocksDB state. This is not a substitute for Datanode block or SCM metadata backups.

The transfer uses the same v2 checkpoint mechanism as OM HA follower bootstrap ([design doc](../../../system-internals/features/om-bootstrapping-with-snapshots)).

## What is included

- `om.db` — volumes, buckets, keys, and related AOS metadata
- `db.snapshots` — bucket snapshot RocksDB state (when snapshots exist on the leader)
- Compaction backup and log directories needed to read snapshot SST files

Requires Ozone **2.2+** with inode-based checkpoint transfer (default: `ozone.om.db.checkpoint.use.inode.based.transfer=true`).

## Backup and restore (recommended)

Use `ozone repair om download` ([HDDS-16171](https://issues.apache.org/jira/browse/HDDS-16171)) when a live OM is reachable. It handles multi-batch transfer, hard link reconstruction, and writes a **ready-to-install** copy of everything under `--output-dir` (including `db.snapshots` when snapshots exist on the leader). No separate snapshot steps.

**Requirements:** `ozone-site.xml` on the host; `kinit` in secure clusters (`ozone.administrators`); stop the **target** OM before installing downloaded metadata.

```shell
# Download
ozone repair om download --output-dir /backup/om-metadata --overwrite

# OM HA — add --service-id; --node-id targets a specific OM (leader recommended)
ozone repair om download \
  --service-id <om-service-id> \
  --node-id <om-node-id> \
  --output-dir /backup/om-metadata \
  --overwrite

# Archive off-cluster (top-level om-metadata/ directory in the tarball)
tar -czf om-metadata-$(date +%Y%m%d).tar.gz -C /backup om-metadata
```

**Restore** — stop the target OM first. If a live OM is still up, re-run `ozone repair om download`. Otherwise extract a CLI backup archive and install:

```shell
mkdir -p /restore
tar -xzf om-metadata-YYYYMMDD.tar.gz -C /restore    # yields /restore/om-metadata/

OM_DB_DIRS=/var/lib/ozone/om/metadata                # ozone.om.db.dirs
rm -rf "$OM_DB_DIRS/om.db" "$OM_DB_DIRS/db.snapshots"
rsync -a /restore/om-metadata/ "$OM_DB_DIRS/"

# Start OM; verify with: ozone sh volume list
```

For HA with an intact Ratis ring, prefer `ozone om --bootstrap` over manual install. See [Replacing Ozone Manager disks](../disk-replacement/ozone-manager) and [Ozone Repair](../tools/ozone-repair#download).

## Alternative: HTTP checkpoint download

Use `curl` or `om-metadata-backup.sh` only when the backup host has no Ozone CLI. This runs the same `/v2/dbCheckpoint` transfer, but the saved tarball stays in inode-based form and needs hard link reconstruction before install.

Target the **leader** OM. Plan for at least **2×** the `X-Ozone-Om-Checkpoint-Estimated-Sst-Bytes` response header value (see [OM HA](../../../system-internals/components/ozone-manager/high-availability)).

Always pass `includeSnapshotData=true&flushBeforeCheckpoint=true`.

**Single batch** (snapshot SST below `ozone.om.ratis.snapshot.max.total.sst.size`, default 10 GB):

```shell
# Non-secure
curl -f -X POST \
  "http://<om-leader>:<port>/v2/dbCheckpoint?includeSnapshotData=true&flushBeforeCheckpoint=true" \
  -F "toExcludeSST[]=" \
  -o "om-metadata-$(date +%Y%m%d).tar"

# Secure (run kinit first)
curl -f --negotiate -u : -X POST \
  "https://<om-leader>:<port>/v2/dbCheckpoint?includeSnapshotData=true&flushBeforeCheckpoint=true" \
  -F "toExcludeSST[]=" \
  -o "om-metadata-$(date +%Y%m%d).tar"
```

**Multiple batches** — `om-metadata-backup.sh` loops until `OZONE_RATIS_SNAPSHOT_COMPLETE`:

```shell
chmod +x om-metadata-backup.sh
./om-metadata-backup.sh --base-url "http://<om-leader>:<port>" \
  --archive "om-metadata-$(date +%Y%m%d).tar.gz"
# Add --kerberos for secure clusters (run kinit first)
```

HTTP archives contain a **flat** inode-based tree (not the `om-metadata/` wrapper used by the CLI). Stop the target OM, then reconstruct hard links and install:

```shell
mkdir -p /restore/om-staging
OM_DB_DIRS=/var/lib/ozone/om/metadata

tar -xf om-metadata-YYYYMMDD.tar -C /restore/om-staging     # .tar from curl
# tar -xzf om-metadata-YYYYMMDD.tar.gz -C /restore/om-staging   # .tar.gz from om-metadata-backup.sh --archive

while IFS=$'\t' read -r dest src; do
  [[ -z "$dest" || -z "$src" ]] && continue
  install -d "$(dirname "/restore/om-staging/$dest")"
  ln "/restore/om-staging/$src" "/restore/om-staging/$dest"
done < /restore/om-staging/hardLinkFile

while IFS=$'\t' read -r dest src; do
  [[ -z "$src" ]] && continue
  if [[ -d "/restore/om-staging/$src" ]]; then
    rm -rf "/restore/om-staging/$src"
  else
    rm -f "/restore/om-staging/$src"
  fi
done < /restore/om-staging/hardLinkFile

rm -f /restore/om-staging/hardLinkFile /restore/om-staging/OZONE_RATIS_SNAPSHOT_COMPLETE

rm -rf "$OM_DB_DIRS/om.db" "$OM_DB_DIRS/db.snapshots"
rsync -a /restore/om-staging/ "$OM_DB_DIRS/"
```

The legacy v1 `/dbCheckpoint` endpoint omits bucket snapshot data even with `includeSnapshotData=true`. Use v2 only.

## Operational notes

- Run checkpoints against the **leader** OM.
- Schedule during low snapshot activity; including snapshot data takes a short-lived cache lock.
- Do **not** use Recon as a backup source (`includeSnapshotData=false` by design).
- User-visible **Ozone Snapshots** are included. **Ratis snapshots** (OM HA replication) are a separate concept — see [OM high availability](../../../system-internals/components/ozone-manager/high-availability).

## Related configuration

| Property | Default | Relevance |
| ---------- | --------- | --------- |
| `ozone.om.db.checkpoint.use.inode.based.transfer` | `true` | Required for snapshot-inclusive backup |
| `ozone.om.ratis.snapshot.max.total.sst.size` | `10GB` | HTTP multi-batch threshold |
| `ozone.administrators` | (none) | HTTP/CLI access in secure mode |

## See also

- [OM bootstrapping with snapshots (design)](../../../system-internals/features/om-bootstrapping-with-snapshots)
- [OM HA configuration](../../configuration/high-availability/om-ha)
- [Replacing Ozone Manager disks](../disk-replacement/ozone-manager)
- [Troubleshooting OM HA snapshot installation](../../../troubleshooting/om-ha-snapshot-installation-issues)
- [Snapshots overview](../snapshots/overview)
