import React from 'react';

const UsersPlaceholder: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <div className="page-subtitle">User management</div>
        </div>
      </div>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '12px', fontWeight: 600 }}>User management functionality is not available yet.</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          This section will allow administrators to manage users, roles and access permissions in a future release.
          <br /><br />
          For now, please use the seed users provided in the database.
        </p>
      </div>
    </div>
  );
};

export default UsersPlaceholder;
