import api from './api';

// Dashboard
export const getDashboardStats = () => api.get('/admin/stats');

// Customers
export const getCustomers = (search = '') =>
  api.get('/admin/customers', { params: search ? { search } : {} });

export const getCustomerById = (id) => api.get(`/admin/customers/${id}`);

export const deleteCustomer = (id) => api.delete(`/admin/customers/${id}`);

// Orders (admin — with search/filter)
export const getAllAdminOrders = (params = {}) => api.get('/admin/orders', { params });

// Order status update (reuses existing order service route)
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);

// Order delete/archive
export const deleteAdminOrder = (id) => api.delete(`/admin/orders/${id}`);
