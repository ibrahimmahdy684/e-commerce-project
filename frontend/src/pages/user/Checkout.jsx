import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI, userAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [profile, setProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [pointsToUse, setPointsToUse] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [cartRes, profileRes] = await Promise.all([
        cartAPI.get(),
        userAPI.getProfile()
      ]);

      setCart(cartRes.data.data); // Extract nested data
      setProfile(profileRes.data.data || profileRes.data); // Handle both formats
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cart?.total || 0;

    // 100 points = 1 currency
    const pointsDiscount = pointsToUse / 100;
    const total = Math.max(0, subtotal - pointsDiscount);

    return { subtotal, pointsDiscount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const { total } = calculateTotal();
    const availablePoints = profile?.points || 0;

    if (pointsToUse > availablePoints) {
      alert('Not enough points available');
      return;
    }

    if (pointsToUse < 0) {
      alert('Points cannot be negative');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        payment_method: paymentMethod,
      };

      if (pointsToUse > 0) {
        orderData.points_to_use = pointsToUse;
      }

      const response = await orderAPI.create(orderData);
      const orderResult = response.data.data; // Extract nested data
      navigate('/orders', {
        state: {
          message: `Order placed successfully! You earned ${orderResult.points_earned || Math.floor(total)} points.`,
          orderId: orderResult.order_id
        }
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading checkout..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <h1>Checkout</h1>
        <p>Your cart is empty</p>
        <button onClick={() => navigate('/storefront')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  const { subtotal, pointsDiscount, total } = calculateTotal();
  const availablePoints = profile?.points || 0;
  const pointsEarned = Math.floor(total);

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item._id} className="order-item">
              <span>{item.product_name || 'Product'} x {item.quantity}</span>
              <span>${(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {pointsToUse > 0 && (
              <div className="total-row discount">
                <span>Points Discount ({pointsToUse} pts):</span>
                <span>-${pointsDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="total-row final">
              <strong>Total:</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <div className="points-info">
              <small>You will earn {pointsEarned} points from this order</small>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Payment Details</h2>

          <div className="form-group">
            <label>Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Use Points (Available: {availablePoints})
              <br />
              <small>100 points = $1</small>
            </label>
            <input
              type="number"
              min="0"
              max={availablePoints}
              value={pointsToUse}
              onChange={(e) => setPointsToUse(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="btn btn-secondary"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
