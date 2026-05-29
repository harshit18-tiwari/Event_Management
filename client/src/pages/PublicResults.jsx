import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import resultService from '../services/resultService';
import Podium from '../components/Podium';

const PublicResults = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const resultResponse = await resultService.getPublicResults(eventId);

      setEvent(resultResponse.data.event || null);
      setResult(resultResponse.data.result || null);
      const toPlacementEntry = (placement, rank) => {
        if (!placement) return null;
        if (placement.members || placement.leader) {
          return { rank, finalScore: 0, team: placement };
        }
        return { rank, finalScore: 0, participant: placement };
      };

      setLeaderboard(
        resultResponse.data.result
          ? [
              toPlacementEntry(resultResponse.data.result.winner, 1),
              toPlacementEntry(resultResponse.data.result.runnerUp, 2),
              toPlacementEntry(resultResponse.data.result.secondRunnerUp, 3),
            ]
              .filter(Boolean)
          : []
      );
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

  if (loading) return <div className="page-shell grid place-items-center">Loading public results...</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Public Results</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{event?.title || 'Event results'}</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/leaderboard/public/${eventId}`} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              View Public Leaderboard
            </Link>
          </div>
        </section>

        {result ? (
          <>
            <Podium entries={leaderboard} />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700">Winner</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{result.winner?.name || result.winner?.title || 'N/A'}</div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Runner-Up</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{result.runnerUp?.name || result.runnerUp?.title || 'N/A'}</div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-700">Second Runner-Up</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{result.secondRunnerUp?.name || result.secondRunnerUp?.title || 'N/A'}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Results have not been published yet.</div>
        )}
      </div>
    </div>
  );
};

export default PublicResults;