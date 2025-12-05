import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await userAPI.getApprovedVendors();
      setVendors(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchName.trim()) {
      fetchVendors();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await userAPI.searchVendors(searchName);
      setVendors(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search vendors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading vendors..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchVendors} />;

  return (
    <div className="vendors-page">
      <h1>Vendors</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search vendors by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
        <button onClick={fetchVendors} className="btn btn-secondary">
          Show All
        </button>
      </div>

      {vendors.length === 0 ? (
        <p>No vendors found</p>
      ) : (
        <div className="vendors-grid">
          {vendors.map(vendor => (
            <div key={vendor._id} className="vendor-card">
              <h3>{vendor.name}</h3>
              <p><strong>Email:</strong> {vendor.email}</p>
              {vendor.phone && <p><strong>Phone:</strong> {vendor.phone}</p>}
              {vendor.address && <p><strong>Address:</strong> {vendor.address}</p>}
              <p className="vendor-status">
                <span className="status-badge status-approved">Approved Vendor</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorsList;
