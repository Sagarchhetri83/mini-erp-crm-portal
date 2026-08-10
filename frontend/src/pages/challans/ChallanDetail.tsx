import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  priceSnapshot: number;
  qty: number;
  lineTotal: number;
}

interface Challan {
  id: string;
  challanNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    mobile: string;
    address: string | null;
    gstNumber: string | null;
  };
  createdBy: {
    name: string;
  };
  items: ChallanItem[];
}

const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canConfirm = user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'WAREHOUSE';
  const canCancel = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    try {
      const res = await api.get(`/challans/${id}`);
      setChallan(res.data);
    } catch {
      setError('Challan not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to confirm this challan? This will permanently deduct stock and cannot be undone.')) return;
    
    setProcessing(true);
    setActionError('');
    try {
      const res = await api.post(`/challans/${id}/confirm`);
      setChallan(res.data);
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to confirm challan.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this draft challan?')) return;

    setProcessing(true);
    setActionError('');
    try {
      await api.delete(`/challans/${id}`);
      fetchChallan(); // refresh to get CANCELLED status
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to cancel challan.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!challan) return null;

  const isDraft = challan.status === 'DRAFT';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Challan {challan.challanNo}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/challans')}>
            ← Back
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            🖨️ Print
          </button>
        </div>
      </div>

      {actionError && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{actionError}</div>}

      <div className="detail-grid">
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Challan Info</h3>
          <div className="detail-field">
            <div className="label">Status</div>
            <div className="value">
              <span className={`badge badge-${challan.status === 'CONFIRMED' ? 'success' : challan.status === 'CANCELLED' ? 'error' : 'warning'}`}>
                {challan.status}
              </span>
            </div>
          </div>
          <div className="detail-field">
            <div className="label">Date</div>
            <div className="value">{new Date(challan.createdAt).toLocaleString()}</div>
          </div>
          <div className="detail-field">
            <div className="label">Created By</div>
            <div className="value">{challan.createdBy.name}</div>
          </div>
          <div className="detail-field">
            <div className="label">Total Amount</div>
            <div className="value" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
              ₹{challan.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Customer Info</h3>
          <div className="detail-field">
            <div className="label">Name</div>
            <div className="value" style={{ fontWeight: 600 }}>{challan.customer.name}</div>
          </div>
          <div className="detail-field">
            <div className="label">Mobile</div>
            <div className="value">{challan.customer.mobile}</div>
          </div>
          {challan.customer.gstNumber && (
            <div className="detail-field">
              <div className="label">GST Number</div>
              <div className="value">{challan.customer.gstNumber}</div>
            </div>
          )}
          {challan.customer.address && (
            <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
              <div className="label">Address</div>
              <div className="value">{challan.customer.address}</div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Items</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>₹{item.priceSnapshot.toFixed(2)}</td>
                  <td>{item.qty}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₹{item.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total:</td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem' }}>
                  ₹{challan.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Buttons for DRAFT status */}
      {isDraft && (
        <div className="card" style={{ marginTop: '24px', backgroundColor: '#f8fafc', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0' }}>Draft Actions</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Confirming this challan will permanently deduct stock from inventory.
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            {canCancel && (
              <button 
                className="btn btn-secondary" 
                style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                onClick={handleCancel}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Cancel Challan'}
              </button>
            )}
            {canConfirm && (
              <button 
                className="btn btn-primary" 
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm & Deduct Stock'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallanDetail;
