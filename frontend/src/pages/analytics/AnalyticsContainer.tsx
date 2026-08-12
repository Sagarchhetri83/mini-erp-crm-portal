import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../dashboard/useDashboardStats';
import { Package, FileText, CheckCircle, Clock, XCircle, Users, Activity, PhoneCall, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

const AnalyticsContainer: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useDashboardStats();

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return (
    <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
      <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>
      <button className="btn btn-secondary" onClick={() => window.location.reload()}>Retry loading analytics</button>
    </div>
  );
  if (!data || !user) return null;

  const { metrics, recentChallans, recentMovements, lowStockProducts } = data;

  const totalChallans = metrics.totalChallans || 1;
  const confirmedPct = (metrics.statusDistribution.CONFIRMED / totalChallans) * 100;
  const draftPct = (metrics.statusDistribution.DRAFT / totalChallans) * 100;
  const cancelledPct = (metrics.statusDistribution.CANCELLED / totalChallans) * 100;

  const totalProducts = metrics.totalProducts || 1;
  const inStockPct = ((metrics.inStockCount || 0) / totalProducts) * 100;
  const lowStockPct = ((metrics.lowStockCount || 0) / totalProducts) * 100;
  const outOfStockPct = ((metrics.outOfStockCount || 0) / totalProducts) * 100;

  // =========================================================================
  // 1. ADMIN ANALYTICS
  // =========================================================================
  const renderAdminAnalytics = () => (
    <>
      {/* KPI ROW */}
      <div className="kpi-strip" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Confirmed Sales</span>
            <DollarSign size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">₹{metrics.confirmedSalesValue.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Confirmed Challans</span>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value">{metrics.confirmedCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Avg Challan Value</span>
            <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">₹{metrics.averageChallanValue.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Customers</span>
            <Users size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{metrics.totalCustomers}</div>
        </div>
      </div>

      <div className="layout-2col">
        {/* LEFT COLUMN */}
        <div className="layout-main">
          {/* CHALLAN STATUS */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Challan Status Distribution
            </h3>
            
            <div style={{ height: '16px', display: 'flex', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px', background: 'var(--border-color)' }}>
              {metrics.statusDistribution.CONFIRMED > 0 && <div style={{ width: `${confirmedPct}%`, background: 'var(--success)', transition: 'width 0.5s ease' }} title={`Confirmed: ${confirmedPct.toFixed(1)}%`} />}
              {metrics.statusDistribution.DRAFT > 0 && <div style={{ width: `${draftPct}%`, background: 'var(--warning)', transition: 'width 0.5s ease' }} title={`Draft: ${draftPct.toFixed(1)}%`} />}
              {metrics.statusDistribution.CANCELLED > 0 && <div style={{ width: `${cancelledPct}%`, background: 'var(--danger)', transition: 'width 0.5s ease' }} title={`Cancelled: ${cancelledPct.toFixed(1)}%`} />}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, padding: '12px', background: '#FAFAF8', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEAE5' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confirmed</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.statusDistribution.CONFIRMED}</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: '#FAFAF8', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEAE5' }}>
                <Clock size={16} style={{ color: 'var(--warning)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Draft</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.statusDistribution.DRAFT}</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: '#FAFAF8', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEAE5' }}>
                <XCircle size={16} style={{ color: 'var(--danger)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cancelled</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.statusDistribution.CANCELLED}</div>
              </div>
            </div>
          </div>

          {/* CUSTOMER OVERVIEW */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} /> Customer Portfolio Breakdown
            </h3>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>By Type</div>
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
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>By Status</div>
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
        </div>

        {/* RIGHT COLUMN */}
        <div className="layout-sidebar">
          {/* INVENTORY HEALTH */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

          {/* CRM FOLLOW-UPS */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={16} /> CRM Follow-ups
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(220, 38, 38, 0.05)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 500 }}>Overdue</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{metrics.followUps?.overdue || 0}</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 500 }}>Due Today</span>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{metrics.followUps?.today || 0}</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>Upcoming</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{metrics.followUps?.upcoming || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // =========================================================================
  // 2. SALES ANALYTICS
  // =========================================================================
  const renderSalesAnalytics = () => (
    <>
      <div className="kpi-strip" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Customers</span>
            <Users size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{metrics.totalCustomers}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Active Leads</span>
            <PhoneCall size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{metrics.customerStatusDistribution?.LEAD || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Confirmed Sales Value</span>
            <DollarSign size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value">₹{metrics.confirmedSalesValue.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Sales Challans</span>
            <FileText size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{metrics.totalChallans}</div>
        </div>
      </div>

      <div className="layout-2col">
        <div className="layout-main">
          {/* Sales Performance Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} /> Sales Performance & Order Status
            </h3>

            <div style={{ height: '16px', display: 'flex', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px', background: 'var(--border-color)' }}>
              {metrics.statusDistribution.CONFIRMED > 0 && <div style={{ width: `${confirmedPct}%`, background: 'var(--success)' }} title={`Confirmed: ${confirmedPct.toFixed(1)}%`} />}
              {metrics.statusDistribution.DRAFT > 0 && <div style={{ width: `${draftPct}%`, background: 'var(--warning)' }} title={`Draft: ${draftPct.toFixed(1)}%`} />}
              {metrics.statusDistribution.CANCELLED > 0 && <div style={{ width: `${cancelledPct}%`, background: 'var(--danger)' }} title={`Cancelled: ${cancelledPct.toFixed(1)}%`} />}
            </div>

            <div className="grid-responsive-3" style={{ gap: '12px' }}>
              <div style={{ padding: '12px', background: '#FAFAF8', borderRadius: '8px', border: '1px solid #ECEAE5', textAlign: 'center' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confirmed Orders</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.confirmedCount}</div>
              </div>
              <div style={{ padding: '12px', background: '#FAFAF8', borderRadius: '8px', border: '1px solid #ECEAE5', textAlign: 'center' }}>
                <Clock size={16} style={{ color: 'var(--warning)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Draft Orders</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.statusDistribution.DRAFT}</div>
              </div>
              <div style={{ padding: '12px', background: '#FAFAF8', borderRadius: '8px', border: '1px solid #ECEAE5', textAlign: 'center' }}>
                <XCircle size={16} style={{ color: 'var(--danger)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cancelled Orders</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{metrics.statusDistribution.CANCELLED}</div>
              </div>
            </div>
          </div>

          {/* Customer Distribution */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} /> Customer Classification Analytics
            </h3>
            <div className="grid-responsive-2" style={{ gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Customer Types</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Retail</span><strong>{metrics.customerTypeDistribution?.RETAIL || 0}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Wholesale</span><strong>{metrics.customerTypeDistribution?.WHOLESALE || 0}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Distributor</span><strong>{metrics.customerTypeDistribution?.DISTRIBUTOR || 0}</strong></div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Lead Pipeline</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Active Accounts</span><strong>{metrics.customerStatusDistribution?.ACTIVE || 0}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Open Leads</span><strong>{metrics.customerStatusDistribution?.LEAD || 0}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Inactive Accounts</span><strong>{metrics.customerStatusDistribution?.INACTIVE || 0}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="layout-sidebar">
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={16} /> CRM Follow-Up Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#991B1B' }}>Overdue</span>
                <strong>{metrics.followUps?.overdue || 0}</strong>
              </div>
              <div style={{ padding: '10px 12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#92400E' }}>Due Today</span>
                <strong>{metrics.followUps?.today || 0}</strong>
              </div>
              <div style={{ padding: '10px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#166534' }}>Upcoming</span>
                <strong>{metrics.followUps?.upcoming || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // =========================================================================
  // 3. WAREHOUSE ANALYTICS
  // =========================================================================
  const renderWarehouseAnalytics = () => (
    <>
      <div className="kpi-strip" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Products</span>
            <Package size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{metrics.totalProducts}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">In Stock Items</span>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value">{metrics.inStockCount || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Low Stock Alert</span>
            <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="kpi-value" style={{ color: metrics.lowStockCount > 0 ? 'var(--warning)' : 'inherit' }}>
            {metrics.lowStockCount}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Out of Stock</span>
            <XCircle size={16} style={{ color: 'var(--danger)' }} />
          </div>
          <div className="kpi-value" style={{ color: metrics.outOfStockCount > 0 ? 'var(--danger)' : 'inherit' }}>
            {metrics.outOfStockCount}
          </div>
        </div>
      </div>

      <div className="layout-2col">
        <div className="layout-main">
          {/* Inventory Health */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} /> Warehouse Stock Health Breakdown
            </h3>
            
            <div style={{ height: '16px', display: 'flex', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px', background: 'var(--border-color)' }}>
              {(metrics.inStockCount || 0) > 0 && <div style={{ width: `${inStockPct}%`, background: 'var(--success)' }} title={`In Stock: ${inStockPct.toFixed(1)}%`} />}
              {metrics.lowStockCount > 0 && <div style={{ width: `${lowStockPct}%`, background: 'var(--warning)' }} title={`Low Stock: ${lowStockPct.toFixed(1)}%`} />}
              {metrics.outOfStockCount > 0 && <div style={{ width: `${outOfStockPct}%`, background: 'var(--danger)' }} title={`Out of Stock: ${outOfStockPct.toFixed(1)}%`} />}
            </div>

            <div className="grid-responsive-3" style={{ gap: '12px' }}>
              <div style={{ padding: '12px', background: '#FAFAF8', borderRadius: '8px', border: '1px solid #ECEAE5', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Healthy</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}>{inStockPct.toFixed(0)}%</div>
              </div>
              <div style={{ padding: '12px', background: '#FAFAF8', borderRadius: '8px', border: '1px solid #ECEAE5', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Low Stock</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--warning)' }}>{lowStockPct.toFixed(0)}%</div>
              </div>
              <div style={{ padding: '12px', background: '#FAFAF8', borderRadius: '8px', border: '1px solid #ECEAE5', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Out of Stock</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--danger)' }}>{outOfStockPct.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Low Stock Items Attention List */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--warning)' }} /> Stock Replenishment Priority
            </h3>

            {lowStockProducts && lowStockProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {lowStockProducts.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FAFAF8', borderRadius: '6px', border: '1px solid #ECEAE5' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: {p.sku} | Min Threshold: {p.minStock}</div>
                    </div>
                    <span className={`badge ${p.stock === 0 ? 'badge-error' : 'badge-warning'}`}>
                      {p.stock} units left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
                All inventory items are currently above minimum threshold levels.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Recent Movement History */}
        <div className="layout-sidebar">
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> Recent Stock Movements
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentMovements.slice(0, 5).map(m => (
                <div key={m.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.type === 'IN' ? '#16A34A' : '#DC2626', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.product?.name || 'Product'}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{m.type === 'IN' ? '+' : '-'}{m.qty} units ({m.reason})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // =========================================================================
  // 4. ACCOUNTS ANALYTICS
  // =========================================================================
  const renderAccountsAnalytics = () => (
    <>
      <div className="kpi-strip" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Confirmed Revenue</span>
            <DollarSign size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value">₹{metrics.confirmedSalesValue.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Confirmed Orders</span>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value">{metrics.confirmedCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Average Order Value</span>
            <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">₹{metrics.averageChallanValue.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Pending Draft Orders</span>
            <Clock size={16} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="kpi-value">{metrics.statusDistribution.DRAFT}</div>
        </div>
      </div>

      <div className="layout-2col">
        <div className="layout-main">
          {/* Financial Transactions List */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid #ECEAE5' }}>
              <span>Recent Sales Transactions</span>
            </div>
            
            <>
              <div className="table-wrapper desktop-only" style={{ border: 'none', margin: 0, borderRadius: 0 }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#FAFAF8' }}>
                      <th style={{ paddingLeft: '20px' }}>CHALLAN NO</th>
                      <th>CUSTOMER</th>
                      <th>DATE</th>
                      <th style={{ textAlign: 'right' }}>AMOUNT</th>
                      <th style={{ paddingRight: '20px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentChallans.slice(0, 6).map(c => (
                      <tr key={c.id}>
                        <td style={{ paddingLeft: '20px', fontWeight: 600 }}>{c.challanNo}</td>
                        <td>{c.customer?.name}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{c.totalAmount.toFixed(2)}</td>
                        <td style={{ paddingRight: '20px' }}>
                          <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-data-list mobile-only" style={{ padding: '16px' }}>
                {recentChallans.slice(0, 6).map((c) => (
                  <div className="mobile-data-card" key={c.id}>
                    <div className="mobile-data-card-header" style={{ marginBottom: '8px' }}>
                      <div className="mobile-data-card-title" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {c.challanNo}
                      </div>
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
          </div>
        </div>

        <div className="layout-sidebar">
          {/* Financial Status Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Sales Financial Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#FAFAF8', border: '1px solid #ECEAE5', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Confirmed Sales</span>
                <strong style={{ color: 'var(--success)' }}>₹{metrics.confirmedSalesValue.toFixed(2)}</strong>
              </div>
              <div style={{ padding: '12px', background: '#FAFAF8', border: '1px solid #ECEAE5', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Average Value</span>
                <strong>₹{metrics.averageChallanValue.toFixed(2)}</strong>
              </div>
              <div style={{ padding: '12px', background: '#FAFAF8', border: '1px solid #ECEAE5', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Transactions</span>
                <strong>{metrics.totalChallans}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Analytics Overview
          </h1>
          <div className="page-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time business performance metrics for {user.role.toLowerCase()} operations
          </div>
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
