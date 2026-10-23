import { QRCodeSVG } from 'qrcode.react';
import { CLINIC_CODE } from '../config/clinicCode';

// The clinic's check-in QR code. Show it on a screen or print the page.
function ClinicQR() {
  return (
    <section className="card clinic-qr" aria-labelledby="clinic-qr">
      <h2 id="clinic-qr" className="card-title">Clinic check-in QR code</h2>
      <p className="muted small">Patients scan this code with the Scan QR page to check in. Show it on a screen or print it.</p>
      <div className="qr-box">
        <QRCodeSVG value={CLINIC_CODE} size={220} marginSize={4} level="M" bgColor="#ffffff" fgColor="#000000" title="Clinic check-in QR code" />
      </div>
    </section>
  );
}

export default ClinicQR;
