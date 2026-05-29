const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    scores: [
      {
        criteria: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'EvaluationCriteria',
          required: true,
        },
        marks: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalMarks: {
      type: Number,
      default: 0,
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

evaluationSchema.index(
  { event: 1, judge: 1, team: 1, participant: 1 },
  { unique: true, partialFilterExpression: { $or: [{ team: { $type: 'objectId' } }, { participant: { $type: 'objectId' } }] } }
);

module.exports = mongoose.model('Evaluation', evaluationSchema);
