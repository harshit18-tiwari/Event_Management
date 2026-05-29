const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { requireJudgeRole } = require('../middleware/judge.middleware');
const evaluationController = require('../controllers/evaluation.controller');

const router = express.Router();

router.post('/', authMiddleware, requireJudgeRole, evaluationController.submitEvaluation);
router.put('/:id', authMiddleware, requireJudgeRole, evaluationController.updateEvaluation);
router.get('/event/:eventId', authMiddleware, evaluationController.getEventEvaluations);
router.get('/team/:teamId', authMiddleware, evaluationController.getTeamEvaluations);
router.get('/participant/:participantId', authMiddleware, evaluationController.getParticipantEvaluations);
router.get('/my', authMiddleware, requireJudgeRole, evaluationController.getMyEvaluations);

module.exports = router;
