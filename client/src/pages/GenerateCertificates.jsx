import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import certificateService from '../services/certificateService';
import eventService from '../services/eventService';
import attendanceService from '../services/attendanceService';
import CertificateStatsCard from '../components/CertificateStatsCard';

const certificateTypeOptions = ['Participation', 'Winner', 'Runner-Up', 'Volunteer'];

const GenerateCertificates = () => {
  const { eventId: routeEventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eventIdInput, setEventIdInput] = useState(routeEventId || '');
  const [event, setEvent] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(Boolean(routeEventId));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [certificateType, setCertificateType] = useState('Participation');
  const [regenerate, setRegenerate] = useState(false);

  useEffect(() => {
    setEventIdInput(routeEventId || '');
  }, [routeEventId]);

  useEffect(() => {
    const loadEventData = async () => {
      if (!routeEventId) {
        setLoadingEvent(false);
        return;
      }

      setLoadingEvent(true);
      setError('');
      try {
        const [eventResponse, attendanceResponse] = await Promise.all([
          eventService.getEventById(routeEventId),
          attendanceService.getAttendanceReport(routeEventId),
        ]);
        setEvent(eventResponse.data.event);
        setAttendanceReport(attendanceResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event details.');
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEventData();
  }, [routeEventId]);

  const loadByEventId = async (nextEventId) => {
    if (!nextEventId) {
      setError('Enter an event ID first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const [eventResponse, attendanceResponse] = await Promise.all([
        eventService.getEventById(nextEventId),
        attendanceService.getAttendanceReport(nextEventId),
      ]);

      setEvent(eventResponse.data.event);
      setAttendanceReport(attendanceResponse.data);
      navigate(`/certificates/generate/${nextEventId}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!event?._id && !routeEventId) {
      setError('Load an event before generating certificates.');
      return;
    }

    const targetEventId = routeEventId || event?._id;
    if (!targetEventId) {
      setError('Load an event before generating certificates.');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess(null);

    try {
      const response = await certificateService.generateCertificates(targetEventId, {
        certificateType,
        regenerate,
      });
      setSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate certificates.');
    } finally {
      setGenerating(false);
    }
  };

  const totalPresent = attendanceReport?.totalPresent || 0;
  const totalRegistered = attendanceReport?.totalRegistered || 0;
  const attendanceRate = attendanceReport?.attendanceRate || 0;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card overflow-hidden bg-slate-950 text-white">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Certificate Management</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Generate Certificates</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Issue verified certificates to attendees of an event. Only students with marked attendance are eligible.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/dashboard" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                  Back to Dashboard
                </Link>
                <Link to="/verify-certificate" className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
                  Verify Certificates
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Attendees</div>
                <div className="mt-2 text-3xl font-semibold text-white">{totalPresent}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Attendance</div>
                <div className="mt-2 text-3xl font-semibold text-white">{attendanceRate}%</div>
              </div>
            </div>
          </div>
        </section>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        {loadingEvent ? (
          <div className="page-card p-6 text-sm text-slate-600">Loading event details...</div>
        ) : !routeEventId && !event ? (
          <section className="page-card p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <label className="label-base">Event ID</label>
                <input
                  value={eventIdInput}
                  onChange={(event) => setEventIdInput(event.target.value)}
                  className="input-base"
                  placeholder="Enter the event ID"
                />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => loadByEventId(eventIdInput.trim())} className="btn-primary w-full md:w-auto">
                  Load Event
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Open an event first, or paste the event ID here to fetch attendance data before generating certificates.
            </p>
          </section>
        ) : null}

        {event && attendanceReport && (
          <>
            <section className="page-card p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Event Details</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-900">{event.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {event.date ? new Date(event.date).toLocaleDateString() : '-'} • {event.venue} • {event.organizer}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/attendance/report/${event._id}`} className="btn-secondary">
                    Attendance Report
                  </Link>
                  <Link to={`/events/${event._id}`} className="btn-secondary">
                    Open Event
                  </Link>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              <CertificateStatsCard label="Registered" value={totalRegistered} tone="sky" />
              <CertificateStatsCard label="Present" value={totalPresent} tone="emerald" />
              <CertificateStatsCard label="Absent" value={attendanceReport?.totalAbsent || 0} tone="rose" />
              <CertificateStatsCard label="Attendance %" value={`${attendanceRate}%`} tone="amber" />
            </section>

            <section className="page-card p-6 sm:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="label-base">Certificate Type</label>
                  <select value={certificateType} onChange={(event) => setCertificateType(event.target.value)} className="input-base">
                    {certificateTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label-base">Generation Mode</label>
                  <div className="flex h-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input type="checkbox" checked={regenerate} onChange={(event) => setRegenerate(event.target.checked)} />
                      Re-generate existing certificates instead of skipping them
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={handleGenerate} disabled={generating} className="btn-primary">
                  {generating ? 'Generating...' : 'Generate Certificates'}
                </button>
                <Link to="/verify-certificate" className="btn-secondary">
                  Verify Certificate
                </Link>
              </div>
            </section>
          </>
        )}

        {success && (
          <section className="page-card p-6 sm:p-8">
            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
              <h2 className="text-2xl font-semibold">Certificates generated successfully</h2>
              <p className="mt-2 text-sm">Certificates Generated: {success.generatedCount}</p>
              <p className="mt-1 text-sm">Skipped: {success.skippedCount}</p>
              <p className="mt-1 text-sm">Updated: {success.updatedCount}</p>
              <p className="mt-1 text-sm">Eligible attendees: {success.totalEligible}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default GenerateCertificates;