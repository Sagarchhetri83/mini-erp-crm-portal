import React from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useDashboardStats } from './useDashboardStats';

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardStats();

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const { metrics, recentChallans, recentMovements } = data;

  // Chart Data Calculations (Real Data)
  const totalChallans = metrics.totalChallans || 1;
  const confirmedCount = metrics.statusDistribution?.CONFIRMED || 0;
  const draftCount = metrics.statusDistribution?.DRAFT || 0;
  const cancelledCount = metrics.statusDistribution?.CANCELLED || 0;

  const inStockCount = metrics.inStockCount || 0;
  const lowStockCount = metrics.lowStockCount || 0;
  const outOfStockCount = metrics.outOfStockCount || 0;
  const totalProductsCount = metrics.totalProducts || (inStockCount + lowStockCount + outOfStockCount) || 1;

  const inStockPct = Math.round((inStockCount / totalProductsCount) * 100);
  const lowStockPct = Math.round((lowStockCount / totalProductsCount) * 100);
  const outOfStockPct = Math.max(0, 100 - inStockPct - lowStockPct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Overview of your business operations and real-time ERP performance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ fontSize: '12px', height: '32px' }}>
            <TrendingUp size={14} /> Export Report
          </button>
          <Link to="/admin/challans/new" className="btn btn-primary" style={{ fontSize: '12px', height: '32px' }}>
            + New Challan
          </Link>
        </div>
      </div>

      {/* ROW 1: 4 COMPACT KPI CARDS */}
      <div className="kpi-strip">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Customers</span>
            <MoreHorizontal size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>
          <div className="kpi-value">{metrics.totalCustomers}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Products</span>
            <MoreHorizontal size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>
          <div className="kpi-value">{metrics.totalProducts}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Sales Challans</span>
            <MoreHorizontal size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>
          <div className="kpi-value">{metrics.totalChallans}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Low Stock</span>
            <MoreHorizontal size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>
          <div className="kpi-value" style={{ color: metrics.lowStockCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {metrics.lowStockCount}
          </div>
        </div>
      </div>

      {/* ROW 2: TWO LARGE ANALYTICS CARDS (Sales Overview + Inventory Distribution) */}
      <div className="grid-responsive-2" style={{ gap: '20px' }}>
        
        {/* Sales Overview Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Sales Overview</span>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
                Confirmed sales value: <strong style={{ color: 'var(--text-primary)' }}>₹{metrics.confirmedSalesValue.toFixed(2)}</strong>
              </div>
            </div>
            <select style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#FAFAF8', color: 'var(--text-secondary)', outline: 'none' }}>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>

          {/* SVG Area Chart */}
          <div style={{ width: '100%', height: '200px', marginTop: '10px' }}>
            <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="#ECEAE5" strokeDasharray="3 3" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="#ECEAE5" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="480" y2="130" stroke="#ECEAE5" strokeDasharray="3 3" />

              {/* Area Fill */}
              <polygon 
                points="40,130 110,100 180,115 250,70 320,85 390,45 460,30 460,140 40,140" 
                fill="url(#salesGrad)" 
              />
              
              {/* Line */}
              <polyline 
                points="40,130 110,100 180,115 250,70 320,85 390,45 460,30" 
                fill="none" 
                stroke="#4F46E5" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />

              {/* Data Points */}
              <circle cx="460" cy="30" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="390" cy="45" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="250" cy="70" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />

              {/* X Axis Labels */}
              <text x="40" y="160" fontSize="10" fill="#9A9892">Week 1</text>
              <text x="180" y="160" fontSize="10" fill="#9A9892">Week 2</text>
              <text x="320" y="160" fontSize="10" fill="#9A9892">Week 3</text>
              <text x="460" y="160" fontSize="10" fill="#9A9892">Week 4</text>
            </svg>
          </div>
        </div>

        {/* Inventory Stock Distribution Donut Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Inventory Distribution</span>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
                Total managed products: <strong style={{ color: 'var(--text-primary)' }}>{metrics.totalProducts}</strong>
              </div>
            </div>
            <MoreHorizontal size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '200px' }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ECEAE5" strokeWidth="3.8" />
                
                {/* In Stock Segment (Green) */}
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#16A34A" strokeWidth="3.8" strokeDasharray={`${inStockPct}, 100`} />
                
                {/* Low Stock Segment (Orange) */}
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#D97706" strokeWidth="3.8" strokeDasharray={`${lowStockPct}, 100`} strokeDashoffset={`-${inStockPct}`} />
                
                {/* Out of Stock Segment (Red) */}
                {outOfStockPct > 0 && (
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#DC2626" strokeWidth="3.8" strokeDasharray={`${outOfStockPct}, 100`} strokeDashoffset={`-${inStockPct + lowStockPct}`} />
                )}
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{inStockPct}%</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Healthy</span>
              </div>
            </div>

            {/* Compact Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>In Stock:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{inStockCount}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D97706' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Low Stock:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{lowStockCount}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#DC2626' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Out of Stock:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{outOfStockCount}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: TWO ANALYTICS CARDS (Product Stock Bar Summary + Sales Challan Trends) */}
      <div className="grid-responsive-2" style={{ gap: '20px' }}>
        
        {/* Product Stock Summary Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Product Stock Summary</span>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
                Real inventory levels by item
              </div>
            </div>
            <Link to="/admin/products" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View All</Link>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0 0 0' }}>
            {data.lowStockProducts && data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.slice(0, 6).map((p, idx) => {
                const heightPct = Math.min(100, Math.max(15, (p.stock / Math.max(1, p.minStock * 2)) * 100));
                const barColor = p.stock <= p.minStock ? '#D97706' : '#4F46E5';
                return (
                  <div key={p.id || idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{p.stock}</span>
                    <div style={{ width: '100%', height: `${heightPct}%`, background: barColor, borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }}></div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '60px' }}>
                      {p.sku || p.name}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ width: '100%', padding: '40px 0' }}>All products are well stocked.</div>
            )}
          </div>
        </div>

        {/* Sales Challan Trends */}
        <div className="card">
          <div className="card-header">
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Sales Challan Trends</span>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
                Status breakdown across total challans
              </div>
            </div>
            <MoreHorizontal size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Confirmed Challans</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{confirmedCount} ({Math.round((confirmedCount / totalChallans) * 100)}%)</span>
              </div>
              <div style={{ height: '8px', background: '#ECEAE5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(confirmedCount / totalChallans) * 100}%`, height: '100%', background: '#16A34A', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Draft Challans</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{draftCount} ({Math.round((draftCount / totalChallans) * 100)}%)</span>
              </div>
              <div style={{ height: '8px', background: '#ECEAE5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(draftCount / totalChallans) * 100}%`, height: '100%', background: '#D97706', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cancelled Challans</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cancelledCount} ({Math.round((cancelledCount / totalChallans) * 100)}%)</span>
              </div>
              <div style={{ height: '8px', background: '#ECEAE5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(cancelledCount / totalChallans) * 100}%`, height: '100%', background: '#DC2626', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: TWO OPERATIONAL CARDS (Recent Sales Challans + Recent Activity) */}
      <div className="grid-responsive-2" style={{ gap: '20px' }}>
        
        {/* Recent Sales Challans Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid #ECEAE5' }}>
            <span>Recent Sales Challans</span>
            <Link to="/admin/challans" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          
          {recentChallans.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>No sales challans recorded yet.</div>
          ) : (
            <>
              <div className="table-wrapper desktop-only" style={{ border: 'none', borderRadius: 0, margin: 0 }}>
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
                    {recentChallans.slice(0, 5).map((c) => (
                      <tr key={c.id}>
                        <td style={{ paddingLeft: '20px', fontWeight: 500 }}>
                          <Link to={`/admin/challans/${c.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{c.challanNo}</Link>
                        </td>
                        <td>{c.customer?.name}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 500, textAlign: 'right' }}>₹{c.totalAmount.toFixed(2)}</td>
                        <td style={{ paddingRight: '20px' }}>
                          <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-data-list mobile-only" style={{ padding: '16px' }}>
                {recentChallans.slice(0, 5).map((c) => (
                  <div className="mobile-data-card" key={c.id}>
                    <div className="mobile-data-card-header" style={{ marginBottom: '8px' }}>
                      <Link to={`/admin/challans/${c.id}`} className="mobile-data-card-title" style={{ fontFamily: 'monospace', textDecoration: 'none', color: 'var(--primary)' }}>
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

        {/* Recent Activity Timeline */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid #ECEAE5' }}>
            <span>Recent Activity</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stock & Order events</span>
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentMovements.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>No recent stock movements recorded.</div>
            ) : (
              recentMovements.slice(0, 5).map(m => (
                <div key={m.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '8px', height: '8px', borderRadius: '50%', 
                    background: m.type === 'IN' ? '#16A34A' : '#DC2626', 
                    marginTop: '5px', flexShrink: 0 
                  }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {m.product?.name || 'Product'} ({m.type})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Quantity {m.type === 'IN' ? '+' : '-'}{m.qty} &bull; {m.reason || 'Movement recorded'}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
