import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import { checkInAppointment, checkInWalkIn } from '../features/care/careService';
import { nextVisit } from '../features/care/careSelectors';
import { getCareErrorMessage } from '../features/care/careErrors';
import { formatDate, todayISO } from '../utils/format';

import { CLINIC_CODE as DEMO_CODE, extractClinicCode } from '../config/clinicCode';

function ScanQR() {
  const user = useSelector((state) => state.auth.user);
  const appointments = useSelector((state) => state.care.appointments);
  const appointmentsLoaded = useSelector((state) => state.care.loaded.appointments);
  const [params] = useSearchParams();
  const linkCode = params.get('code');
  const next = nextVisit(appointments.filter((a) => a.status === 'upcoming'));

  const videoRef = useRef(null);
  const handledRef = useRef(false);
  const [camera, setCamera] = useState(linkCode ? 'off' : 'starting'); // starting | scanning | unsupported | denied | off
  const [attempt, setAttempt] = useState(0);
  const [manual, setManual] = useState('');
  const [result, setResult] = useState(null); // { ok: boolean, text: string }

  // Called when a code is read by the camera or typed in
  const handleCode = useCallback(async (raw) => {
    if (handledRef.current) return;
    const code = extractClinicCode(raw);
    if (!code) {
      const seen = (raw || '').trim().slice(0, 40);
      setResult({ ok: false, text: `That is not a Khatalela-Impilo clinic code${seen ? ` (it said: ${seen})` : ''}. Please scan the QR code at the clinic.` });
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

  // Opened from the clinic QR link with the phone's normal camera: check in once the bookings have loaded.
  const linkDoneRef = useRef(false);
  useEffect(() => {
    if (!linkCode || !appointmentsLoaded || linkDoneRef.current) return;
    linkDoneRef.current = true;
    handleRef.current(linkCode);
  }, [linkCode, appointmentsLoaded]);

  // Start the camera once and read QR codes from its pictures (works in every modern browser).
  useEffect(() => {
    if (linkCode) return undefined; // no camera needed: the link already holds the code
    setCamera('starting');
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
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setCamera('scanning');
        // The phone's own QR reader is used when the browser has one. jsQR is the backup.
        const detector = 'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null;
        let working = false;
        timer = setInterval(async () => {
          if (!video.videoWidth || working) return;
          working = true;
          try {
            if (detector) {
              const codes = await detector.detect(video);
              if (codes.length > 0 && codes[0].rawValue) { handleRef.current(codes[0].rawValue); return; }
            }
          } catch (error) {
            // The built-in reader failed on this picture: jsQR below will try.
          } finally {
            working = false;
          }
          const scale = Math.min(1, 1280 / video.videoWidth);
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const picture = context.getImageData(0, 0, canvas.width, canvas.height);
          const found = jsQR(picture.data, picture.width, picture.height);
          if (found && found.data) handleRef.current(found.data);
        }, 300);
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
  }, [attempt, linkCode]);

  // Backup: read a QR code from a photo or screenshot
  const handlePhoto = (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const picture = context.getImageData(0, 0, canvas.width, canvas.height);
      const found = jsQR(picture.data, picture.width, picture.height);
      URL.revokeObjectURL(image.src);
      if (found && found.data) handleCode(found.data);
      else setResult({ ok: false, text: 'No QR code found in that picture. Try a clearer, closer photo.' });
    };
    image.src = URL.createObjectURL(file);
  };

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
      <p className="center muted" role="status">
        {camera === 'starting' && 'Starting the camera… allow it when your browser asks.'}
        {camera === 'scanning' && 'Camera is on. Hold the clinic QR code inside the frame, about 20 to 30 cm away.'}
        {(camera === 'unsupported' || camera === 'denied') && 'Camera is off.'}
        {camera === 'off' && 'Checking you in from the clinic link…'}
      </p>

      <section className="card scan-why" aria-labelledby="why-scan">
        <h2 id="why-scan" className="card-title">Why scan?</h2>
        <p className="muted">
          Scanning tells the clinic you have arrived. Your name moves to the nurse's "checked in" list straight away,
          so you do not have to queue just to say you are here. If you have no booking, scanning still checks you in as a walk-in.
        </p>
      </section>

      {(camera === 'unsupported' || camera === 'denied') && (
        <p className="center"><button type="button" className="btn btn-primary" onClick={() => setAttempt((n) => n + 1)}>Try the camera again</button></p>
      )}

      {camera === 'unsupported' && (
        <p className="banner banner-info" role="status">
          This page cannot use the camera. Open the app from its https:// address (or localhost) and use a current browser. You can type the clinic code below instead.
        </p>
      )}
      {camera === 'denied' && (
        <p className="banner banner-info" role="status">
          The camera is not available or was blocked. Click the camera icon in the address bar, choose Allow, and reload. You can type the clinic code below instead.
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
        <label className="btn btn-text photo-pick">
          Scan from a photo or screenshot
          <input type="file" accept="image/*" onChange={handlePhoto} className="visually-hidden" />
        </label>
        <button type="button" className="btn btn-text" onClick={() => { setManual(DEMO_CODE); handleCode(DEMO_CODE); }}>
          Use demo code
        </button>
      </form>
      </div>
    </AppShell>
  );
}

export default ScanQR;
