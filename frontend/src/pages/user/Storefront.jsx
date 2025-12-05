import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const Storefront = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getApproved(),
        categoryAPI.getAll()
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading) return <Loading message="Loading products..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;

  return (
    <div className="storefront">
      <h1>Shop</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>No products found</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price}</p>
              <p className="product-quantity">Available: {product.quantity}</p>
              <Link to={`/product/${product._id}`} className="btn btn-primary">
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Storefront;
