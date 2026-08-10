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
  product?: {
    sku: string;
  };
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
    email: string | null;
    businessName: string | null;
    customerType: string | null;
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
      // Assuming the backend doesn't currently return product sku for challan items,
      // the interface supports it gracefully if added.
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

  const formattedDate = new Date(challan.createdAt).toLocaleDateString('en-GB'); // DD/MM/YYYY
  const formattedDateTime = new Date(challan.createdAt).toLocaleString('en-GB');

  return (
    <div>
      {/* =========================================
          SCREEN UI (Hidden on Print)
          ========================================= */}
      <div className="hide-on-print">
        <div className="page-header">
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
              {challan.customer.email && (
                <div className="detail-field">
                  <div className="label">Email Address</div>
                  <div className="value">{challan.customer.email}</div>
                </div>
              )}
              {challan.customer.businessName && (
                <div className="detail-field">
                  <div className="label">Business Name</div>
                  <div className="value">{challan.customer.businessName}</div>
                </div>
              )}
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
                <div className="value">{formattedDateTime}</div>
              </div>
              <div className="detail-field">
                <div className="label">Created By</div>
                <div className="value">{challan.createdBy.name}</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================
          PRINT UI (Hidden on Screen)
          ========================================= */}
      <div className="print-only" style={{ width: '100%', fontFamily: 'Inter, sans-serif' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E5E7EB', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <div className="print-document-title" style={{ marginBottom: '4px' }}>MiniERP</div>
            <div className="print-body print-muted">Sales & Operations</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="print-document-title" style={{ color: 'var(--primary)', marginBottom: '12px' }}>SALES CHALLAN</div>
            
            <table style={{ marginLeft: 'auto', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="print-body print-muted" style={{ padding: '2px 16px 2px 0', textAlign: 'right' }}>Challan No:</td>
                  <td className="print-body print-font-mono" style={{ fontWeight: 600 }}>{challan.challanNo}</td>
                </tr>
                <tr>
                  <td className="print-body print-muted" style={{ padding: '2px 16px 2px 0', textAlign: 'right' }}>Date:</td>
                  <td className="print-body">{formattedDate}</td>
                </tr>
                <tr>
                  <td className="print-body print-muted" style={{ padding: '2px 16px 2px 0', textAlign: 'right' }}>Status:</td>
                  <td className="print-body" style={{ fontWeight: 600 }}>{challan.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Section */}
        <div style={{ marginBottom: '40px' }}>
          <div className="print-section-heading" style={{ marginBottom: '12px', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px', width: '300px' }}>
            BILL TO / CUSTOMER
          </div>
          <table style={{ borderCollapse: 'collapse', width: '300px' }}>
            <tbody>
              <tr>
                <td className="print-body print-muted" style={{ padding: '4px 0', width: '120px' }}>Customer Name</td>
                <td className="print-body" style={{ fontWeight: 600 }}>{challan.customer.name}</td>
              </tr>
              {challan.customer.businessName && (
                <tr>
                  <td className="print-body print-muted" style={{ padding: '4px 0' }}>Business Name</td>
                  <td className="print-body">{challan.customer.businessName}</td>
                </tr>
              )}
              <tr>
                <td className="print-body print-muted" style={{ padding: '4px 0' }}>Mobile</td>
                <td className="print-body">{challan.customer.mobile}</td>
              </tr>
              {challan.customer.email && (
                <tr>
                  <td className="print-body print-muted" style={{ padding: '4px 0' }}>Email</td>
                  <td className="print-body">{challan.customer.email}</td>
                </tr>
              )}
              {challan.customer.gstNumber && (
                <tr>
                  <td className="print-body print-muted" style={{ padding: '4px 0' }}>GST Number</td>
                  <td className="print-body print-font-mono">{challan.customer.gstNumber}</td>
                </tr>
              )}
              <tr>
                <td className="print-body print-muted" style={{ padding: '4px 0', verticalAlign: 'top' }}>Billing Address</td>
                <td className="print-body" style={{ whiteSpace: 'pre-wrap' }}>{challan.customer.address || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: '32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E5E7EB' }}>
            <thead>
              <tr>
                <th className="print-section-heading" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '10px 12px', textAlign: 'left' }}>DESCRIPTION / PRODUCT</th>
                <th className="print-section-heading" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '10px 12px', textAlign: 'center' }}>QTY</th>
                <th className="print-section-heading" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '10px 12px', textAlign: 'right' }}>UNIT PRICE</th>
                <th className="print-section-heading" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '10px 12px', textAlign: 'right' }}>LINE TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: index === challan.items.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                  <td className="print-body" style={{ padding: '12px', fontWeight: 500 }}>
                    {item.productName}
                    {item.product?.sku && <div className="print-font-mono print-muted" style={{ fontSize: '9px', marginTop: '2px' }}>{item.product.sku}</div>}
                  </td>
                  <td className="print-body" style={{ padding: '12px', textAlign: 'center' }}>{item.qty}</td>
                  <td className="print-body" style={{ padding: '12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>₹{item.priceSnapshot.toFixed(2)}</td>
                  <td className="print-body" style={{ padding: '12px', textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>₹{item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          
          {/* Challan Meta */}
          <div style={{ width: '300px' }}>
            <div className="print-section-heading" style={{ marginBottom: '8px', color: '#6B7280' }}>CHALLAN META</div>
            <table style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="print-body print-muted" style={{ padding: '2px 16px 2px 0' }}>Created</td>
                  <td className="print-body">{formattedDateTime}</td>
                </tr>
                <tr>
                  <td className="print-body print-muted" style={{ padding: '2px 16px 2px 0' }}>Created By</td>
                  <td className="print-body">{challan.createdBy.name}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ width: '250px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="print-body" style={{ padding: '8px 12px', borderBottom: '1px solid #E5E7EB' }}>Subtotal</td>
                  <td className="print-body" style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB', fontVariantNumeric: 'tabular-nums' }}>
                    ₹{challan.totalAmount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="print-section-heading" style={{ padding: '12px', color: '#111827 !important' }}>TOTAL AMOUNT</td>
                  <td className="print-body" style={{ padding: '12px', textAlign: 'right', fontSize: '16px !important', fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                    ₹{challan.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', textAlign: 'center' }}>
          <div className="print-body print-muted" style={{ fontSize: '10px !important' }}>Generated by MiniERP</div>
        </div>

      </div>
    </div>
  );
};

export default ChallanDetail;
