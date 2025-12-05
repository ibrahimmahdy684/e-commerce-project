import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Email not found. Please register again.');
      setLoading(false);
      return;
    }

    if (!otp) {
      setError('Please enter the OTP');
      setLoading(false);
      return;
    }

    const result = await verifyOTP(email, otp);
    setLoading(false);

    if (result.success) {
      navigate('/login', { state: { message: 'Account verified successfully! Please login.' } });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify OTP</h2>
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
          <Link to="/register">Back to Register</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;