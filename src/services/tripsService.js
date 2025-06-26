import api from './api';

const tripsService = {
  // Get all trips
  getTrips: async () => {
    try {
      const response = await api.get('/trips');
      return response.data.trips;
    } catch (error) {
      throw error;
    }
  },

  // Get a single trip
  getTrip: async (id) => {
    try {
      const response = await api.get(`/trips/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new trip
  createTrip: async (tripData) => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a trip
  updateTrip: async (id, tripData) => {
    try {
      const response = await api.put(`/trips/${id}`, tripData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a trip
  deleteTrip: async (id) => {
    try {
      const response = await api.delete(`/trips/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Propose trips for confirmation
  proposeTrips: async (orderIds) => {
    try {
      const response = await api.post('/trips/propose', { order_ids: orderIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Confirm selected trips
  confirmTrips: async (tripIds) => {
    try {
      const response = await api.post('/trips/confirm', { confirmed_trip_ids: tripIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default tripsService; 