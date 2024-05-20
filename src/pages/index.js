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

import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Logo from '@site/static/img/ozone-logo.svg';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const getStartedHref = `docs/quick-start`
  return (
    <Layout
      title="Home"
      description={`${siteConfig.tagline}`}>
          <div class="hero">
            <div class="container">
              <div class="row" style={{alignItems: 'center'}}>
                <div class="col col--6">
                  <h1 class="hero__title">{siteConfig.title}</h1>
                  <p class="hero__subtitle">
                    {siteConfig.tagline}
                    <br/>
                    TODO <a href="https://issues.apache.org/jira/browse/HDDS-9539">HDDS-9539</a>
                  </p>
                  <div>
                    <a href={getStartedHref}>
                      <button class="button button--primary button--lg margin-right--sm" href={getStartedHref}>
                        Get Started
                      </button>
                    </a>
                  </div>
                  </div>
                <div class="col col--6 padding--lg" >
                  <Logo height="100%" width="100%" />
                </div>
              </div>
            </div>
          </div>
    </Layout>
  );
}
