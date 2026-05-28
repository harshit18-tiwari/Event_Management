import { useMemo, useState } from 'react';
import AttendanceStatsCard from './AttendanceStatsCard';

const AttendanceTable = ({
  registrations = [],
  title = 'Attendance Records',
  searchPlaceholder = 'Search by student, email, department, or event',
  showEvent = false,
}) => {
  const [search, setSearch] = useState('');

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return registrations;

    return registrations.filter((registration) => {
      const student = registration.student || {};
      const event = registration.event || {};
      const searchText = [student.name, student.email, student.department, event.title, event.venue]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchText.includes(query);
    });
  }, [registrations, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">Search and review attendance records in one place.</p>
        </div>
        <AttendanceStatsCard label="Matching Records" value={filteredRegistrations.length} tone="sky" />
      </div>

      <div>
        <label className="label-base">Search attendance</label>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-base"
          placeholder={searchPlaceholder}
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
                {showEvent && <th className="px-4 py-3 font-semibold">Event</th>}
                <th className="px-4 py-3 font-semibold">Attendance Status</th>
                <th className="px-4 py-3 font-semibold">Check-In Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={showEvent ? 7 : 6} className="px-4 py-10 text-center text-slate-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((registration) => {
                  const student = registration.student || {};
                  const event = registration.event || {};
                  return (
                    <tr key={registration._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium text-slate-900">{student.name || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{student.email || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{student.department || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{student.year || '-'}</td>
                      {showEvent && <td className="px-4 py-3 text-slate-600">{event.title || '-'}</td>}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            registration.attendanceStatus
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {registration.attendanceStatus ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {registration.attendanceMarkedAt ? new Date(registration.attendanceMarkedAt).toLocaleString() : '-'}
                      </td>
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

export default AttendanceTable;