import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, role } = useAuth();

  const getDashboardLink = () => {
    switch (role) {
      case 'user':
        return '/storefront';
      case 'vendor':
        return '/vendor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to E-Commerce Platform</h1>
        <p>Your one-stop shop for all your needs</p>

        {!isAuthenticated() ? (
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to={getDashboardLink()} className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Shop Products</h3>
            <p>Browse and purchase from a wide range of products</p>
          </div>
          <div className="feature-card">
            <h3>Vendor Portal</h3>
            <p>Sell your products and manage your inventory</p>
          </div>
          <div className="feature-card">
            <h3>Secure Payments</h3>
            <p>Multiple payment options with secure checkout</p>
          </div>
          <div className="feature-card">
            <h3>Points System</h3>
            <p>Earn and redeem points on your purchases</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
