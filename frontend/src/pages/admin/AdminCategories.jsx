import { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
        alert('Category updated successfully');
      } else {
        await categoryAPI.create(formData);
        alert('Category created successfully');
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryAPI.delete(id);
      alert('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <Loading message="Loading categories..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchCategories} />;

  return (
    <div className="admin-categories-page">
      <h1>Manage Categories</h1>

      <button
        onClick={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setFormData({ name: '', description: '' });
            setEditingCategory(null);
          }
        }}
        className="btn btn-primary"
      >
        {showForm ? 'Cancel' : 'Add Category'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="category-form">
          <h3>{editingCategory ? 'Edit Category' : 'Create Category'}</h3>

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {editingCategory ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="categories-list">
        <h3>All Categories</h3>
        {categories.length === 0 ? (
          <div className="no-categories">
            <p>No categories found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category.description || 'N/A'}</td>
                  <td>
                    <button onClick={() => handleEdit(category)} className="btn btn-sm btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(category._id)} className="btn btn-sm btn-danger">
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

export default AdminCategories;
