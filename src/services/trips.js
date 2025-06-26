import api from './api';

export const tripsService = {
  // Get all trips with optional filters
  getTrips: async (params = {}) => {
    const response = await api.get('/trips', { params });
    return response.data;
  },

  // Get a single trip by ID
  getTrip: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  // Create a new trip
  createTrip: async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },

  // Update a trip
  updateTrip: async (id, tripData) => {
    const response = await api.patch(`/trips/${id}`, tripData);
    return response.data;
  },

  // Delete a trip
  deleteTrip: async (id) => {
    await api.delete(`/trips/${id}`);
  },

  // Complete a trip
  completeTrip: async (id) => {
    const response = await api.post(`/trips/${id}/complete`);
    return response.data;
  },

  // Start a trip
  startTrip: async (id) => {
    const response = await api.post(`/trips/${id}/start`);
    return response.data;
  },

  // Optimize a trip
  optimizeTrip: async (id) => {
    const response = await api.post(`/trips/${id}/optimize`);
    return response.data;
  },

  // Get trip status
  getTripStatus: async (id) => {
    const response = await api.get(`/trips/${id}/status`);
    return response.data;
  }
}; 