import { useEffect, useRef, useState } from 'react';

const extractCertificateId = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';

  try {
    const url = new URL(text);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || text;
  } catch {
    return text;
  }
};

const CertificateVerificationForm = ({ initialCertificateId = '', onVerify }) => {
  const [certificateId, setCertificateId] = useState(initialCertificateId);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const scannerElementId = useRef(`certificate-scanner-${Math.random().toString(36).slice(2, 10)}`);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    setCertificateId(initialCertificateId);
  }, [initialCertificateId]);

  useEffect(() => {
    let cancelled = false;

    const startScanner = async () => {
      if (!isScanning) {
        return;
      }

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const html5QrCode = new Html5Qrcode(scannerElementId.current);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            const decodedCertificateId = extractCertificateId(decodedText);
            setCertificateId(decodedCertificateId);
            setScannerError('');
            setIsScanning(false);
            await onVerify(decodedCertificateId);
          },
          () => {}
        );
      } catch (error) {
        setScannerError(error?.message || 'Unable to start the QR scanner.');
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      const html5QrCode = html5QrCodeRef.current;
      html5QrCodeRef.current = null;
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {}).finally(() => html5QrCode.clear().catch(() => {}));
      }
    };
  }, [isScanning, onVerify]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedId = extractCertificateId(certificateId);
    if (!trimmedId) {
      setScannerError('Enter a certificate ID or scan the QR code.');
      return;
    }

    setScannerError('');
    await onVerify(trimmedId);
  };

  return (
    <div className="page-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Verify Certificate</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Search by ID or scan QR</h2>
        </div>
        <button type="button" onClick={() => setIsScanning((value) => !value)} className="btn-secondary">
          {isScanning ? 'Stop Scanner' : 'Scan QR Code'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <label className="label-base">Certificate ID</label>
          <input
            value={certificateId}
            onChange={(event) => setCertificateId(event.target.value)}
            className="input-base"
            placeholder="CERT-HACK-2026-001"
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full md:w-auto">
            Verify Certificate
          </button>
        </div>
      </form>

      {scannerError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{scannerError}</div>}

      {isScanning && (
        <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
          <div id={scannerElementId.current} className="overflow-hidden rounded-[1.5rem] bg-white" />
        </div>
      )}
    </div>
  );
};

export default CertificateVerificationForm;