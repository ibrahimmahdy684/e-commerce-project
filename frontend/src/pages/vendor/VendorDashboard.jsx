import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI, productAPI, orderAPI } from '../../services/api';
import Loading from '../../components/Loading';

const VendorDashboard = () => {
  const [vendorStatus, setVendorStatus] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    rejectedProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const statusRes = await vendorAPI.getStatus();
      setVendorStatus(statusRes.data.vendor_status);

      // Get approved products to calculate stats
      const productsRes = await productAPI.getApproved();
      const products = productsRes.data;

      setStats({
        totalProducts: products.length,
        pendingProducts: products.filter(p => p.status === 'pending').length,
        approvedProducts: products.filter(p => p.status === 'approved').length,
        rejectedProducts: products.filter(p => p.status === 'rejected').length
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="vendor-dashboard">
      <h1>Vendor Dashboard</h1>

      <div className="vendor-status-card">
        <h2>Vendor Status</h2>
        <span className={`status-badge status-${vendorStatus}`}>
          {vendorStatus || 'Not Approved'}
        </span>
        {vendorStatus === 'not-approved' && (
          <p className="status-notice">
            Your vendor account is pending approval. You can create products, but they won't be visible until approved.
          </p>
        )}
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pendingProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <p className="stat-number">{stats.approvedProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <p className="stat-number">{stats.rejectedProducts}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/vendor/products" className="btn btn-primary">
          Manage Products
        </Link>
        <Link to="/vendor/orders" className="btn btn-secondary">
          View Orders
        </Link>
        <Link to="/vendor/profile" className="btn btn-secondary">
          Update Profile
        </Link>
      </div>
    </div>
  );
};

export default VendorDashboard;
