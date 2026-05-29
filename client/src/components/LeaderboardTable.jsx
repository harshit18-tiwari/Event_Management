import React from 'react';

const LeaderboardTable = ({ entries = [] }) => {
  const getName = (entry) => entry.team?.name || entry.participant?.name || entry.name || entry.title || 'Unknown';

  if (!entries.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Leaderboard has not been generated yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Team / Participant</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <tr key={entry._id} className={entry.rank <= 3 ? 'bg-amber-50/40' : ''}>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{entry.rank}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{getName(entry)}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{entry.finalScore.toFixed ? entry.finalScore.toFixed(2) : entry.finalScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;