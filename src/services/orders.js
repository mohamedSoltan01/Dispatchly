import api from './api';

export const ordersService = {
  // Get all orders with optional filters
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get a single order by ID
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Create multiple orders
  bulkCreateOrders: async (ordersData) => {
    const response = await api.post('/orders/bulk_create', ordersData);
    return response.data;
  },

  // Update an order
  updateOrder: async (id, orderData) => {
    const response = await api.patch(`/orders/${id}`, orderData);
    return response.data;
  },

  // Delete an order
  deleteOrder: async (id) => {
    await api.delete(`/orders/${id}`);
  },

  // Get order status
  getOrderStatus: async (id) => {
    const response = await api.get(`/orders/${id}/status`);
    return response.data;
  }
}; 