const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { requireJudgeRole } = require('../middleware/judge.middleware');
const judgeController = require('../controllers/judge.controller');

const router = express.Router();

router.post('/assign', authMiddleware, authorizeRoles('Admin', 'Coordinator'), judgeController.assignJudge);
router.delete('/remove/:assignmentId', authMiddleware, authorizeRoles('Admin', 'Coordinator'), judgeController.removeJudge);
router.get('/list', authMiddleware, authorizeRoles('Admin', 'Coordinator'), judgeController.getAvailableJudges);
router.get('/event/:eventId', authMiddleware, judgeController.getAssignedJudges);
router.get('/my-events', authMiddleware, requireJudgeRole, judgeController.getMyAssignedEvents);

module.exports = router;
