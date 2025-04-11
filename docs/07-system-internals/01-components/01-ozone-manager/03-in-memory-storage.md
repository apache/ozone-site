---
sidebar_label: In-Memory Cache
---

# Ozone Manager In-Memory Metadata Cache

To optimize performance, especially for read operations, the Ozone Manager (OM) maintains an **in-memory cache** of its metadata. This cache sits between client requests and the persistent [RocksDB storage](./02-rocksdb-schema.md), serving frequently accessed information directly from the OM's Java heap memory.

## Purpose

The primary goal of the metadata cache is to **reduce read latency**. Accessing data from RAM is significantly faster than reading from disk (even fast SSDs used for RocksDB). By caching frequently requested items like volume information, bucket details, and key metadata, OM can serve many read requests without needing to query RocksDB, leading to improved overall cluster performance.

## How it Works

1.  **Cache Structure:** The cache mirrors the structure of the underlying RocksDB tables (Column Families). Each logical table (e.g., `volumeTable`, `bucketTable`, `keyTable`) within the `OMMetadataManager` has an associated in-memory cache (often implemented using concurrent maps).
2.  **Cache Entries:** Entries in the cache use `CacheKey` (wrapping the original RocksDB key, e.g., `/volumeId/bucketId`) and `CacheValue`. A `CacheValue` holds the actual metadata object (e.g., `OmBucketInfo`) and crucially, the Ratis transaction log index at which this cache entry was last updated or validated.
3.  **Read Operations (`get`, `lookup`):**
    *   When OM needs to retrieve metadata (e.g., `getBucketInfo`), it first checks the corresponding table's in-memory cache using the appropriate `CacheKey`.
    *   **Cache Hit:** If a valid (non-deleted) `CacheValue` exists for the key, the metadata object is retrieved directly from the cache and returned, avoiding a RocksDB lookup.
    *   **Cache Miss:** If the key is not found in the cache, or if the `CacheValue` indicates the entry is deleted, OM performs a read operation on the underlying RocksDB table. If found in RocksDB, the entry might be loaded into the cache for future requests.
4.  **Write Operations (`create`, `update`, `delete`):**
    *   When a metadata modification request is processed (typically after being committed via Ratis in an HA setup), the change is applied to RocksDB.
    *   Simultaneously, the corresponding entry in the in-memory cache is updated using `addCacheEntry`.
        *   For creates/updates, a new `CacheValue` containing the updated metadata object and the current Ratis transaction log index is added.
        *   For deletes, a `CacheValue` representing a deletion marker (often containing `null` or a specific tombstone object) along with the transaction log index is added. This invalidates the cache entry without immediately removing it, ensuring consistency.
5.  **Listing Operations (`listKeys`, `listBuckets`, etc.):**
    *   Listing requires presenting a merged view of both the cache and RocksDB.
    *   The `ListIterator` class is used to achieve this. It internally uses two iterators: one for the cache (`cacheIterator`) and one for the RocksDB table (`TableIterator`).
    *   It intelligently merges the results, prioritizing cache entries (creations, updates, deletions) over potentially stale RocksDB entries based on the Ratis transaction log index associated with the `CacheValue`. This ensures the list reflects the latest committed state.

## Consistency in HA

In an Ozone Manager High Availability (HA) deployment using Ratis, the transaction log index associated with each `CacheValue` is critical for maintaining consistency. The cache reflects the state applied up to a certain Ratis log index. Reads that combine cache and RocksDB data ensure that only data consistent with the committed state machine is returned.

## Benefits and Considerations

*   **Benefit:** Significantly improves read performance for frequently accessed metadata.
*   **Consideration:** Consumes Java heap memory within the Ozone Manager process. The memory footprint grows with the size and activity of the Ozone namespace. OM heap sizing (`OZONE_MANAGER_HEAP_OPTS`) needs to account for both operational needs and this caching layer. Cache eviction policies might be implemented, but the primary mechanism relies on sufficient heap allocation.

The in-memory cache is a vital component for achieving high performance in the Ozone Manager.
