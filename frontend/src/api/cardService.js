import api from './axios';

export const cardService = {
  getAll: async () => {
    const response = await api.get('/cards/');
    return response.data;
  },

  create: async (cardData) => {
    const response = await api.post('/cards/', cardData);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  update: async (id, cardData) => {
    const response = await api.put(`/cards/${id}`, cardData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  }
};

export default cardService;
