---
sidebar_label: Disk Layout
---

# Datanode Disk Layout

Ozone Datanodes manage physical disks (volumes) and organize data into containers. This page describes the directory structure and on-disk files used to store container data and metadata. For how Schema v3 consolidates metadata into one RocksDB per volume, see [Datanode Container Schema v3](./rocksdb-schema).

## Overview

Each Datanode volume (configured via `hdds.datanode.dir`) follows a fixed layout for scalability and performance. The layout has evolved to support very large container counts per Datanode; **Schema V3** merges container metadata into a shared database per volume instead of one RocksDB per container.

## Volume level layout

At the root of each configured HDDS directory, the structure is:

```text
storage_dir/
├── hdds/
│   ├── VERSION
│   └── <<clusterUuid>>/
│       ├── current/
│       │   ├── container0/
│       │   ├── container1/
│       │   └── ...
│       ├── <<storageID>>/
│       │   └── container.db/  (Schema V3 only)
│       └── tmp/
│           └── deleted-containers/
```

### Key components

- **`hdds/VERSION`**: Properties file with volume-level metadata, including:
  - `storageID`: Unique identifier for this volume.
  - `clusterID`: ID of the Ozone cluster this volume belongs to.
  - `datanodeUuid`: ID of the Datanode.
  - `ctime`: Creation time of the volume.
  - `layOutVersion`: Software layout version at volume creation.

- **`<<clusterUuid>>/`**: Directory named after the cluster UUID. Ozone uses one cluster per volume.

- **`current/`**: Active container data. Containers are grouped under subdirectories (`container0`, `container1`, …) so a single directory does not hold hundreds of thousands of entries.

- **`container.db/` (Schema V3)**: When Schema V3 is enabled, a shared RocksDB stores metadata for **all** containers on this volume. That reduces open file descriptors and improves metadata operations compared with per-container databases.

- **`tmp/deleted-containers/`**: Staging area for atomic container deletion. When a container is removed, its directory is moved here before being deleted from disk.

## Container level layout

Each container lives under one of the `container<N>` trees. The subdirectory index `N` is `(containerId >> 9) & 0xFF`.

### Directory structure

```text
current/container<<N>>/<<containerID>>/
├── metadata/
│   ├── <<containerID>>.container
│   ├── <<containerID>>.db/ (Schema V1/V2 only)
│   └── <<containerID>>.tree (checksum info)
└── chunks/
    ├── <<blockID_1>>.chunk
    ├── <<blockID_2>>.chunk
    └── ...
```

### Metadata directory (`metadata/`)

- **`.container` file**: YAML with the main container metadata, including:
  - `containerID`: Unique ID of the container.
  - `state`: Current state (`OPEN`, `CLOSED`, `QUASI_CLOSED`, and so on).
  - `schemaVersion`: Schema version (1, 2, or 3).
  - `chunksPath`: Path to the chunks directory.
  - `metadataPath`: Path to the metadata directory.
  - `maxSize`: Configured maximum size of the container.

- **`.db` directory (Schema V1/V2)**: Per-container RocksDB. In V1 and V2, each container has its own database for block metadata.
  - **Schema V1**: Data in the default column family.
  - **Schema V2**: Metadata, block data, and delete transactions use separate column families.
  - In **Schema V3**, this directory is not used; metadata lives in the volume-level `container.db`.

- **`.tree` file**: Merkle tree checksums for the container’s data (integrity).

### Chunks directory (`chunks/`)

User data files, typically named `<<blockLocalID>>.chunk` (with extra suffixes when a block has multiple chunks). These are raw chunk files for client writes.

## Container metadata (RocksDB) internals

Whether RocksDB is per-container (V1/V2) or shared per volume (V3), it stores mappings and counters such as:

- **Block data**: Maps `blockLocalID` to `BlockData` (protobuf: chunk list and offsets).
- **Metadata counters** (examples):
  - `#BLOCKCOUNT`: Block count in the container.
  - `#BYTESUSED`: Bytes used by blocks.
  - `#BCSID`: Block commit sequence ID.
  - `#delTX`: Latest delete transaction ID.
  - `#pendingDeleteBlockCount`: Blocks marked for deletion but not yet removed.
  - `#pendingDeleteBlockBytes`: Bytes of blocks pending deletion.

## Schema V3 optimization

Schema V3 is the modern layout: one RocksDB per disk (per volume) instead of thousands of small instances.

### Layout differences

- **Location**: Metadata moves from  
  `hdds/<<clusterUuid>>/current/container<<N>>/<<containerID>>/metadata/<<containerID>>.db`  
  to  
  `hdds/<<clusterUuid>>/<<storageID>>/container.db`.

- **Key prefixing**: Keys in the shared database are prefixed with `containerID` so containers stay isolated in one keyspace.

### Benefits

- **Lower resource use**: Fewer file descriptors and less RocksDB cache overhead.
- **Better operations**: More efficient compaction and faster startup (fewer databases to open and scan).

## Deletion process

Container deletion is staged so it stays consistent across crashes:

1. The container is marked `DELETED` in its `.container` file.
2. It is removed from the Datanode in-memory container set.
3. For Schema V3, its metadata is removed from the shared RocksDB.
4. The container directory is moved under `hdds/<<clusterUuid>>/tmp/deleted-containers/`.
5. A background task deletes files under `tmp`.

This avoids partial on-disk states and lets a restart finish cleanup of anything left in `tmp/deleted-containers/`.
