const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');

const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

// All event routes require authentication to view/manage
router.get('/', authMiddleware, getAllEvents);
router.get('/:id', authMiddleware, getEventById);

router.post('/', authMiddleware, authorizeRoles('Admin', 'Coordinator'), createEvent);

router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;
