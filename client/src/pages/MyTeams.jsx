import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import teamService from '../services/teamService';
import TeamCard from '../components/TeamCard';

const MyTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeams = async () => {
    setLoading(true);
    try {
      const response = await teamService.getMyTeams();
      setTeams(response.data.teams || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  if (loading) return <div className="page-shell grid place-items-center">Loading teams...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Team Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">My Teams</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            View teams you lead or belong to, then open details to manage members and invitations.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {user?.role === 'Student' && (
              <Link to="/teams/create" className="btn-primary bg-emerald-500 hover:bg-emerald-600">
                Create Team
              </Link>
            )}
            <Link to="/invitations" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              My Invitations
            </Link>
          </div>
        </section>

        {teams.length === 0 ? (
          <div className="page-card p-8 text-center text-slate-500">No teams found. Create your first team to get started.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeams;
