const Event = require('../models/event.model');
const TeamRegistration = require('../models/teamRegistration.model');
const Team = require('../models/team.model');
const Registration = require('../models/registration.model');
const JudgeAssignment = require('../models/judgeAssignment.model');
const EvaluationCriteria = require('../models/evaluationCriteria.model');
const Evaluation = require('../models/evaluation.model');

const canAccessEventEvaluations = (req, event) => {
  if (req.user.role === 'Admin') return true;
  return req.user.role === 'Coordinator' && String(event.createdBy) === String(req.user._id);
};

const isAssignedJudgeForEvent = async (eventId, judgeId) => {
  return Boolean(await JudgeAssignment.exists({ event: eventId, judge: judgeId }));
};

const resolveTarget = async ({ eventId, teamId, participantId }) => {
  if (teamId) {
    const team = await Team.findById(teamId);
    if (!team) return { error: 'Team not found.' };
    return { team };
  }

  if (participantId) {
    const participant = await Registration.findOne({ event: eventId, student: participantId }).populate('student');
    if (!participant) return { error: 'Participant registration not found.' };
    return { participant: participant.student };
  }

  return { error: 'Either teamId or participantId is required.' };
};

const submitEvaluation = async (req, res) => {
  try {
    const { eventId, teamId, participantId, scores = [], comments = '' } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'eventId is required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const assignment = await JudgeAssignment.findOne({ event: event._id, judge: req.user._id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to evaluate this event.' });
    }

    const criteriaList = await EvaluationCriteria.find({ event: event._id });
    if (!criteriaList.length) {
      return res.status(400).json({ message: 'Please create evaluation criteria before submitting evaluations.' });
    }

    const target = await resolveTarget({ eventId, teamId, participantId });
    if (target.error) {
      return res.status(400).json({ message: target.error });
    }

    if (event.registrationType === 'Team' && !teamId) {
      return res.status(400).json({ message: 'This event requires team evaluation.' });
    }

    if (event.registrationType !== 'Team' && !participantId) {
      return res.status(400).json({ message: 'This event requires participant evaluation.' });
    }

    const duplicateQuery = {
      event: event._id,
      judge: req.user._id,
      team: teamId || null,
      participant: participantId || null,
    };

    const existingEvaluation = await Evaluation.findOne(duplicateQuery);
    if (existingEvaluation) {
      return res.status(409).json({ message: 'You have already evaluated this target.' });
    }

    const criteriaMap = new Map(criteriaList.map((criterion) => [String(criterion._id), criterion]));
    const normalizedScores = scores.map((entry) => {
      const criterion = criteriaMap.get(String(entry.criteria));
      if (!criterion) {
        throw new Error('Invalid criteria selected.');
      }

      const marks = Number(entry.marks);
      if (!Number.isFinite(marks) || marks < 0 || marks > criterion.maxMarks) {
        throw new Error(`Marks for ${criterion.title} must be between 0 and ${criterion.maxMarks}.`);
      }

      return {
        criteria: criterion._id,
        marks,
      };
    });

    const totalMarks = normalizedScores.reduce((sum, score) => sum + score.marks, 0);

    const evaluation = await Evaluation.create({
      event: event._id,
      judge: req.user._id,
      team: teamId || null,
      participant: participantId || null,
      scores: normalizedScores,
      totalMarks,
      comments,
    });

    const populated = await Evaluation.findById(evaluation._id)
      .populate('judge', 'name email role')
      .populate('event', 'title registrationType')
      .populate('team', 'name leader members')
      .populate('participant', 'name email department year role')
      .populate('scores.criteria', 'title maxMarks');

    return res.status(201).json({ evaluation: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit evaluation.', error: error.message });
  }
};

const updateEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id).populate('event');
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found.' });
    }

    if (String(evaluation.judge) !== String(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You are not allowed to update this evaluation.' });
    }

    const criteriaList = await EvaluationCriteria.find({ event: evaluation.event._id });
    const criteriaMap = new Map(criteriaList.map((criterion) => [String(criterion._id), criterion]));

    if (req.body.scores) {
      const normalizedScores = req.body.scores.map((entry) => {
        const criterion = criteriaMap.get(String(entry.criteria));
        if (!criterion) {
          throw new Error('Invalid criteria selected.');
        }

        const marks = Number(entry.marks);
        if (!Number.isFinite(marks) || marks < 0 || marks > criterion.maxMarks) {
          throw new Error(`Marks for ${criterion.title} must be between 0 and ${criterion.maxMarks}.`);
        }

        return { criteria: criterion._id, marks };
      });

      evaluation.scores = normalizedScores;
      evaluation.totalMarks = normalizedScores.reduce((sum, score) => sum + score.marks, 0);
    }

    if (req.body.comments !== undefined) {
      evaluation.comments = req.body.comments;
    }

    await evaluation.save();
    const populated = await Evaluation.findById(evaluation._id)
      .populate('judge', 'name email role')
      .populate('event', 'title registrationType')
      .populate('team', 'name leader members')
      .populate('participant', 'name email department year role')
      .populate('scores.criteria', 'title maxMarks');

    return res.status(200).json({ evaluation: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update evaluation.', error: error.message });
  }
};

const getEventEvaluations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const assignedJudge = req.user.role === 'Judge' && await isAssignedJudgeForEvent(event._id, req.user._id);
    if (!canAccessEventEvaluations(req, event) && !assignedJudge) {
      return res.status(403).json({ message: 'You are not allowed to view evaluations for this event.' });
    }

    const evaluations = await Evaluation.find({ event: event._id })
      .sort({ createdAt: -1 })
      .populate('judge', 'name email role')
      .populate('team', 'name leader members')
      .populate('participant', 'name email department year role')
      .populate('scores.criteria', 'title maxMarks');

    return res.status(200).json({ evaluations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch evaluations.', error: error.message });
  }
};

const getTeamEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ team: req.params.teamId })
      .sort({ createdAt: -1 })
      .populate('judge', 'name email role')
      .populate('event', 'title registrationType')
      .populate('scores.criteria', 'title maxMarks');

    return res.status(200).json({ evaluations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch team evaluations.', error: error.message });
  }
};

const getParticipantEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ participant: req.params.participantId })
      .sort({ createdAt: -1 })
      .populate('judge', 'name email role')
      .populate('event', 'title registrationType')
      .populate('scores.criteria', 'title maxMarks');

    return res.status(200).json({ evaluations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch participant evaluations.', error: error.message });
  }
};

const getMyEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ judge: req.user._id })
      .sort({ createdAt: -1 })
      .populate('event', 'title registrationType')
      .populate('team', 'name leader members')
      .populate('participant', 'name email department year role')
      .populate('scores.criteria', 'title maxMarks');

    return res.status(200).json({ evaluations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your evaluations.', error: error.message });
  }
};

module.exports = {
  submitEvaluation,
  updateEvaluation,
  getEventEvaluations,
  getTeamEvaluations,
  getParticipantEvaluations,
  getMyEvaluations,
};
