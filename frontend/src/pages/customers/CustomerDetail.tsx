import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit, Trash2, Calendar, FileText, Phone, Mail, MapPin, Building2, Hash } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string | null;
  address: string | null;
  gstNumber: string | null;
  customerType: string;
  status: string;
  notes: string | null;
  followUpDate: string | null;
  createdAt: string;
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick CRM update state (follow-up date + notes)
  const [followUpDate, setFollowUpDate] = useState('');
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      const d = res.data;
      setCustomer(d);
      setFollowUpDate(d.followUpDate ? d.followUpDate.split('T')[0] : '');
      setNote(d.notes || '');
    } catch {
      setError('Customer not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCRM = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    try {
      await api.put(`/customers/${id}`, {
        followUpDate: followUpDate || null,
        notes: note || null,
      });
      setActionSuccess('CRM details updated.');
      fetchCustomer();
    } catch {
      setActionError('Failed to update CRM details.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    try {
      await api.delete(`/customers/${id}`);
      navigate(`${rolePrefix}/customers`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete customer.');
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!customer) return null;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="page-header-text">
          <button className="btn-icon" onClick={() => navigate(`${rolePrefix}/customers`)} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-initial" style={{ width: '40px', height: '40px', fontSize: '16px', background: 'var(--primary)', color: 'white', border: 'none' }}>
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="page-title">{customer.name}</h1>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <span className={`badge badge-${customer.status.toLowerCase()}`}>{customer.status}</span>
                <span className="badge badge-secondary">{customer.customerType}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canEdit && (
            <>
              <button className="btn btn-secondary" onClick={() => navigate(`${rolePrefix}/customers/${customer.id}/edit`)}>
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

          {/* Contact Information */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
              Contact Information
            </h3>

            <div className="grid-responsive-2">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Phone size={14} style={{ color: 'var(--text-muted)', marginTop: '3px', flexShrink: 0 }} />
                <div className="detail-field">
                  <div className="label">Mobile Number</div>
                  <div className="value">{customer.mobile}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Mail size={14} style={{ color: 'var(--text-muted)', marginTop: '3px', flexShrink: 0 }} />
                <div className="detail-field">
                  <div className="label">Email Address</div>
                  <div className="value">{customer.email || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Building2 size={14} style={{ color: 'var(--text-muted)', marginTop: '3px', flexShrink: 0 }} />
                <div className="detail-field">
                  <div className="label">Business Name</div>
                  <div className="value">{customer.businessName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Hash size={14} style={{ color: 'var(--text-muted)', marginTop: '3px', flexShrink: 0 }} />
                <div className="detail-field">
                  <div className="label">GST Number</div>
                  <div className="value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                    {customer.gstNumber || <span style={{ color: 'var(--text-muted)', fontFamily: 'inherit' }}>—</span>}
                  </div>
                </div>
              </div>

              {customer.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', gridColumn: '1 / -1' }}>
                  <MapPin size={14} style={{ color: 'var(--text-muted)', marginTop: '3px', flexShrink: 0 }} />
                  <div className="detail-field">
                    <div className="label">Billing / Shipping Address</div>
                    <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{customer.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Classification */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
              Business Classification
            </h3>
            <div className="grid-responsive-3">
              <div className="detail-field">
                <div className="label">Customer Type</div>
                <div className="value"><span className="badge badge-secondary">{customer.customerType}</span></div>
              </div>
              <div className="detail-field">
                <div className="label">Status</div>
                <div className="value"><span className={`badge badge-${customer.status.toLowerCase()}`}>{customer.status}</span></div>
              </div>
              <div className="detail-field">
                <div className="label">Member Since</div>
                <div className="value">{new Date(customer.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: CRM Context */}
        <div className="layout-sidebar">
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} /> CRM Details
            </h3>

            {actionError && <div className="alert alert-error" style={{ padding: '8px', fontSize: '12px', marginBottom: '12px' }}>{actionError}</div>}
            {actionSuccess && <div className="alert alert-success" style={{ padding: '8px', fontSize: '12px', marginBottom: '12px' }}>{actionSuccess}</div>}

            <form onSubmit={handleUpdateCRM}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Follow-up Date</label>
                <input
                  type="date"
                  className="form-control"
                  style={{ height: '32px', fontSize: '13px' }}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Notes</label>
                <textarea
                  className="form-control"
                  rows={5}
                  style={{ fontSize: '13px', padding: '8px 10px' }}
                  placeholder="Add notes about interactions, requirements, or reminders..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              {canEdit && (
                <button type="submit" className="btn btn-secondary" style={{ width: '100%', height: '32px', fontSize: '13px' }}>
                  Save CRM Details
                </button>
              )}
            </form>
          </div>

          {/* Quick info card */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} /> Quick Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Follow-up</span>
                <span style={{ fontWeight: 500 }}>
                  {customer.followUpDate
                    ? new Date(customer.followUpDate).toLocaleDateString()
                    : <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>GST</span>
                <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '12px' }}>
                  {customer.gstNumber || <span style={{ color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: '13px' }}>Not provided</span>}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;

