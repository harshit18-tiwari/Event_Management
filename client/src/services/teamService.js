import api from './api';

const createTeam = (payload) => api.post('/teams', payload);
const getMyTeams = () => api.get('/teams/my');
const getTeamById = (id) => api.get(`/teams/${id}`);
const updateTeam = (id, payload) => api.put(`/teams/${id}`, payload);
const deleteTeam = (id) => api.delete(`/teams/${id}`);
const inviteMember = (teamId, payload) => api.post(`/teams/${teamId}/invitations`, payload);
const changeLeader = (teamId, payload) => api.put(`/teams/${teamId}/leader`, payload);
const getTeamInvitations = (teamId) => api.get(`/teams/${teamId}/invitations`);

const getMyInvitations = () => api.get('/invitations/my');
const acceptInvitation = (id) => api.patch(`/invitations/${id}/accept`);
const rejectInvitation = (id) => api.patch(`/invitations/${id}/reject`);

export default {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  changeLeader,
  getTeamInvitations,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
};
