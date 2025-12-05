import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const VerifyResetOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Email not found. Please restart the process.');
      setLoading(false);
      return;
    }

    try {
      await authAPI.verifyReset({ email, otp });
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Reset OTP</h2>
        <p>Enter the OTP sent to {email}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <p className="auth-link">
          <Link to="/forgot-password">Back</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyResetOTP;