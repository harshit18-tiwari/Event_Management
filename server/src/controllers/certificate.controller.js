const QRCode = require('qrcode');
const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const Certificate = require('../models/certificate.model');
const generateCertificateId = require('../utils/generateCertificateId');
const { generateCertificatePdf } = require('../utils/generateCertificate');

const getCertificateBaseUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5173';
};

const canManageEventCertificates = (user, event) => {
  if (!user || !event) {
    return false;
  }

  if (user.role === 'Admin') {
    return true;
  }

  return user.role === 'Coordinator' && event.createdBy.toString() === user._id.toString();
};

const buildCertificateResponse = async (certificate, student, event) => {
  const verificationUrl = `${getCertificateBaseUrl()}/verify-certificate/${certificate.certificateId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 7,
  });

  return {
    valid: true,
    certificateId: certificate.certificateId,
    certificateType: certificate.certificateType,
    issuedAt: certificate.issuedAt,
    certificateUrl: verificationUrl,
    qrCodeDataUrl,
    studentName: student?.name || '',
    eventName: event?.title || '',
    organizer: event?.organizer || '',
    eventDate: event?.date || null,
    student,
    event,
    certificate,
  };
};

const generateCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { certificateType = 'Participation', regenerate = false } = req.body || {};

    if (!['Participation', 'Winner', 'Runner-Up', 'Volunteer'].includes(certificateType)) {
      return res.status(400).json({ message: 'Invalid certificate type.' });
    }

    const event = await Event.findById(eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageEventCertificates(req.user, event)) {
      return res.status(403).json({ message: 'You are not allowed to manage certificates for this event.' });
    }

    const registrations = await Registration.find({ event: eventId, attendanceStatus: true, status: 'Approved' })
      .populate('student', 'name email department year role')
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email role' },
      })
      .sort({ attendanceMarkedAt: 1, registeredAt: 1 });

    if (registrations.length === 0) {
      return res.status(400).json({ message: 'No attended registrations found for this event.' });
    }

    const existingCount = await Certificate.countDocuments({ event: eventId });
    let nextSequence = existingCount + 1;
    const generatedCertificates = [];
    const skippedCertificates = [];
    const updatedCertificates = [];

    for (const registration of registrations) {
      const existingCertificate = await Certificate.findOne({ student: registration.student._id, event: eventId })
        .populate('student', 'name email department year role')
        .populate({
          path: 'event',
          populate: { path: 'createdBy', select: 'name email role' },
        });

      if (existingCertificate && !regenerate) {
        skippedCertificates.push(existingCertificate);
        continue;
      }

      const certificateId = existingCertificate?.certificateId || generateCertificateId({
        eventTitle: event.title,
        eventCategory: event.category,
        issuedCount: nextSequence,
        issuedAt: new Date(),
      });

      const certificateUrl = `${getCertificateBaseUrl()}/verify-certificate/${certificateId}`;

      let certificateDoc = existingCertificate;
      if (!certificateDoc) {
        certificateDoc = await Certificate.create({
          student: registration.student._id,
          event: eventId,
          certificateId,
          certificateType,
          certificateUrl,
          issuedAt: new Date(),
        });
      } else {
        certificateDoc.certificateType = certificateType;
        certificateDoc.certificateUrl = certificateUrl;
        certificateDoc.issuedAt = new Date();
        await certificateDoc.save();
      }

      nextSequence += 1;

      const populatedCertificate = await Certificate.findById(certificateDoc._id)
        .populate('student', 'name email department year role')
        .populate({
          path: 'event',
          populate: { path: 'createdBy', select: 'name email role' },
        });

      if (existingCertificate) {
        updatedCertificates.push(populatedCertificate);
      }

      generatedCertificates.push(populatedCertificate);
    }

    return res.status(200).json({
      message: 'Certificates processed successfully.',
      generatedCount: generatedCertificates.length,
      skippedCount: skippedCertificates.length,
      updatedCount: updatedCertificates.length,
      totalEligible: registrations.length,
      certificates: generatedCertificates.map((item) => ({
        certificateId: item.certificateId,
        certificateType: item.certificateType,
        issuedAt: item.issuedAt,
        student: item.student,
        event: item.event,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate certificates.', error: error.message });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can access this page.' });
    }

    const certificates = await Certificate.find({ student: req.user._id })
      .populate('student', 'name email department year role')
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email role' },
      })
      .sort({ issuedAt: -1 });

    return res.status(200).json({
      certificates,
      totalCertificates: certificates.length,
      byType: certificates.reduce((accumulator, certificate) => {
        accumulator[certificate.certificateType] = (accumulator[certificate.certificateType] || 0) + 1;
        return accumulator;
      }, {}),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your certificates.', error: error.message });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('student', 'name email department year role')
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email role' },
      });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    const isOwner = req.user.role === 'Student' && certificate.student._id.toString() === req.user._id.toString();
    const canAdminister = canManageEventCertificates(req.user, certificate.event) || req.user.role === 'Admin';

    if (!isOwner && !canAdminister) {
      return res.status(403).json({ message: 'You are not allowed to download this certificate.' });
    }

    const pdfBuffer = await generateCertificatePdf({
      certificate,
      student: certificate.student,
      event: certificate.event,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificateId}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to download certificate.', error: error.message });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('student', 'name email department year role')
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email role' },
      });

    if (!certificate) {
      return res.status(200).json({ valid: false, message: 'Certificate not found.' });
    }

    const response = await buildCertificateResponse(certificate, certificate.student, certificate.event);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ valid: false, message: 'Failed to verify certificate.', error: error.message });
  }
};

const getEventCertificates = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy', 'name email role');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canManageEventCertificates(req.user, event)) {
      return res.status(403).json({ message: 'You are not allowed to view these certificates.' });
    }

    const certificates = await Certificate.find({ event: req.params.eventId })
      .populate('student', 'name email department year role')
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email role' },
      })
      .sort({ issuedAt: -1 });

    return res.status(200).json({
      event,
      certificates,
      totalCertificates: certificates.length,
      byType: certificates.reduce((accumulator, certificate) => {
        accumulator[certificate.certificateType] = (accumulator[certificate.certificateType] || 0) + 1;
        return accumulator;
      }, {}),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch certificates for event.', error: error.message });
  }
};

const getAllCertificates = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const certificates = await Certificate.find()
      .populate('student', 'name email department year role')
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email role' },
      })
      .sort({ issuedAt: -1 });

    return res.status(200).json({
      certificates,
      totalCertificates: certificates.length,
      byType: certificates.reduce((accumulator, certificate) => {
        accumulator[certificate.certificateType] = (accumulator[certificate.certificateType] || 0) + 1;
        return accumulator;
      }, {}),
      byEvent: certificates.reduce((accumulator, certificate) => {
        const eventId = certificate.event?._id?.toString() || 'unknown';
        if (!accumulator[eventId]) {
          accumulator[eventId] = {
            event: certificate.event,
            totalCertificates: 0,
          };
        }
        accumulator[eventId].totalCertificates += 1;
        return accumulator;
      }, {}),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch certificates.', error: error.message });
  }
};

module.exports = {
  generateCertificates,
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
  getEventCertificates,
  getAllCertificates,
};