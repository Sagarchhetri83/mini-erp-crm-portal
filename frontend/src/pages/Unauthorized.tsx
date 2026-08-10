import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user) {
      navigate(`/${user.role.toLowerCase()}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-app)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px auto' }} />
        <h1 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>Access Restricted</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          You don't have permission to access this page.
        </p>
        <button onClick={handleBack} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
