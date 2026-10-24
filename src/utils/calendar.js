// "Add to calendar" helpers: a Google Calendar link and a .ics file (Apple, Outlook, any calendar).
import { VISIT_MINUTES } from '../config/booking';

const pad = (n) => String(n).padStart(2, '0');

// 2026-10-27 + 09:30 (+ minutes) becomes 20261027T093000
function stamp(date, time, addMinutes = 0) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const d = new Date(year, month - 1, day, hour, minute + addMinutes);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

const TITLE = (a) => `${a.type} at ${a.clinic}`;
const NOTE = 'Booked in Khatalela-Impilo. Scan the clinic QR code when you arrive.';

export function googleCalendarUrl(a) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: TITLE(a),
    dates: `${stamp(a.date, a.time)}/${stamp(a.date, a.time, VISIT_MINUTES)}`,
    details: NOTE,
    location: a.clinic,
    ctz: 'Africa/Johannesburg',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsText(a) {
  const now = new Date();
  const created = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Khatalela-Impilo//Appointments//EN',
    'BEGIN:VEVENT',
    `UID:${a.id || stamp(a.date, a.time)}@khatalela-impilo`,
    `DTSTAMP:${created}`,
    `DTSTART:${stamp(a.date, a.time)}`,
    `DTEND:${stamp(a.date, a.time, VISIT_MINUTES)}`,
    `SUMMARY:${TITLE(a)}`,
    `LOCATION:${a.clinic}`,
    `DESCRIPTION:${NOTE}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Clinic appointment in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(a) {
  const blob = new Blob([icsText(a)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clinic-appointment.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
