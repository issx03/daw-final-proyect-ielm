import api from './axios';

export const listService = {
  getAll: async () => {
    const response = await api.get('/lists/');
    return response.data;
  },

  create: async (listData) => {
    const response = await api.post('/lists/', listData);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/lists/${id}`);
    return response.data;
  },

  update: async (id, listData) => {
    const response = await api.put(`/lists/${id}`, listData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/lists/${id}`);
    return response.data;
  }
};

export default listService;
