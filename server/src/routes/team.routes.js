const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const teamController = require('../controllers/team.controller');
const invitationController = require('../controllers/invitation.controller');

const router = express.Router();

router.post('/', authMiddleware, teamController.createTeam);
router.get('/my', authMiddleware, teamController.getMyTeams);
router.get('/:id', authMiddleware, teamController.getTeamById);
router.put('/:id', authMiddleware, teamController.updateTeam);
router.delete('/:id', authMiddleware, teamController.deleteTeam);
router.post('/:id/invitations', authMiddleware, teamController.inviteMember);
router.put('/:id/leader', authMiddleware, teamController.changeLeader);
router.get('/:teamId/invitations', authMiddleware, invitationController.getTeamInvitations);

module.exports = router;
