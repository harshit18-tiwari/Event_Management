import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import registrationService from '../services/registrationService';
import attendanceService from '../services/attendanceService';
import QRCodeCard from '../components/QRCodeCard';

const MyQRCode = () => {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [registration, setRegistration] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRegistrations = async () => {
      setLoading(true);
      try {
        const response = await registrationService.getMyEvents();
        setRegistrations(response.data.registrations || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your registrations.');
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, []);

  useEffect(() => {
    if (eventId) {
      setSelectedEventId(eventId);
    }
  }, [eventId]);

  const selectedRegistration = useMemo(() => {
    return registrations.find((item) => item.event?._id === selectedEventId) || null;
  }, [registrations, selectedEventId]);

  useEffect(() => {
    const loadQRCode = async () => {
      if (!selectedEventId) {
        setRegistration(null);
        setQrCodeDataUrl('');
        return;
      }

      setQrLoading(true);
      setError('');
      try {
        const response = await attendanceService.generateQRCode(selectedEventId);
        setRegistration(response.data.registration || selectedRegistration);
        setQrCodeDataUrl(response.data.qrCodeDataUrl || '');
      } catch (err) {
        setRegistration(selectedRegistration);
        setQrCodeDataUrl('');
        setError(err.response?.data?.message || 'Failed to generate QR code.');
      } finally {
        setQrLoading(false);
      }
    };

    loadQRCode();
  }, [selectedEventId, selectedRegistration]);

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${registration?.event?.title || 'event'}-qr.png`;
    link.click();
  };

  if (loading) {
    return <div className="page-shell grid place-items-center">Loading your QR codes...</div>;
  }

  const emptyState = (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
      No registered events found. Register for an event first to receive a QR code.
    </div>
  );

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Student Attendance</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">My QR Code</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Select one of your approved registrations to view and download the QR code used for attendance check-in.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
              Back to Dashboard
            </Link>
            <Link to="/attendance/history" className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10">
              Attendance History
            </Link>
          </div>
        </section>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="page-card p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Registered Events</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{registrations.length}</div>
          </div>
          <div className="page-card p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Selected Event</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{selectedRegistration?.event?.title ? '1' : '0'}</div>
          </div>
          <div className="page-card p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Status</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{selectedRegistration?.status || 'None'}</div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Your registrations</h2>
          {registrations.length === 0 ? (
            emptyState
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {registrations.map((item) => {
                const event = item.event || {};
                const isSelected = event._id === selectedEventId;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setSelectedEventId(event._id)}
                    className={`rounded-[1.75rem] border p-5 text-left shadow-sm transition hover:-translate-y-0.5 ${
                      isSelected ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">{event.category || 'Event'}</div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{event.title || '-'}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {event.date ? new Date(event.date).toLocaleDateString() : '-'} • {event.venue || '-'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Registration Status: {item.status}</p>
                    <div className="mt-4 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {isSelected ? 'Viewing QR code' : 'View QR code'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <QRCodeCard
            registration={registration || selectedRegistration}
            qrCodeDataUrl={qrCodeDataUrl}
            loading={qrLoading}
            error={error}
            onDownload={handleDownload}
          />
        </section>
      </div>
    </div>
  );
};

export default MyQRCode;