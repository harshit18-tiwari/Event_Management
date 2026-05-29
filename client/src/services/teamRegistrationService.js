import api from './api';

const registerTeamForEvent = (eventId, payload) => api.post(`/team-registrations/register/${eventId}`, payload);
const cancelTeamRegistration = (eventId, payload) => api.delete(`/team-registrations/cancel/${eventId}`, { data: payload });
const getMyTeamRegistrations = () => api.get('/team-registrations/my');
const getEventTeams = (eventId) => api.get(`/team-registrations/event/${eventId}`);

export default {
  registerTeamForEvent,
  cancelTeamRegistration,
  getMyTeamRegistrations,
  getEventTeams,
};
