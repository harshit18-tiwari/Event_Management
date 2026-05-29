const JudgeAssignment = require('../models/judgeAssignment.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');

const canManageJudgeAssignments = (req, event) => {
  if (req.user.role === 'Admin') return true;
  return req.user.role === 'Coordinator' && String(event.createdBy) === String(req.user._id);
};

const assignJudge = async (req, res) => {
  try {
    const { eventId, judgeId } = req.body;
    if (!eventId || !judgeId) {
      return res.status(400).json({ message: 'eventId and judgeId are required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageJudgeAssignments(req, event)) {
      return res.status(403).json({ message: 'You are not allowed to assign judges for this event.' });
    }

    const judgeUser = await User.findById(judgeId);
    if (!judgeUser || judgeUser.role !== 'Judge') {
      return res.status(400).json({ message: 'Selected user must have the Judge role.' });
    }

    const existingAssignment = await JudgeAssignment.findOne({ event: event._id, judge: judgeUser._id });
    if (existingAssignment) {
      return res.status(409).json({ message: 'Judge is already assigned to this event.' });
    }

    const assignment = await JudgeAssignment.create({
      event: event._id,
      judge: judgeUser._id,
      assignedBy: req.user._id,
    });

    const populated = await JudgeAssignment.findById(assignment._id)
      .populate('event', 'title date startTime endTime venue registrationType')
      .populate('judge', 'name email role department year')
      .populate('assignedBy', 'name email role');

    return res.status(201).json({ assignment: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to assign judge.', error: error.message });
  }
};

const removeJudge = async (req, res) => {
  try {
    const assignment = await JudgeAssignment.findById(req.params.assignmentId).populate('event');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    if (!canManageJudgeAssignments(req, assignment.event)) {
      return res.status(403).json({ message: 'You are not allowed to remove this judge assignment.' });
    }

    await assignment.deleteOne();
    return res.status(200).json({ message: 'Judge assignment removed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove judge.', error: error.message });
  }
};

const getAssignedJudges = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageJudgeAssignments(req, event) && req.user.role !== 'Judge') {
      return res.status(403).json({ message: 'You are not allowed to view assigned judges.' });
    }

    const assignments = await JudgeAssignment.find({ event: event._id })
      .sort({ createdAt: -1 })
      .populate('judge', 'name email role department year')
      .populate('assignedBy', 'name email role');

    return res.status(200).json({ assignments });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch assigned judges.', error: error.message });
  }
};

const getMyAssignedEvents = async (req, res) => {
  try {
    const assignments = await JudgeAssignment.find({ judge: req.user._id })
      .sort({ createdAt: -1 })
      .populate('event', 'title date startTime endTime venue category registrationType minTeamSize maxTeamSize createdBy')
      .populate('assignedBy', 'name email role');

    return res.status(200).json({ assignments });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch assigned events.', error: error.message });
  }
};

const getAvailableJudges = async (req, res) => {
  try {
    if (!['Admin', 'Coordinator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not allowed to view judges.' });
    }

    const judges = await User.find({ role: 'Judge' })
      .select('name email role department year createdAt')
      .sort({ name: 1 });

    return res.status(200).json({ judges });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch judges.', error: error.message });
  }
};

module.exports = {
  assignJudge,
  removeJudge,
  getAssignedJudges,
  getMyAssignedEvents,
  getAvailableJudges,
};
