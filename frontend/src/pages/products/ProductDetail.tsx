import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  location: string | null;
  description: string | null;
}

interface StockMovement {
  id: string;
  type: 'IN' | 'OUT';
  qty: number;
  reason: string;
  createdAt: string;
  createdBy: {
    name: string;
    role: string;
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';
  // Sales role shouldn't see stock adjust button
  const canAdjustStock = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Adjust Stock Form
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [prodRes, movRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/movements`)
      ]);
      setProduct(prodRes.data);
      setMovements(movRes.data);
    } catch {
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e: FormEvent) => {
    e.preventDefault();
    setAdjustError('');
    
    if (!adjustQty || parseInt(adjustQty) <= 0 || !adjustReason.trim()) {
      setAdjustError('Please provide a valid quantity and reason.');
      return;
    }

    setAdjusting(true);
    try {
      const res = await api.post(`/products/${id}/adjust-stock`, {
        type: adjustType,
        qty: parseInt(adjustQty),
        reason: adjustReason.trim(),
      });
      
      // Update local state
      setProduct(res.data);
      // Fetch fresh movements
      const movRes = await api.get(`/products/${id}/movements`);
      setMovements(movRes.data);
      
      // Reset form
      setAdjustQty('');
      setAdjustReason('');
    } catch (err: any) {
      setAdjustError(err.response?.data?.error || 'Failed to adjust stock.');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!product) return null;

  const isLowStock = product.stock <= product.minStock;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{product.name}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canEdit && (
            <button className="btn btn-secondary" onClick={() => navigate(`/products/${id}/edit`)}>
              ✏️ Edit
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/products')}>
            ← Back
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Product Info Card */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Product Information</h3>

          <div className="detail-field">
            <div className="label">SKU / Code</div>
            <div className="value" style={{ fontFamily: 'monospace' }}>{product.sku}</div>
          </div>
          <div className="detail-field">
            <div className="label">Current Stock</div>
            <div className="value" style={{ fontSize: '1.25rem', fontWeight: 700, color: isLowStock ? '#b45309' : 'var(--success)' }}>
              {product.stock} {product.unit}
              {isLowStock && <span style={{ fontSize: '0.875rem', marginLeft: '8px' }}>⚠️ Low Stock</span>}
            </div>
          </div>
          <div className="detail-field">
            <div className="label">Min Stock Level</div>
            <div className="value">{product.minStock}</div>
          </div>
          <div className="detail-field">
            <div className="label">Price</div>
            <div className="value">₹{product.price.toFixed(2)}</div>
          </div>
          <div className="detail-field">
            <div className="label">Category</div>
            <div className="value">{product.category || '—'}</div>
          </div>
          <div className="detail-field">
            <div className="label">Location</div>
            <div className="value">{product.location || '—'}</div>
          </div>
          {product.description && (
            <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
              <div className="label">Description</div>
              <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{product.description}</div>
            </div>
          )}
        </div>

        {/* Stock Management Card */}
        <div>
          {canAdjustStock && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Adjust Stock</h3>
              {adjustError && <div className="alert alert-error">{adjustError}</div>}
              
              <form onSubmit={handleAdjustStock}>
                <div className="form-row">
                  <div className="form-group" style={{ flex: '1' }}>
                    <label className="form-label">Type</label>
                    <select 
                      className="form-control" 
                      value={adjustType} 
                      onChange={(e) => setAdjustType(e.target.value as 'IN' | 'OUT')}
                    >
                      <option value="IN">IN (+)</option>
                      <option value="OUT">OUT (-)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: '2' }}>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(e.target.value)}
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <input
                    type="text"
                    className="form-control"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g., Restock from supplier, Damaged goods"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={adjusting}>
                  {adjusting ? 'Processing...' : 'Record Adjustment'}
                </button>
              </form>
            </div>
          )}

          {/* Movements History */}
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Stock Movements</h3>
            {movements.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>No stock movements recorded yet.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {movements.map((m) => (
                  <div key={m.id} style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge badge-${m.type.toLowerCase()}`}>
                        {m.type} {m.qty}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.reason}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      By: {m.createdBy.name} ({m.createdBy.role})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
