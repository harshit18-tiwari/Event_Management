const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const teamRegistrationController = require('../controllers/teamRegistration.controller');

const router = express.Router();

router.get('/my', authMiddleware, teamRegistrationController.getMyTeamRegistrations);
router.get('/event/:eventId', authMiddleware, teamRegistrationController.getEventTeams);
router.post('/register/:eventId', authMiddleware, teamRegistrationController.registerTeamForEvent);
router.delete('/cancel/:eventId', authMiddleware, teamRegistrationController.cancelTeamRegistration);

module.exports = router;
