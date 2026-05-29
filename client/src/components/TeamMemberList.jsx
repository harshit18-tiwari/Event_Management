import React from 'react';

const TeamMemberList = ({ members = [], leaderId }) => {
  if (!members.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No team members yet.</div>;
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const memberKey = member._id || member;
        const isLeader = String(memberKey) === String(leaderId);

        return (
          <div key={memberKey} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <div className="font-semibold text-slate-900">{member.name || 'Unknown member'}</div>
              <div className="text-sm text-slate-500">{member.email || ''}</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLeader ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {isLeader ? 'Leader' : 'Member'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TeamMemberList;
