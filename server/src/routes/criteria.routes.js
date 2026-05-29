const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const criteriaController = require('../controllers/criteria.controller');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('Admin', 'Coordinator'), criteriaController.createCriteria);
router.get('/event/:eventId', authMiddleware, criteriaController.getEventCriteria);
router.put('/:id', authMiddleware, authorizeRoles('Admin', 'Coordinator'), criteriaController.updateCriteria);
router.delete('/:id', authMiddleware, authorizeRoles('Admin', 'Coordinator'), criteriaController.deleteCriteria);

module.exports = router;
