const Invitation = require('../models/invitation.model');
const Team = require('../models/team.model');
const { createNotification } = require('../services/notification.service');

const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ invitedUser: req.user._id })
      .sort({ createdAt: -1 })
      .populate([
        { path: 'team', select: 'name leader members maxMembers', populate: { path: 'leader', select: 'name email role' } },
        { path: 'invitedUser', select: 'name email role department year' },
      ]);

    return res.status(200).json({ invitations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch invitations.', error: error.message });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate('team');
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found.' });
    }

    if (String(invitation.invitedUser) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot accept this invitation.' });
    }

    if (invitation.status !== 'Pending') {
      return res.status(400).json({ message: `Invitation has already been ${invitation.status.toLowerCase()}.` });
    }

    const team = await Team.findById(invitation.team._id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'Team is already full.' });
    }

    if (!team.members.some((memberId) => String(memberId) === String(req.user._id))) {
      team.members.push(req.user._id);
      await team.save();
    }

    invitation.status = 'Accepted';
    await invitation.save();

    await createNotification({
      recipient: team.leader,
      title: `Invitation Accepted: ${team.name}`,
      message: `${req.user.name} accepted the invitation to join "${team.name}".`,
      type: 'announcement',
    });

    return res.status(200).json({ message: 'Invitation accepted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to accept invitation.', error: error.message });
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate('team');
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found.' });
    }

    if (String(invitation.invitedUser) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot reject this invitation.' });
    }

    if (invitation.status !== 'Pending') {
      return res.status(400).json({ message: `Invitation has already been ${invitation.status.toLowerCase()}.` });
    }

    invitation.status = 'Rejected';
    await invitation.save();

    await createNotification({
      recipient: invitation.team.leader,
      title: `Invitation Rejected: ${invitation.team.name}`,
      message: `${req.user.name} rejected the invitation to join "${invitation.team.name}".`,
      type: 'announcement',
    });

    return res.status(200).json({ message: 'Invitation rejected successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reject invitation.', error: error.message });
  }
};

const getTeamInvitations = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const isLeader = String(team.leader) === String(req.user._id);
    if (!isLeader && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You cannot view these invitations.' });
    }

    const invitations = await Invitation.find({ team: team._id })
      .sort({ createdAt: -1 })
      .populate('invitedUser', 'name email role department year');

    return res.status(200).json({ invitations });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch team invitations.', error: error.message });
  }
};

module.exports = {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  getTeamInvitations,
};
