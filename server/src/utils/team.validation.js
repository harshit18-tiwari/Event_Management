const validateTeamInput = (body) => {
  if (!body?.name || !body?.name.trim()) {
    return 'Team name is required.';
  }

  const maxMembers = Number(body.maxMembers);
  if (!Number.isInteger(maxMembers) || maxMembers < 1) {
    return 'Max members must be a positive integer.';
  }

  return null;
};

module.exports = {
  validateTeamInput,
};
