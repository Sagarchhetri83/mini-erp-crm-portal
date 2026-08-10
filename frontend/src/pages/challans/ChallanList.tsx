import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Search, PlusCircle, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

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
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';
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
    return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Sales Challans</h1>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => navigate(`${rolePrefix}/challans/new`)}>
            <PlusCircle size={14} /> New Challan
          </button>
        )}
      </div>

      <div className="toolbar" style={{ marginBottom: '12px' }}>
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Challan No or Customer..."
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
        {(search || statusFilter) && (
          <button 
            className="btn btn-secondary" 
            onClick={() => { setSearch(''); setStatusFilter(''); }}
            style={{ fontSize: '13px' }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : challans.length === 0 ? (
        <div className="card" style={{ padding: '40px' }}>
          <div className="empty-state">
            <p>No challans found. Adjust your search or create a new challan.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>CHALLAN</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>CREATED BY</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right', width: '60px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`${rolePrefix}/challans/${c.id}`} style={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {c.challanNo}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.customer.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.customer.mobile}</div>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>₹{c.totalAmount.toFixed(2)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.createdBy.name}</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => navigate(`${rolePrefix}/challans/${c.id}`)}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-wrapper">
            <span className="pagination-info">
              Showing {challans.length} of {total} challans
            </span>
            <div className="pagination-controls">
              <button className="btn btn-secondary btn-icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={14} />
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-secondary btn-icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallanList;
