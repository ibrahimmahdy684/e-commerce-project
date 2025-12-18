import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyResetOTP from './pages/auth/VerifyResetOTP';
import ResetPassword from './pages/auth/ResetPassword';

// User Pages
import Home from './pages/Home';
import Storefront from './pages/user/Storefront';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';
import Profile from './pages/user/Profile';
import VendorsList from './pages/user/VendorsList';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminVendors from './pages/admin/AdminVendors';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} />
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* User Routes */}
              <Route
                path="/storefront"
                element={
                  <ProtectedRoute allowedRoles="user">
                    <Storefront />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <ProtectedRoute allowedRoles="user">
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles="user">
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles="user">
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles="user">
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:orderId"
                element={
                  <ProtectedRoute allowedRoles="user">
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles="user">
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendors"
                element={
                  <ProtectedRoute allowedRoles="user">
                    <VendorsList />
                  </ProtectedRoute>
                }
              />

              {/* Vendor Routes */}
              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute allowedRoles="vendor">
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/profile"
                element={
                  <ProtectedRoute allowedRoles="vendor">
                    <VendorProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/products"
                element={
                  <ProtectedRoute allowedRoles="vendor">
                    <VendorProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/orders"
                element={
                  <ProtectedRoute allowedRoles="vendor">
                    <VendorOrders />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/vendors"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <AdminVendors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
