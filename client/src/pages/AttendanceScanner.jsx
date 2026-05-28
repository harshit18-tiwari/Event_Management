import { useState } from 'react';
import ScannerComponent from '../components/ScannerComponent';
import attendanceService from '../services/attendanceService';

const AttendanceScanner = () => {
  const [scanMessage, setScanMessage] = useState('Start the scanner to capture a student QR code.');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState('');

  const handleScan = async (qrToken) => {
    setSubmitting(true);
    setError('');
    setLastResult(qrToken);
    try {
      const response = await attendanceService.checkInAttendance(qrToken);
      setScanMessage(response.data.message || 'Attendance marked successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance.');
      setScanMessage('Scan another QR code to continue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Coordinator View</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Attendance Scanner</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Scan a student QR code to verify the registration and mark attendance in a single step.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="page-card p-5 md:col-span-2">
            <ScannerComponent onScan={handleScan} />
          </div>
          <div className="page-card p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Status</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{submitting ? 'Processing scan...' : 'Ready'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Message</div>
              <div className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{scanMessage}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Last Scan</div>
              <div className="mt-2 break-all rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                {lastResult || 'No QR code scanned yet.'}
              </div>
            </div>
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AttendanceScanner;