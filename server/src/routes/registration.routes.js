const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getEventParticipants,
  getAllRegistrations,
  removeParticipantRegistration,
  getRegistrationStats,
} = require('../controllers/registration.controller');

router.get('/my-events', authMiddleware, getMyEvents);
router.get('/event/:eventId', authMiddleware, getEventParticipants);
router.get('/stats', authMiddleware, getRegistrationStats);
router.get('/', authMiddleware, authorizeRoles('Admin'), getAllRegistrations);
router.post('/:eventId', authMiddleware, registerForEvent);
router.delete('/:eventId', authMiddleware, cancelRegistration);
router.delete('/event/:eventId/student/:studentId', authMiddleware, removeParticipantRegistration);

module.exports = router;
