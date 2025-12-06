import { useState, useEffect } from 'react';
import { adminAPI, orderAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    user_id: '',
    page: 1,
    limit: 10
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getAllOrders(filters);
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
    <div className="admin-orders-page">
      <h1>Manage Orders</h1>

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

        <input
          type="text"
          placeholder="Filter by User ID"
          value={filters.user_id}
          onChange={(e) => setFilters({ ...filters, user_id: e.target.value, page: 1 })}
        />

        <select
          value={filters.limit}
          onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      {selectedOrder ? (
        <div className="order-detail-modal">
          <div className="modal-content">
            <h2>Order Details</h2>

            <div className="order-info">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.placed_at || selectedOrder.createdAt).toLocaleString()}</p>
              <p><strong>Customer:</strong> {selectedOrder.user_id?.name || selectedOrder.user_id}</p>
              <p><strong>Email:</strong> {selectedOrder.user_id?.email || 'N/A'}</p>
              <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
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
                  <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <p><strong>Total Amount:</strong> ${selectedOrder.total_amount?.toFixed(2)}</p>
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
        <>
          <div className="orders-list">
            <h3>All Orders ({orders.length})</h3>
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order._id.slice(-8)}</td>
                      <td>{new Date(order.placed_at || order.createdAt).toLocaleDateString()}</td>
                      <td>{order.user_id?.name || order.user_id}</td>
                      <td>{order.items?.length || 0}</td>
                      <td>${order.total_amount?.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

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
        </>
      )}
    </div>
  );
};

export default AdminOrders;
