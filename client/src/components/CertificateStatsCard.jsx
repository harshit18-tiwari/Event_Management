const toneClasses = {
  slate: 'border-slate-200 bg-slate-50 text-slate-900',
  sky: 'border-sky-200 bg-sky-50 text-sky-900',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  rose: 'border-rose-200 bg-rose-50 text-rose-900',
};

const CertificateStatsCard = ({ label, value, description, tone = 'slate' }) => {
  return (
    <div className={`rounded-[1.75rem] border p-5 shadow-sm ${toneClasses[tone] || toneClasses.slate}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {description ? <div className="mt-2 text-sm text-slate-500">{description}</div> : null}
    </div>
  );
};

export default CertificateStatsCard;