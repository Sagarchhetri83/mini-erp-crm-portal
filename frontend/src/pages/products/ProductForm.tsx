import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    unit: 'PCS',
    stock: '0', // Initial stock only on create
    minStock: '0',
    category: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then((res) => {
          const p = res.data;
          setForm({
            name: p.name || '',
            sku: p.sku || '',
            price: p.price?.toString() || '',
            unit: p.unit || 'PCS',
            stock: p.stock?.toString() || '0', // Ignored on update
            minStock: p.minStock?.toString() || '0',
            category: p.category || '',
            location: p.location || '',
            description: p.description || '',
          });
        })
        .catch(() => setError('Failed to load product.'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.sku.trim() || !form.price.trim()) {
      setError('Name, SKU, and Price are required.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        unit: form.unit,
        minStock: parseInt(form.minStock) || 0,
        category: form.category || null,
        location: form.location || null,
        description: form.description || null,
      };

      if (isEdit) {
        // Stock cannot be updated via PUT, handled via adjust-stock endpoint
        await api.put(`/products/${id}`, payload);
      } else {
        payload.stock = parseInt(form.stock) || 0;
        await api.post('/products', payload);
      }
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/products')}>
          ← Back to List
        </button>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                placeholder="Item name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">SKU / Code *</label>
              <input
                name="sku"
                className="form-control"
                value={form.sku}
                onChange={handleChange}
                placeholder="Unique code"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                name="unit"
                className="form-control"
                value={form.unit}
                onChange={handleChange}
                placeholder="e.g., PCS, KG, BOX"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Initial Stock</label>
              <input
                name="stock"
                type="number"
                min="0"
                className="form-control"
                value={form.stock}
                onChange={handleChange}
                style={{ maxWidth: '240px' }}
              />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Stock can only be modified later via adjustments.
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Min Stock Alert Level</label>
              <input
                name="minStock"
                type="number"
                min="0"
                className="form-control"
                value={form.minStock}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                name="category"
                className="form-control"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g., Electronics, Hardware"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Warehouse Bin</label>
            <input
              name="location"
              className="form-control"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., A1-Shelf-2"
              style={{ maxWidth: '300px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
