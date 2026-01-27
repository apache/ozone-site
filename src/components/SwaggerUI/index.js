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

import React, { useState, useRef, useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function SwaggerUIComponent({ spec, defaultServer }) {
  const specUrl = useBaseUrl(spec);
  const [serverUrl, setServerUrl] = useState(defaultServer || 'http://localhost:9888');
  const swaggerSystemRef = useRef(null);

  // Update the server URL in Swagger whenever serverUrl changes
  useEffect(() => {
    if (swaggerSystemRef.current) {
      const spec = swaggerSystemRef.current.getState().getIn(['spec', 'json']);
      if (spec) {
        swaggerSystemRef.current.specActions.updateJsonSpec({
          ...spec.toJS(),
          servers: [{ url: serverUrl, description: 'Configured Recon Server' }]
        });
      }
    }
  }, [serverUrl]);

  return (
    <div className={styles.swaggerWrapper}>
      <div className={styles.serverConfig}>
        <label htmlFor="recon-server-url" className={styles.serverLabel}>
          Recon Server URL:
        </label>
        <input
          id="recon-server-url"
          type="text"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          placeholder="http://localhost:9888"
          className={styles.serverInput}
        />
        <span className={styles.serverHint}>
          (Default for Docker quick start. Change to match your Recon instance.)
        </span>
      </div>
      <SwaggerUI 
        url={specUrl}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
        onComplete={(system) => {
          // Store the system reference for later updates
          swaggerSystemRef.current = system;
          // Set initial server URL
          const spec = system.getState().getIn(['spec', 'json']);
          if (spec) {
            system.specActions.updateJsonSpec({
              ...spec.toJS(),
              servers: [{ url: serverUrl, description: 'Configured Recon Server' }]
            });
          }
        }}
      />
    </div>
  );
}
