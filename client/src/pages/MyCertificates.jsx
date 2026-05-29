import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import certificateService from '../services/certificateService';
import CertificateCard from '../components/CertificateCard';
import CertificateStatsCard from '../components/CertificateStatsCard';

const MyCertificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCertificates = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await certificateService.getMyCertificates();
        setCertificates(response.data.certificates || []);
        setSummary(response.data.byType || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your certificates.');
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  const handleDownload = async (certificateId) => {
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
    return <div className="page-shell grid place-items-center">Loading your certificates...</div>;
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card overflow-hidden bg-slate-950 text-white">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Student Certificates</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">My Certificates</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Review your earned certificates, preview verification details, and download PDF copies whenever you need them.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/dashboard" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                  Back to Dashboard
                </Link>
                <Link to="/verify-certificate" className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
                  Verify Certificate
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Total Certificates</div>
                <div className="mt-2 text-3xl font-semibold text-white">{certificates.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Participation</div>
                <div className="mt-2 text-3xl font-semibold text-white">{summary.Participation || 0}</div>
              </div>
            </div>
          </div>
        </section>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <section className="grid gap-4 md:grid-cols-4">
          <CertificateStatsCard label="Total" value={certificates.length} tone="sky" />
          <CertificateStatsCard label="Participation" value={summary.Participation || 0} tone="emerald" />
          <CertificateStatsCard label="Winner" value={summary.Winner || 0} tone="amber" />
          <CertificateStatsCard label="Runner-Up" value={summary['Runner-Up'] || 0} tone="rose" />
        </section>

        {certificates.length === 0 ? (
          <div className="page-card p-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">No certificates yet</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Certificates appear here after you attend events and the coordinator issues them.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={() => navigate('/events')} className="btn-primary">
                Browse Events
              </button>
              <Link to="/attendance/history" className="btn-secondary">
                View Attendance History
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate._id}
                certificate={certificate}
                onView={() => navigate(`/certificates/${certificate.certificateId}`)}
                onDownload={() => handleDownload(certificate.certificateId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificates;