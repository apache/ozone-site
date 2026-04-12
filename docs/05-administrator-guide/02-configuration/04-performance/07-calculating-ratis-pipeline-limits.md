---
sidebar_label: Calculating Ratis Pipeline Limits
---

# Calculating Ratis Pipeline Limits

ReplicationFactor.THREE is controlled by three configuration properties that limit the
number of pipelines in the cluster at a cluster-wide level and a datanode level, respectively.
The number of pipelines created by SCM is restricted by these limits.

1.  **Cluster-wide Limit (`ozone.scm.ratis.pipeline.limit`)**
    *   **Description**: An absolute, global limit for the total number of open Ratis pipelines
        across the entire cluster. This acts as a final cap on the total number of pipelines.
    *   **Default Value**: `0` (which means no global limit by default).

2.  **Datanode-level Fixed Limit (`ozone.scm.datanode.pipeline.limit`)**
    *   **Description**: When set to a positive number, this property defines a fixed maximum number of pipelines for
        every datanode.
    *   **Default Value**: `2`
    *   **Cluster-wide Limit Calculation**: If this property is set,
        the number of pipelines in the cluster is in addition limited by
        `(<this value> * <number of healthy datanodes>) / 3`.

3.  **Datanode-level Dynamic Limit (`ozone.scm.pipeline.per.metadata.disk`)**
    *   **Description**: This property takes effect when `ozone.scm.datanode.pipeline.limit` is not set to a positive number.
        It calculates a dynamic limit for each datanode based on its available metadata disks.
    *   **Default Value**: `2`

## How Limits are Applied

SCM first calculates a target number of pipelines based on either the **Datanode-level Fixed Limit** or the
**Datanode-level Dynamic Limit**. It then compares this calculated target to the **Cluster-wide Limit**. The
**lowest value** is used as the final target for the number of open pipelines.

**Example (Dynamic Limit):**

Consider a cluster with **10 healthy datanodes**.
*   **8 datanodes** have 4 metadata disks each.
*   **2 datanodes** have 2 metadata disks each.

And the configuration is:
*   `ozone.scm.ratis.pipeline.limit` = **30** (A global cap is set)
*   `ozone.scm.datanode.pipeline.limit` = **0** (Use dynamic calculation)
*   `ozone.scm.pipeline.per.metadata.disk` = **2** (Default)

**Calculation Steps:**
1.  Calculate the limit for the first group of datanodes: `8 datanodes * (2 pipelines/disk * 4 disks/datanode) = 64 pipelines`
2.  Calculate the limit for the second group of datanodes: `2 datanodes * (2 pipelines/disk * 2 disks/datanode) = 8 pipelines`
3.  Calculate the total raw target from the dynamic limit: `(64 + 8) / 3 = 24`
4.  Compare with the global limit: `min(24, 30) = 24`

SCM will attempt to create and maintain approximately **24** open, FACTOR_THREE Ratis pipelines.

**Production Recommendation:**

For most production deployments, using the dynamic per-disk limit (`ozone.scm.datanode.pipeline.limit=0`) is
recommended, as it allows the cluster to scale pipeline capacity naturally with its resources. You can use the
global limit (`ozone.scm.ratis.pipeline.limit`) as a safety cap if needed. A good starting value for
`ozone.scm.pipeline.per.metadata.disk` is **2**. Monitor the section **Pipeline Statistics** in SCM web UI, or run
the command `ozone admin pipeline list` to see if the actual number of pipelines aligns with your configured targets.
