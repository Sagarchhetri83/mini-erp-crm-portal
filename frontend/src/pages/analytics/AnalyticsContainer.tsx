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

  // We now use exact metrics from the backend, calculated via proper aggregations across all data.
  const { metrics } = data;
  const totalChallans = metrics.totalChallans || 1;
  const confirmedPct = (metrics.statusDistribution.CONFIRMED / totalChallans) * 100;
  const draftPct = (metrics.statusDistribution.DRAFT / totalChallans) * 100;
  const cancelledPct = (metrics.statusDistribution.CANCELLED / totalChallans) * 100;

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
              <FileText size={16} /> Recent Challans Overview
            </h3>
            
            {/* Real CSS Chart based on actual data proportions */}
            <div style={{ height: '12px', display: 'flex', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px', background: 'var(--border-color)' }}>
              {metrics.statusDistribution.CONFIRMED > 0 && <div style={{ width: `${confirmedPct}%`, background: 'var(--success)', transition: 'width 0.5s ease' }} title="Confirmed" />}
              {metrics.statusDistribution.DRAFT > 0 && <div style={{ width: `${draftPct}%`, background: 'var(--warning)', transition: 'width 0.5s ease' }} title="Draft" />}
              {metrics.statusDistribution.CANCELLED > 0 && <div style={{ width: `${cancelledPct}%`, background: 'var(--danger)', transition: 'width 0.5s ease' }} title="Cancelled" />}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} /> Confirmed
                </span>
                <span style={{ fontWeight: 600 }}>{metrics.statusDistribution.CONFIRMED}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} style={{ color: 'var(--warning)' }} /> Draft
                </span>
                <span style={{ fontWeight: 600 }}>{metrics.statusDistribution.DRAFT}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <XCircle size={14} style={{ color: 'var(--danger)' }} /> Cancelled
                </span>
                <span style={{ fontWeight: 600 }}>{metrics.statusDistribution.CANCELLED}</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              *Complete historical distribution of all challans.
            </div>
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
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Sales Value</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>₹{metrics.confirmedSalesValue.toFixed(2)}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Average Order Value</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>₹{metrics.averageChallanValue.toFixed(2)}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Pending Follow-ups</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{metrics.followUpCount}</div>
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
              {metrics.outOfStockCount}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} /> Recent Stock Movements
        </h3>
        {data.recentMovements && data.recentMovements.length > 0 ? (
          <div className="table-wrapper" style={{ margin: 0, boxShadow: 'none' }}>
            <table style={{ margin: 0 }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)' }}>
                  <th>DATE</th>
                  <th>PRODUCT</th>
                  <th>TYPE</th>
                  <th style={{ textAlign: 'right' }}>QTY</th>
                  <th>REASON</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMovements.map((m: any) => (
                  <tr key={m.id}>
                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 500 }}>{m.product.name}</td>
                    <td>
                      <span className={m.type === 'IN' ? 'badge badge-success' : 'badge badge-error'}>
                        {m.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      {m.type === 'IN' ? '+' : '-'}{m.qty}
                    </td>
                    <td>{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '24px' }}>
            No recent stock movements.
          </div>
        )}
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
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Confirmed Sales Value</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>₹{metrics.confirmedSalesValue.toFixed(2)}</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Confirmed Sales Count</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>
              {metrics.confirmedCount}
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Average Order Value</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>₹{metrics.averageChallanValue.toFixed(2)}</div>
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
