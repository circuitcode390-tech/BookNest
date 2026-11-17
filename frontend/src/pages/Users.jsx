import React, { useEffect, useState } from 'react';
import { request } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  UsersIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
  SearchIcon,
  ShieldIcon,
} from '../components/Icons';
import { formatDate, formatRole } from '../utils/formatters';

const initialForm = {
  name: '',
  membershipId: '',
  role: 'student',
  password: '',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useAuth();

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await request('/users');
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await request(`/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setMessage('User record successfully updated.');
      } else {
        await request('/users', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setMessage('New user account created successfully.');
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to save user account.');
    }
  }

  function startEdit(u) {
    setEditingId(u.id);
    setForm({
      name: u.name,
      membershipId: u.membership_id,
      role: u.role,
      password: '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelForm() {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(false);
  }

  async function handleDelete(id, name) {
    if (id === currentUser?.id) {
      setError('You cannot delete your own currently logged-in account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await request(`/users/${id}`, { method: 'DELETE' });
      setMessage('User account removed.');
      loadUsers();
    } catch (err) {
      setError(err.message || 'Could not delete user. Users with active transaction history cannot be removed.');
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.name} ${u.membership_id}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>User Directory & Access Control</h1>
          <p>Provision member credentials, assign library roles, and maintain accounts.</p>
        </div>
        <div className="page-header-actions">
          {!showForm && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setForm(initialForm);
                setEditingId(null);
                setShowForm(true);
              }}
            >
              <PlusIcon size={16} />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircleIcon size={18} />
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircleIcon size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {showForm && (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-info">
              <h2>{editingId ? 'Edit User Profile' : 'Register New User'}</h2>
              <p>Configure account credentials and permission levels</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={cancelForm}>
              <XIcon size={14} />
              <span>Cancel</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Legal Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Membership / Staff ID *</label>
                <input
                  type="text"
                  name="membershipId"
                  className="form-control"
                  placeholder="e.g. STU1002"
                  value={form.membershipId}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>System Role *</label>
                <select
                  name="role"
                  className="form-control"
                  value={form.role}
                  onChange={handleInputChange}
                >
                  <option value="student">Student Member</option>
                  <option value="librarian">Librarian (Staff)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Password * {editingId && <small>(Leave blank to keep current)</small>}
                </label>
                <input
                  type="password"
                  name="password"
                  minLength="6"
                  className="form-control"
                  placeholder={editingId ? '••••••••' : 'Min. 6 characters'}
                  value={form.password}
                  onChange={handleInputChange}
                  required={!editingId}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save Changes' : 'Create User Account'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-info">
            <h2>Registered Members & Staff</h2>
            <p>
              Showing {filteredUsers.length} of {users.length} registered profiles
            </p>
          </div>

          <div className="panel-header-actions">
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '140px' }}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="student">Students</option>
              <option value="librarian">Librarians</option>
              <option value="admin">Administrators</option>
            </select>

            <div className="search-bar-wrapper">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search member name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <UsersIcon size={24} />
            </div>
            <h3>No user records found</h3>
            <p>
              {search || filterRole !== 'ALL'
                ? 'Try adjusting your search criteria.'
                : 'No registered users exist in the system.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Membership ID</th>
                  <th>Access Role</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>
                      <span className="badge-code">{u.membership_id}</span>
                    </td>
                    <td>
                      <span className={`badge badge-role-${u.role}`}>
                        {formatRole(u.role)}
                      </span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEdit(u)}
                          title="Edit user details"
                        >
                          <EditIcon size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={u.id === currentUser?.id}
                          title={
                            u.id === currentUser?.id
                              ? 'Cannot delete your active session'
                              : 'Delete user'
                          }
                        >
                          <TrashIcon size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
