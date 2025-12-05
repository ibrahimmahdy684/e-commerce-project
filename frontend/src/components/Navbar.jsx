import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">E-Commerce Platform</Link>
      </div>

      <div className="navbar-menu">
        {!isAuthenticated() ? (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        ) : (
          <>
            {role === 'user' && (
              <>
                <Link to="/storefront" className="nav-link">Shop</Link>
                <Link to="/cart" className="nav-link">Cart</Link>
                <Link to="/orders" className="nav-link">My Orders</Link>
                <Link to="/vendors" className="nav-link">Vendors</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
              </>
            )}

            {role === 'vendor' && (
              <>
                <Link to="/vendor/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/vendor/products" className="nav-link">My Products</Link>
                <Link to="/vendor/orders" className="nav-link">Orders</Link>
                <Link to="/vendor/profile" className="nav-link">Profile</Link>
              </>
            )}

            {role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/admin/categories" className="nav-link">Categories</Link>
                <Link to="/admin/vendors" className="nav-link">Vendors</Link>
                <Link to="/admin/users" className="nav-link">Users</Link>
                <Link to="/admin/products" className="nav-link">Products</Link>
                <Link to="/admin/orders" className="nav-link">Orders</Link>
              </>
            )}

            <button onClick={handleLogout} className="nav-link logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
