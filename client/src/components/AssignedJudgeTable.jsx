import React from 'react';

const AssignedJudgeTable = ({ assignments = [], onRemove }) => {
  if (!assignments.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No judges assigned yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Judge</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Assigned By</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {assignments.map((assignment) => (
            <tr key={assignment._id}>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{assignment.judge?.name}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{assignment.judge?.email}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{assignment.assignedBy?.name || 'System'}</td>
              <td className="px-4 py-3 text-right">
                {onRemove && (
                  <button type="button" onClick={() => onRemove(assignment._id)} className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedJudgeTable;
