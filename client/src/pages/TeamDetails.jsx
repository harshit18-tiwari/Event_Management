import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import teamService from '../services/teamService';
import TeamMemberList from '../components/TeamMemberList';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [name, setName] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [newLeaderId, setNewLeaderId] = useState('');

  const isLeader = useMemo(() => String(team?.leader?._id) === String(user?._id), [team, user]);
  const canManage = isLeader || user?.role === 'Admin';

  const loadTeam = async () => {
    setLoading(true);
    try {
      const response = await teamService.getTeamById(id);
      const teamData = response.data.team;
      setTeam(teamData);
      setName(teamData.name);
      setMaxMembers(teamData.maxMembers);
      setNewLeaderId(teamData.leader?._id || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [id]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const response = await teamService.updateTeam(id, { name, maxMembers: Number(maxMembers) });
      setTeam(response.data.team);
      alert('Team updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update team');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this team?')) return;
    try {
      await teamService.deleteTeam(id);
      navigate('/teams');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to delete team');
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    try {
      await teamService.inviteMember(id, { invitedEmail: inviteEmail });
      alert('Invitation sent');
      setInviteEmail('');
      loadTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to send invitation');
    }
  };

  const handleLeaderChange = async (event) => {
    event.preventDefault();
    try {
      const response = await teamService.changeLeader(id, { newLeaderId });
      setTeam(response.data.team);
      alert('Team leader updated');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to change leader');
    }
  };

  if (loading) return <div className="page-shell grid place-items-center">Loading team details...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;
  if (!team) return <div className="page-shell">Team not found</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Team Details</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{team.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Manage your team members, send invitations, and transfer leadership when needed.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/teams" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              Back to Teams
            </Link>
            <Link to="/invitations" className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
              My Invitations
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="page-card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Members</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Team roster</h2>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Capacity</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{team.members?.length || 0}/{team.maxMembers}</div>
                </div>
              </div>
              <div className="mt-5">
                <TeamMemberList members={team.members || []} leaderId={team.leader?._id} />
              </div>
            </div>

            {canManage && (
              <div className="page-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Update Team</p>
                <form className="mt-4 space-y-4" onSubmit={handleUpdate}>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Team Name</label>
                    <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Max Members</label>
                    <input type="number" min="1" className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} />
                  </div>
                  <button className="btn-primary px-5 py-3" type="submit">Save Changes</button>
                </form>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {canManage && (
              <div className="page-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Invite Member</p>
                <form className="mt-4 space-y-4" onSubmit={handleInvite}>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Invite by Email</label>
                    <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="student@example.com" />
                  </div>
                  <button className="btn-primary px-5 py-3" type="submit">Send Invitation</button>
                </form>
              </div>
            )}

            {canManage && (
              <div className="page-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Team Leader Management</p>
                <form className="mt-4 space-y-4" onSubmit={handleLeaderChange}>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">New Leader</label>
                    <select className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={newLeaderId} onChange={(e) => setNewLeaderId(e.target.value)}>
                      {(team.members || []).map((member) => (
                        <option key={member._id || member} value={member._id || member}>
                          {member.name || 'Member'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="btn-primary px-5 py-3" type="submit">Transfer Leadership</button>
                </form>
              </div>
            )}

            {canManage && (
              <div className="page-card p-6 border-rose-200">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Danger Zone</p>
                <p className="mt-3 text-sm text-slate-600">Deleting this team will remove all invitations associated with it.</p>
                <button type="button" onClick={handleDelete} className="mt-4 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
                  Delete Team
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeamDetails;
