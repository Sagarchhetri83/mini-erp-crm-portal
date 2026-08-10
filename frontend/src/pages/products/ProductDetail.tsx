import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit, Trash2, Box, Info, Hash, Settings2, PackagePlus, FileText } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  category: string | null;
  createdAt: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';
  
  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stock update state
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'SET'>('ADD');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch {
      setError('Product not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    
    if (!stockAdjustment) return;

    let newStock = product!.stock;
    const adjustVal = parseInt(stockAdjustment, 10);
    
    if (adjustmentType === 'ADD') {
      newStock += adjustVal;
    } else {
      newStock = adjustVal;
    }

    if (newStock < 0) {
      setActionError('Stock cannot be negative.');
      return;
    }

    try {
      await api.put(`/products/${id}`, { stock: newStock });
      setActionSuccess(`Stock updated successfully.`);
      setStockAdjustment('');
      fetchProduct();
    } catch (err: any) {
      setActionError('Failed to update stock.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      navigate(`${rolePrefix}/products`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product.');
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!product) return null;

  const isLowStock = product.stock <= product.minStock;
  const isOutOfStock = product.stock === 0;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="page-header-text">
          <button className="btn-icon" onClick={() => navigate(`${rolePrefix}/products`)} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-initial" style={{ width: '40px', height: '40px', background: 'transparent' }}>
              <Box size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
              <h1 className="page-title">{product.name}</h1>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-secondary">{product.sku}</span>
                {isOutOfStock ? (
                  <span className="badge badge-error">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="badge badge-warning">Low Stock</span>
                ) : (
                  <span className="badge badge-success">In Stock</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canEdit && (
            <>
              <button className="btn btn-secondary" onClick={() => navigate(`${rolePrefix}/products/${product.id}/edit`)}>
                <Edit size={14} /> Edit
              </button>
              {user?.role === 'ADMIN' && (
                <button className="btn btn-secondary" onClick={handleDelete} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="layout-2col">
        {/* Main Details */}
        <div className="layout-main">
          
          <div className="card">
            <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} /> Product Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Hash size={16} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                <div className="detail-field">
                  <div className="label">SKU</div>
                  <div className="value" style={{ fontFamily: 'monospace' }}>{product.sku}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Settings2 size={16} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                <div className="detail-field">
                  <div className="label">Category</div>
                  <div className="value">{product.category || '—'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '16px' }} /> {/* Spacer */}
                <div className="detail-field">
                  <div className="label">Price</div>
                  <div className="value" style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{product.price.toFixed(2)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', gridColumn: '1 / -1' }}>
                <FileText size={16} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                <div className="detail-field">
                  <div className="label">Description</div>
                  <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{product.description || 'No description available.'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Inventory Management */}
        <div className="layout-sidebar">
          
          <div className="card">
            <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box size={16} /> Inventory Levels
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Current Stock</span>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{product.stock} {product.unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Minimum Alert</span>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{product.minStock} {product.unit}</span>
            </div>

            {canEdit && (
              <>
                <h4 style={{ fontSize: '13px', marginTop: '16px', marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PackagePlus size={14} /> Adjust Stock
                </h4>
                
                {actionError && <div className="alert alert-error" style={{ padding: '8px', fontSize: '12px', marginBottom: '12px' }}>{actionError}</div>}
                {actionSuccess && <div className="alert alert-success" style={{ padding: '8px', fontSize: '12px', marginBottom: '12px' }}>{actionSuccess}</div>}

                <form onSubmit={handleUpdateStock}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <select
                      className="form-control"
                      style={{ height: '32px', fontSize: '13px', width: '90px', padding: '0 8px' }}
                      value={adjustmentType}
                      onChange={(e) => setAdjustmentType(e.target.value as 'ADD' | 'SET')}
                    >
                      <option value="ADD">Add (+/-)</option>
                      <option value="SET">Set (=)</option>
                    </select>
                    <input
                      type="number"
                      className="form-control"
                      style={{ height: '32px', fontSize: '13px' }}
                      placeholder="Qty"
                      value={stockAdjustment}
                      onChange={(e) => setStockAdjustment(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary" style={{ width: '100%', height: '32px', fontSize: '13px' }}>
                    Update Stock
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
