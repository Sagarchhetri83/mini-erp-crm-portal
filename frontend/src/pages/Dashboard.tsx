import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
      </div>

      <div className="dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
            {data.metrics.totalCustomers}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Customers</div>
        </div>
        
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
            {data.metrics.totalProducts}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Products</div>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
            {data.metrics.totalChallans}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Challans</div>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: data.metrics.lowStockCount > 0 ? '#fef2f2' : 'var(--card-bg)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: data.metrics.lowStockCount > 0 ? '#b45309' : 'var(--primary)', marginBottom: '8px' }}>
            {data.metrics.lowStockCount}
          </div>
          <div style={{ color: data.metrics.lowStockCount > 0 ? '#b45309' : 'var(--text-secondary)', fontWeight: 500 }}>
            Low Stock Alerts
          </div>
        </div>
      </div>

      <div className="detail-grid">
        {/* Low Stock Alerts */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Low Stock Items
            <Link to="/products?lowStock=true" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>View All →</Link>
          </h3>
          
          {data.lowStockProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <p>Inventory is healthy.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Min</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/products/${p.id}`} style={{ fontWeight: 500 }}>{p.name}</Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</div>
                      </td>
                      <td style={{ color: '#b45309', fontWeight: 600 }}>{p.stock}</td>
                      <td>{p.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Challans */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Recent Challans
            <Link to="/challans" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>View All →</Link>
          </h3>

          {data.recentChallans.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <p>No challans created yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Challan No</th>
                    <th>Customer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentChallans.map(c => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/challans/${c.id}`} style={{ fontWeight: 500, fontFamily: 'monospace' }}>
                          {c.challanNo}
                        </Link>
                      </td>
                      <td>{c.customer.name}</td>
                      <td>
                        <span className={`badge badge-${c.status === 'CONFIRMED' ? 'success' : c.status === 'CANCELLED' ? 'error' : 'warning'}`}>
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
      </div>
    </div>
  );
};

export default Dashboard;
