import { useEffect, useState } from 'react';
import evaluationService from '../services/evaluationService';

const MyEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await evaluationService.getMyEvaluations();
        setEvaluations(response.data.evaluations || []);
      } catch {
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="page-shell grid place-items-center">Loading evaluations...</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">My Evaluations</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Evaluation history</h1>
        </section>

        <div className="grid gap-4">
          {evaluations.map((evaluation) => (
            <article key={evaluation._id} className="page-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">{evaluation.event?.title}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Total Marks: {evaluation.totalMarks}</h2>
                  <p className="mt-1 text-sm text-slate-500">{evaluation.team?.name || evaluation.participant?.name || 'Target not available'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {new Date(evaluation.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {evaluation.scores?.map((score) => (
                  <div key={score._id || score.criteria?._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-semibold text-slate-900">{score.criteria?.title}</div>
                    <div className="text-sm text-slate-600">{score.marks}/{score.criteria?.maxMarks}</div>
                  </div>
                ))}
              </div>

              {evaluation.comments && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{evaluation.comments}</p>}
            </article>
          ))}
          {!evaluations.length && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No evaluations submitted yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default MyEvaluations;
