import React from 'react';

const RankCard = ({ entry, label }) => {
  const getName = () => entry?.team?.name || entry?.participant?.name || entry?.name || entry?.title || 'Unknown';

  if (!entry) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
        {label} not declared yet.
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">{getName()}</div>
      <div className="mt-2 text-sm text-slate-600">Rank {entry.rank}</div>
      <div className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        {entry.finalScore.toFixed ? entry.finalScore.toFixed(2) : entry.finalScore}
      </div>
    </div>
  );
};

export default RankCard;