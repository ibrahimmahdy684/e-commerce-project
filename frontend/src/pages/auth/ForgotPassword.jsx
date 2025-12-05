import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      navigate('/verify-reset-otp', { state: { email, message: response.data.message } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset OTP</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <p className="auth-link">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;