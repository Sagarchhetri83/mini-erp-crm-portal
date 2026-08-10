import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface Customer {
  id: string;
  name: string;
  mobile: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  unit: string;
}

interface ChallanItemInput {
  productId: string;
  qty: number;
}

const NewChallan: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ChallanItemInput[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all active customers and products for the dropdowns
    // In a real large app, this would use autocomplete/search instead of loading all
    Promise.all([
      api.get('/customers?limit=1000&status=ACTIVE'),
      api.get('/products?limit=1000')
    ]).then(([custRes, prodRes]) => {
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
    }).catch(() => {
      setError('Failed to load customers or products.');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: '', qty: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof ChallanItemInput, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    let total = 0;
    items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        total += prod.price * item.qty;
      }
    });
    return total;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one item to the challan.');
      return;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) {
        setError(`Please select a product for item #${i + 1}`);
        return;
      }
      if (item.qty <= 0) {
        setError(`Quantity must be greater than 0 for item #${i + 1}`);
        return;
      }
      // Note: We don't block Draft creation on stock levels, stock is checked on Confirm.
    }

    setSaving(true);
    try {
      const res = await api.post('/challans', {
        customerId,
        items
      });
      navigate(`/challans/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create challan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">New Sales Challan</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/challans')}>
          Cancel
        </button>
      </div>

      <div className="card" style={{ maxWidth: '900px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ maxWidth: '400px' }}>
            <label className="form-label">Customer *</label>
            <select
              className="form-control"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '32px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Items</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
              + Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              <p>No items added yet.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleAddItem} style={{ marginTop: '8px' }}>
                Add First Item
              </button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ overflow: 'visible' }}>
              <table style={{ minWidth: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Product</th>
                    <th style={{ width: '15%' }}>Price</th>
                    <th style={{ width: '15%' }}>Qty</th>
                    <th style={{ width: '20%' }}>Line Total</th>
                    <th style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const prod = products.find(p => p.id === item.productId);
                    const price = prod ? prod.price : 0;
                    const lineTotal = price * item.qty;
                    const unit = prod ? prod.unit : '';

                    return (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-control"
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            required
                          >
                            <option value="">- Select -</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.sku} — {p.name} (Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>₹{price.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              min="1"
                              className="form-control"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)}
                              required
                            />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{unit}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>₹{lineTotal.toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--error)' }}
                            onClick={() => handleRemoveItem(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, fontSize: '1.1rem' }}>Total Amount:</td>
                    <td colSpan={2} style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
                      ₹{calculateTotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving || items.length === 0}>
              {saving ? 'Creating...' : 'Create Draft Challan'}
            </button>
            <span style={{ marginLeft: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Stock will not be deducted until the challan is confirmed.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChallan;
