const getCertificateTemplate = () => {
  return {
    collegeName: process.env.COLLEGE_NAME || 'College Event Management',
    certificateSubtitle: process.env.COLLEGE_TAGLINE || 'Official Recognition and Achievement',
    principalName: process.env.PRINCIPAL_NAME || 'Principal',
    coordinatorName: process.env.CERTIFICATE_COORDINATOR_NAME || 'Event Coordinator',
    primaryColor: '#0f172a',
    accentColor: '#0ea5e9',
    highlightColor: '#16a34a',
    paperColor: '#fffdf7',
  };
};

const getCertificateHeading = (certificateType = 'Participation') => {
  switch (certificateType) {
    case 'Winner':
      return 'Certificate of Achievement';
    case 'Runner-Up':
      return 'Certificate of Excellence';
    case 'Second Runner-Up':
      return 'Certificate of Merit';
    case 'Volunteer':
      return 'Certificate of Appreciation';
    default:
      return 'Certificate of Participation';
  }
};

module.exports = {
  getCertificateTemplate,
  getCertificateHeading,
};