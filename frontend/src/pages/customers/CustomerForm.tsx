import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { ArrowLeft, Save } from 'lucide-react';

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    businessName: '',
    email: '',
    gstNumber: '',
    customerType: 'RETAIL',
    status: 'LEAD',
    followUpDate: '',
    notes: '',
    address: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/customers/${id}`)
        .then(res => {
          const d = res.data;
          setFormData({
            name: d.name || '',
            mobile: d.mobile || '',
            businessName: d.businessName || '',
            email: d.email || '',
            gstNumber: d.gstNumber || '',
            customerType: d.customerType || 'RETAIL',
            status: d.status || 'LEAD',
            followUpDate: d.followUpDate ? d.followUpDate.split('T')[0] : '',
            notes: d.notes || '',
            address: d.address || '',
          });
        })
        .catch(() => setError('Failed to load customer details.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...formData,
      followUpDate: formData.followUpDate || null,
      businessName: formData.businessName || null,
      email: formData.email || null,
      gstNumber: formData.gstNumber || null,
      notes: formData.notes || null,
      address: formData.address || null,
    };

    try {
      if (isEdit) {
        await api.put(`/customers/${id}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      navigate(`${rolePrefix}/customers`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save customer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="page-header-text">
          <button className="btn-icon" onClick={() => navigate(`${rolePrefix}/customers`)} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} />
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '860px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Customer Information ── */}
          <h3 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
            Customer Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                name="mobile"
                className="form-control"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Business Name</label>
              <input
                type="text"
                name="businessName"
                className="form-control"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Company or trade name"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">GST Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                name="gstNumber"
                className="form-control"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="e.g. 22AAAAA0000A1Z5"
              />
            </div>
          </div>

          {/* ── CRM Information ── */}
          <h3 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
            CRM Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Customer Type</label>
              <select
                name="customerType"
                className="form-control"
                value={formData.customerType}
                onChange={handleChange}
              >
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Follow-up Date</label>
              <input
                type="date"
                name="followUpDate"
                className="form-control"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                className="form-control"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Interaction notes, requirements, or reminders..."
              />
            </div>
          </div>

          {/* ── Address ── */}
          <h3 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
            Address
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Billing / Shipping Address</label>
              <textarea
                name="address"
                className="form-control"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, City, State, PIN"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Customer'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`${rolePrefix}/customers`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
