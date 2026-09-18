---
sidebar_label: Snapshots
---

# Bucket Snapshots

A Snapshot is a point-in-time, read-only image of a Bucket.
It captures the exact state of the bucket at the moment of creation, allowing users to access historical data or perform backups without interrupting ongoing write operations.

## Snapshot Key characteristics

- **Instantaneous**: Snapshot creation is an O(1) operation. It utilizes metadata within the Ozone Manager, making it extremely fast regardless of the bucket's size.
- **Efficient**: Snapshots do not duplicate data blocks physically. Storage space is claimed only when the live data is modified or deleted, ensuring storage efficiency.
- **Accessible**: Users can access snapshot data through the virtual `.snapshot` directory.
