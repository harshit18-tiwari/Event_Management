import React, { useEffect, useMemo, useState } from 'react';
import eventService from '../services/eventService';
import registrationService from '../services/registrationService';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const categoryOptions = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');
  const [actionLoadingId, setActionLoadingId] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await eventService.getAllEvents();
      setEvents(res.data.events || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setEvents((e) => e.filter(evt => evt._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleRegister = async (eventId) => {
    setActionLoadingId(eventId);
    try {
      const response = await registrationService.registerForEvent(eventId);
      alert(response.data.message || 'Registered successfully');
      await fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setActionLoadingId('');
    }
  };

  const handleCancel = async (eventId) => {
    setActionLoadingId(eventId);
    try {
      const response = await registrationService.cancelRegistration(eventId);
      alert(response.data.message || 'Registration cancelled');
      await fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally {
      setActionLoadingId('');
    }
  };

  const visibleEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const matchesQuery = event.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || event.category === category;
      return matchesQuery && matchesCategory;
    });

    return [...filtered].sort((left, right) => {
      const leftTime = new Date(left.date).getTime();
      const rightTime = new Date(right.date).getTime();
      return sortBy === 'date-desc' ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [events, query, category, sortBy]);

  if (loading) return <div className="p-6">Loading events...</div>;
  if (error) return <div className="p-6 text-rose-600">{error}</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card overflow-hidden bg-slate-950 text-white">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Events</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Discover what is happening on campus.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Browse events by title, category, and date. Coordinators and admins can manage their events directly from each card.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/dashboard" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                  Back to Dashboard
                </Link>
                {(user?.role === 'Admin' || user?.role === 'Coordinator') && (
                  <Link to="/events/create" className="btn-primary bg-emerald-500 hover:bg-emerald-600">
                    Create Event
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Total Events</div>
                <div className="mt-2 text-3xl font-semibold text-white">{events.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Visible</div>
                <div className="mt-2 text-3xl font-semibold text-white">{visibleEvents.length}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-card p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div>
              <label className="label-base">Search by title</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events..." className="input-base" />
            </div>
            <div>
              <label className="label-base">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-base">
                <option value="date-asc">Date: Earliest first</option>
                <option value="date-desc">Date: Latest first</option>
              </select>
            </div>
          </div>
        </section>

        {visibleEvents.length === 0 ? (
        <div className="page-card p-10 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="text-2xl font-semibold text-slate-900">No events found</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Try a different search term, category, or sort order. If you are a coordinator or admin, you can create a new event from the dashboard or here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((evt) => {
            const canManage = user && (user.role === 'Admin' || (evt.createdBy && evt.createdBy._id === user._id));
            return (
              <EventCard
                key={evt._id}
                event={evt}
                onDelete={handleDelete}
                canManage={canManage}
                onRegister={handleRegister}
                onCancel={handleCancel}
                isSubmitting={actionLoadingId === evt._id}
              />
            );
          })}
        </div>
      )}

      </div>
    </div>
  );
};

export default Events;
