import api from './api';

export const vehiclesService = {
  // Get all vehicles with optional filters
  getVehicles: async (params = {}) => {
    try {
      const response = await api.get('/vehicles', { params });
      return response.data.vehicles;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch vehicles');
    }
  },

  // Get a single vehicle by ID
  getVehicle: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch vehicle');
    }
  },

  // Create a new vehicle
  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw new Error(error.response?.data?.error || 'Failed to create vehicle');
    }
  },

  // Update a vehicle
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await api.patch(`/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw new Error(error.response?.data?.error || 'Failed to update vehicle');
    }
  },

  // Delete a vehicle
  deleteVehicle: async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete vehicle');
    }
  },

  // Get vehicle location
  getVehicleLocation: async (id) => {
    const response = await api.get(`/vehicles/${id}/location`);
    return response.data;
  },

  // Update vehicle location
  updateVehicleLocation: async (id, locationId) => {
    try {
      const response = await api.patch(`/vehicles/${id}`, {
        vehicle: { current_location_id: locationId }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle location:', error);
      throw new Error(error.response?.data?.error || 'Failed to update vehicle location');
    }
  }
}; 