#!/usr/bin/env bash
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Download a consistent OM metadata checkpoint tarball from the leader OM HTTP(S)
# endpoint, including bucket snapshot RocksDB state. Handles multi-batch transfers
# when snapshot SST data exceeds ozone.om.ratis.snapshot.max.total.sst.size.
#
# See om-metadata-backup.md in this directory for prerequisites and restore notes.

set -euo pipefail

readonly COMPLETE_SENTINEL='OZONE_RATIS_SNAPSHOT_COMPLETE'
readonly HARDLINK_FILE='hardLinkFile'
readonly DEFAULT_ENDPOINT='v2/dbCheckpoint'
readonly QUERY='includeSnapshotData=true&flushBeforeCheckpoint=true'

usage() {
  cat <<'EOF'
Usage: om-metadata-backup.sh [options] --base-url URL

Download OM metadata (AOS + bucket snapshots) from the leader OM checkpoint API.
Extracts all batches into a staging directory until OZONE_RATIS_SNAPSHOT_COMPLETE
is present.

Required:
  --base-url URL     Leader OM base URL, e.g. https://om1.example.com:9874
                     (no trailing slash; do not include /v2/dbCheckpoint)

Options:
  --staging-dir DIR  Directory to accumulate extracted checkpoint files
                     (default: temporary directory)
  --batch-dir DIR    Directory for per-batch .tar downloads (default: staging-dir/batches)
  --archive FILE     After success, create a gzip tarball of the staging directory
  --kerberos         Use curl SPNEGO (--negotiate -u :); run kinit first
  --endpoint PATH    Checkpoint path (default: v2/dbCheckpoint; v1 omits bucket snapshots)
  --max-batches N    Stop after N batches (default: 1000)
  --keep-batches     Do not delete per-batch .tar files after successful extract
  -h, --help         Show this help

Examples:
  kinit -k -t /path/to/admin.keytab admin@REALM
  ./om-metadata-backup.sh --kerberos --base-url https://om-leader:9874 \\
    --archive om-metadata-$(date +%Y%m%d-%H%M%S).tar.gz

  ./om-metadata-backup.sh --base-url http://om-leader:9874 --staging-dir /backup/om-staging
EOF
}

log() {
  printf '[om-metadata-backup] %s\n' "$*"
}

die() {
  log "ERROR: $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

collect_exclude_ids() {
  local root="$1"
  if [[ ! -d "$root" ]]; then
    return 0
  fi
  find "$root" -type f -exec basename {} \; | sort -u
}

is_complete() {
  [[ -f "$1/$COMPLETE_SENTINEL" ]]
}

download_batch() {
  local url="$1"
  local output="$2"
  shift 2
  local -a curl_auth=("$@")
  local -a curl_form=()
  local inode_id

  if [[ ${#EXCLUDE_IDS[@]} -eq 0 ]]; then
    curl_form+=(-F 'toExcludeSST[]=')
  else
    for inode_id in "${EXCLUDE_IDS[@]}"; do
      curl_form+=(-F "toExcludeSST[]=${inode_id}")
    done
  fi

  log "POST ${url} (excluding ${#EXCLUDE_IDS[@]} file(s))"
  curl -f -sS "${curl_auth[@]}" \
    -X POST \
    "${url}?${QUERY}" \
    "${curl_form[@]}" \
    -o "$output"
}

BASE_URL=''
STAGING_DIR=''
BATCH_DIR=''
ARCHIVE_FILE=''
ENDPOINT="$DEFAULT_ENDPOINT"
MAX_BATCHES=1000
KEEP_BATCHES=false
KERBEROS=false
EXCLUDE_IDS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="${2:-}"
      shift 2
      ;;
    --staging-dir)
      STAGING_DIR="${2:-}"
      shift 2
      ;;
    --batch-dir)
      BATCH_DIR="${2:-}"
      shift 2
      ;;
    --archive)
      ARCHIVE_FILE="${2:-}"
      shift 2
      ;;
    --endpoint)
      ENDPOINT="${2:-}"
      shift 2
      ;;
    --max-batches)
      MAX_BATCHES="${2:-}"
      shift 2
      ;;
    --keep-batches)
      KEEP_BATCHES=true
      shift
      ;;
    --kerberos)
      KERBEROS=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1 (use --help)"
      ;;
  esac
done

[[ -n "$BASE_URL" ]] || die "--base-url is required"
require_cmd curl
require_cmd tar

BASE_URL="${BASE_URL%/}"
CHECKPOINT_URL="${BASE_URL}/${ENDPOINT#/}"

if [[ -z "$STAGING_DIR" ]]; then
  STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/om-metadata-backup.XXXXXX")"
  log "Using temporary staging directory: ${STAGING_DIR}"
else
  mkdir -p "$STAGING_DIR"
fi

if [[ -z "$BATCH_DIR" ]]; then
  BATCH_DIR="${STAGING_DIR}/batches"
fi
mkdir -p "$BATCH_DIR" "$STAGING_DIR"

CURL_AUTH=()
if [[ "$KERBEROS" == true ]]; then
  CURL_AUTH=(--negotiate -u :)
fi

batch=1
while [[ "$batch" -le "$MAX_BATCHES" ]]; do
  batch_tar="${BATCH_DIR}/batch-$(printf '%04d' "$batch").tar"
  EXCLUDE_IDS=()
  while IFS= read -r inode_id; do
    [[ -n "$inode_id" ]] && EXCLUDE_IDS+=("$inode_id")
  done < <(collect_exclude_ids "$STAGING_DIR")

  download_batch "$CHECKPOINT_URL" "$batch_tar" "${CURL_AUTH[@]}"

  if [[ ! -s "$batch_tar" ]]; then
    die "Batch ${batch} download is empty: ${batch_tar}"
  fi

  log "Extracting batch ${batch} into ${STAGING_DIR}"
  tar -xf "$batch_tar" -C "$STAGING_DIR"

  if [[ "$KEEP_BATCHES" != true ]]; then
    rm -f "$batch_tar"
  fi

  if is_complete "$STAGING_DIR"; then
    log "Found ${COMPLETE_SENTINEL} after batch ${batch}"
    break
  fi

  log "Batch ${batch} incomplete; requesting next batch"
  batch=$((batch + 1))
done

if ! is_complete "$STAGING_DIR"; then
  die "Checkpoint incomplete after ${MAX_BATCHES} batch(es); ${COMPLETE_SENTINEL} not found in ${STAGING_DIR}"
fi

if [[ ! -f "${STAGING_DIR}/${HARDLINK_FILE}" ]]; then
  log "WARNING: ${HARDLINK_FILE} not found in staging directory (expected on final batch)"
fi

if [[ -n "$ARCHIVE_FILE" ]]; then
  log "Creating archive ${ARCHIVE_FILE}"
  tar -czf "$ARCHIVE_FILE" -C "$STAGING_DIR" .
fi

log "Backup complete. Staging directory: ${STAGING_DIR}"
if [[ -n "$ARCHIVE_FILE" ]]; then
  log "Archive: ${ARCHIVE_FILE}"
fi
