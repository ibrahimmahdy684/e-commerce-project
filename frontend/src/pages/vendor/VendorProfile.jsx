import { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const VendorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await vendorAPI.getProfile();
      const profileData = response.data.data || response.data;
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        address: profileData.address || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      await vendorAPI.updateProfile(formData);
      setMessage('Profile updated successfully! Note: Your vendor status has been reset to not-approved.');
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading message="Loading profile..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchProfile} />;

  return (
    <div className="vendor-profile-page">
      <h1>Vendor Profile</h1>

      <div className="profile-info">
        <div className="info-card">
          <h3>Account Information</h3>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Vendor Status:</strong>{' '}
            <span className={`status-badge status-${profile.vendor_status}`}>
              {profile.vendor_status || 'not-approved'}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <h3>Update Profile</h3>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <p className="field-notice">
            <small>Note: Updating your profile will reset your vendor status to not-approved</small>
          </p>

          {message && (
            <div className={message.includes('success') ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          <button type="submit" disabled={updating} className="btn btn-primary">
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorProfile;
