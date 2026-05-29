import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import teamRegistrationService from '../services/teamRegistrationService';
import TeamRegistrationCard from '../components/TeamRegistrationCard';

const MyTeamRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const response = await teamRegistrationService.getMyTeamRegistrations();
      setRegistrations(response.data.registrations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleCancel = async (eventId, teamId) => {
    try {
      await teamRegistrationService.cancelTeamRegistration(eventId, { teamId });
      await loadRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel team registration');
    }
  };

  if (loading) return <div className="page-shell grid place-items-center">Loading team registrations...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Team Registration Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">My Team Registrations</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Track your registered teams, review event details, and cancel before the event starts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/teams" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              My Teams
            </Link>
            <Link to="/events" className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
              Browse Events
            </Link>
          </div>
        </section>

        {registrations.length === 0 ? (
          <div className="page-card p-8 text-center text-slate-500">No team registrations yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {registrations.map((registration) => (
              <TeamRegistrationCard
                key={registration._id}
                registration={registration}
                onCancel={() => handleCancel(registration.event._id, registration.team._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeamRegistrations;
