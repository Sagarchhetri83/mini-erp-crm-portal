import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings, 
  Box,
  ChartNoAxesCombined,
  UserCircle,
  MoreHorizontal,
  Menu
} from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { ProfileDropdown } from './ProfileDropdown';

const Layout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  const rolePrefix = `/${user.role.toLowerCase()}`;

  const closeSidebar = () => setIsSidebarOpen(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === rolePrefix) return 'Dashboard';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/customers')) return 'Customers';
    if (path.includes('/products')) return 'Inventory';
    if (path.includes('/challans')) return 'Sales Challans';
    if (path.includes('/users')) return 'Users';
    if (path.includes('/settings')) return 'Settings';
    return 'MiniERP';
  };

  const renderAdminNav = () => (
    <>
      <div className="nav-section">Main</div>
      <NavLink to={rolePrefix} end className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to={`${rolePrefix}/analytics`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <ChartNoAxesCombined size={14} /> Analytics
      </NavLink>
      
      <div className="nav-section">CRM</div>
      <NavLink to={`${rolePrefix}/customers`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <Users size={14} /> Customers
      </NavLink>
      
      <div className="nav-section">Inventory</div>
      <NavLink to={`${rolePrefix}/products`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <Package size={14} /> Products
      </NavLink>
      
      <div className="nav-section">Sales</div>
      <NavLink to={`${rolePrefix}/challans`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <FileText size={14} /> Sales Challans
      </NavLink>

      <div className="nav-section">System</div>
      <NavLink to={`${rolePrefix}/users`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <Users size={14} /> Users
      </NavLink>
      <NavLink to={`${rolePrefix}/settings`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <Settings size={14} /> Settings
      </NavLink>
    </>
  );

  const renderSalesNav = () => (
    <>
      <div className="nav-section">Main</div>
      <NavLink to={rolePrefix} end className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to={`${rolePrefix}/analytics`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <ChartNoAxesCombined size={14} /> Analytics
      </NavLink>
      
      <div className="nav-section">CRM</div>
      <NavLink to={`${rolePrefix}/customers`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <Users size={14} /> Customers
      </NavLink>
      
      <div className="nav-section">Sales</div>
      <NavLink to={`${rolePrefix}/challans`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <FileText size={14} /> Sales Challans
      </NavLink>

      <div className="nav-section">Account</div>
      <a href="#" onClick={(e) => { e.preventDefault(); closeSidebar(); }} className="sidebar-nav-item">
        <UserCircle size={14} /> My Profile
      </a>
    </>
  );

  const renderWarehouseNav = () => (
    <>
      <div className="nav-section">Main</div>
      <NavLink to={rolePrefix} end className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to={`${rolePrefix}/analytics`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <ChartNoAxesCombined size={14} /> Analytics
      </NavLink>
      
      <div className="nav-section">Inventory</div>
      <NavLink to={`${rolePrefix}/products`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <Package size={14} /> Products & Stock
      </NavLink>
      
      <div className="nav-section">Sales</div>
      <NavLink to={`${rolePrefix}/challans`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <FileText size={14} /> Sales Challans
      </NavLink>

      <div className="nav-section">Account</div>
      <a href="#" onClick={(e) => { e.preventDefault(); closeSidebar(); }} className="sidebar-nav-item">
        <UserCircle size={14} /> My Profile
      </a>
    </>
  );

  const renderAccountsNav = () => (
    <>
      <div className="nav-section">Main</div>
      <NavLink to={rolePrefix} end className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to={`${rolePrefix}/analytics`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <ChartNoAxesCombined size={14} /> Analytics
      </NavLink>
      
      <div className="nav-section">Sales</div>
      <NavLink to={`${rolePrefix}/challans`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeSidebar}>
        <FileText size={14} /> Sales Challans
      </NavLink>

      <div className="nav-section">Account</div>
      <a href="#" onClick={(e) => { e.preventDefault(); closeSidebar(); }} className="sidebar-nav-item">
        <UserCircle size={14} /> My Profile
      </a>
    </>
  );

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'sidebar-open' : ''}`} onClick={closeSidebar} aria-hidden="true" />
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box size={16} style={{ color: '#FFFFFF' }} />
          </div>
          <h2>MiniERP</h2>
        </div>
        
        <nav className="sidebar-nav">
          {user.role === 'ADMIN' && renderAdminNav()}
          {user.role === 'SALES' && renderSalesNav()}
          {user.role === 'WAREHOUSE' && renderWarehouseNav()}
          {user.role === 'ACCOUNTS' && renderAccountsNav()}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar-initial" style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '13px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info-mini" style={{ marginLeft: '10px', flex: 1, overflow: 'hidden' }}>
            <span className="name">{user.name}</span>
            <span className="role">{user.role.toLowerCase()}@erp.com</span>
          </div>
          <button className="btn-signout-icon" onClick={() => { navigate(`${rolePrefix}/settings`); closeSidebar(); }} title="Settings">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open Navigation Menu">
              <Menu size={18} />
            </button>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Dashboard</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getPageTitle()}</span>
          </div>
          
          <div className="header-right">
            <GlobalSearch />
            <NotificationBell />
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)' }}>
              <ProfileDropdown />
            </div>
          </div>
        </header>

        <div className="workspace">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

