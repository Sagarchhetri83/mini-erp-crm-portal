import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, FileText, AlertTriangle, PlusCircle } from 'lucide-react';
import { useDashboardStats } from './useDashboardStats';

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardStats();

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">Overview of your business operations</div>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Customers</span>
            <Users size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{data.metrics.totalCustomers}</div>
        </div>
        
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Products</span>
            <Package size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{data.metrics.totalProducts}</div>
        </div>
        
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Sales Challans</span>
            <FileText size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{data.metrics.totalChallans}</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Low Stock</span>
            <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="kpi-value" style={{ color: data.metrics.lowStockCount > 0 ? 'var(--warning)' : 'inherit' }}>
            {data.metrics.lowStockCount}
          </div>
        </div>
      </div>

      <div className="layout-2col">
        <div className="layout-main">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              Recent Sales Challans
              <Link to="/admin/challans" style={{ fontSize: '12px', fontWeight: 500 }}>View All</Link>
            </div>
            
            {data.recentChallans.length === 0 ? (
              <div className="empty-state">No sales challans yet.</div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-app)' }}>
                      <th>CHALLAN NO</th>
                      <th>CUSTOMER</th>
                      <th>DATE</th>
                      <th style={{ textAlign: 'right' }}>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentChallans.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 500 }}>
                          <Link to={`/admin/challans/${c.id}`}>{c.challanNo}</Link>
                        </td>
                        <td>{c.customer?.name}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 500, textAlign: 'right' }}>₹{c.totalAmount.toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="layout-sidebar">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '12px 16px', margin: 0, borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
              Quick Actions
            </div>
            <div style={{ padding: '8px' }}>
              <Link to="/admin/customers/new" className="sidebar-nav" style={{ padding: '8px', display: 'flex', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none', alignItems: 'center' }}>
                <PlusCircle size={14} style={{ color: 'var(--primary)' }}/> Add Customer
              </Link>
              <Link to="/admin/products/new" className="sidebar-nav" style={{ padding: '8px', display: 'flex', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none', alignItems: 'center' }}>
                <PlusCircle size={14} style={{ color: 'var(--primary)' }}/> Add Product
              </Link>
              <Link to="/admin/challans/new" className="sidebar-nav" style={{ padding: '8px', display: 'flex', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none', alignItems: 'center' }}>
                <PlusCircle size={14} style={{ color: 'var(--primary)' }}/> New Challan
              </Link>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '12px 16px', margin: 0, borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
              Inventory Status
            </div>
            <div style={{ padding: '16px' }}>
              {data.metrics.lowStockCount === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>All products are sufficiently stocked.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.lowStockProducts.slice(0, 5).map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Link to={`/admin/products/${p.id}`} style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.sku}</Link>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Min: {p.minStock}</span>
                      </div>
                      <span className={`badge ${p.stock === 0 ? 'badge-error' : 'badge-warning'}`}>
                        {p.stock} in stock
                      </span>
                    </div>
                  ))}
                  {data.metrics.lowStockCount > 5 && (
                    <Link to="/admin/products" style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
                      View all {data.metrics.lowStockCount} low stock items
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
