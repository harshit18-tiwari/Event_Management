const Team = require('../models/team.model');
const Invitation = require('../models/invitation.model');
const User = require('../models/user.model');
const { validateTeamInput } = require('../utils/team.validation');
const { createNotification } = require('../services/notification.service');

const canManageTeam = (req, team) => {
  if (!req.user) return false;
  if (req.user.role === 'Admin') return true;
  return String(team.leader) === String(req.user._id);
};

const buildTeamPopulate = () => [
  { path: 'leader', select: 'name email role department year' },
  { path: 'members', select: 'name email role department year' },
];

const createTeam = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can create teams.' });
    }

    const validationError = validateTeamInput(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const team = await Team.create({
      name: req.body.name.trim(),
      leader: req.user._id,
      members: [req.user._id],
      maxMembers: Number(req.body.maxMembers),
    });

    const populated = await Team.findById(team._id).populate(buildTeamPopulate());
    return res.status(201).json({ team: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A team with the same name already exists for this leader.' });
    }

    return res.status(500).json({ message: 'Failed to create team.', error: error.message });
  }
};

const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [{ leader: req.user._id }, { members: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate(buildTeamPopulate());

    return res.status(200).json({ teams });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your teams.', error: error.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate(buildTeamPopulate());
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const isMember = team.members.some((member) => String(member._id || member) === String(req.user._id));
    if (!isMember && !canManageTeam(req, team)) {
      return res.status(403).json({ message: 'You are not allowed to view this team.' });
    }

    return res.status(200).json({ team });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch team details.', error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    if (!canManageTeam(req, team)) {
      return res.status(403).json({ message: 'You are not allowed to update this team.' });
    }

    if (req.body.name !== undefined) {
      if (!req.body.name.trim()) {
        return res.status(400).json({ message: 'Team name is required.' });
      }
      team.name = req.body.name.trim();
    }

    if (req.body.maxMembers !== undefined) {
      const maxMembers = Number(req.body.maxMembers);
      if (!Number.isInteger(maxMembers) || maxMembers < team.members.length) {
        return res.status(400).json({ message: 'Max members cannot be lower than the current member count.' });
      }
      team.maxMembers = maxMembers;
    }

    await team.save();
    const populated = await Team.findById(team._id).populate(buildTeamPopulate());
    return res.status(200).json({ team: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update team.', error: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    if (!canManageTeam(req, team)) {
      return res.status(403).json({ message: 'You are not allowed to delete this team.' });
    }

    await Invitation.deleteMany({ team: team._id });
    await team.deleteOne();
    return res.status(200).json({ message: 'Team deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete team.', error: error.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    if (!canManageTeam(req, team)) {
      return res.status(403).json({ message: 'You are not allowed to invite members to this team.' });
    }

    const invitedUserId = req.body.invitedUserId || req.body.invitedUser;
    const invitedEmail = req.body.invitedEmail;

    let invitedUser = null;
    if (invitedUserId) {
      invitedUser = await User.findById(invitedUserId);
    } else if (invitedEmail) {
      invitedUser = await User.findOne({ email: invitedEmail.toLowerCase() });
    }

    if (!invitedUser) {
      return res.status(404).json({ message: 'User to invite was not found.' });
    }

    const alreadyMember = team.members.some((memberId) => String(memberId) === String(invitedUser._id));
    if (alreadyMember) {
      return res.status(409).json({ message: 'User is already a member of this team.' });
    }

    const existingInvitation = await Invitation.findOne({ team: team._id, invitedUser: invitedUser._id });
    if (existingInvitation && existingInvitation.status === 'Pending') {
      return res.status(409).json({ message: 'Invitation is already pending for this user.' });
    }

    const invitation = await Invitation.findOneAndUpdate(
      { team: team._id, invitedUser: invitedUser._id },
      { team: team._id, invitedUser: invitedUser._id, status: 'Pending' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate([
      { path: 'team', select: 'name leader members maxMembers' },
      { path: 'invitedUser', select: 'name email role department year' },
    ]);

    await createNotification({
      recipient: invitedUser._id,
      title: `Team Invitation: ${team.name}`,
      message: `You have been invited to join the team "${team.name}".`,
      type: 'announcement',
    });

    return res.status(201).json({ invitation });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send invitation.', error: error.message });
  }
};

const changeLeader = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    if (!canManageTeam(req, team)) {
      return res.status(403).json({ message: 'You are not allowed to change the leader.' });
    }

    const newLeaderId = req.body.newLeaderId;
    if (!newLeaderId) {
      return res.status(400).json({ message: 'newLeaderId is required.' });
    }

    const isMember = team.members.some((memberId) => String(memberId) === String(newLeaderId));
    if (!isMember) {
      return res.status(400).json({ message: 'New leader must already be a team member.' });
    }

    team.leader = newLeaderId;
    await team.save();

    const populated = await Team.findById(team._id).populate(buildTeamPopulate());
    return res.status(200).json({ team: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update team leader.', error: error.message });
  }
};

module.exports = {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  changeLeader,
};
