const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { getCertificateTemplate, getCertificateHeading } = require('./certificateTemplate');

const toBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const generateCertificatePdf = async ({ certificate, student, event }) => {
  const template = getCertificateTemplate();
  const verifyUrl = certificate.certificateUrl;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 180,
    color: {
      dark: template.primaryColor,
      light: '#ffffff',
    },
  });

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

  doc.info.Title = `${template.collegeName} - ${certificate.certificateId}`;
  doc.info.Author = template.collegeName;
  doc.info.Subject = 'Academic certificate';

  doc.rect(0, 0, doc.page.width, doc.page.height).fill(template.paperColor);

  doc.save();
  doc.lineWidth(2.25).strokeColor(template.accentColor).roundedRect(18, 18, doc.page.width - 36, doc.page.height - 36, 26).stroke();
  doc.lineWidth(0.75).strokeColor('#cbd5e1').roundedRect(32, 32, doc.page.width - 64, doc.page.height - 64, 18).stroke();
  doc.restore();

  doc.fillColor(template.primaryColor).font('Helvetica-Bold');
  doc.fontSize(28).text(template.collegeName, 0, 52, { align: 'center' });
  doc.font('Helvetica').fontSize(11).fillColor('#475569').text(template.certificateSubtitle, { align: 'center' });

  doc.moveDown(1.2);
  doc.font('Helvetica-Bold').fillColor(template.accentColor).fontSize(18).text(getCertificateHeading(certificate.certificateType), { align: 'center' });

  doc.moveDown(1);
  doc.font('Helvetica').fillColor('#475569').fontSize(13).text('This is proudly presented to', { align: 'center' });

  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fillColor(template.primaryColor).fontSize(30).text(student?.name || 'Student Name', { align: 'center' });

  doc.moveDown(0.7);
  doc.font('Helvetica').fillColor('#475569').fontSize(13).text('for successful participation in', { align: 'center' });

  doc.moveDown(0.35);
  doc.font('Helvetica-Bold').fillColor(template.primaryColor).fontSize(22).text(event?.title || 'Event Title', { align: 'center' });

  const leftX = 62;
  const infoY = 240;
  const cardWidth = 355;

  const infoCards = [
    ['Event Date', formatDate(event?.date)],
    ['Organizer', event?.organizer || '-'],
    ['Certificate ID', certificate.certificateId],
    ['Issue Date', formatDate(certificate.issuedAt)],
  ];

  infoCards.forEach(([label, value], index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = leftX + col * (cardWidth + 22);
    const y = infoY + row * 58;

    doc.roundedRect(x, y, cardWidth, 46, 12).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8).text(label.toUpperCase(), x + 14, y + 10);
    doc.fillColor(template.primaryColor).font('Helvetica').fontSize(12).text(value || '-', x + 14, y + 23, { width: cardWidth - 28 });
  });

  const qrX = doc.page.width - 225;
  const qrY = 212;

  doc.roundedRect(qrX, qrY, 150, 150, 18).fillAndStroke('#ffffff', '#e2e8f0');
  doc.image(qrBuffer, qrX + 14, qrY + 14, { width: 122, height: 122 });
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Scan to verify', qrX, qrY + 164, { width: 150, align: 'center' });

  doc.moveTo(80, 392).lineTo(250, 392).strokeColor('#94a3b8').lineWidth(1).stroke();
  doc.moveTo(330, 392).lineTo(500, 392).strokeColor('#94a3b8').lineWidth(1).stroke();

  doc.fillColor(template.primaryColor).font('Helvetica-Bold').fontSize(11).text(template.principalName, 80, 400, { width: 170, align: 'center' });
  doc.fillColor('#64748b').font('Helvetica').fontSize(9).text('Principal Signature', 80, 416, { width: 170, align: 'center' });

  doc.fillColor(template.primaryColor).font('Helvetica-Bold').fontSize(11).text(template.coordinatorName, 330, 400, { width: 170, align: 'center' });
  doc.fillColor('#64748b').font('Helvetica').fontSize(9).text('Coordinator Signature', 330, 416, { width: 170, align: 'center' });

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text(`Verification URL: ${verifyUrl}`, 62, 470, {
    width: doc.page.width - 124,
    align: 'center',
  });

  doc.end();
  return toBuffer(doc);
};

module.exports = {
  generateCertificatePdf,
};