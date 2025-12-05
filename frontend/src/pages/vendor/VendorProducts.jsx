import { useState, useEffect } from 'react';
import { productAPI, categoryAPI, vendorAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    quantity: 0,
    price: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [profileRes, categoriesRes, approvedProductsRes] = await Promise.all([
        vendorAPI.getProfile(),
        categoryAPI.getAll(),
        productAPI.getApproved()
      ]);

      const vendorData = profileRes.data.data || profileRes.data;
      setVendorId(vendorData._id);

      const categoriesData = categoriesRes.data.data || categoriesRes.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Filter products by this vendor
      const productsData = approvedProductsRes.data.data || approvedProductsRes.data;
      const allProducts = Array.isArray(productsData) ? productsData : [];
      const vendorProducts = allProducts.filter(
        p => p.vendorId === vendorData._id || p.vendorId?._id === vendorData._id
      );

      setProducts(vendorProducts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || formData.quantity < 1 || formData.price <= 0) {
      alert('Please fill all required fields correctly');
      return;
    }

    try {
      const productData = {
        ...formData,
        vendorId: vendorId,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        await productAPI.update(editingProduct._id, productData);
        alert('Product updated successfully! Status reset to pending.');
      } else {
        await productAPI.create(productData);
        alert('Product created successfully! Status: pending approval.');
      }

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId?._id || product.categoryId,
      quantity: product.quantity,
      price: product.price
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(productId);
      alert('Product deleted successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      quantity: 0,
      price: 0
    });
    setEditingProduct(null);
  };

  if (loading) return <Loading message="Loading products..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;

  return (
    <div className="vendor-products-page">
      <h1>My Products</h1>

      <button
        onClick={() => {
          setShowForm(!showForm);
          if (!showForm) resetForm();
        }}
        className="btn btn-primary"
      >
        {showForm ? 'Cancel' : 'Add New Product'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {editingProduct ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="products-list">
        <h3>All Products</h3>
        {products.length === 0 ? (
          <p>No products yet. Create your first product!</p>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge status-${product.status}`}>
                    {product.status}
                  </span>
                </p>

                <div className="product-actions">
                  <button onClick={() => handleEdit(product)} className="btn btn-sm btn-secondary">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProducts;
