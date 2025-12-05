import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const Profile = () => {
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

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || ''
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
      await userAPI.updateProfile(formData);
      setMessage('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await userAPI.deleteAccount();
      alert('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) return <Loading message="Loading profile..." />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchProfile} />;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-info">
        <div className="info-card">
          <h3>Account Information</h3>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Points:</strong> {profile.points || 0}</p>
          <p><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
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
            <small>Note: Email and role cannot be edited</small>
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

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <button onClick={handleDeleteAccount} className="btn btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
