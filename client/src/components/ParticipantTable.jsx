import RegistrationStatusBadge from './RegistrationStatusBadge';

const ParticipantTable = ({ registrations = [], search = '', onSearchChange, onRemoveParticipant, canManage = false, removingId = '' }) => {
  const filteredRegistrations = registrations.filter((registration) => {
    const student = registration.student || {};
    const searchText = `${student.name || ''} ${student.email || ''} ${student.department || ''}`.toLowerCase();
    return searchText.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="label-base">Search participants</label>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="input-base"
          placeholder="Search by name, email, or department"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Year</th>
                <th className="px-4 py-3 font-semibold">Registration Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                {canManage && <th className="px-4 py-3 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-10 text-center text-slate-500">
                    No participants found.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((registration) => {
                  const student = registration.student || {};
                  return (
                    <tr key={registration._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium text-slate-900">{student.name || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{student.email || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{student.department || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{student.year || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {registration.registeredAt ? new Date(registration.registeredAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <RegistrationStatusBadge status={registration.status} />
                      </td>
                      {canManage && (
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onRemoveParticipant?.(registration.event, student._id)}
                            disabled={removingId === registration._id}
                            className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParticipantTable;
