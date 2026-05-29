const Certificate = require('../models/certificate.model');
const generateCertificateId = require('./generateCertificateId');

const getCertificateBaseUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5173';
};

const upsertPlacementCertificate = async ({ studentId, event, certificateType }) => {
  const existingCertificate = await Certificate.findOne({
    student: studentId,
    event: event._id,
    certificateType,
  });

  const certificateId = existingCertificate?.certificateId || generateCertificateId({
    eventTitle: event.title,
    eventCategory: event.category,
    issuedCount: await Certificate.countDocuments({ event: event._id, certificateType }) + 1,
    issuedAt: new Date(),
  });

  const certificateUrl = `${getCertificateBaseUrl()}/verify-certificate/${certificateId}`;

  const certificate = existingCertificate || new Certificate({
    student: studentId,
    event: event._id,
    certificateType,
  });

  certificate.certificateId = certificateId;
  certificate.certificateUrl = certificateUrl;
  certificate.issuedAt = new Date();
  await certificate.save();

  return Certificate.findById(certificate._id)
    .populate('student', 'name email department year role')
    .populate({ path: 'event', populate: { path: 'createdBy', select: 'name email role' } });
};

const issuePlacementCertificates = async ({ event, certificateType, placement }) => {
  const createdCertificates = [];

  if (!placement) {
    return createdCertificates;
  }

  if (placement.kind === 'team' && placement.team?.members?.length) {
    for (const member of placement.team.members) {
      const certificate = await upsertPlacementCertificate({
        studentId: member._id,
        event,
        certificateType,
      });
      createdCertificates.push(certificate);
    }
    return createdCertificates;
  }

  if (placement.kind === 'user' && placement.user?._id) {
    const certificate = await upsertPlacementCertificate({
      studentId: placement.user._id,
      event,
      certificateType,
    });
    createdCertificates.push(certificate);
  }

  return createdCertificates;
};

module.exports = {
  issuePlacementCertificates,
};