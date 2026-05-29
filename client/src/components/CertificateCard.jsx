import { Link } from 'react-router-dom';

const CertificateCard = ({ certificate, onView, onDownload }) => {
  const event = certificate?.event || {};

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">{certificate?.certificateType || 'Participation'}</div>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{event.title || 'Certificate'}</h3>
          <p className="mt-1 text-sm text-slate-600">{event.organizer || 'College Event'} • {event.venue || '-'}</p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{certificate?.certificateId || '-'}</span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Issue Date</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-900">
            {certificate?.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : '-'}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Student</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-900">{certificate?.student?.name || '-'}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onView} className="btn-secondary">
          View
        </button>
        <button type="button" onClick={onDownload} className="btn-primary">
          Download
        </button>
        <Link to={`/verify-certificate/${certificate?.certificateId}`} className="btn-secondary">
          Verify
        </Link>
      </div>
    </article>
  );
};

export default CertificateCard;