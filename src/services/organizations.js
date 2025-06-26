import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api/v1";

export const organizationsService = {
  async getOrganizations() {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async createOrganization(orgData) {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_BASE_URL}/organizations`, orgData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateOrganization(id, orgData) {
    const token = localStorage.getItem("token");
    const response = await axios.patch(`${API_BASE_URL}/organizations/${id}`, orgData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async deleteOrganization(id) {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_BASE_URL}/organizations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getOrganization(id) {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/organizations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
}; 