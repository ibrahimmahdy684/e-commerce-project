import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  verify: (data) => api.post('/api/auth/verify', data),
  login: (data) => api.post('/api/auth/login', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  verifyReset: (data) => api.post('/api/auth/verify-reset', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),
  deleteAccount: () => api.delete('/api/users/me'),
  getApprovedVendors: () => api.get('/api/vendors/approved'),
  searchVendors: (name) => api.get('/api/vendors', { params: { name } }),
};

// Vendor API
export const vendorAPI = {
  getProfile: () => api.get('/api/vendor/me'),
  updateProfile: (data) => api.put('/api/vendor/me', data),
  getStatus: () => api.get('/api/vendor/status'),

  // Statistics and Reports - uses same endpoints as admin, but returns vendor-specific data
  getStatistics: () => api.get('/api/orders/statistics'),
  getSalesReport: (params) => api.get('/api/orders/sales-report', { params }),
};

// Product API
export const productAPI = {
  create: (data) => api.post('/api/product', data),
  getAll: () => api.get('/api/product/all'),
  getApproved: () => api.get('/api/product/approved'),
  getById: (id) => api.get(`/api/product/${id}`),
  update: (id, data) => api.put(`/api/product/${id}`, data),
  delete: (id) => api.delete(`/api/product/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/api/cart'),
  add: (data) => api.post('/api/cart', data),
  update: (itemId, data) => api.put(`/api/cart/${itemId}`, data),
  remove: (itemId) => api.delete(`/api/cart/${itemId}`),
  clear: () => api.delete('/api/cart'),
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/api/orders', data),
  getUserOrders: (params) => api.get('/api/orders', { params }),
  getOrderDetails: (orderId) => api.get(`/api/orders/${orderId}`),
  updateStatus: (orderId, data) => api.put(`/api/orders/${orderId}/status`, data),
  cancel: (orderId) => api.delete(`/api/orders/${orderId}/cancel`),
};

// Admin API
export const adminAPI = {
  // Vendors
  getUnapprovedVendors: () => api.get('/api/admin/vendors/unapproved'),
  approveVendor: (id) => api.put(`/api/admin/vendors/${id}/approve`),

  // Users
  createUser: (data) => api.post('/api/admin/create', data),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),

  // Orders - uses same endpoint as regular users, but returns all orders based on role
  getAllOrders: (params) => api.get('/api/orders', { params }),
  getStatistics: () => api.get('/api/orders/statistics'),
  getSalesReport: (params) => api.get('/api/orders/sales-report', { params }),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export default api;
