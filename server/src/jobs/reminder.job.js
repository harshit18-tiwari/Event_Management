const cron = require('node-cron');
const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const User = require('../models/user.model');
const { sendTemplate } = require('../services/email.service');
const { createNotification } = require('../services/notification.service');

// Simple reminder job that runs every 30 minutes and sends reminders for events
function startReminders() {
  // runs every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const now = new Date();
      const in7daysStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const in7daysEnd = new Date(in7daysStart.getTime() + 60 * 60 * 1000);

      const in1dayStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in1dayEnd = new Date(in1dayStart.getTime() + 60 * 60 * 1000);

      const in1hourStart = new Date(now.getTime() + 60 * 60 * 1000);
      const in1hourEnd = new Date(in1hourStart.getTime() + 60 * 60 * 1000);

      const checks = [
        { start: in7daysStart, end: in7daysEnd, type: '7 days' },
        { start: in1dayStart, end: in1dayEnd, type: '1 day' },
        { start: in1hourStart, end: in1hourEnd, type: '1 hour' },
      ];

      for (const chk of checks) {
        const events = await Event.find({ startDate: { $gte: chk.start, $lt: chk.end } });
        for (const ev of events) {
          // find participants
          const regs = await Registration.find({ event: ev._id }).populate('student');
          for (const r of regs) {
            const user = r.student;
            const vars = { name: user.name, eventName: ev.title, eventDate: ev.startDate };
            // email
            try {
              await sendTemplate('reminder', user.email, vars, `Reminder: ${ev.title} - ${chk.type}`);
            } catch (err) {
              // ignore
            }

            try {
              await createNotification({ recipient: user._id, title: `Reminder: ${ev.title}`, message: `Event starts ${chk.type}`, type: 'reminder' });
            } catch (err) {
              // ignore
            }
          }
        }
      }
    } catch (err) {
      console.error('Reminder job error', err);
    }
  });

  console.log('Reminder cron job scheduled');
}

module.exports = { startReminders };
