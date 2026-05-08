import api from './axios';

export const userService = {
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateMe: async (userData) => {
    const response = await api.patch('/auth/me', userData);
    return response.data;
  }
};

export default userService;
