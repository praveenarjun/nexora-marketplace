import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Products
export const getProducts = (params) => api.get('/v1/products', { params });
export const getProduct = (id) => api.get(`/v1/products/${id}`);
export const filterProducts = (params) => api.get('/v1/products/filter', { params });
export const getFeaturedProducts = () => api.get('/v1/products/featured');
export const updateProductStatus = (id, status) =>
  api.patch(`/v1/products/${id}/status`, null, { params: { status } });

// Categories
export const getCategories = () => api.get('/v1/categories');

// Orders
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const placeOrder = (data) => api.post('/orders', data);
export const cancelOrder = (id) => api.post(`/orders/${id}/cancel`);

// User
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);

// Inventory
export const getInventory = (productId) => api.get(`/inventory/${productId}`);
export const restockProduct = (data) => api.post('/inventory/restock', data);
export const getLowStockProducts = () => api.get('/v1/products/low-stock');

export default api;
