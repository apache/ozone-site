---
sidebar_label: Checksums
---

# Read and write checksums for chunks and stripes

Apache Ozone protects data integrity with checksums across the data lifecycle. Checksums are computed at **chunk** granularity for all data layouts and, for Erasure Coded (EC) data, also at **stripe** granularity. Together they let Ozone detect corruption and drive recovery at several layers.

## Chunk-level checksumming

Chunks are the smallest unit of data transfer and storage in Ozone (commonly **4&nbsp;MB**). Each chunk carries one or more checksums.

### Write path (calculation)

Checksums are computed mainly on the client inside **`BlockOutputStream`**.

- **Mechanism:** While buffering data, the client uses **`org.apache.hadoop.ozone.common.Checksum`** to compute checksums.
- **Granularity:** Controlled by [`ozone.client.bytes.per.checksum`](../../administrator-guide/configuration/appendix). Data is split into segments; each segment gets one checksum entry.
- **Algorithms:** CRC32, CRC32C, SHA256, and MD5.
- **Storage:** Checksums live in the **`ChecksumData`** field of the **`ChunkInfo`** protobuf and are sent to the Datanode on the **WriteChunk** request.

### Read path (verification)

The client verifies checksums on read for end-to-end integrity.

- **Mechanism:** **`ChunkInputStream`** recomputes checksums for received segments and compares them to the values in **`ChunkInfo`** metadata.
- **Failure handling:** On mismatch, an **`OzoneChecksumException`** is thrown. For replicated data the client retries another replica; for EC it triggers reconstruction.

---

## Stripe-level checksumming (erasure coding)

Erasure coding adds **stripe** checksums on top of per-chunk checksums to protect each stripe ( **d** data blocks + **p** parity blocks).

### Write path (calculation)

In **`ECKeyOutputStream`**, after a stripe is encoded:

- **Calculation:** **`ECBlockOutputStreamEntry.calculateChecksum()`** concatenates the chunk-level checksums of every chunk in the stripe (data and parity).
- **Storage:** The resulting stripe checksum is stored in **`stripeChecksum`** on **`ChunkInfo`** and sent to Datanodes on **PutBlock**.

### Usage

- **File checksum API:** Derives block-group-level checksums without re-reading bytes.
- **Datanode reconstruction:** Datanodes use stripe checksums to validate stripe integrity during reconciliation or offline recovery.

---

## Hadoop file checksum (`getFileChecksum()`)

Ozone implements the Hadoop **`getFileChecksum()`** API so clients can compare file integrity across Hadoop-compatible filesystems.

- **Hierarchy:**
  1. **File checksum** — combines checksums of all blocks in the file.
  2. **Block checksum** — combines checksums of all chunks in the block.
  3. **Chunk checksum** — base CRC/hash for each **`bytes.per.checksum`** segment.
- **Implementation:** The client (via **`FileChecksumHelper`**) loads **`ChunkInfo`** for all blocks from Datanodes or OM metadata and combines checksums locally, so **data bytes are not read** and the call stays fast.
- **Combination logic:** [`ozone.client.checksum.combine.mode`](../../administrator-guide/configuration/appendix) selects how levels are merged (for example **`COMPOSITE_CRC`** or **`MD5MD5CRC`**).

---

## S3 ETags

For S3 compatibility, Ozone stores an **ETag** (entity tag) per object.

- **Simple uploads:** For **PutObject**, the S3 Gateway computes **MD5** over the object stream as it is written to Ozone and stores it in key metadata as the ETag.
- **Multipart uploads:**
  1. Each part gets an ETag (MD5 of that part).
  2. On completion, **OM** builds a final ETag from the part MD5s (concatenate part digests, then MD5 that byte string), matching common S3 multipart behavior.
  3. The final ETag is often suffixed with the part count (for example **`…-N`**).
- **Storage:** ETags live in key metadata in **OM** and are returned on HEAD/GET through the S3 Gateway.

---

## Configuration and compatibility

| Property | Default | Description |
| -------- | ------- | ----------- |
| [`ozone.client.checksum.type`](../../administrator-guide/configuration/appendix) | `CRC32` | HDFS often defaults to **CRC32C**. Use **CRC32C** in Ozone when you need comparable checksums for HDFS→Ozone migrations (for example DistCp integrity checks). |
| [`ozone.client.bytes.per.checksum`](../../administrator-guide/configuration/appendix) | `16KB` | Segment size for chunk checksums. Minimum allowed is **8KB**. |
| [`ozone.client.checksum.combine.mode`](../../administrator-guide/configuration/appendix) | `COMPOSITE_CRC` | How chunk/block checksums are merged for the file checksum API. |
| [`ozone.client.verify.checksum`](../../administrator-guide/configuration/appendix) | `true` | Enables or disables client-side verification on read. |

### Checksum combine modes

- **`COMPOSITE_CRC` (default):** Builds a file-level CRC by mathematically combining lower-level chunk/block CRCs. Block-independent and efficient.
- **`MD5MD5CRC`:** MD5 of the MD5 values of chunk checksums; useful for **legacy HDFS** compatibility.

---

## Key components

| Component | Responsibility |
| --------- | ---------------- |
| `Checksum.java` | Core hashing (CRC32C, MD5, and so on). |
| `ChunkInfo` (protobuf) | Carries **`checksumData`** (per chunk) and **`stripeChecksum`** (per stripe). |
| `BlockOutputStream` | Client-side chunk checksums on write. |
| `ChunkInputStream` | Client-side chunk checksum verification on read. |
| `FileChecksumHelper` | Implements **`getFileChecksum()`** by aggregating metadata. |
| S3 Gateway **`ObjectEndpoint`** | MD5-based ETags for **PutObject**. |
| **OM** (S3 multipart **CompleteMultipartUpload** handling) | Final multipart ETag from part ETags. |
