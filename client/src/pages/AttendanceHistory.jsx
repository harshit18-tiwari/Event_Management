import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import attendanceService from '../services/attendanceService';
import AttendanceStatsCard from '../components/AttendanceStatsCard';
import AttendanceTable from '../components/AttendanceTable';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const response = await attendanceService.getMyAttendance();
        setAttendance(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your attendance history.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return <div className="page-shell grid place-items-center">Loading attendance history...</div>;
  }

  if (error) {
    return <div className="page-shell text-rose-600">{error}</div>;
  }

  const registrations = attendance?.registrations || [];
  const attendanceRate = attendance?.totalRegistered
    ? Number(((attendance.totalPresent / attendance.totalRegistered) * 100).toFixed(2))
    : 0;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Student Attendance</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Attendance History</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Review all of your event check-ins and attendance outcomes in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              Back to Dashboard
            </Link>
            <Link to="/attendance/qr" className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
              My QR Code
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <AttendanceStatsCard label="Registered" value={attendance?.totalRegistered || 0} tone="sky" />
          <AttendanceStatsCard label="Present" value={attendance?.totalPresent || 0} tone="emerald" />
          <AttendanceStatsCard label="Attendance %" value={`${attendanceRate}%`} tone="amber" />
        </section>

        <section className="page-card p-6 sm:p-8">
          <AttendanceTable registrations={registrations} title="Your Attendance Records" showEvent />
        </section>
      </div>
    </div>
  );
};

export default AttendanceHistory;