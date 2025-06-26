import api from './api';

const locationService = {
  // Get all locations
  getAllLocations: async () => {
    try {
      const response = await api.get('/locations');
      return response.data.locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  // Get a single location
  getLocation: async (id) => {
    try {
      const response = await api.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  },

  // Create a new location
  createLocation: async (locationData) => {
    try {
      const response = await api.post('/locations', {
        location: locationData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },

  // Update a location
  updateLocation: async (id, locationData) => {
    try {
      const response = await api.patch(`/locations/${id}`, {
        location: locationData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  // Delete a location
  deleteLocation: async (id) => {
    try {
      await api.delete(`/locations/${id}`);
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
};

export default locationService; 