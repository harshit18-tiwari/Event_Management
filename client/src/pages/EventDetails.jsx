import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import { useAuth as useAuthContext } from '../context/AuthContext';
import RegisterButton from '../components/RegisterButton';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await eventService.getEventById(id);
        setEvent(res.data.event);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event');
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-rose-600">{error}</div>;
  if (!event) return <div className="p-6">Event not found</div>;

  const date = new Date(event.date).toLocaleDateString();

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card overflow-hidden bg-slate-950 text-white">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                {event.category}
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{event.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">{event.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/events" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                  Back to events
                </Link>
                {(user?.role === 'Admin' || user?.role === 'Coordinator') && (
                  <Link to={`/certificates/generate/${id}`} className="btn-primary bg-emerald-500 hover:bg-emerald-600">
                    Generate Certificates
                  </Link>
                )}
                <Link to={`/leaderboard/public/${id}`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                  Public Leaderboard
                </Link>
                <Link to={`/results/public/${id}`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                  Public Results
                </Link>
                {(user?.role === 'Admin' || user?.role === 'Coordinator') && (
                  <Link to={`/events/${id}/judges`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                    Manage Judges
                  </Link>
                )}
                {(user?.role === 'Admin' || user?.role === 'Coordinator') && (
                  <Link to={`/events/${id}/criteria`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                    Manage Criteria
                  </Link>
                )}
                {event.registrationType === 'Team' && (user?.role === 'Admin' || user?.role === 'Coordinator') && (
                  <Link to={`/events/${id}/teams`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                    View Teams
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Date</div>
                <div className="mt-2 text-2xl font-semibold text-white">{date}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Time</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {event.startTime} - {event.endTime}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
          <div className="page-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Venue</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{event.venue}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Organizer</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{event.organizer}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Max Participants</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{event.maxParticipants}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Poster</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{event.poster || 'Not provided'}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Registration Type</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{event.registrationType || 'Individual'}</div>
              </div>
              {event.registrationType === 'Team' && (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Min Team Size</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{event.minTeamSize}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Max Team Size</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{event.maxTeamSize}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="page-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Creator</p>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-slate-900">{event.createdBy?.name}</div>
              <div className="mt-1 break-all text-sm text-slate-600">{event.createdBy?.email}</div>
              <div className="mt-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {event.createdBy?.role}
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Schedule</div>
              <div className="mt-3 text-2xl font-semibold">{event.startTime} - {event.endTime}</div>
              <div className="mt-2 text-sm text-slate-300">Plan your attendance around this time slot.</div>
            </div>

            {user?.role === 'Student' && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <RegisterButton event={event} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventDetails;
