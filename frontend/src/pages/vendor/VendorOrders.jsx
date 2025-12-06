import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      // Vendors see orders containing their products (smart routing on backend)
      const response = await orderAPI.getUserOrders({});
      // Response structure: { success, message, data: { orders, pagination } }
      const ordersData = response.data?.data?.orders || response.data?.orders || [];
      setOrders(ordersData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await orderAPI.getOrderDetails(orderId);
      // Response structure: { success, message, data: orderObject }
      const orderData = response.data?.data || response.data;
      setSelectedOrder(orderData);
      setNewStatus(orderData.status);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load order details');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await orderAPI.updateStatus(selectedOrder._id, { status: newStatus });
      alert('Order status updated successfully');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) return <Loading message="Loading orders..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchOrders} />;

  return (
    <div className="vendor-orders-page">
      <h1>Orders</h1>

      {selectedOrder ? (
        <div className="order-detail-modal">
          <div className="modal-content">
            <h2>Order Details</h2>

            <div className="order-info">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.placed_at || selectedOrder.createdAt).toLocaleString()}</p>
              <p><strong>Customer:</strong> {selectedOrder.user_id?.name || 'N/A'}</p>
              <p><strong>Current Status:</strong>{' '}
                <span className={`status-badge status-${selectedOrder.status}`}>
                  {selectedOrder.status}
                </span>
              </p>
            </div>

            <h3>Items</h3>
            <div className="order-items">
              {selectedOrder.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <p><strong>{item.product_id?.name || item.product_name || 'Product'}</strong></p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ${item.price?.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="status-update">
              <h3>Update Status</h3>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="modal-actions">
                <button onClick={handleUpdateStatus} className="btn btn-primary">
                  Update Status
                </button>
                <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="orders-list">
          {orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <h3>Order #{order._id.slice(-8)}</h3>
                  <p><strong>Date:</strong> {new Date(order.placed_at || order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Items:</strong> {order.items?.length || 0}</p>
                  <p><strong>Total:</strong> ${order.total_amount?.toFixed(2)}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </p>

                  <button
                    onClick={() => viewOrderDetails(order._id)}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
