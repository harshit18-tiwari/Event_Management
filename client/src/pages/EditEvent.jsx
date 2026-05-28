import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EventForm from '../components/EventForm';
import eventService from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await eventService.getEventById(id);
        const evt = res.data.event;
        // authorization: only admin or owner
        if (user.role !== 'Admin' && evt.createdBy._id !== user._id) {
          alert('Not authorized to edit');
          return navigate('/events');
        }
        setInitial(evt);
      } catch (err) {
        alert('Failed to load event');
        navigate('/events');
      } finally { setLoading(false); }
    };
    load();
  }, [id, user, navigate]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await eventService.updateEvent(id, data);
      navigate('/events');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!initial) return null;

  const formInitial = {
    ...initial,
    date: initial.date ? new Date(initial.date).toISOString().slice(0, 10) : '',
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Edit Event</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Update event details.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Make changes to the event you own, or manage any event if you are an admin.
          </p>
        </section>

        <div className="page-card p-6 sm:p-8">
          <EventForm initial={formInitial} onSubmit={handleSubmit} submitting={submitting} />
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
