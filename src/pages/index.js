import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Logo from '@site/static/img/ozone-logo.svg';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const getStartedHref = `docs/quick-start/installation/docker`
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
