import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import resultService from '../services/resultService';
import leaderboardService from '../services/leaderboardService';
import Podium from '../components/Podium';
import RankCard from '../components/RankCard';

const Results = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [eventResponse, resultResponse, leaderboardResponse] = await Promise.all([
        eventService.getEventById(eventId),
        resultService.getResults(eventId),
        leaderboardService.getLeaderboard(eventId).catch(() => ({ data: { leaderboard: [] } })),
      ]);

      setEvent(eventResponse.data.event);
      setResult(resultResponse.data.result || null);
      setLeaderboard(leaderboardResponse.data.leaderboard || []);
    } catch {
      setEvent(null);
      setResult(null);
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

    window.addEventListener('results-updated', handler);
    return () => window.removeEventListener('results-updated', handler);
  }, [eventId]);

  const canManage = user && (user.role === 'Admin' || user.role === 'Coordinator');

  const handleDeclare = async () => {
    setSaving(true);
    try {
      await resultService.declareWinners(eventId);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to declare results');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-shell grid place-items-center">Loading results...</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Results</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{event?.title || 'Event results'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Declare winners once the leaderboard is ready. Certificates are generated automatically.</p>

          {canManage && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleDeclare} disabled={saving} className="btn-primary bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60">
                {saving ? 'Publishing...' : 'Declare Winners'}
              </button>
              <Link to={`/events/${eventId}/leaderboard`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                View Leaderboard
              </Link>
            </div>
          )}
        </section>

        <Podium entries={leaderboard} />

        <RankCard entry={leaderboard[0]} label="Winner Preview" />

        {result ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700">Published Results</div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-amber-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Winner</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{result.winner?.name || result.winner?.title || 'N/A'}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Runner-Up</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{result.runnerUp?.name || result.runnerUp?.title || 'N/A'}</div>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">Second Runner-Up</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{result.secondRunnerUp?.name || result.secondRunnerUp?.title || 'N/A'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Results have not been declared yet.</div>
        )}
      </div>
    </div>
  );
};

export default Results;