import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;