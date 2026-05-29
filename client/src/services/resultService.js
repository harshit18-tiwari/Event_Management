import api from './api';

const declareWinners = (eventId) => api.post(`/results/${eventId}`);
const getResults = (eventId) => api.get(`/results/${eventId}`);
const getPublicResults = (eventId) => api.get(`/results/public/${eventId}`);

export default {
  declareWinners,
  getResults,
  getPublicResults,
};