import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const AdminVendors = () => {
  const [unapprovedVendors, setUnapprovedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUnapprovedVendors();
  }, []);

  const fetchUnapprovedVendors = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getUnapprovedVendors();
      setUnapprovedVendors(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    if (!confirm('Are you sure you want to approve this vendor?')) return;

    try {
      await adminAPI.approveVendor(vendorId);
      alert('Vendor approved successfully');
      fetchUnapprovedVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve vendor');
    }
  };

  if (loading) return <Loading message="Loading vendors..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchUnapprovedVendors} />;

  return (
    <div className="admin-vendors-page">
      <h1>Manage Vendors</h1>

      <div className="vendors-section">
        <h2>Unapproved Vendors</h2>
        {unapprovedVendors.length === 0 ? (
          <p>No unapproved vendors</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedVendors.map(vendor => (
                <tr key={vendor._id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.phone || 'N/A'}</td>
                  <td>{vendor.address || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${vendor.vendor_status}`}>
                      {vendor.vendor_status || 'not-approved'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleApprove(vendor._id)}
                      className="btn btn-sm btn-primary"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminVendors;
