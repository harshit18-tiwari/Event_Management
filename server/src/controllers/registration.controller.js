const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const User = require('../models/user.model');
const JudgeAssignment = require('../models/judgeAssignment.model');
const { createNotifications } = require('../services/notification.service');
const jwt = require('jsonwebtoken');

const parseEventStart = (event) => {
  const [hours = '00', minutes = '00'] = String(event.startTime || '00:00').split(':');
  const start = new Date(event.date);
  start.setHours(Number(hours), Number(minutes), 0, 0);
  return start;
};

const buildQrToken = (registration) => {
  return jwt.sign(
    {
      studentId: registration.student.toString(),
      eventId: registration.event.toString(),
      registrationId: registration._id.toString(),
    },
    process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.QR_TOKEN_EXPIRES_IN || '365d',
    }
  );
};

const getApprovedCount = async (eventId) => {
  return Registration.countDocuments({ event: eventId, status: 'Approved' });
};

const registerForEvent = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can register for events.' });
    }

    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.registrationType === 'Team') {
      return res.status(400).json({ message: 'This event requires team registration.' });
    }

    const registrationStart = parseEventStart(event);
    if (new Date() >= registrationStart) {
      return res.status(400).json({ message: 'Registration is closed because the event has started.' });
    }

    const existingRegistration = await Registration.findOne({ student: req.user._id, event: eventId });
    if (existingRegistration) {
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    const approvedCount = await getApprovedCount(eventId);
    const isFull = approvedCount >= event.maxParticipants;
    const status = isFull ? 'Waitlisted' : 'Approved';

    const registration = await Registration.create({
      student: req.user._id,
      event: eventId,
      status,
    });

    registration.qrToken = buildQrToken(registration);
    await registration.save();

    const staffRecipients = await User.find({ role: { $in: ['Admin', 'Coordinator'] } }).select('_id');
    await createNotifications(
      staffRecipients.map((user) => user._id),
      {
        title: 'New Student Registration',
        message: `${req.user.name} registered for ${event.title}.`,
        type: 'registration',
      }
    );

    const populated = await Registration.findById(registration._id)
      .populate('student', 'name email department year role')
      .populate('event', 'title category venue date startTime endTime organizer maxParticipants createdBy');

    return res.status(201).json({
      message: status === 'Waitlisted' ? 'Event is full. You have been added to the waitlist.' : 'Registered successfully.',
      registration: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    return res.status(500).json({ message: 'Failed to register for event.', error: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can cancel their registration.' });
    }

    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (new Date() >= parseEventStart(event)) {
      return res.status(400).json({ message: 'Registration cannot be cancelled after the event starts.' });
    }

    const registration = await Registration.findOne({ student: req.user._id, event: eventId });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    await registration.deleteOne();

    return res.status(200).json({ message: 'Registration cancelled successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to cancel registration.', error: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can access this page.' });
    }

    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email role' },
      })
      .sort({ registeredAt: -1 });

    return res.status(200).json({ registrations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your events.', error: error.message });
  }
};

const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const isAdmin = req.user.role === 'Admin';
    const isOwner = req.user.role === 'Coordinator' && event.createdBy.toString() === req.user._id.toString();
    const isAssignedJudge = req.user.role === 'Judge' && await JudgeAssignment.exists({ event: event._id, judge: req.user._id });

    if (!isAdmin && !isOwner && !isAssignedJudge) {
      return res.status(403).json({ message: 'You are not allowed to view these participants.' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email department year role')
      .sort({ registeredAt: -1 });

    const approvedCount = registrations.filter((registration) => registration.status === 'Approved').length;
    const availableSeats = Math.max(event.maxParticipants - approvedCount, 0);

    return res.status(200).json({
      event,
      registrations,
      stats: {
        totalRegistrations: registrations.length,
        approvedCount,
        waitlistedCount: registrations.filter((registration) => registration.status === 'Waitlisted').length,
        availableSeats,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch participants.', error: error.message });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const registrations = await Registration.find()
      .populate('student', 'name email department year role')
      .populate('event', 'title category venue date startTime endTime organizer maxParticipants createdBy')
      .populate('event.createdBy', 'name email role')
      .sort({ registeredAt: -1 });

    return res.status(200).json({ registrations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch registrations.', error: error.message });
  }
};

const removeParticipantRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const isAdmin = req.user.role === 'Admin';
    const isOwner = req.user.role === 'Coordinator' && event.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You are not allowed to manage this registration.' });
    }

    const registration = await Registration.findOne({ event: req.params.eventId, student: req.params.studentId });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    await registration.deleteOne();
    return res.status(200).json({ message: 'Registration removed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove registration.', error: error.message });
  }
};

const getRegistrationStats = async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    return res.status(200).json({ totalRegistrations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch registration statistics.', error: error.message });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getEventParticipants,
  getAllRegistrations,
  removeParticipantRegistration,
  getRegistrationStats,
  buildQrToken,
};
