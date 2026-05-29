import { io } from 'socket.io-client';

let socket;

export function initSocket(user) {
  if (!user) return null;
  if (socket) return socket;

  const url = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '') : 'http://localhost:5000';
  socket = io(url, { query: { userId: user._id } });

  socket.on('connect', () => {
    console.log('Socket connected', socket.id);
  });

  socket.on('notification', (payload) => {
    // emit a window event so components can listen
    window.dispatchEvent(new CustomEvent('notification-received', { detail: payload }));
  });

  socket.on('leaderboard-updated', (payload) => {
    window.dispatchEvent(new CustomEvent('leaderboard-updated', { detail: payload }));
  });

  socket.on('results-updated', (payload) => {
    window.dispatchEvent(new CustomEvent('results-updated', { detail: payload }));
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
