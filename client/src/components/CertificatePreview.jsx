const CertificatePreview = ({ certificate, qrCodeDataUrl, verificationUrl }) => {
  const event = certificate?.event || {};

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="bg-slate-950 px-6 py-5 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Certificate Preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{certificate?.certificateType || 'Participation'} Certificate</h2>
        <p className="mt-2 text-sm text-slate-300">Issued for {event.title || 'event participation'}</p>
      </div>

      <div className="grid gap-6 bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-amber-200 bg-white/90 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">College Event Management</div>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{certificate?.studentName || certificate?.student?.name || '-'}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Has successfully completed <span className="font-semibold text-slate-900">{event.title || '-'}</span> and earned the
              <span className="font-semibold text-slate-900"> {certificate?.certificateType || 'Participation'} Certificate</span>.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Certificate ID</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{certificate?.certificateId || '-'}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Issue Date</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {certificate?.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : '-'}
                </div>
              </div>
            </div>

            {verificationUrl && (
              <p className="mt-4 break-all rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                Verification URL: {verificationUrl}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Organizer</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{event.organizer || '-'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Event Date</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{event.date ? new Date(event.date).toLocaleDateString() : '-'}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-inner">
            <div className="grid h-72 w-72 place-items-center rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Certificate verification QR code" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center text-sm text-slate-500">QR code will appear here for verification.</div>
              )}
            </div>
            <div className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Scan to verify</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;