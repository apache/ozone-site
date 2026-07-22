/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const REPLICATION_FACTOR = 3;

function toPositiveInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

/**
 * Calculate SCM's target number of open FACTOR_THREE Ratis pipelines.
 *
 * Mirrors the formulas documented on the Calculating Ratis Pipeline Limits page.
 */
export function calculateRatisPipelineLimit({
  useDynamicLimit,
  datanodePipelineLimit,
  pipelinesPerMetadataDisk,
  globalLimit,
  diskGroups,
  healthyDatanodes,
}) {
  const steps = [];
  let rawTarget = 0;

  if (useDynamicLimit) {
    const perDisk = Math.max(toPositiveInt(pipelinesPerMetadataDisk, 2), 1);
    const groups = Array.isArray(diskGroups) ? diskGroups : [];
    let totalSlots = 0;

    groups.forEach((group, index) => {
      const datanodeCount = toPositiveInt(group.datanodeCount, 0);
      const metadataDisks = Math.max(toPositiveInt(group.metadataDisks, 0), 1);
      const groupSlots = datanodeCount * perDisk * metadataDisks;
      totalSlots += groupSlots;

      if (datanodeCount > 0) {
        steps.push({
          label: `Group ${index + 1} pipeline slots`,
          formula: `${datanodeCount} datanodes * (${perDisk} pipelines/disk * ${metadataDisks} disks/datanode)`,
          value: groupSlots,
        });
      }
    });

    rawTarget = Math.floor(totalSlots / REPLICATION_FACTOR);
    steps.push({
      label: 'Raw target from dynamic limit',
      formula: `(${totalSlots}) / ${REPLICATION_FACTOR}`,
      value: rawTarget,
    });
  } else {
    const perDatanodeLimit = Math.max(toPositiveInt(datanodePipelineLimit, 2), 1);
    const datanodes = toPositiveInt(healthyDatanodes, 0);
    const totalSlots = perDatanodeLimit * datanodes;
    rawTarget = Math.floor(totalSlots / REPLICATION_FACTOR);

    steps.push({
      label: 'Raw target from fixed datanode limit',
      formula: `(${perDatanodeLimit} * ${datanodes} healthy datanodes) / ${REPLICATION_FACTOR}`,
      value: rawTarget,
    });
  }

  const cap = toPositiveInt(globalLimit, 0);
  let finalTarget = rawTarget;
  let globalLimitApplied = false;

  if (cap > 0) {
    finalTarget = Math.min(rawTarget, cap);
    globalLimitApplied = finalTarget < rawTarget;
    steps.push({
      label: 'Compare with global limit',
      formula: `min(${rawTarget}, ${cap})`,
      value: finalTarget,
    });
  }

  return {
    steps,
    rawTarget,
    finalTarget,
    globalLimitApplied,
  };
}

export function createDefaultDiskGroups() {
  return [
    { id: 'group-1', datanodeCount: 8, metadataDisks: 4 },
    { id: 'group-2', datanodeCount: 2, metadataDisks: 2 },
  ];
}
