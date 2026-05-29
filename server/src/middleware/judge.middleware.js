const JudgeAssignment = require('../models/judgeAssignment.model');

const requireJudgeRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'Judge') {
    return res.status(403).json({ message: 'Judge access required.' });
  }

  return next();
};

const ensureAssignedJudge = async (req, res, next) => {
  try {
    const { eventId, teamId, participantId } = req.body;
    const event = eventId || req.params.eventId;

    if (!event) {
      return res.status(400).json({ message: 'Event is required.' });
    }

    const assignment = await JudgeAssignment.findOne({ event, judge: req.user._id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this event.' });
    }

    req.judgeAssignment = assignment;
    req.judgeEvaluationTarget = { eventId: String(event), teamId: teamId || null, participantId: participantId || null };
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Judge authorization failed.', error: error.message });
  }
};

module.exports = {
  requireJudgeRole,
  ensureAssignedJudge,
};
