import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Settings, LogOut } from 'lucide-react';

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(`/${user.role.toLowerCase()}${path}`);
  };

  return (
    <div className="profile-wrapper" ref={wrapperRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}
      >
        <div className="avatar-initial" style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '13px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
        </div>
      </button>

      {isOpen && (
        <div className="profile-dropdown" style={{
          position: 'absolute', top: '44px', right: 0, width: '240px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)', borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 9999, overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{user.email}</div>
            <div style={{ fontSize: '10px', background: 'var(--primary)', color: 'white', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
              {user.role}
            </div>
          </div>
          
          <div style={{ padding: '8px 0', backgroundColor: 'var(--bg-surface)' }}>
            <button className="dropdown-item" onClick={() => handleNavigate('/profile')} style={{
              width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
              background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer',
              textAlign: 'left'
            }}>
              <User size={16} /> My Profile
            </button>
            <button className="dropdown-item" onClick={() => handleNavigate('/settings')} style={{
              width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
              background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer',
              textAlign: 'left'
            }}>
              <Settings size={16} /> Account Settings
            </button>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-color)', padding: '8px 0', backgroundColor: 'var(--bg-surface)' }}>
            <button className="dropdown-item" onClick={handleLogout} style={{
              width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
              background: 'none', border: 'none', color: 'var(--danger-color, #EF4444)', fontSize: '13px', cursor: 'pointer',
              textAlign: 'left', fontWeight: 500
            }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
