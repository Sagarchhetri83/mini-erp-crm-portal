import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users as UsersIcon, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Key, 
  Trash2, 
  X, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

interface UserSummary {
  total: number;
  active: number;
  inactive: number;
  admin: number;
}

const UsersPlaceholder: React.FC = () => {
  const { user: currentUser } = useAuth();

  // State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [summary, setSummary] = useState<UserSummary>({ total: 0, active: 0, inactive: 0, admin: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Active Dropdown Menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SALES' as 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.users);
      setSummary(res.data.summary);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to load users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'SALES',
      status: 'ACTIVE',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setSelectedUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      confirmPassword: '',
      role: u.role,
      status: u.status,
    });
    setFormError('');
    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  const openViewModal = (u: UserItem) => {
    setSelectedUser(u);
    setIsViewModalOpen(true);
    setActiveMenuId(null);
  };

  const openResetModal = (u: UserItem) => {
    setSelectedUser(u);
    setNewPassword('');
    setFormError('');
    setIsResetModalOpen(true);
    setActiveMenuId(null);
  };

  // Handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status,
      });
      setSuccessMsg('User created successfully.');
      setIsAddModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError('');

    // Self-protection check
    if (currentUser && currentUser.id === selectedUser.id) {
      if (formData.status === 'INACTIVE' || formData.role !== 'ADMIN') {
        setFormError('You cannot deactivate your own administrator account or remove your Admin role.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.put(`/users/${selectedUser.id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      });
      setSuccessMsg('User updated successfully.');
      setIsEditModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError('');

    if (newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/users/${selectedUser.id}/reset-password`, { password: newPassword });
      setSuccessMsg('Password reset successfully.');
      setIsResetModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (u: UserItem) => {
    setActiveMenuId(null);
    if (currentUser && currentUser.id === u.id) {
      alert('You cannot deactivate your own administrator account.');
      return;
    }

    const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/users/${u.id}`, { status: nextStatus });
      setSuccessMsg(`User ${nextStatus.toLowerCase()}d successfully.`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status.');
    }
  };

  const handleDeleteUser = async (u: UserItem) => {
    setActiveMenuId(null);
    if (currentUser && currentUser.id === u.id) {
      alert('You cannot delete your own administrator account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${u.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/users/${u.id}`);
      setSuccessMsg('User deleted successfully.');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            User Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Manage MiniERP users, roles, and access.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal} style={{ fontSize: '13px', height: '36px', gap: '6px' }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* SUCCESS NOTIFICATION ALERT */}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', color: '#166534', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* ERROR ALERT */}
      {error && (
        <div style={{ padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
          <button className="btn btn-secondary" onClick={fetchUsers} style={{ height: '30px', fontSize: '12px' }}>
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      )}

      {/* 2. SUMMARY KPI CARDS */}
      <div className="kpi-strip">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Users</span>
            <UsersIcon size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{summary.total}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Active Users</span>
            <UserCheck size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="kpi-value">{summary.active}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Inactive Users</span>
            <UserX size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="kpi-value">{summary.inactive}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Admin Users</span>
            <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value">{summary.admin}</div>
        </div>
      </div>

      {/* 3. TOOLBAR (SEARCH + FILTERS) */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '220px', height: '36px', background: '#FAFAF8' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#FAFAF8', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="SALES">Sales</option>
          <option value="WAREHOUSE">Warehouse</option>
          <option value="ACCOUNTS">Accounts</option>
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#FAFAF8', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* 4. USER TABLE & STATES */}
      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <div>Loading users...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="card empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <UsersIcon size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>No users found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            No ERP users match your current filter options.
          </p>
          <button className="btn btn-primary" onClick={openAddModal} style={{ fontSize: '12px' }}>
            + Add User
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none', margin: 0, borderRadius: 0 }}>
            <table style={{ margin: 0 }}>
              <thead>
                <tr style={{ background: '#FAFAF8' }}>
                  <th style={{ paddingLeft: '20px' }}>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ paddingLeft: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className="badge badge-secondary" style={{ fontWeight: 600 }}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(u.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '20px', position: 'relative' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}
                        style={{ width: '28px', height: '28px' }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Action Menu */}
                      {activeMenuId === u.id && (
                        <div style={{
                          position: 'absolute', top: '32px', right: '20px', width: '160px',
                          background: '#FFFFFF', border: '1px solid #ECEAE5', borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 999, overflow: 'hidden',
                          padding: '4px 0', textAlign: 'left'
                        }}>
                          <button onClick={() => openViewModal(u)} style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                            <Eye size={14} /> View
                          </button>
                          <button onClick={() => openEditModal(u)} style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                            <Edit size={14} /> Edit
                          </button>
                          <button onClick={() => openResetModal(u)} style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                            <Key size={14} /> Reset Password
                          </button>
                          <button onClick={() => handleToggleStatus(u)} style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: u.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)', cursor: 'pointer' }}>
                            {u.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />} {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                          <div style={{ borderTop: '1px solid #ECEAE5', margin: '4px 0' }} />
                          <button onClick={() => handleDeleteUser(u)} style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--danger)', cursor: 'pointer', fontWeight: 500 }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL 1: ADD USER */}
      {/* ====================================================================== */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '24px', background: '#FFFFFF', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #ECEAE5', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Create New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {formError && <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '12px' }}>{formError}</div>}

            <form onSubmit={handleAddSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" placeholder="e.g. Rahul Verma" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="e.g. rahul@erp.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Role</label>
                  <select className="form-control" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}>
                    <option value="ADMIN">Admin</option>
                    <option value="SALES">Sales</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="ACCOUNTS">Accounts</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="At least 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL 2: EDIT USER */}
      {/* ====================================================================== */}
      {isEditModalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '24px', background: '#FFFFFF', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #ECEAE5', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Edit User Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {formError && <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '12px' }}>{formError}</div>}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Role</label>
                  <select className="form-control" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}>
                    <option value="ADMIN">Admin</option>
                    <option value="SALES">Sales</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="ACCOUNTS">Accounts</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL 3: VIEW USER DETAILS */}
      {/* ====================================================================== */}
      {isViewModalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px', background: '#FFFFFF', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #ECEAE5', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>User Profile</h3>
              <button onClick={() => setIsViewModalOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedUser.email}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <span className="badge badge-secondary">{selectedUser.role}</span>
                  <span className={`badge ${selectedUser.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>{selectedUser.status}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #ECEAE5', paddingTop: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Access & Module Permissions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <div style={{ color: 'var(--text-primary)' }}>✓ Dashboard Overview</div>
                <div style={{ color: selectedUser.role === 'ADMIN' || selectedUser.role === 'ACCOUNTS' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {selectedUser.role === 'ADMIN' || selectedUser.role === 'ACCOUNTS' ? '✓ Analytics' : '✗ Analytics'}
                </div>
                <div style={{ color: selectedUser.role === 'ADMIN' || selectedUser.role === 'SALES' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {selectedUser.role === 'ADMIN' || selectedUser.role === 'SALES' ? '✓ Customer CRM' : '✗ Customer CRM'}
                </div>
                <div style={{ color: selectedUser.role === 'ADMIN' || selectedUser.role === 'WAREHOUSE' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {selectedUser.role === 'ADMIN' || selectedUser.role === 'WAREHOUSE' ? '✓ Inventory & Stock' : '✗ Inventory & Stock'}
                </div>
                <div style={{ color: 'var(--text-primary)' }}>✓ Sales Challans</div>
                <div style={{ color: selectedUser.role === 'ADMIN' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: selectedUser.role === 'ADMIN' ? 600 : 400 }}>
                  {selectedUser.role === 'ADMIN' ? '✓ User Management' : '✗ User Management (Disabled)'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL 4: RESET PASSWORD */}
      {/* ====================================================================== */}
      {isResetModalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '24px', background: '#FFFFFF', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #ECEAE5', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Reset Password</h3>
              <button onClick={() => setIsResetModalOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Enter a new password for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
            </p>

            {formError && <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '12px' }}>{formError}</div>}

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsResetModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersPlaceholder;
