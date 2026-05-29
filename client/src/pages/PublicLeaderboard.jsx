import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import leaderboardService from '../services/leaderboardService';
import LeaderboardTable from '../components/LeaderboardTable';

const PublicLeaderboard = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const leaderboardResponse = await leaderboardService.getPublicLeaderboard(eventId);

      setEvent(leaderboardResponse.data.event || null);
      setLeaderboard(leaderboardResponse.data.leaderboard || []);
    } catch {
      setEvent(null);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const handler = (event) => {
      if (String(event.detail?.eventId) === String(eventId)) {
        load();
      }
    };

    window.addEventListener('leaderboard-updated', handler);
    return () => window.removeEventListener('leaderboard-updated', handler);
  }, [eventId]);

  if (loading) return <div className="page-shell grid place-items-center">Loading public leaderboard...</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Public Leaderboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{event?.title || 'Leaderboard'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Live rankings are shown here once the leaderboard is generated.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/results/public/${eventId}`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              View Public Results
            </Link>
          </div>
        </section>

        <LeaderboardTable entries={leaderboard} />
      </div>
    </div>
  );
};

export default PublicLeaderboard;