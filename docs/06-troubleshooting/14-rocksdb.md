---
sidebar_label: RocksDB
---

# Troubleshooting RocksDB

Apache Ozone uses RocksDB as the underlying embedded database for storing metadata in all its core components: Ozone Manager (OM), Storage Container Manager (SCM), and Datanode. Understanding how to examine and debug these RocksDB databases is essential for troubleshooting problems in Ozone.

## RocksDB Overview

RocksDB is a high-performance embedded key-value store used by Ozone to persistently store metadata. Each Ozone component organizes its data in **Column Families** (logical tables) within the database:

- **Ozone Manager (OM)**: Stores namespace information (volumes, buckets, keys), security information, and operational state
- **Storage Container Manager (SCM)**: Stores container metadata, pipeline information, and node management data
- **Datanode**: Stores container-level metadata, block mappings, and deletion state

## Using the Ozone Debug LDB Tool

Ozone provides a powerful command-line tool to inspect and analyze the contents of RocksDB databases through the `ozone debug ldb` command. This tool allows you to examine the database schema, scan for specific entries, and troubleshoot metadata-related issues.

### General Command Structure

```bash
ozone debug ldb --db <path-to-rocksdb-directory> <command> [options]
```

### Common Commands

| Command | Description |
| ------- | ----------- |
| `ls` or `list_column_families` | List all column families in the database |
| `scan` | Scan/query all entries in a column family |
| `get` | Get a specific key-value pair |
| `value-schema` | Show the schema structure of values in a column family |
| `dump` | Export database contents to files |

### Important Options

| Option | Description |
| ------ | ----------- |
| `--column_family` or `--cf` | Specify the column family to operate on |
| `--filter` | Apply filtering conditions to scan results |
| `--startkey` and `--endkey` | Define a key range for scanning |
| `--limit` or `-l` | Limit the number of results returned |
| `--out` | Direct output to a file instead of console |
| `--fields` | Limit output to specific fields |

## Debugging Ozone Manager (OM) RocksDB

The OM database stores the namespace hierarchy and all associated metadata. The database is typically located in the directory specified by the `ozone.om.db.dirs` property, in a subdirectory named `om.db`.

### Key Column Families in OM

- `volumeTable`: Volume metadata
- `bucketTable`: Bucket metadata
- `keyTable`: Key metadata (for object store layout)
- `fileTable`: File metadata (for filesystem optimized layout)
- `directoryTable`: Directory metadata (for filesystem optimized layout)
- `deletedTable`: Deleted keys pending block deletion
- `metaTable`: Miscellaneous OM configuration and counts

### Example Commands for OM

```bash
# Define the OM DB path
OM_DB_PATH=/path/to/om/metadata/om.db

# List all column families
ozone debug ldb --db ${OM_DB_PATH} ls

# Scan volume information
ozone debug ldb --db ${OM_DB_PATH} scan --column_family volumeTable

# Look at the volume table schema
ozone debug ldb --db ${OM_DB_PATH} value-schema --column_family volumeTable

# Scan bucket information with specific volume
ozone debug ldb --db ${OM_DB_PATH} scan --column_family bucketTable --filter="volumeName:equals:myvolume"

# Find all keys in a specific bucket (limit to 10 results)
ozone debug ldb --db ${OM_DB_PATH} scan --column_family keyTable --filter="bucketName:equals:mybucket" --limit 10

# Examine deleted keys
ozone debug ldb --db ${OM_DB_PATH} scan --column_family deletedTable

# Check OM metadata counts
ozone debug ldb --db ${OM_DB_PATH} scan --column_family metaTable --filter="key:regex:(USER|VOLUME|BUCKET)_COUNT"
```

## Debugging Storage Container Manager (SCM) RocksDB

The SCM database stores container metadata, pipeline information, and node management data. The database is typically located in the directory specified by the `hdds.scm.db.dirs` property, in a subdirectory named `scm.db`.

### Key Column Families in SCM

- `containers`: Container metadata
- `pipelines`: Pipeline configuration and state
- `deletedBlocks`: Blocks marked for deletion
- `nodes`: Datanode registration information
- `meta`: SCM metadata and configuration

### Example Commands for SCM

```bash
# Define the SCM DB path
SCM_DB_PATH=/path/to/scm/metadata/scm.db

# List all column families
ozone debug ldb --db ${SCM_DB_PATH} ls

# Scan container information
ozone debug ldb --db ${SCM_DB_PATH} scan --column_family containers

# Find containers in a specific state
ozone debug ldb --db ${SCM_DB_PATH} scan --column_family containers --filter="state:equals:CLOSED"

# Examine pipeline information
ozone debug ldb --db ${SCM_DB_PATH} scan --column_family pipelines

# Look at pipeline schema
ozone debug ldb --db ${SCM_DB_PATH} value-schema --column_family pipelines

# View registered datanodes
ozone debug ldb --db ${SCM_DB_PATH} scan --column_family nodes

# Check blocks pending deletion
ozone debug ldb --db ${SCM_DB_PATH} scan --column_family deletedBlocks --limit 5
```

## Debugging Datanode RocksDB

Each Datanode maintains container databases to store block metadata. These databases are typically located within the Datanode's data directories, organized by container ID.

### Key Column Families in Datanode

- `block_data`: Block metadata (Schema V3)
- `metadata`: Container metadata (Schema V3)
- `delete_txns`: Deletion transaction records (Schema V3)

### Example Commands for Datanode

```bash
# Define the path to a specific container's database
# (You need to know the container ID and its location on the Datanode)
CONTAINER_ID=1000
DN_DB_PATH=/path/to/datanode/CONTAINER_DIR/${CONTAINER_ID}/container.db

# List all column families
ozone debug ldb --db ${DN_DB_PATH} ls

# Scan block information
ozone debug ldb --db ${DN_DB_PATH} scan --column_family block_data

# View container metadata
ozone debug ldb --db ${DN_DB_PATH} scan --column_family metadata

# Check deletion transactions
ozone debug ldb --db ${DN_DB_PATH} scan --column_family delete_txns
```

## Advanced Filtering and Output Control

The LDB tool supports sophisticated filtering and output control:

```bash
# Filter by specific field value
ozone debug ldb --db ${OM_DB_PATH} scan --column_family volumeTable --filter="usedNamespace:equals:5"

# Use regex for more flexible matching
ozone debug ldb --db ${OM_DB_PATH} scan --column_family keyTable --filter="keyName:regex:^backup.*\.txt$"

# Select specific fields to display
ozone debug ldb --db ${OM_DB_PATH} scan --column_family keyTable --fields="volumeName,bucketName,keyName,dataSize"

# Output results to a file
ozone debug ldb --db ${OM_DB_PATH} scan --column_family bucketTable --out=/tmp/bucket_data.json
```

## Best Practices for Using LDB Debug Tool

1. **Consider Service Impact**: Running extensive scans on a production database can impact performance. For large scans, consider:
   - Stopping the service temporarily
   - Using filtering to reduce the scan scope
   - Scheduling during low-load periods

2. **Backup Before Extensive Analysis**: Create a backup of the RocksDB directory before performing extensive analysis, especially if the service is stopped.

3. **Database Location Determination**:
   - For OM: Check `ozone.om.db.dirs` configuration
   - For SCM: Check `hdds.scm.db.dirs` configuration
   - For Datanode: Containers are in the directories specified by `hdds.datanode.dir`

4. **Interpret Results Carefully**: 
   - Many values are stored as Protocol Buffers and are displayed in a best-effort human-readable format
   - Some binary data may not display correctly
   - Use the `value-schema` command to understand structure

5. **Key Format Awareness**: 
   - Keys often include prefixes or internal IDs
   - Object IDs (numerical) are often used instead of names
   - Composite keys may join multiple fields with delimiters

## Common Troubleshooting Scenarios

### Investigate Missing Keys or Objects

```bash
# Check if a volume exists
ozone debug ldb --db ${OM_DB_PATH} scan --column_family volumeTable --filter="volumeName:equals:myvol"

# Check if a bucket exists
ozone debug ldb --db ${OM_DB_PATH} scan --column_family bucketTable --filter="bucketName:equals:mybucket"

# Look for a key in regular table and deletedTable
ozone debug ldb --db ${OM_DB_PATH} scan --column_family keyTable --filter="keyName:equals:mykey"
ozone debug ldb --db ${OM_DB_PATH} scan --column_family deletedTable --filter="keyName:equals:mykey"
```

### Verify Container State

```bash
# Check if a container exists and its state
ozone debug ldb --db ${SCM_DB_PATH} scan --column_family containers --filter="containerID:equals:1000"

# Verify container exists on datanode
ozone debug ldb --db ${DN_DB_PATH} scan --column_family metadata
```

### Diagnose Replication Issues

```bash
# Check pipeline state for a container
ozone debug ldb --db ${SCM_DB_PATH} scan --column_family containers --filter="containerID:equals:1000" --fields="pipelineID"
ozone debug ldb --db ${SCM_DB_PATH} scan --column_family pipelines --filter="pipelineID:equals:PIPELINE_ID_FROM_ABOVE"
```

## References

For more detailed information about the RocksDB schemas in Ozone components, refer to:

- [Ozone Manager RocksDB Schema](../07-system-internals/01-components/01-ozone-manager/02-rocksdb-schema.md)
- [Storage Container Manager RocksDB Schema](../07-system-internals/01-components/02-storage-container-manager/02-rocksdb-schema.md)
- [Datanode RocksDB Schema](../07-system-internals/01-components/03-datanode/02-rocksdb-schema.md)