import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    address: ''
  });
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const response = await adminAPI.getUsers(params);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await adminAPI.createUser(createData);
      alert('User created successfully');
      setShowCreateForm(false);
      setCreateData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
        address: ''
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      await adminAPI.updateUser(editingUser._id, editData);
      alert('User updated successfully');
      setShowEditForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminAPI.deleteUser(userId);
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setEditData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setShowEditForm(true);
  };

  if (loading) return <Loading message="Loading users..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchUsers} />;

  return (
    <div className="admin-users-page">
      <h1>Manage Users</h1>

      <div className="page-controls">
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary">
          {showCreateForm ? 'Cancel' : 'Create User'}
        </button>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="user-form">
          <h3>Create New User</h3>

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={createData.name}
              onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={createData.email}
              onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={createData.password}
              onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              value={createData.role}
              onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={createData.phone}
              onChange={(e) => setCreateData({ ...createData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={createData.address}
              onChange={(e) => setCreateData({ ...createData, address: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary">Create User</button>
        </form>
      )}

      {showEditForm && editingUser && (
        <form onSubmit={handleEdit} className="user-form">
          <h3>Edit User: {editingUser.email}</h3>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary">Update User</button>
          <button
            type="button"
            onClick={() => {
              setShowEditForm(false);
              setEditingUser(null);
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="users-list">
        <h3>All Users</h3>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>{user.address || 'N/A'}</td>
                  <td>
                    <button onClick={() => openEditForm(user)} className="btn btn-sm btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
