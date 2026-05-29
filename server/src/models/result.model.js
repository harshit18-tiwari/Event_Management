const mongoose = require('mongoose');

const createPlacementField = (refPath) => ({
  type: mongoose.Schema.Types.ObjectId,
  refPath,
  default: null,
});

const resultSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true,
    },
    winner: createPlacementField('winnerRefModel'),
    winnerRefModel: {
      type: String,
      enum: ['Team', 'User'],
      default: 'Team',
    },
    runnerUp: createPlacementField('runnerUpRefModel'),
    runnerUpRefModel: {
      type: String,
      enum: ['Team', 'User'],
      default: 'Team',
    },
    secondRunnerUp: createPlacementField('secondRunnerUpRefModel'),
    secondRunnerUpRefModel: {
      type: String,
      enum: ['Team', 'User'],
      default: 'Team',
    },
    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    declaredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);