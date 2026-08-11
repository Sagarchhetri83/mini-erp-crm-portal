import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../dashboard/useDashboardStats';
import { Package, FileText, CheckCircle, Clock, XCircle, Users, Activity, PhoneCall } from 'lucide-react';

const AnalyticsContainer: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useDashboardStats();

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data || !user) return null;

  const { metrics } = data;
  const totalChallans = metrics.totalChallans || 1;
  const confirmedPct = (metrics.statusDistribution.CONFIRMED / totalChallans) * 100;
  const draftPct = (metrics.statusDistribution.DRAFT / totalChallans) * 100;
  const cancelledPct = (metrics.statusDistribution.CANCELLED / totalChallans) * 100;

  const totalProducts = metrics.totalProducts || 1;
  const inStockPct = ((metrics.inStockCount || 0) / totalProducts) * 100;
  const lowStockPct = ((metrics.lowStockCount || 0) / totalProducts) * 100;
  const outOfStockPct = ((metrics.outOfStockCount || 0) / totalProducts) * 100;

  const renderAdminAnalytics = () => (
    <>
      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Sales (Confirmed)</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>₹{metrics.confirmedSalesValue.toFixed(2)}</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Confirmed Challans</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{metrics.confirmedCount}</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg Challan Value</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>₹{metrics.averageChallanValue.toFixed(2)}</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Customers</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{metrics.totalCustomers}</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Products</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{metrics.totalProducts}</div>
        </div>
        <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--warning)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Low Stock Items</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{metrics.lowStockCount}</div>
        </div>
      </div>

      <div className="layout-2col">
        {/* LEFT COLUMN */}
        <div className="layout-main">
          {/* CHALLAN STATUS */}
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Challan Status Distribution
            </h3>
            
            <div style={{ height: '16px', display: 'flex', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', background: 'var(--border-color)' }}>
              {metrics.statusDistribution.CONFIRMED > 0 && <div style={{ width: `${confirmedPct}%`, background: 'var(--success)', transition: 'width 0.5s ease' }} title={`Confirmed: ${confirmedPct.toFixed(1)}%`} />}
              {metrics.statusDistribution.DRAFT > 0 && <div style={{ width: `${draftPct}%`, background: 'var(--warning)', transition: 'width 0.5s ease' }} title={`Draft: ${draftPct.toFixed(1)}%`} />}
              {metrics.statusDistribution.CANCELLED > 0 && <div style={{ width: `${cancelledPct}%`, background: 'var(--danger)', transition: 'width 0.5s ease' }} title={`Cancelled: ${cancelledPct.toFixed(1)}%`} />}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', textAlign: 'center' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confirmed</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.statusDistribution.CONFIRMED}</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', textAlign: 'center' }}>
                <Clock size={16} style={{ color: 'var(--warning)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Draft</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.statusDistribution.DRAFT}</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', textAlign: 'center' }}>
                <XCircle size={16} style={{ color: 'var(--danger)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cancelled</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.statusDistribution.CANCELLED}</div>
              </div>
            </div>
          </div>

          {/* CUSTOMER OVERVIEW */}
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} /> Customer Overview
            </h3>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>By Type</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Retail</span> <span style={{ fontWeight: 600 }}>{metrics.customerTypeDistribution?.RETAIL || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Wholesale</span> <span style={{ fontWeight: 600 }}>{metrics.customerTypeDistribution?.WHOLESALE || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Distributor</span> <span style={{ fontWeight: 600 }}>{metrics.customerTypeDistribution?.DISTRIBUTOR || 0}</span>
                  </div>
                </div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>By Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}/> Active</span> 
                    <span style={{ fontWeight: 600 }}>{metrics.customerStatusDistribution?.ACTIVE || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}/> Lead</span> 
                    <span style={{ fontWeight: 600 }}>{metrics.customerStatusDistribution?.LEAD || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }}/> Inactive</span> 
                    <span style={{ fontWeight: 600 }}>{metrics.customerStatusDistribution?.INACTIVE || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> Recent Activity
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.recentChallans.slice(0, 3).map(c => (
                <div key={`c-${c.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '8px', background: 'rgba(91, 92, 226, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>Challan {c.status.toLowerCase()}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.challanNo} for {c.customer.name}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {data.recentMovements.slice(0, 3).map(m => (
                <div key={`m-${m.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px' }}>
                    <Package size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>Stock Adjusted ({m.type})</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.product.name} ({m.type === 'IN' ? '+' : '-'}{m.qty})</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="layout-sidebar">
          {/* INVENTORY HEALTH */}
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} /> Inventory Health
            </h3>
            
            <div style={{ height: '8px', display: 'flex', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px', background: 'var(--border-color)' }}>
              {(metrics.inStockCount || 0) > 0 && <div style={{ width: `${inStockPct}%`, background: 'var(--success)' }} title="In Stock" />}
              {metrics.lowStockCount > 0 && <div style={{ width: `${lowStockPct}%`, background: 'var(--warning)' }} title="Low Stock" />}
              {metrics.outOfStockCount > 0 && <div style={{ width: `${outOfStockPct}%`, background: 'var(--danger)' }} title="Out of Stock" />}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}/> In Stock
                </span>
                <span style={{ fontWeight: 600 }}>{metrics.inStockCount || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}/> Low Stock
                </span>
                <span style={{ fontWeight: 600 }}>{metrics.lowStockCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}/> Out of Stock
                </span>
                <span style={{ fontWeight: 600 }}>{metrics.outOfStockCount}</span>
              </div>
            </div>
          </div>

          {/* FOLLOW-UPS */}
          <div className="card">
            <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={16} /> CRM Follow-ups
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 500 }}>Overdue</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{metrics.followUps?.overdue || 0}</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 500 }}>Due Today</span>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{metrics.followUps?.today || 0}</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(91, 92, 226, 0.05)', border: '1px solid rgba(91, 92, 226, 0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>Upcoming</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{metrics.followUps?.upcoming || 0}</span>
              </div>
            </div>
            
            {(metrics.followUps?.total || 0) === 0 && (
              <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                No follow-ups scheduled.
              </div>
            )}
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
          <div className="page-subtitle">Key performance metrics and business trends</div>
        </div>
      </div>

      {user.role === 'ADMIN' ? renderAdminAnalytics() : (
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          Analytics dashboards for other roles follow the same data structure and use role-specific KPIs.
        </div>
      )}
    </div>
  );
};

export default AnalyticsContainer;
