// The text inside the clinic's check-in QR code.
// The worker dashboard shows this code as a QR image. The patient's Scan page reads it.
export const CLINIC_PREFIX = 'KHATALELA-CLINIC:';
export const CLINIC_CODE = 'KHATALELA-CLINIC:MTHATHA';

// The QR shows a web link, so the phone's normal camera can open the app.
// The link is built from the address the worker page is open on.
export function clinicLink() {
  return `${window.location.origin}/scan?code=${encodeURIComponent(CLINIC_CODE)}`;
}

// Finds the clinic code inside what was scanned (a plain code or the link above).
export function extractClinicCode(raw) {
  const text = decodeURIComponent((raw || '').trim());
  const at = text.indexOf(CLINIC_PREFIX);
  return at === -1 ? '' : text.slice(at).split(/[&#\s]/)[0];
}
