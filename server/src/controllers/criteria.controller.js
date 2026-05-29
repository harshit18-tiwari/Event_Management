const Event = require('../models/event.model');
const EvaluationCriteria = require('../models/evaluationCriteria.model');

const canManageCriteria = (req, event) => {
  if (req.user.role === 'Admin') return true;
  return req.user.role === 'Coordinator' && String(event.createdBy) === String(req.user._id);
};

const createCriteria = async (req, res) => {
  try {
    const { eventId, title, description, maxMarks } = req.body;
    if (!eventId || !title || !maxMarks) {
      return res.status(400).json({ message: 'eventId, title, and maxMarks are required.' });
    }

    const marks = Number(maxMarks);
    if (!Number.isFinite(marks) || marks <= 0) {
      return res.status(400).json({ message: 'maxMarks must be greater than 0.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageCriteria(req, event)) {
      return res.status(403).json({ message: 'You are not allowed to manage criteria for this event.' });
    }

    const criteria = await EvaluationCriteria.create({
      event: event._id,
      title: title.trim(),
      description: description || '',
      maxMarks: marks,
    });

    return res.status(201).json({ criteria });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create criteria.', error: error.message });
  }
};

const getEventCriteria = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const criteria = await EvaluationCriteria.find({ event: event._id }).sort({ createdAt: 1 });
    const totalMarks = criteria.reduce((sum, criterion) => sum + criterion.maxMarks, 0);

    return res.status(200).json({ criteria, totalMarks, event });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch criteria.', error: error.message });
  }
};

const updateCriteria = async (req, res) => {
  try {
    const criteria = await EvaluationCriteria.findById(req.params.id).populate('event');
    if (!criteria) {
      return res.status(404).json({ message: 'Criteria not found.' });
    }

    if (!canManageCriteria(req, criteria.event)) {
      return res.status(403).json({ message: 'You are not allowed to update this criteria.' });
    }

    if (req.body.title !== undefined) criteria.title = req.body.title.trim();
    if (req.body.description !== undefined) criteria.description = req.body.description;
    if (req.body.maxMarks !== undefined) {
      const marks = Number(req.body.maxMarks);
      if (!Number.isFinite(marks) || marks <= 0) {
        return res.status(400).json({ message: 'maxMarks must be greater than 0.' });
      }
      criteria.maxMarks = marks;
    }

    await criteria.save();
    return res.status(200).json({ criteria });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update criteria.', error: error.message });
  }
};

const deleteCriteria = async (req, res) => {
  try {
    const criteria = await EvaluationCriteria.findById(req.params.id).populate('event');
    if (!criteria) {
      return res.status(404).json({ message: 'Criteria not found.' });
    }

    if (!canManageCriteria(req, criteria.event)) {
      return res.status(403).json({ message: 'You are not allowed to delete this criteria.' });
    }

    await criteria.deleteOne();
    return res.status(200).json({ message: 'Criteria deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete criteria.', error: error.message });
  }
};

module.exports = {
  createCriteria,
  getEventCriteria,
  updateCriteria,
  deleteCriteria,
};
