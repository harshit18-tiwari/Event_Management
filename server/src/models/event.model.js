const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'],
    },
    venue: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    organizer: { type: String, required: true, trim: true },
    poster: { type: String, default: '' },
    registrationType: {
      type: String,
      enum: ['Individual', 'Team'],
      default: 'Individual',
    },
    minTeamSize: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxTeamSize: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxParticipants: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
