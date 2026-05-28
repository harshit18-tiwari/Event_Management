const RegisterButton = ({ event, onRegister, onCancel, isSubmitting = false }) => {
  const now = new Date();
  const eventStart = new Date(`${new Date(event.date).toISOString().slice(0, 10)}T${event.startTime || '00:00'}:00`);
  const isRegistrationClosed = !event.isRegistrationOpen || now >= eventStart;
  const hasRegistration = Boolean(event.myRegistration);
  const status = event.myRegistration?.status;

  if (hasRegistration) {
    const label = status === 'Waitlisted' ? 'Waitlisted' : 'Already Registered';

    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {label}
        </span>
        <button
          type="button"
          onClick={() => onCancel?.(event._id)}
          disabled={isSubmitting || isRegistrationClosed}
          className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel Registration
        </button>
      </div>
    );
  }

  if (isRegistrationClosed) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Registration Closed
      </span>
    );
  }

  const isFull = event.availableSeats <= 0;

  return (
    <button
      type="button"
      onClick={() => onRegister?.(event._id)}
      disabled={isSubmitting}
      className={`rounded-2xl px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isFull ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-brand-600 text-white hover:bg-brand-700'
      }`}
    >
      {isFull ? 'Join Waitlist' : 'Register Now'}
    </button>
  );
};

export default RegisterButton;
