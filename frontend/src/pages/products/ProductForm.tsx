import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { ArrowLeft, Save } from 'lucide-react';

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    stock: 0,
    minStock: 0,
    unit: 'pcs',
    category: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(res => setFormData(res.data))
        .catch(() => setError('Failed to load product details'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number = value;
    
    if (type === 'number') {
      finalValue = parseFloat(value) || 0;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate(`${rolePrefix}/products`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="page-header-text">
          <button className="btn-icon" onClick={() => navigate(`${rolePrefix}/products`)} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} />
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
            Basic Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">SKU *</label>
              <input
                type="text"
                name="sku"
                className="form-control"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <input
                type="text"
                name="category"
                className="form-control"
                value={formData.category || ''}
                onChange={handleChange}
                placeholder="e.g. Electronics, Clothing"
              />
            </div>
            
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={3}
                value={formData.description || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
            Pricing & Inventory
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                className="form-control"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Unit</label>
              <input
                type="text"
                name="unit"
                className="form-control"
                value={formData.unit}
                onChange={handleChange}
                placeholder="pcs, kg, box"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Current Stock *</label>
              <input
                type="number"
                name="stock"
                min="0"
                className="form-control"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Minimum Stock Alert *</label>
              <input
                type="number"
                name="minStock"
                min="0"
                className="form-control"
                value={formData.minStock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`${rolePrefix}/products`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
