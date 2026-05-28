const AttendanceStatsCard = ({ label, value, description, tone = 'slate' }) => {
  const tones = {
    slate: 'border-slate-200 bg-slate-50 text-slate-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${tones[tone] || tones.slate}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value ?? 0}</div>
      {description && <div className="mt-2 text-sm text-slate-600">{description}</div>}
    </div>
  );
};

export default AttendanceStatsCard;