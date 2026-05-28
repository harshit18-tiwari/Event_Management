const badgeStyles = {
  Approved: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-100 text-amber-700 ring-amber-200',
  Rejected: 'bg-rose-100 text-rose-700 ring-rose-200',
  Waitlisted: 'bg-sky-100 text-sky-700 ring-sky-200',
};

const RegistrationStatusBadge = ({ status }) => {
  if (!status) return null;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeStyles[status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {status}
    </span>
  );
};

export default RegistrationStatusBadge;
