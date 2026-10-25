import { QRCodeSVG } from 'qrcode.react';
import { clinicLink } from '../config/clinicCode';

// The clinic's check-in QR code. Show it on a screen or print the page.
function ClinicQR() {
  return (
    <section className="card clinic-qr" aria-labelledby="clinic-qr">
      <h2 id="clinic-qr" className="card-title">Clinic check-in QR code</h2>
      <p className="muted small">Patients can scan this with their phone's normal camera. It opens the app and checks them in once they are signed in. The Scan QR page inside the app reads it too. Show it large on a screen, or print it.</p>
      <div className="qr-box">
        <QRCodeSVG value={clinicLink()} size={300} marginSize={4} level="M" bgColor="#ffffff" fgColor="#000000" title="Clinic check-in QR code" />
      </div>
    </section>
  );
}

export default ClinicQR;
