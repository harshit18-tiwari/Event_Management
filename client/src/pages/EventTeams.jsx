import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import teamRegistrationService from '../services/teamRegistrationService';

const EventTeams = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await teamRegistrationService.getEventTeams(eventId);
        setEvent(response.data.event);
        setRegistrations(response.data.registrations || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event team list');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  if (loading) return <div className="page-shell grid place-items-center">Loading team list...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Event Team Listing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Teams for {event?.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Review which teams are registered for this team-based event.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/events/${eventId}`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              Back to Event
            </Link>
          </div>
        </section>

        {registrations.length === 0 ? (
          <div className="page-card p-8 text-center text-slate-500">No teams registered yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {registrations.map((registration) => (
              <article key={registration._id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Registered Team</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{registration.team?.name}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{registration.status}</span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-900">Leader:</span> {registration.team?.leader?.name}</div>
                  <div><span className="font-semibold text-slate-900">Members:</span> {registration.team?.members?.length || 0}</div>
                  <div><span className="font-semibold text-slate-900">Registered By:</span> {registration.registeredBy?.name}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTeams;
