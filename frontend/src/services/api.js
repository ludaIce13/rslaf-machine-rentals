import axios from 'axios';

// Prefer REACT_APP_API_URL (as set in Render), fallback to REACT_APP_API_BASE, then localhost
const API_BASE =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8000';

// Create API instance
const apiInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests if available
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const register = (userData) => apiInstance.post('/auth/register', userData);
export const login = (credentials) => {
  // Use URLSearchParams for application/x-www-form-urlencoded
  const params = new URLSearchParams();
  params.append('username', credentials.email || credentials.username);
  params.append('password', credentials.password);

  return axios.post(`${API_BASE}/auth/login`, params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
export const getCurrentUser = () => apiInstance.get('/auth/me');
export const updateProfile = (userData) => apiInstance.put('/auth/me', userData);

// Admin functions
export const getAllUsers = () => apiInstance.get('/auth/admin/users');
export const createAdminUser = (userData) => apiInstance.post('/auth/admin/users', userData);
export const updateUserRole = (userId, role) => apiInstance.put(`/auth/admin/users/${userId}/role`, { role });
export const deactivateUser = (userId) => apiInstance.delete(`/auth/admin/users/${userId}`);

// Products
export const getProducts = (params) => apiInstance.get('/products', { params });
export const createProduct = (data) => apiInstance.post('/products', data);
export const updateProduct = (id, data) => apiInstance.put(`/products/${id}`, data);
export const deleteProduct = (id) => apiInstance.delete(`/products/${id}`);
export const getCategories = () => apiInstance.get('/products/categories');
export const uploadProductImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  const token = localStorage.getItem('token');
  const apiKey = process.env.REACT_APP_API_KEY; // must match SMARTRENTALS_API_KEY on backend
  return axios.post(`${API_BASE}/products/upload-image`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { 'X-API-Key': apiKey } : {})
    }
  });
};

// Inventory
export const getInventory = (params) => apiInstance.get('/inventory', { params });
export const getInventoryByProduct = (productId) => apiInstance.get('/inventory', { params: { product_id: productId } });
export const createInventoryItem = (data) => apiInstance.post('/inventory', data);
export const updateInventoryItem = (id, data) => apiInstance.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => apiInstance.delete(`/inventory/${id}`);
export const getInventoryCounts = () => apiInstance.get('/inventory/counts');

// Customers
export const getCustomers = () => apiInstance.get('/customers');
export const getMyCustomerProfile = () => apiInstance.get('/customers/me');
export const updateMyCustomerProfile = (data) => apiInstance.put('/customers/me', data);
export const createCustomer = (data) => apiInstance.post('/customers', data);

// Orders
export const getOrders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('No authentication token found. Please log in.'));
  }
  return apiInstance.get('/orders', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
export const getMyOrders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('No authentication token found. Please log in.'));
  }
  return apiInstance.get('/orders/my', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
export const createOrder = (data) => apiInstance.post('/orders', data);
export const updateOrderStatus = (orderId, status) => apiInstance.post(`/orders/${orderId}/status/${status}`);
export const getOrder = (orderId) => apiInstance.get(`/orders/${orderId}`);

// Payments
export const createPayment = (data) => apiInstance.post('/payments', data);
export const getPayments = () => apiInstance.get('/payments');

// Availability
export const getAvailableItems = (productId, start, end) =>
  apiInstance.get(`/availability/products/${productId}?start=${start}&end=${end}`);
export const getQuote = (data) => apiInstance.post('/availability/quote', data);

// Reports
export const getUpcomingReservations = (start, end) =>
  apiInstance.get(`/reports/upcoming-reservations?start=${start}&end=${end}`);
export const getUtilization = (start, end) =>
  apiInstance.get(`/reports/utilization?start=${start}&end=${end}`);

// Export as named export for component imports
export const api = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getCustomers,
  getMyCustomerProfile,
  updateMyCustomerProfile,
  createCustomer,
  getOrders,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  getOrder,
  createPayment,
  getPayments,
  getAvailableItems,
  getQuote,
  getUpcomingReservations,
  getUtilization,
  login,
  register,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  createAdminUser,
  updateUserRole,
  deactivateUser
};

export default apiInstance;
