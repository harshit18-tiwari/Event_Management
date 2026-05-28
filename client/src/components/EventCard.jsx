import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterButton from './RegisterButton';

const EventCard = ({ event, onDelete, canManage, onRegister, onCancel, isSubmitting = false }) => {
  const { user } = useAuth();
  const date = new Date(event.date).toLocaleDateString();
  const createdByName = event.createdBy?.name || 'Unknown';
  const isStudent = user?.role === 'Student';
  const seatsLeft = typeof event.availableSeats === 'number' ? event.availableSeats : event.maxParticipants;
  const registeredCount = typeof event.registeredCount === 'number' ? event.registeredCount : 0;

  return (
    <div className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.10)]">
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-700 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              {event.category}
            </span>
            <h3 className="mt-4 text-xl font-semibold leading-tight">{event.title}</h3>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-right text-xs text-slate-100 backdrop-blur">
            <div className="font-semibold">{date}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">Event date</div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Venue</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{event.venue}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Organizer</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{event.organizer}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-brand-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">Registered</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{registeredCount}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Seats Left</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{seatsLeft}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {event.myRegistration
                ? event.myRegistration.status === 'Waitlisted'
                  ? 'Waitlisted'
                  : 'Already Registered'
                : event.isRegistrationOpen
                  ? seatsLeft <= 0
                    ? 'Event Full'
                    : 'Open'
                  : 'Registration Closed'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
          <span>Created by</span>
          <span className="font-semibold text-slate-900">{createdByName}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/events/${event._id}`} className="btn-primary px-4 py-2 text-xs">
            View Details
          </Link>

          {isStudent && <RegisterButton event={event} onRegister={onRegister} onCancel={onCancel} isSubmitting={isSubmitting} />}

          {canManage && (
            <>
              <Link to={`/events/${event._id}/edit`} className="btn-secondary px-4 py-2 text-xs">
                Edit
              </Link>
              <Link to={`/events/${event._id}/participants`} className="rounded-2xl bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100">
                Participants
              </Link>
              <button
                onClick={() => onDelete && onDelete(event._id)}
                className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
