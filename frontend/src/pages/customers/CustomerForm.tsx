import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    customerType: 'RETAIL',
    status: 'LEAD',
    address: '',
    gstNumber: '',
    followUpDate: '',
    notes: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      api.get(`/customers/${id}`)
        .then((res) => {
          const c = res.data;
          setForm({
            name: c.name || '',
            mobile: c.mobile || '',
            email: c.email || '',
            customerType: c.customerType || 'RETAIL',
            status: c.status || 'LEAD',
            address: c.address || '',
            gstNumber: c.gstNumber || '',
            followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : '',
            notes: c.notes || '',
          });
        })
        .catch(() => setError('Failed to load customer.'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.mobile.trim()) {
      setError('Name and Mobile are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        email: form.email || null,
        address: form.address || null,
        gstNumber: form.gstNumber || null,
        followUpDate: form.followUpDate || null,
        notes: form.notes || null,
      };

      if (isEdit) {
        await api.put(`/customers/${id}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save customer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Customer' : 'New Customer'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/customers')}>
          ← Back to List
        </button>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                placeholder="Customer name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile *</label>
              <input
                name="mobile"
                className="form-control"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input
                name="gstNumber"
                className="form-control"
                value={form.gstNumber}
                onChange={handleChange}
                placeholder="GSTIN"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Type *</label>
              <select name="customerType" className="form-control" value={form.customerType} onChange={handleChange}>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input
                name="followUpDate"
                type="date"
                className="form-control"
                value={form.followUpDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-control"
              value={form.address}
              onChange={handleChange}
              placeholder="Full address"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-control"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any notes about this customer..."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/customers')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
