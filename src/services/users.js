import api from './api';

export const usersService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data.users || response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  deleteUser: async (userId) => {
    await api.delete(`/users/${userId}`);
  },
}; 