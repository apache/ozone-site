import React from 'react';
import Link from '@docusaurus/Link';

export default function IntegrationsCard() {
  return (
    <Link
      className="card padding--lg"
      to="/docs/user-guide/integrations"
      style={{ 
        display: 'block', 
        height: '100%', 
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h3>Integrations</h3>
        <div style={{ 
          width: '150px',
          height: '150px',
          margin: '15px auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '15px',
          justifyItems: 'center',
          alignItems: 'center',
          background: 'rgba(247, 252, 240, 0.9)',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Direct use of original SVGs at smaller size for maximum fidelity */}
          <img src="/ozone-site/img/integrations/hive.svg" alt="Hive" width="35" height="35" />
          <img src="/ozone-site/img/integrations/spark.svg" alt="Spark" width="40" height="40" />
          <img src="/ozone-site/img/integrations/impala.svg" alt="Impala" width="35" height="35" />
          <img src="/ozone-site/img/integrations/iceberg.svg" alt="Iceberg" width="40" height="40" />
          <img src="/ozone-site/img/integrations/trino.svg" alt="Trino" width="40" height="40" />
          <img src="/ozone-site/img/integrations/hue.svg" alt="Hue" width="40" height="40" />
        </div>
        <p>Configure ecosystem tools to work with Ozone storage.</p>
      </div>
    </Link>
  );
}