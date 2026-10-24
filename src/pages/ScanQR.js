import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import { checkInAppointment, checkInWalkIn } from '../features/care/careService';
import { nextVisit } from '../features/care/careSelectors';
import { getCareErrorMessage } from '../features/care/careErrors';
import { formatDate, todayISO } from '../utils/format';

import { CLINIC_PREFIX, CLINIC_CODE as DEMO_CODE } from '../config/clinicCode';

function ScanQR() {
  const user = useSelector((state) => state.auth.user);
  const appointments = useSelector((state) => state.care.appointments);
  const next = nextVisit(appointments.filter((a) => a.status === 'upcoming'));

  const videoRef = useRef(null);
  const handledRef = useRef(false);
  const [camera, setCamera] = useState('starting'); // starting | scanning | unsupported | denied
  const [manual, setManual] = useState('');
  const [result, setResult] = useState(null); // { ok: boolean, text: string }

  // Called when a code is read by the camera or typed in
  const handleCode = useCallback(async (raw) => {
    if (handledRef.current) return;
    const code = (raw || '').trim();
    if (!code.startsWith(CLINIC_PREFIX)) {
      setResult({ ok: false, text: 'That is not a Khatalela-Impilo clinic code. Please scan the QR code at the clinic.' });
      return;
    }
    const alreadyIn = appointments.find((a) => a.status === 'checked-in' && a.date === todayISO());
    if (alreadyIn) {
      handledRef.current = true;
      setResult({ ok: true, text: 'You are already checked in. Please wait to be called.' });
      return;
    }
    handledRef.current = true; // stop the camera reading the same code again and again
    try {
      if (next) {
        await checkInAppointment(next.id);
        setResult({ ok: true, text: `You are checked in for ${next.type} on ${formatDate(next.date)} at ${next.clinic}. The nurse can see you are here.` });
      } else {
        await checkInWalkIn(user, user.details && user.details.preferredClinic);
        setResult({ ok: true, text: 'You are checked in as a walk-in. You did not need a booking. The nurse can see you are here.' });
      }
    } catch (error) {
      handledRef.current = false;
      setResult({ ok: false, text: getCareErrorMessage(error) });
    }
  }, [next, appointments, user]);

  const handleRef = useRef(handleCode);
  useEffect(() => {
    handleRef.current = handleCode;
  }, [handleCode]);

  // Start the camera once and read QR codes from its pictures (works in every modern browser).
  useEffect(() => {
    let stream = null;
    let timer = null;
    let cancelled = false;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCamera('unsupported');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setCamera('scanning');
        timer = setInterval(() => {
          if (!video.videoWidth) return;
          const scale = Math.min(1, 640 / video.videoWidth);
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const picture = context.getImageData(0, 0, canvas.width, canvas.height);
          const found = jsQR(picture.data, picture.width, picture.height);
          if (found && found.data) handleRef.current(found.data);
        }, 250);
      } catch (error) {
        setCamera('denied');
      }
    }

    start();
    return () => {
      cancelled = true;
      clearInterval(timer);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleManual = (event) => {
    event.preventDefault();
    handleCode(manual);
  };

  return (
    <AppShell title="Scan QR Code" backTo="/dashboard" center>
      <div className="scan-page">
      <div className="scan-frame">
        <video ref={videoRef} className={camera === 'scanning' ? 'scan-video show' : 'scan-video'} muted playsInline />
        {camera !== 'scanning' && <span className="scan-placeholder"><Icon name="qr" size={72} /></span>}
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
      </div>
      <p className="center muted">Scan the QR code at the clinic</p>

      <section className="card scan-why" aria-labelledby="why-scan">
        <h2 id="why-scan" className="card-title">Why scan?</h2>
        <p className="muted">
          Scanning tells the clinic you have arrived. Your name moves to the nurse's "checked in" list straight away,
          so you do not have to queue just to say you are here. If you have no booking, scanning still checks you in as a walk-in.
        </p>
      </section>

      {camera === 'unsupported' && (
        <p className="banner banner-info" role="status">
          This browser cannot scan with the camera. Type the clinic code below instead.
        </p>
      )}
      {camera === 'denied' && (
        <p className="banner banner-info" role="status">
          The camera is not available or was blocked. Type the clinic code below instead.
        </p>
      )}

      {result && (
        <div className={result.ok ? 'banner banner-success' : 'banner banner-error'} role={result.ok ? 'status' : 'alert'}>
          {result.text}
          {result.ok && <> <Link to="/appointments">See my appointments</Link></>}
        </div>
      )}

      <form onSubmit={handleManual} className="manual">
        <label htmlFor="code">Clinic code</label>
        <div className="manual-row">
          <input id="code" type="text" value={manual} onChange={(e) => setManual(e.target.value)}
            placeholder="KHATALELA-CLINIC:..." autoComplete="off" />
          <button type="submit" className="btn btn-primary">Check In</button>
        </div>
        <button type="button" className="btn btn-text" onClick={() => { setManual(DEMO_CODE); handleCode(DEMO_CODE); }}>
          Use demo code
        </button>
      </form>
      </div>
    </AppShell>
  );
}

export default ScanQR;
