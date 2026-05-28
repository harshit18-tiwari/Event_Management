import api from './api';

const registerForEvent = (eventId) => api.post(`/registrations/${eventId}`);
const cancelRegistration = (eventId) => api.delete(`/registrations/${eventId}`);
const getMyEvents = () => api.get('/registrations/my-events');
const getEventParticipants = (eventId) => api.get(`/registrations/event/${eventId}`);
const getAllRegistrations = () => api.get('/registrations');
const getRegistrationStats = () => api.get('/registrations/stats');
const removeParticipantRegistration = (eventId, studentId) => api.delete(`/registrations/event/${eventId}/student/${studentId}`);

export default {
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getEventParticipants,
  getAllRegistrations,
  getRegistrationStats,
  removeParticipantRegistration,
};
