import api from './api';

export function createAnnouncement(payload) {
  return api.post('/announcements', payload);
}

export function getAnnouncements() {
  return api.get('/announcements');
}

export function getAnnouncement(id) {
  return api.get(`/announcements/${id}`);
}

export function updateAnnouncement(id, payload) {
  return api.put(`/announcements/${id}`, payload);
}

export function deleteAnnouncement(id) {
  return api.delete(`/announcements/${id}`);
}
