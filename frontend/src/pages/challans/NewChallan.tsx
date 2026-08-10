import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { ArrowLeft, PlusCircle, Trash2, User, Package, Save } from 'lucide-react';

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

  const { user } = useAuth();
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ChallanItemInput[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all active customers and products for the dropdowns
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
    }

    setSaving(true);
    try {
      const res = await api.post('/challans', {
        customerId,
        items
      });
      navigate(`${rolePrefix}/challans/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create challan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  const selectedCustomer = customers.find(c => c.id === customerId);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="page-header-text">
          <button className="btn-icon" onClick={() => navigate(`${rolePrefix}/challans`)} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} />
          </button>
          <h1 className="page-title">New Sales Challan</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="layout-2col">
        {/* Main Form - 70% */}
        <div className="layout-main">
          
          <div className="card">
            <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> Customer Details
            </h3>
            
            <div className="form-group" style={{ maxWidth: '400px', margin: 0 }}>
              <select
                className="form-control"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choose a Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} /> Order Items
              </h3>
            </div>

            {items.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <p>No items added yet.</p>
                <button type="button" className="btn btn-secondary" onClick={handleAddItem} style={{ marginTop: '12px' }}>
                  <PlusCircle size={14} /> Add First Item
                </button>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Product</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Price</th>
                      <th style={{ width: '15%' }}>Quantity</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Line Total</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Action</th>
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
                              <option value="">- Select Product -</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.sku} — {p.name}
                                </option>
                              ))}
                            </select>
                            {prod && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{prod.stock} in stock</div>}
                          </td>
                          <td style={{ textAlign: 'right' }}>₹{price.toFixed(2)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                value={item.qty}
                                onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)}
                                style={{ width: '80px', textAlign: 'right' }}
                                required
                              />
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{unit}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 500, textAlign: 'right' }}>₹{lineTotal.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => handleRemoveItem(index)}
                              title="Remove Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleAddItem}>
                    <PlusCircle size={14} /> Add Item
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Sidebar - 30% Sticky */}
        <div className="layout-sidebar" style={{ position: 'sticky', top: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>{selectedCustomer ? selectedCustomer.name : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Items</span>
                <span style={{ fontWeight: 500 }}>{items.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontWeight: 600 }}>Total Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving || items.length === 0} style={{ width: '100%', marginBottom: '12px' }}>
              <Save size={14} /> {saving ? 'Creating...' : 'Create Draft Challan'}
            </button>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Stock will not be deducted until confirmed.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewChallan;
