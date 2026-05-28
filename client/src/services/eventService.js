import api from './api';

const createEvent = (payload) => api.post('/events', payload);
const getAllEvents = (params) => api.get('/events', { params });
const getEventById = (id) => api.get(`/events/${id}`);
const updateEvent = (id, payload) => api.put(`/events/${id}`, payload);
const deleteEvent = (id) => api.delete(`/events/${id}`);

export default {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
