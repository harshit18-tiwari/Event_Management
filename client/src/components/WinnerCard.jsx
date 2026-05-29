import React from 'react';

const medalStyles = {
  Winner: 'bg-amber-100 text-amber-700',
  'Runner-Up': 'bg-slate-100 text-slate-700',
  'Second Runner-Up': 'bg-orange-100 text-orange-700',
};

const WinnerCard = ({ title, entry }) => {
  const getName = () => entry?.team?.name || entry?.participant?.name || entry?.name || entry?.title || 'Unknown';

  if (!entry) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        {title} not declared yet.
      </div>
    );
  }

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${medalStyles[title] || 'bg-slate-100 text-slate-700'}`}>
        {title}
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-slate-900">{getName()}</h3>
      <p className="mt-2 text-sm text-slate-600">Rank {entry.rank}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">Score {entry.finalScore.toFixed ? entry.finalScore.toFixed(2) : entry.finalScore}</p>
    </article>
  );
};

export default WinnerCard;