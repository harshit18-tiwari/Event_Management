import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import judgeService from '../services/judgeService';

const MyAssignedEvents = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await judgeService.getMyAssignedEvents();
        setAssignments(response.data.assignments || []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="page-shell grid place-items-center">Loading assigned events...</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">My Assigned Events</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Events you are allowed to judge</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Open an event to review criteria, score submissions, and track your evaluations.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment) => (
            <article key={assignment._id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Assigned Event</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{assignment.event?.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{assignment.event?.venue}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{assignment.event?.registrationType}</span>
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
          {!assignments.length && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No events have been assigned to you yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default MyAssignedEvents;
