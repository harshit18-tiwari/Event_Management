import api from './api';

const submitEvaluation = (payload) => api.post('/evaluations', payload);
const updateEvaluation = (id, payload) => api.put(`/evaluations/${id}`, payload);
const getEventEvaluations = (eventId) => api.get(`/evaluations/event/${eventId}`);
const getTeamEvaluations = (teamId) => api.get(`/evaluations/team/${teamId}`);
const getParticipantEvaluations = (participantId) => api.get(`/evaluations/participant/${participantId}`);
const getMyEvaluations = () => api.get('/evaluations/my');

export default {
  submitEvaluation,
  updateEvaluation,
  getEventEvaluations,
  getTeamEvaluations,
  getParticipantEvaluations,
  getMyEvaluations,
};
