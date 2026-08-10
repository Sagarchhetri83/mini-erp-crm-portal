import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { ArrowLeft, Save, Info } from 'lucide-react';

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
    price: '' as string | number,
    stock: 0,
    minStock: '' as string | number,
    unit: 'PCS',
    category: '',
    location: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(res => {
          const d = res.data;
          setFormData({
            name: d.name || '',
            sku: d.sku || '',
            description: d.description || '',
            price: d.price ?? '',
            stock: d.stock ?? 0,
            minStock: d.minStock ?? '',
            unit: d.unit || 'PCS',
            category: d.category || '',
            location: d.location || '',
          });
        })
        .catch(() => setError('Failed to load product details.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.toString().trim()) {
      errors.name = 'Product name is required.';
    }
    if (!formData.sku.toString().trim()) {
      errors.sku = 'SKU is required.';
    }
    const price = parseFloat(formData.price as string);
    if (isNaN(price) || price < 0) {
      errors.price = 'Price must be a non-negative number.';
    }
    const minStock = parseInt(formData.minStock as string);
    if (isNaN(minStock) || minStock < 0) {
      errors.minStock = 'Minimum stock must be 0 or greater.';
    }
    if (!isEdit) {
      const stock = parseInt(String(formData.stock));
      if (isNaN(stock) || stock < 0) {
        errors.stock = 'Initial stock must be 0 or greater.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setSaving(true);

    const payload: any = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description || null,
      price: parseFloat(formData.price as string),
      minStock: parseInt(formData.minStock as string),
      unit: formData.unit || 'PCS',
      category: formData.category || null,
      location: formData.location || null,
    };

    // Stock is only sent on create — backend ignores it on PUT
    if (!isEdit) {
      payload.stock = parseInt(String(formData.stock)) || 0;
    }

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate(`${rolePrefix}/products`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  const sectionLabel: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
    marginBottom: '16px',
  };

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

      <div className="card" style={{ maxWidth: '860px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Product Details ── */}
          <h3 style={sectionLabel}>Product Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Blue Denim Shirt"
              />
              {fieldErrors.name && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{fieldErrors.name}</div>}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">SKU / Product Code *</label>
              <input
                type="text"
                name="sku"
                className="form-control"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. SHIRT-BLUE-L"
                style={{ fontFamily: 'monospace' }}
              />
              {fieldErrors.sku && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{fieldErrors.sku}</div>}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <input
                type="text"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Apparel, Electronics"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Location / Warehouse</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Warehouse A, Shelf 3"
              />
            </div>

            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional product description"
              />
            </div>
          </div>

          {/* ── Pricing & Inventory ── */}
          <h3 style={sectionLabel}>Pricing & Inventory</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                className="form-control"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
              />
              {fieldErrors.price && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{fieldErrors.price}</div>}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Unit</label>
              <input
                type="text"
                name="unit"
                className="form-control"
                value={formData.unit}
                onChange={handleChange}
                placeholder="PCS, KG, BOX"
              />
            </div>

            {!isEdit ? (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Initial Stock *</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  className="form-control"
                  value={formData.stock}
                  onChange={handleChange}
                />
                {fieldErrors.stock && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{fieldErrors.stock}</div>}
              </div>
            ) : (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Current Stock</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.stock}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-app)' }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Info size={11} /> Use the Adjust Stock tool on the product detail page to change stock.
                </div>
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Minimum Stock Alert *</label>
              <input
                type="number"
                name="minStock"
                min="0"
                step="1"
                className="form-control"
                value={formData.minStock}
                onChange={handleChange}
                placeholder="0"
              />
              {fieldErrors.minStock && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{fieldErrors.minStock}</div>}
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Low stock alert triggers when current stock reaches this level.
              </div>
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
