import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Search, PlusCircle, MoreVertical, ChevronLeft, ChevronRight, Box } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  category: string | null;
  location: string | null;
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';
  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (lowStockFilter) params.append('lowStock', 'true');

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, lowStockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Products & Inventory</h1>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => navigate(`${rolePrefix}/products/new`)}>
            <PlusCircle size={14} /> Add Product
          </button>
        )}
      </div>

      <div className="toolbar" style={{ marginBottom: '12px' }}>
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', padding: '0 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', height: '36px' }}>
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => {
              setLowStockFilter(e.target.checked);
              setPage(1);
            }}
          />
          Low Stock Only
        </label>
        {search && (
          <button 
            className="btn btn-secondary" 
            onClick={() => { setSearch(''); }}
            style={{ fontSize: '13px' }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="card" style={{ padding: '40px' }}>
          <div className="empty-state">
            <p>No products found. Adjust your search or add a new product.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>CATEGORY</th>
                <th style={{ textAlign: 'right' }}>PRICE</th>
                <th style={{ textAlign: 'right' }}>CURRENT STOCK</th>
                <th style={{ textAlign: 'right' }}>MIN STOCK</th>
                <th>STATUS</th>
                <th>LOCATION</th>
                <th style={{ textAlign: 'right', width: '60px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLowStock = p.stock <= p.minStock && p.stock > 0;
                const isOutOfStock = p.stock === 0;
                let statusClass = 'status-in-stock';
                let statusText = 'In Stock';

                if (isOutOfStock) {
                  statusClass = 'status-out-of-stock';
                  statusText = 'Out of Stock';
                } else if (isLowStock) {
                  statusClass = 'status-low-stock';
                  statusText = 'Low Stock';
                }

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="table-avatar-cell">
                        <div className="avatar-initial" style={{ background: 'transparent' }}>
                          <Box size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div>
                          <Link to={`${rolePrefix}/products/${p.id}`} className="cell-title">
                            {p.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{p.sku}</td>
                    <td>{p.category || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{p.price.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {p.stock} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.unit}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {p.minStock} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.unit}</span>
                    </td>
                    <td>
                      <div className={`status-dot ${statusClass}`}>
                        {statusText}
                      </div>
                    </td>
                    <td>{p.location || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          title="View Details"
                          onClick={() => navigate(`${rolePrefix}/products/${p.id}`)}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination-wrapper">
            <span className="pagination-info">
              Showing {products.length} of {total} products
            </span>
            <div className="pagination-controls">
              <button className="btn btn-secondary btn-icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={14} />
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-secondary btn-icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
