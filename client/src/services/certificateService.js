import api from './api';

const generateCertificates = (eventId, payload = {}) => api.post(`/certificates/generate/${eventId}`, payload);
const getMyCertificates = () => api.get('/certificates/my');
const downloadCertificate = (certificateId) => api.get(`/certificates/download/${certificateId}`, { responseType: 'blob' });
const verifyCertificate = (certificateId) => api.get(`/certificates/verify/${certificateId}`);
const getEventCertificates = (eventId) => api.get(`/certificates/event/${eventId}`);
const getAllCertificates = () => api.get('/certificates');

export default {
  generateCertificates,
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
  getEventCertificates,
  getAllCertificates,
};