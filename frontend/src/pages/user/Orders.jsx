import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });

  const location = useLocation();
  const successMessage = location.state?.message;

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await orderAPI.getUserOrders(filters);
      // Handle response structure: { success, message, data: {...} }
      const data = response.data.data || response.data;
      // Ensure we have an array
      setOrders(Array.isArray(data) ? data : (data.orders || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await orderAPI.cancel(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <Loading message="Loading orders..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchOrders} />;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.limit}
          onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found</p>
          <Link to="/storefront" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order._id.slice(-8)}</h3>
                <span className={`status-badge status-${order.status}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <p>Date: {new Date(order.placed_at).toLocaleDateString()}</p>
                <p>Total: ${order.total_amount?.toFixed(2) || '0.00'}</p>
                <p>Payment: {order.payment_method}</p>
              </div>

              <div className="order-actions">
                <Link to={`/order/${order._id}`} className="btn btn-secondary btn-sm">
                  View Details
                </Link>
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="pagination">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span>Page {filters.page}</span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={orders.length < filters.limit}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
