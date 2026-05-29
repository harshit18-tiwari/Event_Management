import api from './api';

export function getNotifications() {
  return api.get('/notifications');
}

export function markAsRead(id) {
  return api.patch(`/notifications/${id}/read`);
}

export function markAllAsRead() {
  return api.patch('/notifications/read-all');
}

export function getUnreadCount() {
  return api.get('/notifications/unread-count');
}
