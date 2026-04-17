import api from './axios';

export const boardService = {
  getAll: async () => {
    const response = await api.get('/boards/');
    return response.data;
  },

  create: async (boardData) => {
    const response = await api.post('/boards/', boardData);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  update: async (id, boardData) => {
    const response = await api.patch(`/boards/${id}`, boardData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/boards/${id}`);
    return response.data;
  }
};
