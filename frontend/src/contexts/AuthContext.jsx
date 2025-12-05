import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('auth_token');
    const savedRole = localStorage.getItem('user_role');

    if (token && savedRole) {
      setRole(savedRole);
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', userData.role);

      setUser(userData);
      setRole(userData.role);

      return { success: true, role: userData.role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return {
        success: true,
        message: response.data.message,
        email: userData.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await authAPI.verify({ email, otp });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    setUser(null);
    setRole(null);
  };

  const isAuthenticated = () => {
    return !!user && !!role;
  };

  const hasRole = (allowedRoles) => {
    if (!role) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(role);
    }
    return role === allowedRoles;
  };

  const value = {
    user,
    role,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};