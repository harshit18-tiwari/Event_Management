const Event = require('../models/event.model');
const Evaluation = require('../models/evaluation.model');
const Leaderboard = require('../models/leaderboard.model');
const JudgeAssignment = require('../models/judgeAssignment.model');
const Team = require('../models/team.model');
const { broadcast } = require('../socket/socket');

const canManageEvent = (req, event) => {
  if (req.user.role === 'Admin') return true;
  return req.user.role === 'Coordinator' && String(event.createdBy) === String(req.user._id);
};

const canViewEvent = async (req, event) => {
  if (req.user.role === 'Admin' || req.user.role === 'Coordinator') {
    return canManageEvent(req, event);
  }

  if (req.user.role !== 'Judge') {
    return false;
  }

  return Boolean(await JudgeAssignment.exists({ event: event._id, judge: req.user._id }));
};

const resolveLeaderboardTarget = (event, entry) => {
  if (event.registrationType === 'Team') {
    return {
      team: entry.team._id,
      participant: null,
      label: entry.team.name,
      kind: 'team',
    };
  }

  return {
    team: null,
    participant: entry.participant._id,
    label: entry.participant.name,
    kind: 'user',
  };
};

const aggregateScores = (evaluations, event) => {
  const groups = new Map();

  for (const evaluation of evaluations) {
    const target = event.registrationType === 'Team' ? evaluation.team : evaluation.participant;
    if (!target) {
      continue;
    }

    const targetId = String(target._id);
    const current = groups.get(targetId) || {
      target,
      totalScore: 0,
      count: 0,
    };

    current.totalScore += Number(evaluation.totalMarks || 0);
    current.count += 1;
    groups.set(targetId, current);
  }

  const rows = [...groups.values()].map((group) => ({
    ...group,
    finalScore: group.count === 0 ? 0 : Number((group.totalScore / group.count).toFixed(2)),
  }));

  rows.sort((left, right) => {
    if (right.finalScore !== left.finalScore) {
      return right.finalScore - left.finalScore;
    }

    const leftLabel = event.registrationType === 'Team' ? left.target.name : left.target.name;
    const rightLabel = event.registrationType === 'Team' ? right.target.name : right.target.name;
    return String(leftLabel).localeCompare(String(rightLabel));
  });

  let rank = 0;
  let previousScore = null;

  return rows.map((row, index) => {
    if (previousScore === null || row.finalScore !== previousScore) {
      rank = index + 1;
      previousScore = row.finalScore;
    }

    const resolved = resolveLeaderboardTarget(event, row.target);
    return {
      ...resolved,
      finalScore: row.finalScore,
      rank,
    };
  });
};

const generateLeaderboard = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageEvent(req, event)) {
      return res.status(403).json({ message: 'You are not allowed to generate this leaderboard.' });
    }

    const evaluations = await Evaluation.find({ event: event._id })
      .populate('team', 'name members leader')
      .populate('participant', 'name email department year role');

    if (!evaluations.length) {
      return res.status(400).json({ message: 'No evaluations found for this event.' });
    }

    const ranking = aggregateScores(evaluations, event);
    if (!ranking.length) {
      return res.status(400).json({ message: 'No ranked entries could be generated.' });
    }

    await Leaderboard.deleteMany({ event: event._id });
    const documents = await Leaderboard.insertMany(
      ranking.map((entry) => ({
        event: event._id,
        participant: entry.participant,
        team: entry.team,
        finalScore: entry.finalScore,
        rank: entry.rank,
      }))
    );

    const leaderboard = await Leaderboard.find({ event: event._id })
      .sort({ rank: 1, finalScore: -1, _id: 1 })
      .populate('participant', 'name email department year role')
      .populate('team', 'name leader members');

    broadcast('leaderboard-updated', { eventId: event._id, leaderboard });

    return res.status(201).json({
      message: 'Leaderboard generated successfully.',
      leaderboard,
      generatedCount: documents.length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate leaderboard.', error: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!(await canViewEvent(req, event))) {
      return res.status(403).json({ message: 'You are not allowed to view this leaderboard.' });
    }

    const leaderboard = await Leaderboard.find({ event: event._id })
      .sort({ rank: 1, finalScore: -1, _id: 1 })
      .populate('participant', 'name email department year role')
      .populate('team', 'name leader members');

    return res.status(200).json({ event, leaderboard });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch leaderboard.', error: error.message });
  }
};

const getPublicLeaderboard = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const leaderboard = await Leaderboard.find({ event: event._id })
      .sort({ rank: 1, finalScore: -1, _id: 1 })
      .populate('participant', 'name email department year role')
      .populate('team', 'name leader members');

    return res.status(200).json({ event, leaderboard });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch public leaderboard.', error: error.message });
  }
};

module.exports = {
  generateLeaderboard,
  getLeaderboard,
  getPublicLeaderboard,
};