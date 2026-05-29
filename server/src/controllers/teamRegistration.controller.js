const Event = require('../models/event.model');
const Team = require('../models/team.model');
const TeamRegistration = require('../models/teamRegistration.model');
const { validateTeamRegistrationInput } = require('../utils/teamRegistration.validation');

const parseEventStart = (event) => {
  const [hours = '00', minutes = '00'] = String(event.startTime || '00:00').split(':');
  const start = new Date(event.date);
  start.setHours(Number(hours), Number(minutes), 0, 0);
  return start;
};

const canManageEvent = (req, event) => {
  if (req.user.role === 'Admin') return true;
  if (req.user.role === 'Coordinator' && String(event.createdBy) === String(req.user._id)) return true;
  return false;
};

const getRegisteredSeats = async (eventId) => {
  const registrations = await TeamRegistration.find({ event: eventId })
    .populate({ path: 'team', select: 'members' })
    .select('team');

  return registrations.reduce((sum, registration) => sum + (registration.team?.members?.length || 0), 0);
};

const registerTeamForEvent = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can register teams for events.' });
    }

    const eventId = req.params.eventId;
    const validationError = validateTeamRegistrationInput({ event: eventId, team: req.body.teamId });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.registrationType !== 'Team') {
      return res.status(400).json({ message: 'This event does not support team registration.' });
    }

    if (new Date() >= parseEventStart(event)) {
      return res.status(400).json({ message: 'Registration is closed because the event has started.' });
    }

    const team = await Team.findById(req.body.teamId).populate('members', '_id');
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    if (String(team.leader) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the team leader can register this team.' });
    }

    const teamSize = team.members.length;
    if (teamSize < (event.minTeamSize || 0) || teamSize > (event.maxTeamSize || Number.MAX_SAFE_INTEGER)) {
      return res.status(400).json({ message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}.` });
    }

    const existingRegistration = await TeamRegistration.findOne({ event: event._id, team: team._id });
    if (existingRegistration) {
      return res.status(409).json({ message: 'This team is already registered for the event.' });
    }

    const currentSeatsUsed = await getRegisteredSeats(event._id);
    if (currentSeatsUsed + teamSize > event.maxParticipants) {
      return res.status(400).json({ message: 'Event capacity exceeded for this team registration.' });
    }

    const registration = await TeamRegistration.create({
      event: event._id,
      team: team._id,
      registeredBy: req.user._id,
      status: 'Approved',
    });

    const populated = await TeamRegistration.findById(registration._id)
      .populate({ path: 'event', select: 'title registrationType minTeamSize maxTeamSize maxParticipants date startTime endTime venue' })
      .populate({ path: 'team', populate: { path: 'leader', select: 'name email role' } })
      .populate('registeredBy', 'name email role');

    return res.status(201).json({ message: 'Team registered successfully.', registration: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This team is already registered for the event.' });
    }

    return res.status(500).json({ message: 'Failed to register team for event.', error: error.message });
  }
};

const cancelTeamRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const teamId = req.body.teamId || req.query.teamId;
    if (!teamId) {
      return res.status(400).json({ message: 'teamId is required.' });
    }

    const registration = await TeamRegistration.findOne({ event: event._id, team: teamId }).populate('team');
    if (!registration) {
      return res.status(404).json({ message: 'Team registration not found.' });
    }

    const isLeader = String(registration.team.leader) === String(req.user._id);
    if (req.user.role !== 'Admin' && !isLeader) {
      return res.status(403).json({ message: 'Only the team leader can cancel this registration.' });
    }

    if (new Date() >= parseEventStart(event)) {
      return res.status(400).json({ message: 'Registration cannot be cancelled after the event starts.' });
    }

    await registration.deleteOne();
    return res.status(200).json({ message: 'Team registration cancelled successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to cancel team registration.', error: error.message });
  }
};

const getMyTeamRegistrations = async (req, res) => {
  try {
    const ledTeams = await Team.find({ leader: req.user._id }).select('_id');
    const teamIds = ledTeams.map((team) => team._id);

    const registrations = await TeamRegistration.find({
      $or: [{ registeredBy: req.user._id }, { team: { $in: teamIds } }],
    })
      .sort({ registeredAt: -1 })
      .populate({ path: 'event', select: 'title date startTime endTime venue registrationType maxParticipants minTeamSize maxTeamSize createdBy', populate: { path: 'createdBy', select: 'name email role' } })
      .populate({ path: 'team', populate: { path: 'leader', select: 'name email role' } })
      .populate('registeredBy', 'name email role');

    return res.status(200).json({ registrations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch team registrations.', error: error.message });
  }
};

const getEventTeams = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageEvent(req, event)) {
      return res.status(403).json({ message: 'You are not allowed to view these team registrations.' });
    }

    const registrations = await TeamRegistration.find({ event: event._id })
      .sort({ registeredAt: -1 })
      .populate({ path: 'team', populate: { path: 'leader', select: 'name email role' } })
      .populate('registeredBy', 'name email role');

    return res.status(200).json({ event, registrations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch event teams.', error: error.message });
  }
};

module.exports = {
  registerTeamForEvent,
  cancelTeamRegistration,
  getMyTeamRegistrations,
  getEventTeams,
};
