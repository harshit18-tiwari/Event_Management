import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import eventService from '../services/eventService';
import judgeService from '../services/judgeService';
import JudgeSelector from '../components/JudgeSelector';
import AssignedJudgeTable from '../components/AssignedJudgeTable';

const AssignJudges = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [judges, setJudges] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [judgeId, setJudgeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [eventResponse, judgesResponse, assignmentsResponse] = await Promise.all([
        eventService.getEventById(eventId),
        judgeService.getAvailableJudges(),
        judgeService.getAssignedJudges(eventId),
      ]);

      setEvent(eventResponse.data.event);
      setJudges(judgesResponse.data.judges || []);
      setAssignments(assignmentsResponse.data.assignments || []);
    } catch (error) {
      setEvent(null);
      setJudges([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await judgeService.assignJudge({ eventId, judgeId });
      setJudgeId('');
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign judge');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (assignmentId) => {
    try {
      await judgeService.removeJudge(assignmentId);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove judge');
    }
  };

  if (loading) return <div className="page-shell grid place-items-center">Loading judge assignment...</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Judge Assignment</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{event?.title || 'Event not found'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Assign judges who will evaluate this event. Coordinators can manage only their own events.</p>
        </section>

        <div className="page-card p-6 sm:p-8">
          <form onSubmit={handleAssign} className="space-y-4">
            <JudgeSelector judges={judges} value={judgeId} onChange={(e) => setJudgeId(e.target.value)} />
            <button type="submit" disabled={saving} className="btn-primary px-5 py-3 disabled:opacity-60">
              {saving ? 'Assigning...' : 'Assign Judge'}
            </button>
          </form>
        </div>

        <div className="page-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Current Assignments</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Judges already assigned</h2>
            </div>
          </div>
          <div className="mt-6">
            <AssignedJudgeTable assignments={assignments} onRemove={handleRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignJudges;
