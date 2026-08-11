import React from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, CheckCircle, Clock, FileText } from 'lucide-react';
import { useDashboardStats } from './useDashboardStats';

const AccountsDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardStats();

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const totalSalesValue = data.recentChallans.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts Dashboard</h1>
          <div className="page-subtitle">Sales and financial overview</div>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Recent Sales Value</span>
            <IndianRupee size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>
            ₹{totalSalesValue.toLocaleString()}
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Confirmed Challans</span>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value">{data.metrics.statusDistribution.CONFIRMED}</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Pending / Draft</span>
            <Clock size={16} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="kpi-value">{data.metrics.statusDistribution.DRAFT}</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Average Challan Value</span>
            <FileText size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">
            {data.recentChallans.length > 0 
              ? `₹${(totalSalesValue / data.recentChallans.length).toFixed(2)}`
              : '₹0'}
          </div>
        </div>
      </div>

      <div className="layout-2col">
        <div className="layout-main">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              Recent Sales Transactions
              <Link to="/accounts/challans" style={{ fontSize: '12px', fontWeight: 500 }}>View All</Link>
            </div>
            
            {data.recentChallans.length === 0 ? (
              <div className="empty-state">No transactions yet.</div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, margin: 0 }}>
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
                          <Link to={`/accounts/challans/${c.id}`}>{c.challanNo}</Link>
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
            )}
          </div>
        </div>

        <div className="layout-sidebar">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '12px 16px', margin: 0, borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
              Sales Summary
            </div>
            <div style={{ padding: '16px' }}>
               <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Review complete sales analytics on the analytics page.</div>
               <Link to="/accounts/analytics" className="btn btn-secondary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
                  View Full Analytics
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;
