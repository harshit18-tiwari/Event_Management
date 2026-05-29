import React from 'react';

const CriteriaList = ({ criteria = [] }) => {
  if (!criteria.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No criteria configured yet.</div>;
  }

  return (
    <div className="space-y-3">
      {criteria.map((item) => (
        <div key={item._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <div className="font-semibold text-slate-900">{item.title}</div>
            {item.description && <div className="text-sm text-slate-500">{item.description}</div>}
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{item.maxMarks}</div>
        </div>
      ))}
    </div>
  );
};

export default CriteriaList;
