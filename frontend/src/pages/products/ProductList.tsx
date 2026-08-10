import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  category: string | null;
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      <div className="page-header">
        <h1 className="page-title">Products & Inventory</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            + Add Product
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-bar">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => {
                setLowStockFilter(e.target.checked);
                setPage(1);
              }}
            />
            Show Low Stock Only
          </label>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search or add a new product.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    {canEdit && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isLowStock = p.stock <= p.minStock;
                    return (
                      <tr key={p.id} className={isLowStock ? 'low-stock' : ''}>
                        <td>
                          <Link to={`/products/${p.id}`} style={{ fontWeight: 600 }}>
                            {p.name}
                          </Link>
                          {isLowStock && (
                            <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
                              ⚠️ Low Stock (Min: {p.minStock})
                            </div>
                          )}
                        </td>
                        <td>{p.sku}</td>
                        <td>{p.category || '—'}</td>
                        <td>₹{p.price.toFixed(2)}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: isLowStock ? '#b45309' : 'inherit' }}>
                            {p.stock}
                          </span>{' '}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.unit}</span>
                        </td>
                        {canEdit && (
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/products/${p.id}/edit`)}
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <span className="pagination-info">
                Showing {products.length} of {total} products
              </span>
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  ← Prev
                </button>
                <span style={{ padding: '8px 12px', fontSize: '0.875rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;
