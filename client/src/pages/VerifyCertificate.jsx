import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import certificateService from '../services/certificateService';
import CertificateVerificationForm from '../components/CertificateVerificationForm';
import CertificatePreview from '../components/CertificatePreview';

const VerifyCertificate = () => {
  const { certificateId: routeCertificateId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = useCallback(async (certificateId) => {
    if (!certificateId) {
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await certificateService.verifyCertificate(certificateId);
      if (!response.data.valid) {
        setError(response.data.message || 'Invalid certificate.');
        return;
      }

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify certificate.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (routeCertificateId) {
      verify(routeCertificateId);
    }
  }, [routeCertificateId]);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card overflow-hidden bg-slate-950 text-white">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Public Verification</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Verify Certificate</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Enter a certificate ID or scan the QR code printed on the certificate to confirm its authenticity.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/login" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                  Login
                </Link>
                <Link to="/dashboard" className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
                  Dashboard
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Status</div>
                <div className="mt-2 text-3xl font-semibold text-white">{result?.valid ? 'Valid' : 'Ready'}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Lookup</div>
                <div className="mt-2 text-3xl font-semibold text-white">{routeCertificateId ? 'Auto' : 'Manual'}</div>
              </div>
            </div>
          </div>
        </section>

        <CertificateVerificationForm initialCertificateId={routeCertificateId || ''} onVerify={verify} />

        {loading && <div className="page-card p-6 text-sm text-slate-600">Verifying certificate...</div>}

        {error && (
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
            <h2 className="text-2xl font-semibold text-rose-800">Invalid Certificate</h2>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}

        {result?.valid && (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <div className="page-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Student</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{result.studentName}</div>
              </div>
              <div className="page-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Event</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{result.eventName}</div>
              </div>
              <div className="page-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Certificate Type</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{result.certificateType}</div>
              </div>
              <div className="page-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Issue Date</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {result.issuedAt ? new Date(result.issuedAt).toLocaleDateString() : '-'}
                </div>
              </div>
            </section>

            <CertificatePreview
              certificate={result}
              qrCodeDataUrl={result.qrCodeDataUrl}
              verificationUrl={result.certificateUrl}
            />

            <section className="page-card p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <Link to={`/certificates/${result.certificateId}`} className="btn-primary">
                  Open Details
                </Link>
                <Link to="/verify-certificate" className="btn-secondary">
                  Verify Another Certificate
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;