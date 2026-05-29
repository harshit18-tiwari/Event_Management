import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import leaderboardService from '../services/leaderboardService';
import LeaderboardTable from '../components/LeaderboardTable';
import RankCard from '../components/RankCard';

const Leaderboard = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [eventResponse, leaderboardResponse] = await Promise.all([
        eventService.getEventById(eventId),
        leaderboardService.getLeaderboard(eventId),
      ]);

      setEvent(eventResponse.data.event);
      setLeaderboard(leaderboardResponse.data.leaderboard || []);
    } catch (error) {
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

  const canManage = user && (user.role === 'Admin' || user.role === 'Coordinator');

  const handleGenerate = async () => {
    setSaving(true);
    try {
      await leaderboardService.generateLeaderboard(eventId);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate leaderboard');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-shell grid place-items-center">Loading leaderboard...</div>;
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Leaderboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{event?.title || 'Event leaderboard'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Average judge scores are ranked automatically for the active competition.</p>

          {canManage && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleGenerate} disabled={saving} className="btn-primary bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60">
                {saving ? 'Generating...' : 'Generate Leaderboard'}
              </button>
              <Link to={`/events/${eventId}/results`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                View Results
              </Link>
            </div>
          )}
        </section>

        <RankCard entry={leaderboard[0]} label="Top Rank" />

        <LeaderboardTable entries={leaderboard} />
      </div>
    </div>
  );
};

export default Leaderboard;