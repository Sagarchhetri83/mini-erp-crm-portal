import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import SalesDashboard from './SalesDashboard';
import WarehouseDashboard from './WarehouseDashboard';
import AccountsDashboard from './AccountsDashboard';

const DashboardContainer: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'SALES':
      return <SalesDashboard />;
    case 'WAREHOUSE':
      return <WarehouseDashboard />;
    case 'ACCOUNTS':
      return <AccountsDashboard />;
    default:
      return <div>Dashboard not available for this role.</div>;
  }
};

export default DashboardContainer;
