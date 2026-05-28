const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Waitlisted'],
      default: 'Approved',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    qrToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    attendanceStatus: {
      type: Boolean,
      default: false,
    },
    attendanceMarkedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

registrationSchema.index({ student: 1, event: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
