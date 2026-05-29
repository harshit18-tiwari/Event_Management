const buildEventCode = (eventTitle = '', eventCategory = '') => {
  const source = String(eventTitle || eventCategory || 'EVENT')
    .replace(/[^a-z0-9]+/gi, '')
    .toUpperCase();

  return (source.slice(0, 4) || 'EVNT').padEnd(4, 'X');
};

const generateCertificateId = ({ eventTitle, eventCategory, issuedCount, issuedAt = new Date() }) => {
  const year = new Date(issuedAt).getFullYear();
  const sequence = String(Number(issuedCount) || 0).padStart(3, '0');
  return `CERT-${buildEventCode(eventTitle, eventCategory)}-${year}-${sequence}`;
};

module.exports = generateCertificateId;