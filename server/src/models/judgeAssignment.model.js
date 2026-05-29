const mongoose = require('mongoose');

const judgeAssignmentSchema = new mongoose.Schema(
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
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

judgeAssignmentSchema.index({ event: 1, judge: 1 }, { unique: true });

module.exports = mongoose.model('JudgeAssignment', judgeAssignmentSchema);
