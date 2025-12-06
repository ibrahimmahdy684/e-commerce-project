import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI, productAPI, orderAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const VendorDashboard = () => {
  const [vendorStatus, setVendorStatus] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    rejectedProducts: 0
  });
  const [salesStats, setSalesStats] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch vendor status
      const statusRes = await vendorAPI.getStatus();
      setVendorStatus(statusRes.data.vendor_status);

      // Get all products to calculate stats
      const productsRes = await productAPI.getAll();
      // Product API returns data directly (not wrapped in { data: { data: ... } })
      const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.data || []);

      setStats({
        totalProducts: products.length,
        pendingProducts: products.filter(p => p.status === 'pending').length,
        approvedProducts: products.filter(p => p.status === 'approved').length,
        rejectedProducts: products.filter(p => p.status === 'rejected').length
      });

      // Fetch sales statistics
      const salesStatsRes = await vendorAPI.getStatistics();
      setSalesStats(salesStatsRes.data?.data || salesStatsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const params = {};
      if (dateRange.start_date) params.start_date = dateRange.start_date;
      if (dateRange.end_date) params.end_date = dateRange.end_date;

      const response = await vendorAPI.getSalesReport(params);
      setSalesReport(response.data?.data || response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load sales report');
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchDashboardData} />;

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

      <h2>Product Statistics</h2>
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

      {salesStats && (
        <>
          <h2>Sales Statistics</h2>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-number">{salesStats.total_orders || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Orders</h3>
              <p className="stat-number">{salesStats.pending_orders || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Orders</h3>
              <p className="stat-number">{salesStats.completed_orders || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-number">${salesStats.total_revenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-card">
              <h3>Products Sold</h3>
              <p className="stat-number">{salesStats.total_products_sold || 0}</p>
            </div>
          </div>
        </>
      )}

      <div className="sales-report-section">
        <h2>Sales Report</h2>
        <div className="date-filters">
          <input
            type="date"
            value={dateRange.start_date}
            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
            placeholder="End Date"
          />
          <button onClick={fetchSalesReport} className="btn btn-primary">
            Generate Report
          </button>
        </div>

        {salesReport && (
          <div className="sales-report-data">
            <h3>Sales Report Results</h3>
            <p><strong>Period:</strong> {salesReport.period?.start} to {salesReport.period?.end}</p>
            <p><strong>Total Sales:</strong> ${salesReport.summary?.total_sales?.toFixed(2) || '0.00'}</p>
            <p><strong>Total Orders:</strong> {salesReport.summary?.total_orders || 0}</p>
            <p><strong>Products Sold:</strong> {salesReport.summary?.total_products_sold || 0}</p>
            <p><strong>Average Order Value:</strong> ${salesReport.summary?.average_order_value?.toFixed(2) || '0.00'}</p>
          </div>
        )}
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
