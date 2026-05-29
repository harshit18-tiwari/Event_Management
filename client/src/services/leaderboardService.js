import api from './api';

const generateLeaderboard = (eventId) => api.post(`/leaderboard/generate/${eventId}`);
const getLeaderboard = (eventId) => api.get(`/leaderboard/${eventId}`);
const getPublicLeaderboard = (eventId) => api.get(`/leaderboard/public/${eventId}`);

export default {
  generateLeaderboard,
  getLeaderboard,
  getPublicLeaderboard,
};