import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { 
  PlusCircle
} from 'lucide-react';

interface DashboardData {
  metrics: {
    totalCustomers: number;
    totalProducts: number;
    totalChallans: number;
    lowStockCount: number;
  };
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    minStock: number;
  }[];
  recentChallans: {
    id: string;
    challanNo: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    customer: { name: string };
  }[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '18px' }}>Dashboard</h1>
          <p className="page-subtitle">Overview of your business operations</p>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Customers</span>
          </div>
          <div className="kpi-value">{data.metrics.totalCustomers}</div>
        </div>
        
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Products</span>
          </div>
          <div className="kpi-value">{data.metrics.totalProducts}</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Challans</span>
          </div>
          <div className="kpi-value">{data.metrics.totalChallans}</div>
        </div>

        <div className="card kpi-card" style={{ borderColor: data.metrics.lowStockCount > 0 ? 'var(--warning)' : 'var(--border-color)', backgroundColor: data.metrics.lowStockCount > 0 ? 'var(--warning-bg)' : 'var(--bg-surface)' }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: data.metrics.lowStockCount > 0 ? '#92400E' : 'var(--text-secondary)' }}>Low Stock</span>
          </div>
          <div className="kpi-value" style={{ color: data.metrics.lowStockCount > 0 ? '#92400E' : 'inherit' }}>
            {data.metrics.lowStockCount}
          </div>
        </div>
      </div>

      <div className="layout-2col">
        {/* MAIN COLUMN */}
        <div className="layout-main">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px' }}>Recent Sales Challans</h3>
            </div>
            {data.recentChallans.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>No challans created yet.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Challan</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentChallans.map(c => (
                      <tr key={c.id}>
                        <td>
                          <Link to={`/challans/${c.id}`} style={{ fontWeight: 500 }}>
                            {c.challanNo}
                          </Link>
                        </td>
                        <td>{c.customer.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>₹{c.totalAmount.toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${c.status.toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Example of another main area block could go here, e.g. Recent Customers */}
        </div>

        {/* RIGHT COLUMN */}
        <div className="layout-sidebar">
          
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              Inventory Status
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Products</span>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{data.metrics.totalProducts}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Low Stock</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: data.metrics.lowStockCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{data.metrics.lowStockCount}</span>
            </div>
            
            <div style={{ marginTop: '12px', fontSize: '13px', color: data.metrics.lowStockCount > 0 ? 'var(--warning)' : 'var(--success)' }}>
              {data.metrics.lowStockCount > 0 ? 'Attention required for inventory.' : 'Inventory is healthy.'}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/challans/new" className="btn btn-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', padding: '6px 0', height: 'auto', fontWeight: 400, color: 'var(--text-primary)' }}>
                <PlusCircle size={14} style={{ color: 'var(--text-muted)' }} /> New Challan
              </Link>
              <Link to="/customers/new" className="btn btn-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', padding: '6px 0', height: 'auto', fontWeight: 400, color: 'var(--text-primary)' }}>
                <PlusCircle size={14} style={{ color: 'var(--text-muted)' }} /> Add Customer
              </Link>
              <Link to="/products/new" className="btn btn-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', padding: '6px 0', height: 'auto', fontWeight: 400, color: 'var(--text-primary)' }}>
                <PlusCircle size={14} style={{ color: 'var(--text-muted)' }} /> Add Product
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.recentChallans.slice(0, 3).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                  <div style={{ color: 'var(--primary)', marginTop: '2px' }}>●</div>
                  <div>
                    Challan <span style={{ fontWeight: 500 }}>{c.challanNo}</span> {c.status.toLowerCase()}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {data.recentChallans.length === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent activity.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
