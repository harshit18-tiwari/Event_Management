import { useEffect, useRef, useState } from 'react';

const ScannerComponent = ({ onScan }) => {
  const scannerRef = useRef(null);
  const containerId = 'attendance-scanner-reader';
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('Scanner idle');
  const [error, setError] = useState('');

  const stopScanner = async () => {
    if (!scannerRef.current) {
      setIsScanning(false);
      return;
    }

    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    } catch (stopError) {
      // Ignore camera shutdown errors and reset local state.
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
      setStatus('Scanner stopped');
    }
  };

  const startScanner = async () => {
    if (isScanning) return;

    setError('');
    setStatus('Requesting camera permission...');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          setStatus('QR code detected');
          await stopScanner();
          onScan?.(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
      setStatus('Scanning for QR codes...');
    } catch (scannerError) {
      setError(scannerError?.message || 'Unable to start the camera scanner.');
      setStatus('Scanner unavailable');
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={startScanner} disabled={isScanning} className="btn-primary disabled:opacity-60">
          Start Scanner
        </button>
        <button type="button" onClick={stopScanner} disabled={!isScanning} className="btn-secondary disabled:opacity-60">
          Stop Scanner
        </button>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-lg">
        <div id={containerId} className="overflow-hidden rounded-[1.5rem] bg-slate-900" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <span>{status}</span>
          <span>{isScanning ? 'Camera active' : 'Camera idle'}</span>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
    </div>
  );
};

export default ScannerComponent;