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

import Heading from '@theme/Heading';
import { useMemo, useState } from 'react';
import {
  calculateRatisPipelineLimit,
  createDefaultDiskGroups,
} from './calculateRatisPipelineLimit';
import styles from './styles.module.css';

let nextGroupId = 3;

function NumberField({ id, label, hint, value, onChange, min = 0 }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}

export default function RatisPipelineCalculator() {
  const [useDynamicLimit, setUseDynamicLimit] = useState(true);
  const [heterogeneousDisks, setHeterogeneousDisks] = useState(true);
  const [globalLimit, setGlobalLimit] = useState(30);
  const [datanodePipelineLimit, setDatanodePipelineLimit] = useState(2);
  const [pipelinesPerMetadataDisk, setPipelinesPerMetadataDisk] = useState(2);
  const [healthyDatanodes, setHealthyDatanodes] = useState(10);
  const [uniformMetadataDisks, setUniformMetadataDisks] = useState(4);
  const [diskGroups, setDiskGroups] = useState(createDefaultDiskGroups);

  const effectiveDiskGroups = useMemo(() => {
    if (!useDynamicLimit) {
      return [];
    }
    if (heterogeneousDisks) {
      return diskGroups;
    }
    return [{ datanodeCount: healthyDatanodes, metadataDisks: uniformMetadataDisks }];
  }, [
    diskGroups,
    healthyDatanodes,
    heterogeneousDisks,
    uniformMetadataDisks,
    useDynamicLimit,
  ]);

  const result = useMemo(
    () =>
      calculateRatisPipelineLimit({
        useDynamicLimit,
        datanodePipelineLimit,
        pipelinesPerMetadataDisk,
        globalLimit,
        diskGroups: effectiveDiskGroups,
        healthyDatanodes,
      }),
    [
      datanodePipelineLimit,
      effectiveDiskGroups,
      globalLimit,
      healthyDatanodes,
      pipelinesPerMetadataDisk,
      useDynamicLimit,
    ],
  );

  const updateDiskGroup = (id, field, value) => {
    setDiskGroups((groups) =>
      groups.map((group) =>
        group.id === id ? { ...group, [field]: value } : group,
      ),
    );
  };

  const addDiskGroup = () => {
    setDiskGroups((groups) => [
      ...groups,
      {
        id: `group-${nextGroupId++}`,
        datanodeCount: 1,
        metadataDisks: 2,
      },
    ]);
  };

  const removeDiskGroup = (id) => {
    setDiskGroups((groups) =>
      groups.length > 1 ? groups.filter((group) => group.id !== id) : groups,
    );
  };

  return (
    <div className={styles.wrapper}>
      <Heading as="h3" className={styles.title}>
        Pipeline Limit Calculator
      </Heading>
      <p className={styles.description}>
        Estimate the number of open FACTOR_THREE Ratis pipelines SCM targets from your
        configuration values.
      </p>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="limit-mode" className={styles.label}>
            Datanode limit mode
          </label>
          <select
            id="limit-mode"
            className={styles.select}
            value={useDynamicLimit ? 'dynamic' : 'fixed'}
            onChange={(event) => setUseDynamicLimit(event.target.value === 'dynamic')}
          >
            <option value="dynamic">Dynamic (`ozone.scm.datanode.pipeline.limit=0`)</option>
            <option value="fixed">Fixed (`ozone.scm.datanode.pipeline.limit &gt; 0`)</option>
          </select>
        </div>

        <NumberField
          id="global-limit"
          label="ozone.scm.ratis.pipeline.limit"
          hint="0 means no global cap"
          value={globalLimit}
          onChange={setGlobalLimit}
        />

        {useDynamicLimit ? (
          <NumberField
            id="pipelines-per-disk"
            label="ozone.scm.pipeline.per.metadata.disk"
            value={pipelinesPerMetadataDisk}
            onChange={setPipelinesPerMetadataDisk}
            min={1}
          />
        ) : (
          <NumberField
            id="datanode-pipeline-limit"
            label="ozone.scm.datanode.pipeline.limit"
            value={datanodePipelineLimit}
            onChange={setDatanodePipelineLimit}
            min={1}
          />
        )}
      </div>

      {useDynamicLimit ? (
        <div className={styles.section}>
          <div className={styles.field}>
            <label htmlFor="heterogeneous-disks" className={styles.label}>
              Metadata disk layout
            </label>
            <select
              id="heterogeneous-disks"
              className={styles.select}
              value={heterogeneousDisks ? 'heterogeneous' : 'uniform'}
              onChange={(event) =>
                setHeterogeneousDisks(event.target.value === 'heterogeneous')
              }
            >
              <option value="uniform">All datanodes use the same metadata disk count</option>
              <option value="heterogeneous">Multiple datanode groups</option>
            </select>
          </div>

          {heterogeneousDisks ? (
            <>
              <Heading as="h4" className={styles.sectionTitle}>
                Datanode groups
              </Heading>
              <table className={styles.groupTable}>
                <thead>
                  <tr>
                    <th>Datanodes</th>
                    <th>Metadata disks per datanode</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {diskGroups.map((group) => (
                    <tr key={group.id}>
                      <td>
                        <input
                          className={styles.input}
                          type="number"
                          min="0"
                          value={group.datanodeCount}
                          onChange={(event) =>
                            updateDiskGroup(group.id, 'datanodeCount', event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className={styles.input}
                          type="number"
                          min="1"
                          value={group.metadataDisks}
                          onChange={(event) =>
                            updateDiskGroup(group.id, 'metadataDisks', event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removeDiskGroup(group.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.buttonRow}>
                <button type="button" className={styles.secondaryButton} onClick={addDiskGroup}>
                  Add group
                </button>
              </div>
            </>
          ) : (
            <div className={`${styles.grid} ${styles.section}`}>
              <NumberField
                id="healthy-datanodes-uniform"
                label="Healthy datanodes"
                value={healthyDatanodes}
                onChange={setHealthyDatanodes}
              />
              <NumberField
                id="uniform-metadata-disks"
                label="Metadata disks per datanode"
                value={uniformMetadataDisks}
                onChange={setUniformMetadataDisks}
                min={1}
              />
            </div>
          )}
        </div>
      ) : (
        <div className={`${styles.grid} ${styles.section}`}>
          <NumberField
            id="healthy-datanodes-fixed"
            label="Healthy datanodes"
            value={healthyDatanodes}
            onChange={setHealthyDatanodes}
          />
        </div>
      )}

      <div className={styles.result}>
        <p className={styles.resultValue}>
          Estimated open Ratis pipelines: <strong>{result.finalTarget}</strong>
        </p>
        <ol className={styles.stepList}>
          {result.steps.map((step) => (
            <li key={step.label} className={styles.stepItem}>
              {step.label}:{' '}
              <span className={styles.stepFormula}>
                {step.formula} = {step.value}
              </span>
            </li>
          ))}
        </ol>
        <p className={styles.note}>
          SCM maintains approximately this many open, FACTOR_THREE Ratis pipelines. Actual
          counts may differ slightly during cluster changes.
          {result.globalLimitApplied
            ? ' The global limit reduced the dynamic/fixed target.'
            : null}
        </p>
      </div>
    </div>
  );
}
