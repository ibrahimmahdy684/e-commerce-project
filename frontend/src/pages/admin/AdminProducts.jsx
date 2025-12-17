import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productAPI, categoryAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    vendorId: '',
    quantity: 0,
    price: 0,
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll()
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        await productAPI.update(editingProduct._id, productData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(productData);
        toast.success('Product created successfully');
      }

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId?._id || product.categoryId,
      vendorId: product.vendorId?._id || product.vendorId,
      quantity: product.quantity,
      price: product.price,
      status: product.status
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(productId);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleApprove = async (productId) => {
    try {
      await productAPI.update(productId, { status: 'approved' });
      alert('Product approved successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      vendorId: '',
      quantity: 0,
      price: 0,
      status: 'pending'
    });
    setEditingProduct(null);
  };

  if (loading) return <Loading message="Loading products..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;

  return (
    <div className="admin-products-page">
      <h1>Manage Products</h1>

      <button
        onClick={() => {
          setShowForm(!showForm);
          if (!showForm) resetForm();
        }}
        className="btn btn-primary"
      >
        {showForm ? 'Cancel' : 'Add Product'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <h3>{editingProduct ? 'Edit Product' : 'Create Product'}</h3>

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

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {!editingProduct && (
          <div className="form-group">
            <label>Vendor ID *</label>
            <input
              type="text"
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
              placeholder="Enter vendor ID"
              required
            />
          </div>
          )}

          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Price *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            {editingProduct ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="products-list">
        <h3>All Products ({products.length})</h3>
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.categoryId?.name || 'N/A'}</td>
                  <td>{product.vendorId?.name || product.vendorId}</td>
                  <td>${product.price}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <span className={`status-badge status-${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(product)} className="btn btn-sm btn-secondary">
                      Edit
                    </button>
                    {product.status === 'pending' && (
                      <button onClick={() => handleApprove(product._id)} className="btn btn-sm btn-success">
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDelete(product._id)} className="btn btn-sm btn-danger">
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

export default AdminProducts;
