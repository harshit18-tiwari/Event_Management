import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import eventService from '../services/eventService';
import criteriaService from '../services/criteriaService';
import CriteriaForm from '../components/CriteriaForm';
import CriteriaCard from '../components/CriteriaCard';

const ManageCriteria = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const loadData = async () => {
    try {
      const [eventResponse, criteriaResponse] = await Promise.all([
        eventService.getEventById(eventId),
        criteriaService.getEventCriteria(eventId),
      ]);

      setEvent(eventResponse.data.event);
      setCriteria(criteriaResponse.data.criteria || []);
    } catch {
      setEvent(null);
      setCriteria([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await criteriaService.updateCriteria(editing._id, payload);
      } else {
        await criteriaService.createCriteria({ ...payload, event: eventId });
      }

      setEditing(null);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save criteria');
    }
  };

  const handleDelete = async (id) => {
    try {
      await criteriaService.deleteCriteria(id);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete criteria');
    }
  };

  if (loading) return <div className="page-shell grid place-items-center">Loading criteria...</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Manage Criteria</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{event?.title || 'Event criteria'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Define the rubric judges will use for scoring this event.</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="page-card p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{editing ? 'Edit Criteria' : 'Add Criteria'}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{editing ? editing.title : 'New scoring rule'}</h2>
              </div>
              {editing && (
                <button type="button" className="btn-secondary px-4 py-2 text-xs" onClick={() => setEditing(null)}>
                  Cancel Edit
                </button>
              )}
            </div>
            <CriteriaForm initial={editing || {}} onSubmit={handleSubmit} />
          </div>

          <div className="space-y-4">
            {criteria.map((item) => (
              <CriteriaCard
                key={item._id}
                criteria={item}
                onEdit={() => setEditing(item)}
                onDelete={() => handleDelete(item._id)}
              />
            ))}
            {!criteria.length && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No criteria configured yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCriteria;
