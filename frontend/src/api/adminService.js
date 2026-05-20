import api from './axios';

const adminService = {
  getUsers: () => api.get('/users/').then((r) => r.data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  blockUser: (id) => api.patch(`/users/${id}/block`).then((r) => r.data),
  unblockUser: (id) => api.patch(`/users/${id}/unblock`).then((r) => r.data),
};

export default adminService;
