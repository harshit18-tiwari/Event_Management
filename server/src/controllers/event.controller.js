const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const User = require('../models/user.model');
const { createNotifications } = require('../services/notification.service');

const validateEventInput = (body) => {
  const required = ['title','description','category','venue','date','startTime','endTime','organizer','maxParticipants'];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) return `Missing fields: ${missing.join(', ')}`;
  return null;
};

const getEventStats = async (eventIds, userId = null) => {
  const registrations = await Registration.find({ event: { $in: eventIds } }).select('event student status');

  return eventIds.reduce((accumulator, eventId) => {
    const eventRegistrations = registrations.filter((registration) => registration.event.toString() === eventId.toString());
    const approvedCount = eventRegistrations.filter((registration) => registration.status === 'Approved').length;
    const waitlistedCount = eventRegistrations.filter((registration) => registration.status === 'Waitlisted').length;
    const myRegistration = userId
      ? eventRegistrations.find((registration) => registration.student.toString() === userId.toString()) || null
      : null;

    accumulator[eventId.toString()] = {
      registeredCount: approvedCount,
      waitlistedCount,
      availableSeats: 0,
      myRegistration,
    };

    return accumulator;
  }, {});
};

const enrichEventsWithStats = async (events, userId = null) => {
  const statsMap = await getEventStats(events.map((event) => event._id), userId);

  return events.map((event) => {
    const stats = statsMap[event._id.toString()] || {
      registeredCount: 0,
      waitlistedCount: 0,
      availableSeats: event.maxParticipants,
      myRegistration: null,
    };

    return {
      ...event.toObject(),
      ...stats,
      availableSeats: Math.max(event.maxParticipants - stats.registeredCount, 0),
      isRegistrationOpen: new Date() < new Date(`${event.date.toISOString().slice(0, 10)}T${event.startTime || '00:00'}:00`),
    };
  });
};

const createEvent = async (req, res) => {
  try {
    const errMsg = validateEventInput(req.body);
    if (errMsg) return res.status(400).json({ message: errMsg });

    const payload = {
      ...req.body,
      createdBy: req.user._id,
    };

    const event = await Event.create(payload);
    const populated = await event.populate('createdBy', 'name email role');

    const students = await User.find({ role: 'Student' }).select('_id name email');
    await createNotifications(
      students.map((student) => student._id),
      {
        title: `New Event: ${event.title}`,
        message: `A new event "${event.title}" has been created and is now available for registration.`,
        type: 'announcement',
      }
    );

    return res.status(201).json({ event: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Create event failed', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).populate('createdBy', 'name email role');
    const enrichedEvents = await enrichEventsWithStats(events, req.user?._id || null);
    return res.status(200).json({ events: enrichedEvents });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email role');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const enriched = await enrichEventsWithStats([event], req.user?._id || null);
    return res.status(200).json({ event: enriched[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Authorization: Admin can edit any event, Coordinator can edit only own
    if (req.user.role === 'Student') return res.status(403).json({ message: 'Forbidden' });

    if (req.user.role === 'Coordinator' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the owner of this event' });
    }

    Object.keys(req.body).forEach((key) => {
      if (key === 'createdBy') return;
      event[key] = req.body[key];
    });

    await event.save();
    const populated = await Event.findById(event._id).populate('createdBy', 'name email role');
    const enriched = await enrichEventsWithStats([populated], req.user?._id || null);

    const participants = await Registration.find({ event: event._id }).select('student');
    await createNotifications(
      participants.map((registration) => registration.student),
      {
        title: `Event Updated: ${event.title}`,
        message: `The event "${event.title}" has updated details. Please review the latest information.`,
        type: 'announcement',
      }
    );

    return res.status(200).json({ event: enriched[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (req.user.role === 'Student') return res.status(403).json({ message: 'Forbidden' });

    if (req.user.role === 'Coordinator' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the owner of this event' });
    }

    await event.remove();
    return res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
