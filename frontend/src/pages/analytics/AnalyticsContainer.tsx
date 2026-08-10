import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../dashboard/useDashboardStats';
import { ChartNoAxesCombined, Package, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

const AnalyticsContainer: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useDashboardStats();

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data || !user) return null;

  // Derive some basic analytics from the available dashboard stats payload
  // In a real application with heavy data, this would come from a dedicated /analytics backend endpoint
  
  const recentChallans = data.recentChallans;
  
  const confirmedChallans = recentChallans.filter(c => c.status === 'CONFIRMED');
  const draftChallans = recentChallans.filter(c => c.status === 'DRAFT');
  const cancelledChallans = recentChallans.filter(c => c.status === 'CANCELLED');
  
  const recentSalesValue = recentChallans.reduce((sum, c) => sum + c.totalAmount, 0);

  const renderAdminAnalytics = () => (
    <>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChartNoAxesCombined size={16} /> Business Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Customers</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{data.metrics.totalCustomers}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Products</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{data.metrics.totalProducts}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Challans</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{data.metrics.totalChallans}</div>
          </div>
        </div>
      </div>
      
      <div className="layout-2col">
        <div className="layout-main">
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Recent Challan Status Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} /> Confirmed
                </span>
                <span style={{ fontWeight: 600 }}>{confirmedChallans.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} style={{ color: 'var(--warning)' }} /> Draft
                </span>
                <span style={{ fontWeight: 600 }}>{draftChallans.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <XCircle size={14} style={{ color: 'var(--danger)' }} /> Cancelled
                </span>
                <span style={{ fontWeight: 600 }}>{cancelledChallans.length}</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>*Based on most recent transaction data</div>
          </div>
        </div>

        <div className="layout-sidebar">
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} /> Inventory Health
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Healthy Products</span>
              <span style={{ fontWeight: 600 }}>{data.metrics.totalProducts - data.metrics.lowStockCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--warning)' }}>Low Stock Products</span>
              <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{data.metrics.lowStockCount}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSalesAnalytics = () => (
    <>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChartNoAxesCombined size={16} /> Sales Performance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Customers</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{data.metrics.totalCustomers}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Recent Sales Value</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--success)' }}>₹{recentSalesValue.toLocaleString()}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Confirmed Transactions</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{confirmedChallans.length}</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderWarehouseAnalytics = () => (
    <>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChartNoAxesCombined size={16} /> Inventory Analytics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Products Monitored</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{data.metrics.totalProducts}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--warning-bg)', borderRadius: 'var(--radius-md)', backgroundColor: '#fefcf8' }}>
            <div style={{ fontSize: '12px', color: 'var(--warning)', marginBottom: '4px' }}>Low Stock Items</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--warning)' }}>{data.metrics.lowStockCount}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--danger-bg)', borderRadius: 'var(--radius-md)', backgroundColor: '#fffcfc' }}>
            <div style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '4px' }}>Out of Stock</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--danger)' }}>
              {data.lowStockProducts.filter(p => p.stock === 0).length}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAccountsAnalytics = () => (
    <>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChartNoAxesCombined size={16} /> Financial Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Recent Sales Volume</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--success)' }}>₹{recentSalesValue.toLocaleString()}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Average Transaction</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>
              {recentChallans.length > 0 ? `₹${(recentSalesValue / recentChallans.length).toFixed(2)}` : '₹0'}
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Pending Drafts</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--warning)' }}>{draftChallans.length}</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <div className="page-subtitle">Key performance metrics and trends</div>
        </div>
      </div>

      {user.role === 'ADMIN' && renderAdminAnalytics()}
      {user.role === 'SALES' && renderSalesAnalytics()}
      {user.role === 'WAREHOUSE' && renderWarehouseAnalytics()}
      {user.role === 'ACCOUNTS' && renderAccountsAnalytics()}
    </div>
  );
};

export default AnalyticsContainer;
