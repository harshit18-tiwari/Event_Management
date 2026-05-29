const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxMembers: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
  },
  { timestamps: true }
);

TeamSchema.index({ name: 1, leader: 1 }, { unique: true });

module.exports = mongoose.model('Team', TeamSchema);
