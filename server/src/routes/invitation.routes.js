const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const invitationController = require('../controllers/invitation.controller');

const router = express.Router();

router.get('/my', authMiddleware, invitationController.getMyInvitations);
router.patch('/:id/accept', authMiddleware, invitationController.acceptInvitation);
router.patch('/:id/reject', authMiddleware, invitationController.rejectInvitation);

module.exports = router;
