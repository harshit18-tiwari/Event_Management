import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import registrationService from '../services/registrationService';
import ParticipantTable from '../components/ParticipantTable';

const EventParticipants = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await registrationService.getEventParticipants(id);
        setEvent(response.data.event);
        setRegistrations(response.data.registrations || []);
        setStats(response.data.stats || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load participants');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="page-shell grid place-items-center">Loading participants...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;

  const handleRemoveParticipant = async (eventId, studentId) => {
    setRemovingId(studentId);
    try {
      const response = await registrationService.removeParticipantRegistration(eventId, studentId);
      alert(response.data.message || 'Registration removed');
      const refreshed = await registrationService.getEventParticipants(id);
      setEvent(refreshed.data.event);
      setRegistrations(refreshed.data.registrations || []);
      setStats(refreshed.data.stats || null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove participant');
    } finally {
      setRemovingId('');
    }
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Participants</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{event?.title || 'Event Participants'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            View and manage registrations for this event.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/events" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              Back to Events
            </Link>
          </div>
        </section>

        {stats && (
          <section className="grid gap-4 md:grid-cols-4">
            {[
              ['Total Registrations', stats.totalRegistrations],
              ['Approved', stats.approvedCount],
              ['Waitlisted', stats.waitlistedCount],
              ['Available Seats', stats.availableSeats],
            ].map(([label, value]) => (
              <div key={label} className="page-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
              </div>
            ))}
          </section>
        )}

        <section className="page-card p-5 sm:p-6">
          <ParticipantTable
            registrations={registrations}
            search={search}
            onSearchChange={setSearch}
            canManage={true}
            removingId={removingId}
            onRemoveParticipant={handleRemoveParticipant}
          />
        </section>
      </div>
    </div>
  );
};

export default EventParticipants;
