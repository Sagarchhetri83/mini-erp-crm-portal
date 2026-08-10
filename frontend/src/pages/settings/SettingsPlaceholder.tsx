import React from 'react';

const SettingsPlaceholder: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <div className="page-subtitle">System settings</div>
        </div>
      </div>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '12px', fontWeight: 600 }}>Configuration options will be available here in a future release.</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Currently, the core application settings are managed via environment variables on the backend. 
          Dynamic system configuration will be implemented soon.
        </p>
      </div>
    </div>
  );
};

export default SettingsPlaceholder;
