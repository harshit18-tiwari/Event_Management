import api from './api';

const generateQRCode = (eventId) => api.get(`/attendance/qr/${eventId}`);
const checkInAttendance = (qrToken) => api.post('/attendance/checkin', { qrToken });
const getAttendanceReport = (eventId) => api.get(`/attendance/event/${eventId}`);
const getMyAttendance = () => api.get('/attendance/my-attendance');
const getAllAttendance = () => api.get('/attendance/all');

export default {
  generateQRCode,
  checkInAttendance,
  getAttendanceReport,
  getMyAttendance,
  getAllAttendance,
};