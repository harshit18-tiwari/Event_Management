const Notification = require('../models/notification.model');
const { emitToUser } = require('../socket/socket');

async function createNotification({ recipient, title, message, type }) {
  const n = await Notification.create({ recipient, title, message, type });

  // try to deliver in realtime
  try {
    emitToUser(String(recipient), 'notification', n);
  } catch (err) {
    // ignore
  }

  return n;
}

async function createNotifications(recipients, payload) {
  const created = [];

  for (const recipient of recipients) {
    if (!recipient) continue;
    created.push(await createNotification({ recipient, ...payload }));
  }

  return created;
}

module.exports = { createNotification, createNotifications };
