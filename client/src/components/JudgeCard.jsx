import React from 'react';

const JudgeCard = ({ assignment, onRemove }) => {
  const event = assignment.event;
  const judge = assignment.judge;

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Assigned Judge</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{judge?.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{judge?.email}</p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">Judge</span>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <div className="font-semibold text-slate-900">{event?.title}</div>
        <div className="mt-1">{event?.venue}</div>
        <div className="mt-1">{new Date(event?.date).toLocaleDateString()}</div>
      </div>

      {onRemove && (
        <div className="mt-5">
          <button type="button" onClick={onRemove} className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
            Remove Judge
          </button>
        </div>
      )}
    </article>
  );
};

export default JudgeCard;
