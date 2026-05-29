import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import certificateService from '../services/certificateService';
import CertificatePreview from '../components/CertificatePreview';

const CertificateDetails = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCertificate = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await certificateService.verifyCertificate(certificateId);
        if (!response.data.valid) {
          setError(response.data.message || 'Certificate not found.');
          setCertificate(null);
          return;
        }

        setCertificate(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load certificate details.');
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [certificateId]);

  const handleDownload = async () => {
    try {
      const response = await certificateService.downloadCertificate(certificateId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificateId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download certificate.');
    }
  };

  if (loading) {
    return <div className="page-shell grid place-items-center">Loading certificate details...</div>;
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          <h1 className="text-2xl font-semibold text-rose-800">Certificate not available</h1>
          <p className="mt-2 text-sm">{error}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/verify-certificate" className="btn-primary">
              Verify Another Certificate
            </Link>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Certificate Details</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{certificate?.eventName || 'Certificate'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Preview the certificate, verify the issuance details, and download the PDF copy.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/certificates" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              Back to Certificates
            </Link>
            <Link to={`/verify-certificate/${certificateId}`} className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
              Public Verification Page
            </Link>
          </div>
        </section>

        <CertificatePreview
          certificate={certificate}
          qrCodeDataUrl={certificate?.qrCodeDataUrl}
          verificationUrl={certificate?.certificateUrl}
        />

        <section className="page-card p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Certificate ID</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{certificate?.certificateId}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Student</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{certificate?.studentName}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Event Date</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {certificate?.eventDate ? new Date(certificate.eventDate).toLocaleDateString() : '-'}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={handleDownload} className="btn-primary">
              Download PDF
            </button>
            <Link to="/verify-certificate" className="btn-secondary">
              Verify Another Certificate
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CertificateDetails;