import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">📦</div>
          <h2>Mini ERP</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            📊 Dashboard
          </NavLink>
          
          <NavLink to="/customers" className={({ isActive }) => (isActive ? 'active' : '')}>
            👥 Customers
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
            📦 Inventory
          </NavLink>
          
          <NavLink to="/challans" className={({ isActive }) => (isActive ? 'active' : '')}>
            📄 Sales Challans
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role badge badge-secondary">{user?.role}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
