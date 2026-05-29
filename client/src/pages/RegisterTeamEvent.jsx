import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import teamService from '../services/teamService';
import teamRegistrationService from '../services/teamRegistrationService';
import TeamSelector from '../components/TeamSelector';

const RegisterTeamEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [eventResponse, teamResponse] = await Promise.all([
          eventService.getEventById(eventId),
          teamService.getMyTeams(),
        ]);

        const currentEvent = eventResponse.data.event;
        if (currentEvent.registrationType !== 'Team') {
          setError('This event does not support team registration.');
          return;
        }

        setEvent(currentEvent);
        setTeams((teamResponse.data.teams || []).filter((team) => String(team.leader?._id) === String(user?._id)));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load team event');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teamRegistrationService.registerTeamForEvent(eventId, { teamId });
      navigate('/team-registrations');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register team');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-shell grid place-items-center">Loading team event...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;
  if (!event) return null;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Team Registration</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Register a team for {event.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Only team leaders can register one of their teams for this event.
          </p>
        </section>

        <div className="page-card p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Event Capacity</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{event.maxParticipants}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Allowed Team Size</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{event.minTeamSize} - {event.maxTeamSize}</div>
              </div>
            </div>

            <TeamSelector teams={teams} value={teamId} onChange={(e) => setTeamId(e.target.value)} />

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className="btn-primary px-5 py-3 disabled:opacity-60">
                {submitting ? 'Registering...' : 'Register Team'}
              </button>
              <Link to={`/events/${eventId}`} className="btn-secondary border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                Back to Event
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterTeamEvent;
