const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
  generateCertificates,
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
  getEventCertificates,
  getAllCertificates,
} = require('../controllers/certificate.controller');

const router = express.Router();

router.post('/generate/:eventId', authMiddleware, generateCertificates);
router.get('/my', authMiddleware, getMyCertificates);
router.get('/download/:certificateId', authMiddleware, downloadCertificate);
router.get('/verify/:certificateId', verifyCertificate);
router.get('/event/:eventId', authMiddleware, getEventCertificates);
router.get('/', authMiddleware, authorizeRoles('Admin'), getAllCertificates);

module.exports = router;