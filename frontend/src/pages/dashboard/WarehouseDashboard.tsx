import React from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, Box, PlusCircle } from 'lucide-react';
import { useDashboardStats } from './useDashboardStats';

const WarehouseDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardStats();

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse Dashboard</h1>
          <div className="page-subtitle">Inventory levels and warehouse activity</div>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Products</span>
            <Package size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{data.metrics.totalProducts}</div>
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

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Out of Stock</span>
            <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>
            {data.lowStockProducts.filter(p => p.stock === 0).length}
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Stock Items</span>
            <Box size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">—</div> {/* Real metric would go here if backend summed stock natively */}
        </div>
      </div>

      <div className="layout-2col">
        <div className="layout-main">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              Low Stock Products
              <Link to="/warehouse/products" style={{ fontSize: '12px', fontWeight: 500 }}>Manage Inventory</Link>
            </div>
            
            {data.lowStockProducts.length === 0 ? (
              <div className="empty-state">All products are sufficiently stocked.</div>
            ) : (
              <>
                <div className="table-wrapper desktop-only" style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                  <table style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-app)' }}>
                        <th>PRODUCT / SKU</th>
                        <th>CURRENT STOCK</th>
                        <th>MIN ALERT</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStockProducts.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 500 }}>
                            <Link to={`/warehouse/products/${p.id}`}>{p.name} ({p.sku})</Link>
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.stock}</td>
                          <td>{p.minStock}</td>
                          <td>
                            <span className={`badge ${p.stock === 0 ? 'badge-error' : 'badge-warning'}`}>
                              {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-data-list mobile-only" style={{ padding: '16px' }}>
                  {data.lowStockProducts.map((p) => (
                    <div className="mobile-data-card" key={p.id}>
                      <div className="mobile-data-card-header" style={{ marginBottom: '8px' }}>
                        <div>
                          <Link to={`/warehouse/products/${p.id}`} className="mobile-data-card-title" style={{ display: 'block', textDecoration: 'none' }}>
                            {p.name}
                          </Link>
                          <div className="mobile-data-card-subtitle" style={{ fontFamily: 'monospace' }}>{p.sku}</div>
                        </div>
                        <span className={`badge ${p.stock === 0 ? 'badge-error' : 'badge-warning'}`}>
                          {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </div>
                      <div className="mobile-data-card-grid" style={{ marginTop: '0' }}>
                        <div>
                          <div className="mobile-data-card-label">Current Stock</div>
                          <div className="mobile-data-card-value" style={{ fontWeight: 600 }}>{p.stock}</div>
                        </div>
                        <div>
                          <div className="mobile-data-card-label">Min Alert</div>
                          <div className="mobile-data-card-value">{p.minStock}</div>
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
              <Link to="/warehouse/products/new" className="sidebar-nav" style={{ padding: '8px', display: 'flex', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none', alignItems: 'center' }}>
                <PlusCircle size={14} style={{ color: 'var(--primary)' }}/> Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
