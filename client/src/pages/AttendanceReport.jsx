import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import AttendanceStatsCard from '../components/AttendanceStatsCard';
import AttendanceTable from '../components/AttendanceTable';

const AttendanceReport = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError('');

      if (!eventId && user?.role !== 'Admin') {
        setError('Open a specific event to view a coordinator report.');
        setLoading(false);
        return;
      }

      try {
        const response = eventId ? await attendanceService.getAttendanceReport(eventId) : await attendanceService.getAllAttendance();
        setReport(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [eventId, user?.role]);

  if (loading) {
    return <div className="page-shell grid place-items-center">Loading attendance report...</div>;
  }

  if (error) {
    return <div className="page-shell text-rose-600">{error}</div>;
  }

  const registrations = report?.registrations || [];
  const title = eventId ? report?.event?.title || 'Attendance Report' : 'All Attendance Records';

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Attendance Report</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Review attendance performance and individual check-ins for the selected event.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              Back to Dashboard
            </Link>
            <Link to="/events" className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
              Browse Events
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <AttendanceStatsCard label="Registered" value={report?.totalRegistered} tone="sky" />
          <AttendanceStatsCard label="Present" value={report?.totalPresent} tone="emerald" />
          <AttendanceStatsCard label="Absent" value={report?.totalAbsent} tone="rose" />
          <AttendanceStatsCard label="Attendance %" value={`${report?.attendanceRate ?? 0}%`} tone="amber" />
        </section>

        {report?.event && (
          <section className="page-card p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Event', report.event.title],
                ['Venue', report.event.venue],
                ['Date', report.event.date ? new Date(report.event.date).toLocaleDateString() : '-'],
                ['Organizer', report.event.organizer],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{value || '-'}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="page-card p-6 sm:p-8">
          <AttendanceTable
            registrations={registrations}
            title={eventId ? 'Event Attendance' : 'Attendance Overview'}
            showEvent={!eventId && user?.role === 'Admin'}
          />
        </section>
      </div>
    </div>
  );
};

export default AttendanceReport;