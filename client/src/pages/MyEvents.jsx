import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import registrationService from '../services/registrationService';
import RegistrationStatusBadge from '../components/RegistrationStatusBadge';

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingId, setSubmittingId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await registrationService.getMyEvents();
      setRegistrations(response.data.registrations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (eventId) => {
    setSubmittingId(eventId);
    try {
      const response = await registrationService.cancelRegistration(eventId);
      alert(response.data.message || 'Registration cancelled');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel registration');
    } finally {
      setSubmittingId('');
    }
  };

  const now = new Date();

  const sections = useMemo(() => {
    const registeredEvents = registrations
      .map((registration) => ({ ...registration.event, registrationId: registration._id, registrationStatus: registration.status, registeredAt: registration.registeredAt }))
      .filter(Boolean);

    return {
      upcoming: registeredEvents.filter((event) => new Date(event.date) >= now),
      past: registeredEvents.filter((event) => new Date(event.date) < now),
      total: registeredEvents.length,
    };
  }, [registrations, now]);

  if (loading) return <div className="page-shell grid place-items-center">Loading your events...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;

  const renderCards = (events) => {
    if (events.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          No events in this section.
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <article key={event._id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">{event.category}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{event.title}</h3>
              </div>
              <RegistrationStatusBadge status={event.registrationStatus} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{new Date(event.date).toLocaleDateString()} • {event.venue}</p>
            <p className="mt-1 text-sm text-slate-500">Organizer: {event.organizer}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/events/${event._id}`} className="btn-primary px-4 py-2 text-xs">
                View Details
              </Link>
              <button
                type="button"
                onClick={() => handleCancel(event._id)}
                disabled={submittingId === event._id || new Date(event.date) <= now}
                className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Student Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">My Registered Events</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Track your upcoming events, review your past registrations, and cancel before an event starts.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="page-card p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Total Registered</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{sections.total}</div>
          </div>
          <div className="page-card p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Upcoming Events</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{sections.upcoming.length}</div>
          </div>
          <div className="page-card p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Past Events</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{sections.past.length}</div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Upcoming Events</h2>
          {renderCards(sections.upcoming)}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Past Events</h2>
          {renderCards(sections.past)}
        </section>
      </div>
    </div>
  );
};

export default MyEvents;
