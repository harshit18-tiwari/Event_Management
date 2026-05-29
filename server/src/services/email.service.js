const nodemailer = require('nodemailer');
const { renderTemplate } = require('../utils/emailTemplates');

const TRANSPORTER = (function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // fallback: ethereal (development)
  return null;
})();

async function sendMail({ to, subject, html }) {
  if (!TRANSPORTER) {
    console.warn('SMTP transporter not configured. Skipping email send to', to);
    return null;
  }

  const info = await TRANSPORTER.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@college.edu',
    to,
    subject,
    html,
  });

  return info;
}

async function sendTemplate(templateName, to, vars = {}, subjectOverride) {
  const html = renderTemplate(templateName, vars);
  const subject = subjectOverride || vars.subject || 'Notification from College Events';
  return sendMail({ to, subject, html });
}

module.exports = {
  sendMail,
  sendTemplate,
};
