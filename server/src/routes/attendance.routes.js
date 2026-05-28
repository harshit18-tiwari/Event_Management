const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  generateQRCode,
  checkInAttendance,
  getEventAttendance,
  getStudentAttendance,
  getAllAttendance,
} = require('../controllers/attendance.controller');

router.get('/qr/:eventId', authMiddleware, generateQRCode);
router.post('/checkin', authMiddleware, checkInAttendance);
router.get('/event/:eventId', authMiddleware, getEventAttendance);
router.get('/my-attendance', authMiddleware, getStudentAttendance);
router.get('/all', authMiddleware, getAllAttendance);

module.exports = router;