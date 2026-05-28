import api from './api';

const getAuthStats = () => api.get('/auth/stats');

export default {
  getAuthStats,
};
