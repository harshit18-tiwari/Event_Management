const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const leaderboardController = require('../controllers/leaderboard.controller');

const router = express.Router();

router.post('/generate/:eventId', authMiddleware, authorizeRoles('Admin', 'Coordinator'), leaderboardController.generateLeaderboard);
router.get('/:eventId', authMiddleware, leaderboardController.getLeaderboard);
router.get('/public/:eventId', leaderboardController.getPublicLeaderboard);

module.exports = router;