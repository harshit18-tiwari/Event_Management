import api from './api';

const createCriteria = (payload) => api.post('/criteria', {
  ...payload,
  eventId: payload.eventId || payload.event,
});
const getEventCriteria = (eventId) => api.get(`/criteria/event/${eventId}`);
const updateCriteria = (id, payload) => api.put(`/criteria/${id}`, payload);
const deleteCriteria = (id) => api.delete(`/criteria/${id}`);

export default {
  createCriteria,
  getEventCriteria,
  updateCriteria,
  deleteCriteria,
};
