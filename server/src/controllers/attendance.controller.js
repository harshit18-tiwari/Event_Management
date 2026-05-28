const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const Event = require('../models/event.model');
const Registration = require('../models/registration.model');

const parseEventBoundary = (event, timeField) => {
  const [hours = '00', minutes = '00'] = String(event?.[timeField] || '00:00').split(':');
  const boundary = new Date(event.date);
  boundary.setHours(Number(hours), Number(minutes), 0, 0);
  return boundary;
};

const canManageEventAttendance = (user, event) => {
  if (!user || !event) {
    return false;
  }

  if (user.role === 'Admin') {
    return true;
  }

  return user.role === 'Coordinator' && event.createdBy.toString() === user._id.toString();
};

const generateQRCode = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can access QR codes.' });
    }

    const { eventId } = req.params;
    const registration = await Registration.findOne({ student: req.user._id, event: eventId })
      .populate('student', 'name email department year role')
      .populate('event', 'title category venue date startTime endTime organizer createdBy');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found for this event.' });
    }

    if (!registration.qrToken) {
      registration.qrToken = jwt.sign(
        {
          studentId: registration.student._id.toString(),
          eventId: registration.event._id.toString(),
          registrationId: registration._id.toString(),
        },
        process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.QR_TOKEN_EXPIRES_IN || '365d' }
      );
      await registration.save();
    }

    const qrCodeDataUrl = await QRCode.toDataURL(registration.qrToken, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return res.status(200).json({
      message: 'QR code generated successfully.',
      registration,
      qrToken: registration.qrToken,
      qrCodeDataUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate QR code.', error: error.message });
  }
};

const checkInAttendance = async (req, res) => {
  try {
    if (!['Coordinator', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only coordinators and admins can mark attendance.' });
    }

    const { qrToken } = req.body;
    if (!qrToken) {
      return res.status(400).json({ message: 'QR token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(qrToken, process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired QR code.' });
    }

    const registration = await Registration.findById(decoded.registrationId)
      .populate('student', 'name email department year role')
      .populate('event', 'title category venue date startTime endTime organizer createdBy');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    if (registration.qrToken !== qrToken) {
      return res.status(400).json({ message: 'Invalid QR code.' });
    }

    if (registration.student._id.toString() !== decoded.studentId || registration.event._id.toString() !== decoded.eventId) {
      return res.status(400).json({ message: 'QR code does not match this registration.' });
    }

    if (!canManageEventAttendance(req.user, registration.event)) {
      return res.status(403).json({ message: 'You are not allowed to manage attendance for this event.' });
    }

    if (registration.attendanceStatus) {
      return res.status(409).json({ message: 'Attendance already recorded.' });
    }

    const eventEnd = parseEventBoundary(registration.event, 'endTime');
    if (new Date() > eventEnd) {
      return res.status(400).json({ message: 'Attendance can only be marked before or during the event.' });
    }

    registration.attendanceStatus = true;
    registration.attendanceMarkedAt = new Date();
    await registration.save();

    return res.status(200).json({
      message: 'Attendance marked successfully.',
      registration,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark attendance.', error: error.message });
  }
};

const getEventAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageEventAttendance(req.user, event)) {
      return res.status(403).json({ message: 'You are not allowed to view this attendance report.' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email department year role')
      .sort({ registeredAt: -1 });

    const totalRegistered = registrations.length;
    const totalPresent = registrations.filter((registration) => registration.attendanceStatus).length;
    const totalAbsent = Math.max(totalRegistered - totalPresent, 0);
    const attendanceRate = totalRegistered === 0 ? 0 : Number(((totalPresent / totalRegistered) * 100).toFixed(2));

    return res.status(200).json({
      event,
      registrations,
      totalRegistered,
      totalPresent,
      totalAbsent,
      attendanceRate,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch attendance report.', error: error.message });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can access attendance history.' });
    }

    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email role' },
      })
      .sort({ attendanceMarkedAt: -1, registeredAt: -1 });

    return res.status(200).json({
      registrations,
      totalRegistered: registrations.length,
      totalPresent: registrations.filter((registration) => registration.attendanceStatus).length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your attendance.', error: error.message });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const registrations = await Registration.find()
      .populate('student', 'name email department year role')
      .populate('event', 'title category venue date startTime endTime organizer createdBy')
      .populate('event.createdBy', 'name email role')
      .sort({ attendanceMarkedAt: -1, registeredAt: -1 });

    const totalRegistered = registrations.length;
    const totalPresent = registrations.filter((registration) => registration.attendanceStatus).length;
    const totalAbsent = Math.max(totalRegistered - totalPresent, 0);
    const attendanceRate = totalRegistered === 0 ? 0 : Number(((totalPresent / totalRegistered) * 100).toFixed(2));

    return res.status(200).json({
      registrations,
      totalRegistered,
      totalPresent,
      totalAbsent,
      attendanceRate,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch attendance records.', error: error.message });
  }
};

module.exports = {
  generateQRCode,
  checkInAttendance,
  getEventAttendance,
  getStudentAttendance,
  getAllAttendance,
};