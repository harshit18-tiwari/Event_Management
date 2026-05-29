import { useEffect, useState } from 'react';
import teamService from '../services/teamService';
import InvitationCard from '../components/InvitationCard';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const response = await teamService.getMyInvitations();
      setInvitations(response.data.invitations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAccept = async (id) => {
    try {
      await teamService.acceptInvitation(id);
      await loadInvitations();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to accept invitation');
    }
  };

  const handleReject = async (id) => {
    try {
      await teamService.rejectInvitation(id);
      await loadInvitations();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to reject invitation');
    }
  };

  if (loading) return <div className="page-shell grid place-items-center">Loading invitations...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Team Invitations</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">My Invitations</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Accept or reject invitations to join teams for your event work.
          </p>
        </section>

        {invitations.length === 0 ? (
          <div className="page-card p-8 text-center text-slate-500">No invitations right now.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation._id}
                invitation={invitation}
                onAccept={() => handleAccept(invitation._id)}
                onReject={() => handleReject(invitation._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invitations;
