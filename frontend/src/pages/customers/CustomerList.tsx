import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Search, PlusCircle, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string | null;
  customerType: string;
  status: string;
  followUpDate: string | null;
  createdAt: string;
}

const CustomerList: React.FC = () => {
  const { user } = useAuth();
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';
  const navigate = useNavigate();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('customerType', typeFilter);

      const res = await api.get(`/customers?${params.toString()}`);
      setCustomers(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  const getTypeBadge = (type: string) => {
    return <span className="badge badge-secondary">{type}</span>;
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Customers</h1>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => navigate(`${rolePrefix}/customers/new`)}>
            <PlusCircle size={14} /> Add Customer
          </button>
        )}
      </div>

      <div className="toolbar" style={{ marginBottom: '12px' }}>
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            className="form-control"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '140px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '140px' }}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>
        {(search || statusFilter || typeFilter) && (
          <button 
            className="btn btn-secondary" 
            onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
            style={{ fontSize: '13px' }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : customers.length === 0 ? (
        <div className="card" style={{ padding: '40px' }}>
          <div className="empty-state">
            <p>No customers found. Adjust your search or add a new customer.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>MOBILE</th>
                <th>BUSINESS</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>FOLLOW-UP</th>
                <th style={{ textAlign: 'right', width: '60px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="table-avatar-cell">
                      <div className="avatar-initial">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link to={`${rolePrefix}/customers/${c.id}`} className="cell-title">
                          {c.name}
                        </Link>
                        {c.email && (
                          <div className="cell-subtitle">{c.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{c.mobile}</td>
                  <td>{c.businessName || '—'}</td>
                  <td>{getTypeBadge(c.customerType)}</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {c.followUpDate
                      ? new Date(c.followUpDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => navigate(`${rolePrefix}/customers/${c.id}`)}
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
              Showing {customers.length} of {total} customers
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

export default CustomerList;
