const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    finalScore: {
      type: Number,
      required: true,
      default: 0,
    },
    rank: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

leaderboardSchema.index({ event: 1, rank: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);