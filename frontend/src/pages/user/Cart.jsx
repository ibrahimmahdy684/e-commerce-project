import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await cartAPI.get();
      setCart(response.data.data); // Extract the nested data object
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await cartAPI.update(itemId, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      await cartAPI.remove(itemId);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Clear entire cart?')) return;

    try {
      await cartAPI.clear();
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  if (loading) return <Loading message="Loading cart..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchCart} />;

  const items = cart?.items || [];
  const total = cart?.total || 0;

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/storefront')} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div key={item._id} className="cart-item">
                <div className="item-info">
                  <h3>{item.product_name || 'Product'}</h3>
                  <p className="item-price">${item.price}</p>
                  {item.vendor_name && <p className="item-vendor">Sold by: {item.vendor_name}</p>}
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="item-total">
                  <p>${(item.subtotal || item.price * item.quantity).toFixed(2)}</p>
                </div>

                <button
                  onClick={() => removeItem(item._id)}
                  className="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Total: ${total.toFixed(2)}</h3>

            <div className="cart-actions">
              <button onClick={clearCart} className="btn btn-secondary">
                Clear Cart
              </button>
              <button onClick={() => navigate('/checkout')} className="btn btn-primary">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
