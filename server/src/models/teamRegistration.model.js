const mongoose = require('mongoose');

const teamRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Approved', 'Rejected', 'Waitlisted'],
      default: 'Approved',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

teamRegistrationSchema.index({ event: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('TeamRegistration', teamRegistrationSchema);
