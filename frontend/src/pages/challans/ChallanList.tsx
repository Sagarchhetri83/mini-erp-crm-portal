import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Challan {
  id: string;
  challanNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customer: {
    name: string;
    mobile: string;
  };
  createdBy: {
    name: string;
  };
}

const ChallanList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/challans?${params.toString()}`);
      setChallans(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch challans:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getStatusBadge = (status: string) => {
    let type = 'secondary';
    if (status === 'CONFIRMED') type = 'success';
    if (status === 'CANCELLED') type = 'error';
    if (status === 'DRAFT') type = 'warning';
    return <span className={`badge badge-${type}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales Challans</h1>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => navigate('/challans/new')}>
            + New Challan
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-bar">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search by Challan No or Customer Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : challans.length === 0 ? (
          <div className="empty-state">
            <h3>No challans found</h3>
            <p>Try adjusting your search or create a new challan.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Challan No</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Created By</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/challans/${c.id}`} style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {c.challanNo}
                        </Link>
                      </td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.customer.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.customer.mobile}</div>
                      </td>
                      <td>{c.createdBy.name}</td>
                      <td style={{ fontWeight: 600 }}>₹{c.totalAmount.toFixed(2)}</td>
                      <td>{getStatusBadge(c.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <span className="pagination-info">
                Showing {challans.length} of {total} challans
              </span>
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  ← Prev
                </button>
                <span style={{ padding: '8px 12px', fontSize: '0.875rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChallanList;
