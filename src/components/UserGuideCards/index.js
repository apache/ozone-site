import React from 'react';
import Link from '@docusaurus/Link';
import IntegrationsCard from '../IntegrationsCard';

export default function UserGuideCards() {
  return (
    <div className="container">
      <div className="row">
        {/* Client Interfaces Card */}
        <div className="col col--6 margin-bottom--lg">
          <Link
            className="card padding--lg"
            to="/docs/user-guide/client-interfaces"
            style={{ 
              display: 'block', 
              height: '100%', 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h3>Client Interfaces</h3>
              <div style={{ 
                width: '150px',
                height: '150px',
                margin: '15px auto'
              }}>
                <img 
                  src="/ozone-site/img/client-interfaces-compact.svg" 
                  alt="Client Interfaces" 
                  style={{ width: '100%', height: '100%' }} 
                />
              </div>
              <p>Connect to Ozone with various protocols (S3, OFS, CLI).</p>
            </div>
          </Link>
        </div>
        
        {/* Integrations Card */}
        <div className="col col--6 margin-bottom--lg">
          <IntegrationsCard />
        </div>
      </div>
    </div>
  );
}