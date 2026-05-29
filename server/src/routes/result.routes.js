const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const resultController = require('../controllers/result.controller');

const router = express.Router();

router.post('/:eventId', authMiddleware, authorizeRoles('Admin', 'Coordinator'), resultController.declareWinners);
router.get('/:eventId', authMiddleware, resultController.getResults);
router.get('/public/:eventId', resultController.getPublicResults);

module.exports = router;