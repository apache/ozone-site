---
sidebar_label: Native ACLs
---

# Native ACLs

Apache Ozone provides a built-in Access Control List (ACL) system for managing permissions on resources like volumes, buckets, and keys. This system is the default authorization mechanism when Ozone is not integrated with Apache Ranger.

## Overview

Ozone's native ACLs are based on the POSIX ACL model and concepts from HDFS ACLs. They allow granting specific permissions to users and groups for specific resources.

*   **ACL Structure:** An ACL consists of multiple entries. Each entry defines:
    *   **Type:** User, Group, World (others), or Mask.
    *   **Name:** The specific user or group name (not applicable for World).
    *   **Permissions:** The set of rights granted (e.g., READ, WRITE, DELETE, LIST, READ_ACL, WRITE_ACL, ALL).
*   **Inheritance:** ACLs are typically inherited from parent directories or buckets, but this behavior can be modified.
*   **Default ACLs:** Buckets and volumes can have default ACLs that are automatically applied to new objects or buckets created within them.

## Key Concepts

*   **Permissions:**
    *   **READ:** Allows reading object data or listing contents of a bucket/directory.
    *   **WRITE:** Allows writing or modifying object data, creating objects/directories within a bucket.
    *   **DELETE:** Allows deleting an object or an empty bucket/directory.
    *   **LIST:** Allows listing the contents of a bucket/directory (names, metadata). Note: Requires READ access on the parent directory path as well.
    *   **READ_ACL:** Allows reading the ACLs of the object/bucket.
    *   **WRITE_ACL:** Allows modifying the ACLs of the object/bucket.
    *   **ALL:** Grants all permissions (READ, WRITE, DELETE, LIST, READ_ACL, WRITE_ACL).
*   **Scope:** ACLs can be set on:
    *   Volumes
    *   Buckets
    *   Keys (Objects/Files)
    *   Prefixes (Directories)

## Managing ACLs

Ozone ACLs are managed using the `ozone sh` command-line interface (CLI).

**Common Commands:**

*   **Set ACL:**
    ```bash
    ozone sh <volume|bucket|key> setacl <path> --acl <type>:<name>:<permissions>[,...]
    ```
    *   `<type>`: `user`, `group`, `world`
    *   `<name>`: User or group name (omit for `world`)
    *   `<permissions>`: Comma-separated list (e.g., `read,write,delete,list,read_acl,write_acl,all`) or individual letters (e.g., `rwdlx`). Use `a` for `all`.

    **Example:** Grant user `testuser` READ and WRITE access to `/vol1/bucket1`:
    ```bash
    ozone sh bucket setacl /vol1/bucket1 --acl user:testuser:rw
    ```

*   **Get ACL:**
    ```bash
    ozone sh <volume|bucket|key> getacl <path>
    ```
    **Example:** Get ACLs for `/vol1/bucket1`:
    ```bash
    ozone sh bucket getacl /vol1/bucket1
    ```

*   **Remove ACL:**
    ```bash
    ozone sh <volume|bucket|key> removeacl <path> --acl <type>:<name>:<permissions>[,...]
    ```
    **Example:** Remove WRITE access for `testuser` from `/vol1/bucket1`:
    ```bash
    ozone sh bucket removeacl /vol1/bucket1 --acl user:testuser:w
    ```

*   **Add ACL (without replacing existing):**
    ```bash
    ozone sh <volume|bucket|key> addacl <path> --acl <type>:<name>:<permissions>[,...]
    ```

## Default ACLs

Default ACLs are applied to new items created *within* a container (volume or bucket). They are set using the `--default` flag with the `setacl` command on the container itself.

**Example:** Set default READ access for group `readers` on new objects created in `/vol1/bucket1`:

```bash
ozone sh bucket setacl /vol1/bucket1 --acl default:group:readers:r
```

Ozone's native ACL system provides a granular way to control access to resources within the cluster, especially when Apache Ranger is not being used.
