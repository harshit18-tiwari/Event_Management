function renderTemplate(name, vars = {}) {
  const collegeName = process.env.COLLEGE_NAME || 'College';
  switch (name) {
    case 'registration':
      return `
        <h2>${collegeName} - Registration Confirmation</h2>
        <p>Hi ${vars.name || 'Student'},</p>
        <p>You have successfully registered for <strong>${vars.eventName}</strong> on ${vars.eventDate}.</p>
        <p>See event details and reach out to organizers if needed.</p>
      `;
    case 'reminder':
      return `
        <h2>${collegeName} - Event Reminder</h2>
        <p>Hi ${vars.name || 'Student'},</p>
        <p>This is a reminder for <strong>${vars.eventName}</strong> starting at ${vars.eventDate}.</p>
      `;
    case 'attendance':
      return `
        <h2>${collegeName} - Attendance Confirmed</h2>
        <p>Hi ${vars.name || 'Student'},</p>
        <p>Your attendance for <strong>${vars.eventName}</strong> has been recorded.</p>
      `;
    case 'certificate':
      return `
        <h2>${collegeName} - Certificate Available</h2>
        <p>Hi ${vars.name || 'Student'},</p>
        <p>Your certificate for <strong>${vars.eventName}</strong> is now available. <a href="${vars.certificateUrl}">Download it here</a>.</p>
      `;
    case 'eventUpdate':
      return `
        <h2>${collegeName} - Event Update</h2>
        <p>Hi ${vars.name || 'Student'},</p>
        <p>The event <strong>${vars.eventName}</strong> has updated details: ${vars.updateText}</p>
      `;
    default:
      return `<p>${vars.message || ''}</p>`;
  }
}

module.exports = { renderTemplate };
