
import React from 'react';
import Layout from '@theme/Layout';

const users = [
  {
    name: 'Tencent',
    useCase: 'Data warehouses, Machine Learning Platforms etc.',
    link: 'https://cloud.tencent.com/developer/article/1667033',
  },
  {
    name: 'Cloudera',
    useCase: 'Cloudera is a user of Ozone.',
    link: 'https://www.cloudera.com/',
  },
  {
    name: 'Shopee',
    useCase: 'Practices of Ozone at Shopee.',
    link: 'https://drive.google.com/file/d/1vrUy9K6PlAnNhlaZVJ-6q6cKJIi1QFXA/view',
  },
  {
    name: 'Preferred Networks',
    useCase: 'ML Cluster at Preferred Networks.',
    link: 'https://tech.preferred.jp/en/blog/a-year-with-apache-ozone/',
  },
  {
    name: 'G-Research',
    useCase: 'G-Research uses Ozone for their open-source initiatives.',
    link: 'https://opensource.gresearch.co.uk/',
  },
  {
    name: 'Qihoo360',
    useCase: 'Qihoo360 uses Ozone.',
    link: 'https://mp.weixin.qq.com/s/OB_YTlXfDMg6ZfMaYOkn_Q',
  },
  {
    name: 'DiDi',
    useCase: 'Best practices of Ozone at DiDi.',
    link: 'https://ozone.apache.org/assets/ApacheOzoneBestPracticesAtDidi.pdf',
  },
  {
    name: 'Meituan',
    useCase: 'Meituan is a user of Ozone.',
    link: 'https://www.meituan.com/',
  },
  {
    name: 'China Unicom',
    useCase: 'China Unicom is a user of Ozone.',
    link: 'https://www.chinaunicom.com.hk/en/global/home.php',
  },
];

function WhoUsesOzone() {
  return (
    <Layout
      title="Who Uses Ozone?"
      description="A list of companies and organizations that use Apache Ozone in production.">
      <div className="container" style={{padding: '2rem 0'}}>
        <h1 style={{textAlign: 'center'}}>Who Uses Ozone?</h1>
        <p style={{textAlign: 'center', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 2rem auto'}}>
          This page lists organizations that are using Apache Ozone in production or for significant projects.
          If your organization is using Apache Ozone and would like to be added to this list, please send a pull request
          with your organization's name, use case, and any relevant links (e.g., blog posts, case studies, or architectural overviews).
        </p>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem'}}>
          {users.map((user) => (
            <div key={user.name} style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1.5rem',
              width: '300px',
              textAlign: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{fontSize: '1.5rem'}}>{user.name}</h2>
                <p>{user.useCase}</p>
              </div>
              <a href={user.link} target="_blank" rel="noopener noreferrer" style={{marginTop: '1rem'}}>
                Learn More
              </a>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default WhoUsesOzone;
