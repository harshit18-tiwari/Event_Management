import React from 'react';

const CriteriaCard = ({ criteria, onEdit, onDelete }) => {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Criteria</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{criteria.title}</h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{criteria.maxMarks} Marks</span>
      </div>
      {criteria.description && <p className="mt-3 text-sm leading-6 text-slate-600">{criteria.description}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {onEdit && (
          <button type="button" onClick={onEdit} className="btn-secondary px-4 py-2 text-xs">Edit</button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Delete</button>
        )}
      </div>
    </article>
  );
};

export default CriteriaCard;
