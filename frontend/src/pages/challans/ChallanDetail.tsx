import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Printer, FileText, User, Box, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';

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

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!challan) return null;

  const isDraft = challan.status === 'DRAFT';

  const getStatusBadge = (status: string) => {
    return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header" style={{ '@media print': { display: 'none' } } as any}>
        <div className="page-header-text">
          <button className="btn-icon" onClick={() => navigate(`${rolePrefix}/challans`)} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">{challan.challanNo}</h1>
            {getStatusBadge(challan.status)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {actionError && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{actionError}</div>}

      <div className="layout-2col">
        {/* Main Area: Document / Items */}
        <div className="layout-main">
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              <h3 style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box size={16} /> Order Items
              </h3>
            </div>
            
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, margin: 0, boxShadow: 'none' }}>
              <table style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-app)' }}>
                    <th>PRODUCT</th>
                    <th>PRICE</th>
                    <th>QTY</th>
                    <th style={{ textAlign: 'right' }}>LINE TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {challan.items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.productName}</td>
                      <td>₹{item.priceSnapshot.toFixed(2)}</td>
                      <td>{item.qty}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        ₹{item.lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, fontSize: '13px', background: 'var(--bg-app)' }}>Total Amount:</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '15px', color: 'var(--primary)', background: 'var(--bg-app)' }}>
                      ₹{challan.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons for DRAFT status */}
          {isDraft && (
            <div className="card" style={{ background: '#FEFBF4', border: '1px solid var(--warning-bg)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309' }}>
                  <AlertTriangle size={14} /> Action Required
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#92400E' }}>
                  Confirming this draft will permanently deduct stock from inventory.
                </p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                {canCancel && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    onClick={handleCancel}
                    disabled={processing}
                  >
                    <XCircle size={14} /> {processing ? 'Processing...' : 'Cancel'}
                  </button>
                )}
                {canConfirm && (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleConfirm}
                    disabled={processing}
                    style={{ background: 'var(--success)' }}
                  >
                    <CheckCircle size={14} /> {processing ? 'Processing...' : 'Confirm & Deduct Stock'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Customer & Challan Info */}
        <div className="layout-sidebar">
          
          <div className="card">
            <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> Customer Details
            </h3>
            
            <div className="detail-field">
              <div className="label">Customer Name</div>
              <div className="value" style={{ fontWeight: 500 }}>{challan.customer.name}</div>
            </div>
            <div className="detail-field">
              <div className="label">Mobile Number</div>
              <div className="value">{challan.customer.mobile}</div>
            </div>
            {challan.customer.gstNumber && (
              <div className="detail-field">
                <div className="label">GST Number</div>
                <div className="value">{challan.customer.gstNumber}</div>
              </div>
            )}
            {challan.customer.address && (
              <div className="detail-field">
                <div className="label">Billing Address</div>
                <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{challan.customer.address}</div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Challan Summary
            </h3>
            
            <div className="detail-field">
              <div className="label">Challan Number</div>
              <div className="value" style={{ fontFamily: 'monospace' }}>{challan.challanNo}</div>
            </div>
            <div className="detail-field">
              <div className="label">Date Created</div>
              <div className="value">{new Date(challan.createdAt).toLocaleString()}</div>
            </div>
            <div className="detail-field">
              <div className="label">Created By</div>
              <div className="value">{challan.createdBy.name}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChallanDetail;
