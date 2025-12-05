import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await productAPI.getById(id);
      setProduct(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (quantity < 1) {
      setMessage('Quantity must be at least 1');
      return;
    }

    if (quantity > product.quantity) {
      setMessage('Not enough stock available');
      return;
    }

    setAddingToCart(true);
    setMessage('');

    try {
      await cartAPI.add({
        product_id: product._id,
        quantity: quantity
      });
      setMessage('Added to cart successfully!');
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <Loading message="Loading product..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchProduct} />;
  if (!product) return <ErrorDisplay message="Product not found" />;

  return (
    <div className="product-detail">
      <div className="product-detail-content">
        <h1>{product.name}</h1>
        <p className="product-description">{product.description}</p>
        <p className="product-price">Price: ${product.price}</p>
        <p className="product-quantity">Available: {product.quantity}</p>
        <p className="product-status">
          Status: <span className={`status-badge status-${product.status}`}>{product.status}</span>
        </p>

        {product.status === 'approved' && product.quantity > 0 && (
          <div className="add-to-cart">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="btn btn-primary"
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}

        {message && (
          <div className={message.includes('success') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        <button onClick={() => navigate('/storefront')} className="btn btn-secondary">
          Back to Shop
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
