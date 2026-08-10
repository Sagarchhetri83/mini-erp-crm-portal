import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  customerType: string;
  status: string;
  followUpDate: string | null;
  createdAt: string;
}

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
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
    const cls = `badge badge-${status.toLowerCase()}`;
    return <span className={cls}>{status}</span>;
  };

  const getTypeBadge = (type: string) => {
    const cls = `badge badge-${type.toLowerCase()}`;
    return <span className={cls}>{type}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={() => navigate('/customers/new')}>
          + Add Customer
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-bar">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search by name or mobile..."
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
            style={{ width: 'auto', minWidth: '160px' }}
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>Try adjusting your search or add a new customer.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/customers/${c.id}`} style={{ fontWeight: 600 }}>
                          {c.name}
                        </Link>
                        {c.email && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td>{c.mobile}</td>
                      <td>{getTypeBadge(c.customerType)}</td>
                      <td>{getStatusBadge(c.status)}</td>
                      <td>
                        {c.followUpDate
                          ? new Date(c.followUpDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/customers/${c.id}/edit`)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <span className="pagination-info">
                Showing {customers.length} of {total} customers
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

export default CustomerList;
