const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
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
    certificateId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    certificateType: {
      type: String,
      enum: ['Participation', 'Winner', 'Runner-Up', 'Second Runner-Up', 'Volunteer'],
      default: 'Participation',
    },
    certificateUrl: {
      type: String,
      default: '',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1, event: 1, certificateType: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;