import React from 'react';

const TeamRegistrationCard = ({ registration, onCancel }) => {
  const team = registration.team;
  const event = registration.event;

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Team Event</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{event?.title}</h3>
          <div className="mt-1 text-sm text-slate-600">Team: {team?.name}</div>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{registration.status}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Venue</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{event?.venue}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Registered At</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{new Date(registration.registeredAt).toLocaleString()}</div>
        </div>
      </div>

      {onCancel && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onCancel} className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
            Cancel Registration
          </button>
        </div>
      )}
    </article>
  );
};

export default TeamRegistrationCard;
