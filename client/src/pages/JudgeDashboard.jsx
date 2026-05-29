import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import judgeService from '../services/judgeService';
import evaluationService from '../services/evaluationService';

const JudgeDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [assignmentResponse, evaluationResponse] = await Promise.all([
          judgeService.getMyAssignedEvents(),
          evaluationService.getMyEvaluations(),
        ]);

        setAssignments(assignmentResponse.data.assignments || []);
        setEvaluations(evaluationResponse.data.evaluations || []);
      } catch {
        setAssignments([]);
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const upcomingAssignments = assignments.filter((item) => new Date(item.event?.date) >= new Date()).length;

  if (loading) {
    return <div className="page-shell grid place-items-center">Loading judge dashboard...</div>;
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Judge Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Review assigned events and submit evaluations</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Use the assigned event list to open evaluation pages, review criteria, and track everything you have scored.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/judge/my-events" className="btn-primary bg-emerald-500 hover:bg-emerald-600">My Assigned Events</Link>
            <Link to="/judge/my-evaluations" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">My Evaluations</Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Assigned Events', assignments.length],
            ['Upcoming Assignments', upcomingAssignments],
            ['Evaluations Submitted', evaluations.length],
          ].map(([label, value]) => (
            <div key={label} className="page-card p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
            </div>
          ))}
        </section>

        <section className="page-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Assigned Events</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Open event-specific workflows</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <article key={assignment._id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Assigned Event</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{assignment.event?.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{assignment.event?.venue}</p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    {assignment.event?.registrationType}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <div>{assignment.event?.date ? new Date(assignment.event.date).toLocaleDateString() : '-'}</div>
                  <div className="mt-1">{assignment.event?.startTime} - {assignment.event?.endTime}</div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to={assignment.event?.registrationType === 'Team'
                      ? `/judge/events/${assignment.event?._id}/evaluate-team`
                      : `/judge/events/${assignment.event?._id}/evaluate-participant`}
                    className="btn-primary px-4 py-2 text-xs"
                  >
                    Evaluate
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default JudgeDashboard;
