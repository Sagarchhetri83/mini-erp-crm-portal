import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Box,
  ChartNoAxesCombined,
  UserCircle,
  MoreHorizontal
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const rolePrefix = `/${user.role.toLowerCase()}`;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
      <NavLink to={rolePrefix} end className={({ isActive }) => (isActive ? 'active' : '')}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to={`${rolePrefix}/analytics`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <ChartNoAxesCombined size={14} /> Analytics
      </NavLink>
      
      <div className="nav-section">CRM</div>
      <NavLink to={`${rolePrefix}/customers`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <Users size={14} /> Customers
      </NavLink>
      
      <div className="nav-section">Inventory</div>
      <NavLink to={`${rolePrefix}/products`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <Package size={14} /> Products
      </NavLink>
      
      <div className="nav-section">Sales</div>
      <NavLink to={`${rolePrefix}/challans`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <FileText size={14} /> Sales Challans
      </NavLink>

      <div className="nav-section">System</div>
      <NavLink to={`${rolePrefix}/users`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <Users size={14} /> Users
      </NavLink>
      <NavLink to={`${rolePrefix}/settings`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <Settings size={14} /> Settings
      </NavLink>
    </>
  );

  const renderSalesNav = () => (
    <>
      <div className="nav-section">Main</div>
      <NavLink to={rolePrefix} end className={({ isActive }) => (isActive ? 'active' : '')}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to={`${rolePrefix}/analytics`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <ChartNoAxesCombined size={14} /> Analytics
      </NavLink>
      
      <div className="nav-section">CRM</div>
      <NavLink to={`${rolePrefix}/customers`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <Users size={14} /> Customers
      </NavLink>
      
      <div className="nav-section">Sales</div>
      <NavLink to={`${rolePrefix}/challans`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <FileText size={14} /> Sales Challans
      </NavLink>

      <div className="nav-section">Account</div>
      <a href="#" onClick={(e) => e.preventDefault()} className="sidebar-nav-item">
        <UserCircle size={14} /> My Profile
      </a>
    </>
  );

  const renderWarehouseNav = () => (
    <>
      <div className="nav-section">Main</div>
      <NavLink to={rolePrefix} end className={({ isActive }) => (isActive ? 'active' : '')}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to={`${rolePrefix}/analytics`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <ChartNoAxesCombined size={14} /> Analytics
      </NavLink>
      
      <div className="nav-section">Inventory</div>
      <NavLink to={`${rolePrefix}/products`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <Package size={14} /> Products & Stock
      </NavLink>
      
      <div className="nav-section">Sales</div>
      <NavLink to={`${rolePrefix}/challans`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <FileText size={14} /> Sales Challans
      </NavLink>

      <div className="nav-section">Account</div>
      <a href="#" onClick={(e) => e.preventDefault()} className="sidebar-nav-item">
        <UserCircle size={14} /> My Profile
      </a>
    </>
  );

  const renderAccountsNav = () => (
    <>
      <div className="nav-section">Main</div>
      <NavLink to={rolePrefix} end className={({ isActive }) => (isActive ? 'active' : '')}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to={`${rolePrefix}/analytics`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <ChartNoAxesCombined size={14} /> Analytics
      </NavLink>
      
      <div className="nav-section">Sales</div>
      <NavLink to={`${rolePrefix}/challans`} className={({ isActive }) => (isActive ? 'active' : '')}>
        <FileText size={14} /> Sales Challans
      </NavLink>

      <div className="nav-section">Account</div>
      <a href="#" onClick={(e) => e.preventDefault()} className="sidebar-nav-item">
        <UserCircle size={14} /> My Profile
      </a>
    </>
  );

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ background: '#A78BFA', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <Box size={18} style={{ color: '#FFFFFF' }} />
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
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=374151&color=fff&size=40`} 
            alt={user.name} 
            style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}
          />
          <div className="user-info-mini" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
            <span className="name">{user.name}</span>
            <span className="role">{user.role.toLowerCase()}@erp.com</span>
          </div>
          <button className="btn-signout-icon" onClick={handleLogout} title="Sign Out">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">{getPageTitle()}</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Bell size={16} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)' }}>
              <div className="avatar-initial" style={{ width: '28px', height: '28px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '11px' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
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
