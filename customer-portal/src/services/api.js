import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create API instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login/json', credentials);
export const getCurrentUser = () => api.get('/auth/me');
export const updateProfile = (userData) => api.put('/auth/me', userData);

// Admin functions
export const getAllUsers = () => api.get('/auth/admin/users');
export const createAdminUser = (userData) => api.post('/auth/admin/users', userData);
export const updateUserRole = (userId, role) => api.put(`/auth/admin/users/${userId}/role`, { role });
export const deactivateUser = (userId) => api.delete(`/auth/admin/users/${userId}`);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Inventory
export const getInventory = () => api.get('/inventory');
export const getInventoryCounts = () => api.get('/inventory/counts');
export const createInventoryItem = (data) => api.post('/inventory', data);
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`);

// Customers
export const getCustomers = () => api.get('/customers');
export const getMyCustomerProfile = () => api.get('/customers/me');
export const updateMyCustomerProfile = (data) => api.put('/customers/me', data);
export const createCustomer = (data) => api.post('/customers', data);

// Orders
export const getOrders = () => api.get('/orders');
export const getMyOrders = () => api.get('/orders/my');
export const createOrder = (data) => api.post('/orders', data);
export const updateOrderStatus = (orderId, status) => api.post(`/orders/${orderId}/status/${status}`);
export const getOrder = (orderId) => api.get(`/orders/${orderId}`);

// Payments
export const createPayment = (data) => api.post('/payments', data);
export const getPayments = () => api.get('/payments');

// Availability
export const getAvailableItems = (productId, start, end) =>
  api.get(`/availability/products/${productId}?start=${start}&end=${end}`);
export const getQuote = (data) => api.post('/availability/quote', data);

// Reports
export const getUpcomingReservations = (start, end) =>
  api.get(`/reports/upcoming-reservations?start=${start}&end=${end}`);
export const getUtilization = (start, end) =>
  api.get(`/reports/utilization?start=${start}&end=${end}`);

export default api;