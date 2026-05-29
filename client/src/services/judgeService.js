import api from './api';

const assignJudge = (payload) => api.post('/judges/assign', payload);
const removeJudge = (assignmentId) => api.delete(`/judges/remove/${assignmentId}`);
const getAssignedJudges = (eventId) => api.get(`/judges/event/${eventId}`);
const getMyAssignedEvents = () => api.get('/judges/my-events');
const getAvailableJudges = () => api.get('/judges/list');

export default {
  assignJudge,
  removeJudge,
  getAssignedJudges,
  getMyAssignedEvents,
  getAvailableJudges,
};
