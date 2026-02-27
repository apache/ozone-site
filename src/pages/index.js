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

// Import Bootstrap icons
import { GraphUpArrow, Diagram3Fill, LockFill, Speedometer, Stack, HddRackFill, ShieldLock } from 'react-bootstrap-icons';

const features = [
  {
    title: 'Scalable',
    description: 'Handle petabytes of data with ease. Apache Ozone scales to billions of objects and supports both small and large files efficiently.',
    icon: GraphUpArrow,
    iconSize: 30,
  },
  {
    title: 'Resilient',
    description: 'Built-in replication, erasure coding, and robust consistency model ensure your data remains safe and available.',
    icon: Diagram3Fill,
    iconSize: 30,
  },
  {
    title: 'Secure',
    description: 'Security features including Kerberos authentication, TDE encryption, ACL-based and Ranger based authorization for enterprise environments.',
    icon: LockFill,
    iconSize: 30,
  },
  {
    title: 'Performant',
    description: 'Optimized for both high throughput and low latency operations, with support for tiered storage.',
    icon: Speedometer,
    iconSize: 30,
  },
  {
    title: 'Multi-Protocol',
    description: 'Native S3 protocol support plus seamless integration with the Hadoop ecosystem through multiple filesystem interfaces.',
    icon: Stack,
    iconSize: 30,
  },
  {
    title: 'Efficient',
    description: 'Dense storage nodes and extensive scalability allow consolidation of multiple clusters, reducing operational costs.',
    icon: HddRackFill,
    iconSize: 30,
  },
];

function Feature({title, description, icon: Icon, iconSize}) {
  return (
    <div className="col col--4 margin-bottom--lg">
      <div className="text--center padding--lg">
        <div className="margin-bottom--md" style={{ color: 'var(--ifm-color-primary)' }}>
          <Icon size={iconSize} />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

// Import additional Bootstrap icons for use cases
import { Water, Bucket, Folder2 } from 'react-bootstrap-icons';

function UseCases() {
  const useCases = [
    {
      title: 'Data Lakes',
      description: 'Build cost-effective, scalable data lakes for analytics workloads with tiered storage support.',
      icon: Water,
      iconSize: 30,
    },
    {
      title: 'Object Storage',
      description: 'S3-compatible storage for applications, backups, and unstructured data at any scale.',
      icon: Bucket,
      iconSize: 30,
    },
    {
      title: 'Big Data Storage',
      description: 'Reliable storage foundation for Hadoop, Spark, and other data processing frameworks.',
      icon: Folder2,
      iconSize: 30,
    },
  ];

  return (
    <section className="padding-vert--xl">
      <div className="container">
        <div className="row">
          <div className="col">
            <h2 className="text--center margin-bottom--lg">Use Cases</h2>
          </div>
        </div>
        <div className="row">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="col col--4 margin-bottom--lg">
              <div className="text--center padding--lg">
                <div className="margin-bottom--md" style={{ color: 'var(--ifm-color-primary)' }}>
                  <useCase.icon size={useCase.iconSize} />
                </div>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
          <div className="col col--12 text--center margin-top--lg">
            <Link to="/community/who-uses-ozone">
              <button className="button button--primary button--lg">See Who Uses Ozone</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Import icons for integrations
import {
  FileEarmarkCodeFill,
  SegmentedNav,
  Calendar3,
  Lightning,
  ShieldLockFill,
  KeyFill,
  ClipboardData,
  GraphUp,
  Database
} from 'react-bootstrap-icons';
function Integrations() {
  const integrations = [
    { 
      name: 'Hive', 
      icon: () => <img src="/img/integrations/hive.svg" className="integration-logo-img" data-logo="hive" style={{ height: '42px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      link: '/docs/user-guide/integrations/hive' 
    },
    { 
      name: 'Spark', 
      icon: () => <img src="/img/integrations/spark.svg" className="integration-logo-img" data-logo="spark" style={{ height: '28px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      // link: '/docs/user-guide/integrations/spark'
    },
    { 
      name: 'Iceberg', 
      icon: () => <img src="/img/integrations/iceberg.svg" className="integration-logo-img" data-logo="iceberg" style={{ height: '28px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      link: '/docs/user-guide/integrations/iceberg' 
    },
    { 
      name: 'Trino', 
      icon: () => <img src="/img/integrations/trino.svg" className="integration-logo-img" data-logo="trino" style={{ height: '28px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      // link: '/docs/user-guide/integrations/trino'
    },
    { 
      name: 'Impala', 
      icon: () => <img src="/img/integrations/impala.svg" className="integration-logo-img" data-logo="impala" style={{ height: '42px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      link: '/docs/user-guide/integrations/impala' 
    },
    { 
      name: 'Ranger', 
      icon: () => <img src="/img/integrations/ranger.svg" className="integration-logo-img" data-logo="ranger" style={{ height: '28px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      link: '/docs/administrator-guide/configuration/security/ranger' 
    },
    { 
      name: 'Knox', 
      icon: () => <img src="/img/integrations/knox.svg" className="integration-logo-img" data-logo="knox" style={{ height: '28px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      // link: '/docs/administrator-guide/configuration/security/knox'
    },
    { 
      name: 'Kerberos', 
      icon: props => <ShieldLock {...props} size={28} style={{ color: '#212529' }} data-logo="kerberos-icon" />, 
      link: '/docs/administrator-guide/configuration/security/kerberos' 
    },
    { 
      name: 'Prometheus', 
      icon: () => <img src="/img/integrations/prometheus.svg" className="integration-logo-img" data-logo="prometheus" style={{ height: '28px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      link: '/docs/administrator-guide/operations/observability/prometheus' 
    },
    { 
      name: 'Grafana', 
      icon: () => <img src="/img/integrations/grafana.svg" className="integration-logo-img" data-logo="grafana" style={{ height: '42px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      link: '/docs/administrator-guide/operations/observability/grafana' 
    },
    { 
      name: 'Oozie', 
      icon: () => <img src="/img/integrations/oozie.svg" className="integration-logo-img" data-logo="oozie" style={{ height: '28px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />, 
      // link: '/docs/user-guide/integrations/oozie'
    },
    { 
      name: 'Hue', 
      icon: () => <img src="/img/integrations/hue.svg" className="integration-logo-img" data-logo="hue" style={{ height: '42px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />,
      // link: '/docs/user-guide/integrations/hue'
    },
    {
      name: 'HBase',
      icon: () => <img src="/img/integrations/hbase.svg" className="integration-logo-img" data-logo="hbase" style={{ height: '42px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />,
      link: '/docs/user-guide/integrations/hbase'
    },
   {
      name: 'DistCp',
      icon: () => <img src="/img/integrations/distcp.svg" className="integration-logo-img" data-logo="distcp" style={{ height: '42px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />,
      link: '/docs/user-guide/integrations/hadoop-distcp'
    },
  ];

  return (
    <section className="padding-vert--xl integrations-section">
      <div className="container">
        <div className="row">
          <div className="col">
            <h2 className="text--center margin-bottom--lg">Integrations</h2>
          </div>
        </div>
        <div className="row">
          {integrations.map((integration, idx) => (
            <div key={idx} className="col col--2 margin-bottom--lg">
              <Link to={integration.link} className="text--center padding--md integration-item" style={{ display: 'block', textDecoration: 'none' }}>
                <div className="margin-bottom--sm" style={{ 
                  color: 'var(--ifm-color-primary)',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <integration.icon size={28} />
                </div>
                <div className="integration-name">{integration.name}</div>
              </Link>
            </div>
          ))}
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
      <div className="hero hero-banner">
        <div className="container">
          <div className="row" style={{alignItems: 'center'}}>
            <div className="col col--6">
              <h1 className="hero__title">{siteConfig.title}</h1>
              <p className="hero__subtitle">
                {siteConfig.tagline}
              </p>
              <div>
                <Link to={getStartedHref}>
                  <button className="button button--primary button--lg margin-right--sm">
                    Get Started
                  </button>
                </Link>
                <Link to="/downloads">
                  <button className="button button--secondary button--lg">
                    Download
                  </button>
                </Link>
              </div>
            </div>
            <div className="col col--6 text--center">
              {/* Logo with increased size and positioned more to the right */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '2rem' }}>
                <Logo style={{ maxHeight: '240px', width: 'auto' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases section moved before Features as recommended */}
      <UseCases />

      <section className="padding-vert--xl container">
        <div className="row">
          <div className="col">
            <h2 className="text--center margin-bottom--lg">Features</h2>
          </div>
        </div>
        <div className="row">
          {features.map((feature, idx) => (
            <Feature key={idx} {...feature} />
          ))}
        </div>
      </section>

      <Integrations />

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
