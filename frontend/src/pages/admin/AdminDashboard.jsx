import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getStatistics();
      // Response structure: { success, message, data: statisticsObject }
      setStatistics(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const params = {};
      if (dateRange.start_date) params.start_date = dateRange.start_date;
      if (dateRange.end_date) params.end_date = dateRange.end_date;

      const response = await adminAPI.getSalesReport(params);
      // Response structure: { success, message, data: salesReportObject }
      setSalesReport(response.data?.data || response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load sales report');
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchStatistics} />;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{statistics?.total_orders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-number">{statistics?.pending_orders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Orders</h3>
          <p className="stat-number">{statistics?.completed_orders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">${statistics?.total_revenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

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
            <p><strong>Average Order Value:</strong> ${salesReport.summary?.average_order_value?.toFixed(2) || '0.00'}</p>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/categories" className="btn btn-primary">Manage Categories</Link>
          <Link to="/admin/vendors" className="btn btn-primary">Manage Vendors</Link>
          <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
          <Link to="/admin/products" className="btn btn-primary">Manage Products</Link>
          <Link to="/admin/orders" className="btn btn-primary">Manage Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
