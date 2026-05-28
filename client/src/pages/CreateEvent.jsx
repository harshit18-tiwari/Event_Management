import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import eventService from '../services/eventService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await eventService.createEvent(data);
      navigate('/events');
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">New Event</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Create a new campus event.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Coordinators and admins can publish an event with venue, schedule, category, and capacity details.
          </p>
        </section>

        <div className="page-card p-6 sm:p-8">
          <EventForm onSubmit={handleSubmit} submitting={submitting} />
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
