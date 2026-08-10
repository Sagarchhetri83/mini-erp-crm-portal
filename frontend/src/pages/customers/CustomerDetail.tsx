import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  customerType: string;
  status: string;
  address: string | null;
  gstNumber: string | null;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Follow-up form
  const [followUpDate, setFollowUpDate] = useState('');
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data);
    } catch {
      setError('Customer not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!followUpDate && !note.trim()) return;

    setAddingNote(true);
    setNoteSuccess('');
    try {
      const res = await api.post(`/customers/${id}/followup`, {
        followUpDate: followUpDate || undefined,
        note: note.trim() || undefined,
      });
      setCustomer(res.data);
      setFollowUpDate('');
      setNote('');
      setNoteSuccess('Follow-up added successfully!');
      setTimeout(() => setNoteSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add follow-up.');
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusBadge = (status: string) => (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );

  const getTypeBadge = (type: string) => (
    <span className={`badge badge-${type.toLowerCase()}`}>{type}</span>
  );

  // Parse notes string into individual entries
  const parseNotes = (notesStr: string | null): { date: string; text: string }[] => {
    if (!notesStr) return [];
    return notesStr.split('\n').filter(Boolean).map((line) => {
      const match = line.match(/^\[(.+?)\]\s*(.*)$/);
      if (match) {
        return { date: match[1], text: match[2] };
      }
      return { date: '', text: line };
    });
  };

  if (loading) return <div className="spinner" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!customer) return null;

  const notes = parseNotes(customer.notes);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{customer.name}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/customers/${id}/edit`)}>
            ✏️ Edit
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/customers')}>
            ← Back
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Customer Info Card */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Customer Information</h3>

          <div className="detail-field">
            <div className="label">Name</div>
            <div className="value">{customer.name}</div>
          </div>
          <div className="detail-field">
            <div className="label">Mobile</div>
            <div className="value">{customer.mobile}</div>
          </div>
          {customer.email && (
            <div className="detail-field">
              <div className="label">Email</div>
              <div className="value">{customer.email}</div>
            </div>
          )}
          <div className="detail-field">
            <div className="label">Type</div>
            <div className="value">{getTypeBadge(customer.customerType)}</div>
          </div>
          <div className="detail-field">
            <div className="label">Status</div>
            <div className="value">{getStatusBadge(customer.status)}</div>
          </div>
          {customer.gstNumber && (
            <div className="detail-field">
              <div className="label">GST Number</div>
              <div className="value">{customer.gstNumber}</div>
            </div>
          )}
          {customer.address && (
            <div className="detail-field">
              <div className="label">Address</div>
              <div className="value">{customer.address}</div>
            </div>
          )}
          <div className="detail-field">
            <div className="label">Follow-up Date</div>
            <div className="value">
              {customer.followUpDate
                ? new Date(customer.followUpDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                : '—'}
            </div>
          </div>
          <div className="detail-field">
            <div className="label">Created</div>
            <div className="value" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {new Date(customer.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Notes & Follow-up Card */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Follow-up Notes</h3>

          {/* Add Note Form */}
          {noteSuccess && <div className="alert alert-success">{noteSuccess}</div>}

          <form onSubmit={handleAddFollowUp} style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">Next Follow-up Date</label>
              <input
                type="date"
                className="form-control"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Note</label>
              <textarea
                className="form-control"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a follow-up note..."
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={addingNote}>
              {addingNote ? 'Adding...' : '+ Add Follow-up'}
            </button>
          </form>

          {/* Notes History */}
          <div className="notes-section">
            {notes.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>No follow-up notes yet.</p>
              </div>
            ) : (
              notes.map((n, idx) => (
                <div key={idx} className="note-item">
                  {n.date && (
                    <div className="note-date">
                      {new Date(n.date).toLocaleString()}
                    </div>
                  )}
                  <div className="note-text">{n.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
