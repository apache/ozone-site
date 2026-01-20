---
sidebar_label: Calculating EC Pipeline Limits
---

# Calculating EC Pipeline Limits

The target number of open EC pipelines SCM aims to maintain is calculated dynamically for each EC replication configuration (e.g., RS-6-3, RS-3-2). The calculation is based on the following two properties, with the final target being the greater of the two resulting values.

- `ozone.scm.ec.pipeline.minimum`
  - **Description**: The guaranteed minimum number of open pipelines to maintain for each EC configuration, regardless of other factors.
  - **Default Value**: `5`

- `ozone.scm.ec.pipeline.per.volume.factor`
  - **Description**: A factor used to calculate a target number of pipelines based on the total number of healthy volumes across all datanodes in the cluster.
  - **Default Value**: `1.0`

## Calculation Logic:

SCM first calculates a volume-based target using the formula:
`(<pipeline.per.volume.factor> * <total healthy volumes>) / <required nodes for EC config>`

The final target number of pipelines is then determined by:
`max(<volume-based target>, <pipeline.minimum>)`

## Example:

Consider a cluster with **200 total healthy volumes** across all datanodes and an EC policy of **RS-6-3** (which requires 9 nodes).

- `ozone.scm.ec.pipeline.minimum` = **5** (default)
- `ozone.scm.ec.pipeline.per.volume.factor` = **1.0** (default)

1.  The volume-based target is: `(1.0 * 200) / 9 = 22`
2.  The final target is: `max(22, 5) = 22`

SCM will attempt to create and maintain approximately **22** open, RS-6-3 EC pipelines.

## Production Recommendation:

The default values are a good starting point for most clusters. If you have a very high number of volumes and a write-heavy EC workload, you might consider slightly increasing the `pipeline.per.volume.factor`. Conversely, for read-heavy workloads, the default minimum of 5 pipelines is often sufficient.
