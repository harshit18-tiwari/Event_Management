let io;
const userSockets = new Map(); // userId -> Set(socketId)

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId || null;
    if (userId) {
      const set = userSockets.get(userId) || new Set();
      set.add(socket.id);
      userSockets.set(userId, set);
    }

    socket.on('disconnect', () => {
      if (!userId) return;
      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(userId);
      }
    });
  });

  console.log('Socket.io initialized');
}

function emitToUser(userId, event, payload) {
  if (!io) return;
  const set = userSockets.get(String(userId));
  if (!set) return;
  for (const socketId of set) {
    io.to(socketId).emit(event, payload);
  }
}

function broadcast(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

module.exports = { initSocket, emitToUser, broadcast };
