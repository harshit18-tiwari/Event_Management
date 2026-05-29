import React from 'react';
import { Link } from 'react-router-dom';

const TeamCard = ({ team }) => {
  const memberCount = team.members?.length || 0;
  const leaderName = team.leader?.name || 'Unknown';

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Team</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{team.name}</h3>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Members</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{memberCount}/{team.maxMembers}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-3">
          <span>Leader</span>
          <span className="font-semibold text-slate-900">{leaderName}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to={`/teams/${team._id}`} className="btn-primary px-4 py-2 text-xs">
          View Details
        </Link>
        <Link to={`/teams/${team._id}`} className="rounded-2xl bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100">
          Manage
        </Link>
      </div>
    </article>
  );
};

export default TeamCard;
