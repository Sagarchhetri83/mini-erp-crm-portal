import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, CheckCircle, IndianRupee, PlusCircle } from 'lucide-react';
import { useDashboardStats } from './useDashboardStats';

const SalesDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardStats();

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const totalSalesValue = data.recentChallans.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Dashboard</h1>
          <div className="page-subtitle">Your recent sales activity and metrics</div>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Customers</span>
            <Users size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{data.metrics.totalCustomers}</div>
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
            <span className="kpi-label">Active Leads</span>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value">{data.metrics.followUps?.total || 0}</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Recent Sales Value</span>
            <IndianRupee size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>
            ₹{totalSalesValue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="layout-2col">
        <div className="layout-main">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              Recent Sales Challans
              <Link to="/sales/challans" style={{ fontSize: '12px', fontWeight: 500 }}>View All</Link>
            </div>
            
            {data.recentChallans.length === 0 ? (
              <div className="empty-state">No sales challans yet.</div>
            ) : (
              <>
                <div className="table-wrapper desktop-only" style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                  <table style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-app)' }}>
                        <th>CHALLAN NO</th>
                        <th>CUSTOMER</th>
                        <th>DATE</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentChallans.map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 500 }}>
                            <Link to={`/sales/challans/${c.id}`}>{c.challanNo}</Link>
                          </td>
                          <td>{c.customer?.name}</td>
                          <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 500 }}>₹{c.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-data-list mobile-only" style={{ padding: '16px' }}>
                  {data.recentChallans.map((c) => (
                    <div className="mobile-data-card" key={c.id}>
                      <div className="mobile-data-card-header" style={{ marginBottom: '8px' }}>
                        <Link to={`/sales/challans/${c.id}`} className="mobile-data-card-title" style={{ fontFamily: 'monospace', textDecoration: 'none', color: 'var(--primary)' }}>
                          {c.challanNo}
                        </Link>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                      </div>
                      <div className="mobile-data-card-grid" style={{ marginTop: '0' }}>
                        <div>
                          <div className="mobile-data-card-label">Customer</div>
                          <div className="mobile-data-card-value">{c.customer?.name}</div>
                        </div>
                        <div>
                          <div className="mobile-data-card-label">Amount</div>
                          <div className="mobile-data-card-value">₹{c.totalAmount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="mobile-data-card-label">Date</div>
                          <div className="mobile-data-card-value">{new Date(c.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="layout-sidebar">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '12px 16px', margin: 0, borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
              Quick Actions
            </div>
            <div style={{ padding: '8px' }}>
              <Link to="/sales/customers/new" className="sidebar-nav" style={{ padding: '8px', display: 'flex', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none', alignItems: 'center' }}>
                <PlusCircle size={14} style={{ color: 'var(--primary)' }}/> Add Customer
              </Link>
              <Link to="/sales/challans/new" className="sidebar-nav" style={{ padding: '8px', display: 'flex', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none', alignItems: 'center' }}>
                <PlusCircle size={14} style={{ color: 'var(--primary)' }}/> New Challan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
