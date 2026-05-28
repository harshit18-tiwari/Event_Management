const QRCodeCard = ({ registration, qrCodeDataUrl, loading, error, onDownload }) => {
  const event = registration?.event;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="bg-slate-950 px-6 py-5 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">My QR Code</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{event?.title || 'Registered Event'}</h2>
        <p className="mt-2 text-sm text-slate-300">
          {event?.date ? new Date(event.date).toLocaleDateString() : '-'} • {event?.venue || '-'}
        </p>
      </div>

      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Registration Status</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{registration?.status || '-'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Attendance</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {registration?.attendanceStatus ? 'Marked Present' : 'Not checked in'}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Present this QR code to the coordinator for attendance check-in.
          </div>

          <button
            type="button"
            onClick={onDownload}
            disabled={!qrCodeDataUrl || loading}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download QR Code
          </button>
        </div>

        <div className="flex justify-center">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-inner">
            {loading ? (
              <div className="grid h-72 w-72 place-items-center rounded-[1.5rem] bg-slate-100 text-slate-500">
                Generating QR code...
              </div>
            ) : error ? (
              <div className="grid h-72 w-72 place-items-center rounded-[1.5rem] bg-rose-50 px-6 text-center text-sm text-rose-700">
                {error}
              </div>
            ) : qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Attendance QR code"
                className="h-72 w-72 rounded-[1.5rem] border border-slate-100 bg-white object-contain p-3"
              />
            ) : (
              <div className="grid h-72 w-72 place-items-center rounded-[1.5rem] bg-slate-100 text-slate-500">
                Select a registered event to view the QR code.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeCard;