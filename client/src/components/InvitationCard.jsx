import React from 'react';

const InvitationCard = ({ invitation, onAccept, onReject }) => {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Invitation</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{invitation.team?.name}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${invitation.status === 'Pending' ? 'bg-amber-100 text-amber-700' : invitation.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {invitation.status}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-slate-600">
        <div><span className="font-semibold text-slate-900">Leader:</span> {invitation.team?.leader?.name || 'Unknown'}</div>
        <div><span className="font-semibold text-slate-900">Team Members:</span> {invitation.team?.members?.length || 0}/{invitation.team?.maxMembers || '-'}</div>
      </div>

      {invitation.status === 'Pending' && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onAccept} className="btn-primary px-4 py-2 text-xs">Accept</button>
          <button type="button" onClick={onReject} className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Reject</button>
        </div>
      )}
    </article>
  );
};

export default InvitationCard;
