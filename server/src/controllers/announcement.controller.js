const Announcement = require('../models/announcement.model');
const User = require('../models/user.model');
const Registration = require('../models/registration.model');
const { createNotification } = require('../services/notification.service');

async function createAnnouncement(req, res) {
  const { title, content, event, targetAudience } = req.body;
  const createdBy = req.user._id;

  const a = await Announcement.create({ title, content, event, targetAudience, createdBy });

  // create notifications for audience
  let recipients = [];
  if (targetAudience === 'All') {
    recipients = await User.find({ role: 'student' }).select('_id');
  } else if (targetAudience === 'Participants' && event) {
    const regs = await Registration.find({ event }).select('student');
    recipients = regs.map(r => ({ _id: r.student }));
  }

  // bulk create notifications (fire-and-forget)
  for (const r of recipients) {
    try {
      await createNotification({ recipient: r._id, title, message: content, type: 'announcement' });
    } catch (err) {
      // ignore
    }
  }

  res.status(201).json(a);
}

async function getAnnouncements(req, res) {
  const q = Announcement.find().sort({ createdAt: -1 }).limit(100).populate('createdBy', 'name email');
  const items = await q.exec();
  res.json(items);
}

async function getAnnouncementById(req, res) {
  const a = await Announcement.findById(req.params.id).populate('createdBy', 'name email');
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
}

async function updateAnnouncement(req, res) {
  const id = req.params.id;
  const a = await Announcement.findById(id);
  if (!a) return res.status(404).json({ message: 'Not found' });

  // only author or admin can update
  if (String(a.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  a.title = req.body.title || a.title;
  a.content = req.body.content || a.content;
  a.targetAudience = req.body.targetAudience || a.targetAudience;
  await a.save();
  res.json(a);
}

async function deleteAnnouncement(req, res) {
  const id = req.params.id;
  const a = await Announcement.findById(id);
  if (!a) return res.status(404).json({ message: 'Not found' });
  if (String(a.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await a.remove();
  res.json({ success: true });
}

module.exports = { createAnnouncement, getAnnouncements, getAnnouncementById, updateAnnouncement, deleteAnnouncement };
