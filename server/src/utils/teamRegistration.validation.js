const validateTeamRegistrationInput = ({ event, team }) => {
  if (!event) {
    return 'Event is required.';
  }

  if (!team) {
    return 'Team is required.';
  }

  return null;
};

module.exports = {
  validateTeamRegistrationInput,
};
