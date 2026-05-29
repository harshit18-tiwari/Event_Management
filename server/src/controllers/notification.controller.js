const Notification = require('../models/notification.model');

async function getNotifications(req, res) {
  const userId = req.user._id;
  const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
}

async function markAsRead(req, res) {
  const userId = req.user._id;
  const id = req.params.id;
  const n = await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { isRead: true }, { new: true });
  if (!n) return res.status(404).json({ message: 'Notification not found' });
  res.json(n);
}

async function markAllAsRead(req, res) {
  const userId = req.user._id;
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  res.json({ success: true });
}

async function getUnreadCount(req, res) {
  const userId = req.user._id;
  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  res.json({ count });
}

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount };
