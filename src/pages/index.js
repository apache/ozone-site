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
import Link from '@docusaurus/Link';
import clsx from 'clsx';

const features = [
  {
    title: 'Scalable Storage',
    description: 'Handle petabytes of data with ease. Apache Ozone scales to billions of objects and supports both small and large files efficiently.',
    icon: '📊',
  },
  {
    title: 'Cloud Native',
    description: 'Designed to run in containerized environments with Kubernetes integration, supporting both cloud and on-premises deployments.',
    icon: '☁️',
  },
  {
    title: 'S3 Compatible',
    description: 'Native S3 protocol support makes it easy to use with existing S3 clients and applications without modification.',
    icon: '🔄',
  },
  {
    title: 'Hadoop Integration',
    description: 'Seamlessly works with the Hadoop ecosystem including HDFS, Hive, Spark, and more through multiple filesystem interfaces.',
    icon: '🐘',
  },
  {
    title: 'Reliable & Resilient',
    description: 'Built-in replication, erasure coding, and robust consistency model ensure your data remains safe and available.',
    icon: '🔒',
  },
  {
    title: 'Enterprise Ready',
    description: 'Security features including Kerberos authentication, TDE encryption, ACL-based and Ranger based authorization for enterprise environments.',
    icon: '🏢',
  },
];

function Feature({title, description, icon}) {
  return (
    <div className="col col--4 margin-bottom--lg">
      <div className="card padding--lg height--100">
        <div className="card__header">
          <h3>{icon} {title}</h3>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

function UseCases() {
  return (
    <section className="padding-vert--xl">
      <div className="container">
        <div className="row">
          <div className="col">
            <h2 className="text--center margin-bottom--lg">Common Use Cases</h2>
          </div>
        </div>
        <div className="row">
          <div className="col col--4 margin-bottom--lg">
            <div className="card padding--lg height--100">
              <div className="card__header">
                <h3>Data Lakes</h3>
              </div>
              <div className="card__body">
                <p>Build cost-effective, scalable data lakes for analytics workloads with tiered storage support.</p>
              </div>
            </div>
          </div>
          <div className="col col--4 margin-bottom--lg">
            <div className="card padding--lg height--100">
              <div className="card__header">
                <h3>Object Storage</h3>
              </div>
              <div className="card__body">
                <p>S3-compatible storage for applications, backups, and unstructured data at any scale.</p>
              </div>
            </div>
          </div>
          <div className="col col--4 margin-bottom--lg">
            <div className="card padding--lg height--100">
              <div className="card__header">
                <h3>Big Data Storage</h3>
              </div>
              <div className="card__body">
                <p>Reliable storage foundation for Hadoop, Spark, and other data processing frameworks.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col col--12 text--center margin-top--lg">
            <Link to="/community/who-uses-ozone">
              <button className="button button--secondary button--lg">See Who Uses Ozone</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const getStartedHref = `docs/quick-start/installation/docker`;
  return (
    <Layout
      title="Home"
      description={`${siteConfig.tagline}`}>
      <div className="hero hero--primary">
        <div className="container">
          <div className="row" style={{alignItems: 'center'}}>
            <div className="col col--6">
              <h1 className="hero__title">{siteConfig.title}</h1>
              <p className="hero__subtitle">
                {siteConfig.tagline}
              </p>
              <div>
                <Link to={getStartedHref}>
                  <button className="button button--secondary button--lg margin-right--sm">
                    Get Started
                  </button>
                </Link>
                <Link to="/download">
                  <button className="button button--outline button--secondary button--lg">
                    Download
                  </button>
                </Link>
              </div>
            </div>
            <div className="col col--6 padding--lg">
              <Logo height="100%" width="100%" />
            </div>
          </div>
        </div>
      </div>

      <section className="padding-vert--xl">
        <div className="container">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h2 className="text--center margin-bottom--md">What is Apache Ozone?</h2>
              <p className="text--center">
                Apache Ozone is a distributed, scalable, and high-performance object store designed for modern data lakes  and cloud-native workloads. It addresses scaling needs while providing S3 compatibility and strong integrations with the data processing ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="padding-vert--xl container">
        <div className="row">
          <div className="col">
            <h2 className="text--center margin-bottom--lg">Key Features</h2>
          </div>
        </div>
        <div className="row">
          {features.map((feature, idx) => (
            <Feature key={idx} {...feature} />
          ))}
        </div>
      </section>

      <UseCases />

      <section className="padding-vert--xl">
        <div className="container">
          <div className="row">
            <div className="col col--8 col--offset-2 text--center">
              <h2 className="margin-bottom--md">Ready to Get Started?</h2>
              <p className="margin-bottom--lg">
                Deploy Apache Ozone in minutes with Docker, or explore our comprehensive documentation for other deployment options.
              </p>
              <div>
                <Link to={getStartedHref}>
                  <button className="button button--primary button--lg margin-right--md">
                    Quick Start
                  </button>
                </Link>
                <Link to="/docs">
                  <button className="button button--secondary button--lg">
                    Documentation
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}
