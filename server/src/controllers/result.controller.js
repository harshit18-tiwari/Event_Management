const Event = require('../models/event.model');
const Leaderboard = require('../models/leaderboard.model');
const Result = require('../models/result.model');
const JudgeAssignment = require('../models/judgeAssignment.model');
const Team = require('../models/team.model');
const { issuePlacementCertificates } = require('../utils/winnerCertificates');
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

const buildPlacement = async (entry) => {
  if (entry.team) {
    const team = await Team.findById(entry.team).populate('members', 'name email department year role');
    return { kind: 'team', team };
  }

  const user = entry.participant
    ? await entry.populate('participant', 'name email department year role').then((doc) => doc.participant)
    : null;
  return { kind: 'user', user };
};

const declareWinners = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageEvent(req, event)) {
      return res.status(403).json({ message: 'You are not allowed to declare results for this event.' });
    }

    const leaderboard = await Leaderboard.find({ event: event._id })
      .sort({ rank: 1, finalScore: -1, _id: 1 })
      .populate('participant', 'name email department year role')
      .populate('team', 'name leader members');

    if (!leaderboard.length) {
      return res.status(400).json({ message: 'Generate the leaderboard before declaring winners.' });
    }

    const winner = leaderboard[0] || null;
    const runnerUp = leaderboard[1] || null;
    const secondRunnerUp = leaderboard[2] || null;

    const payload = {
      event: event._id,
      declaredBy: req.user._id,
      declaredAt: new Date(),
      winner: winner?.team || winner?.participant || null,
      winnerRefModel: winner?.team ? 'Team' : winner?.participant ? 'User' : 'Team',
      runnerUp: runnerUp?.team || runnerUp?.participant || null,
      runnerUpRefModel: runnerUp?.team ? 'Team' : runnerUp?.participant ? 'User' : 'Team',
      secondRunnerUp: secondRunnerUp?.team || secondRunnerUp?.participant || null,
      secondRunnerUpRefModel: secondRunnerUp?.team ? 'Team' : secondRunnerUp?.participant ? 'User' : 'Team',
    };

    const result = await Result.findOneAndUpdate(
      { event: event._id },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate('winner')
      .populate('runnerUp')
      .populate('secondRunnerUp')
      .populate('declaredBy', 'name email role');

    const createdCertificates = [];

    const winnerPlacement = winner?.team
      ? { kind: 'team', team: await Team.findById(winner.team).populate('members', 'name email department year role') }
      : winner?.participant
        ? { kind: 'user', user: winner.participant }
        : null;
    const runnerUpPlacement = runnerUp?.team
      ? { kind: 'team', team: await Team.findById(runnerUp.team).populate('members', 'name email department year role') }
      : runnerUp?.participant
        ? { kind: 'user', user: runnerUp.participant }
        : null;
    const secondRunnerUpPlacement = secondRunnerUp?.team
      ? { kind: 'team', team: await Team.findById(secondRunnerUp.team).populate('members', 'name email department year role') }
      : secondRunnerUp?.participant
        ? { kind: 'user', user: secondRunnerUp.participant }
        : null;

    createdCertificates.push(...await issuePlacementCertificates({ event, certificateType: 'Winner', placement: winnerPlacement }));
    createdCertificates.push(...await issuePlacementCertificates({ event, certificateType: 'Runner-Up', placement: runnerUpPlacement }));
    createdCertificates.push(...await issuePlacementCertificates({ event, certificateType: 'Second Runner-Up', placement: secondRunnerUpPlacement }));

    broadcast('results-updated', { eventId: event._id, result });

    return res.status(200).json({
      message: 'Results declared successfully.',
      result,
      createdCertificates,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to declare winners.', error: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!(await canViewEvent(req, event))) {
      return res.status(403).json({ message: 'You are not allowed to view these results.' });
    }

    const result = await Result.findOne({ event: event._id })
      .populate('winner')
      .populate('runnerUp')
      .populate('secondRunnerUp')
      .populate('declaredBy', 'name email role');

    return res.status(200).json({ event, result });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch results.', error: error.message });
  }
};

const getPublicResults = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const result = await Result.findOne({ event: event._id })
      .populate('winner')
      .populate('runnerUp')
      .populate('secondRunnerUp')
      .populate('declaredBy', 'name email role');

    return res.status(200).json({ event, result });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch public results.', error: error.message });
  }
};

module.exports = {
  declareWinners,
  getResults,
  getPublicResults,
};