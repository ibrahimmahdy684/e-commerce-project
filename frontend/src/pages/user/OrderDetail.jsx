import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await orderAPI.getOrderDetails(orderId);
      setOrder(response.data.data); // Extract nested data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading order details..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchOrder} />;
  if (!order) return <ErrorDisplay message="Order not found" />;

  return (
    <div className="order-detail-page">
      <h1>Order Details</h1>

      <div className="order-info-card">
        <div className="order-header">
          <h2>Order #{order._id?.slice(-8) || 'N/A'}</h2>
          <span className={`status-badge status-${order.status}`}>
            {order.status}
          </span>
        </div>

        <div className="order-meta">
          <p><strong>Date:</strong> {new Date(order.placed_at).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> {order.payment_method}</p>
        </div>

        <h3>Items</h3>
        <div className="order-items">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div>
                  <strong>{item.product_name || 'Product'}</strong>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div>
                  <p>${item.price || 0} each</p>
                  <p><strong>${((item.price || 0) * item.quantity).toFixed(2)}</strong></p>
                </div>
              </div>
            ))
          ) : (
            <p>No items found</p>
          )}
        </div>

        <div className="order-totals">
          <div className="total-row final">
            <strong>Total Amount:</strong>
            <strong>${order.total_amount?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>

        <button onClick={() => navigate('/orders')} className="btn btn-secondary">
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;
