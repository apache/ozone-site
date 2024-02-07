import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Logo from '@site/static/img/ozone-logo-hug.svg';
import Banner from '@site/static/img/banner.png';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const getStartedHref = `docs/quick-start/installation/docker`
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="{siteConfig.tagline}">
      <div className="banner-container" style={{ backgroundImage: `url(${Banner})` }}>
        <div className="overlay">
          <div className="content-box">
            <h1>{siteConfig.title}</h1>
            <p>{siteConfig.tagline}</p>
            <div className="buttons-container">
              <button>Slack</button>
              <button>Github</button>
              <button>Community</button>
            </div>
          </div>
          <div className="logo-container">
            <Logo />
          </div>
      </div>
    </div>
        
    <div className="about-container">
      <p>To-Do: about component</p>
      <p> create about component in src/components as function and import to here </p>
    </div>

      <div className="center-container">
        <div className="features-container">
          <div className="f1"> feature-1
            <p>create feature-1 component in src/components as function and import to here </p>
          </div>

          <div className="f2"> feature-2
            <p>create feature-2 component in src/components as function and import to here </p>
          </div>

          <div className="f3"> feature-3
            <p>create feature-3 component in src/components as function and import to here </p>
          </div>

          <div className="f4"> feature-4
            <p>create feature-4 component in src/components as function and import to here </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
