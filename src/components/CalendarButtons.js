import { googleCalendarUrl, downloadIcs } from '../utils/calendar';

// Two buttons that put an appointment in the patient's own calendar.
function CalendarButtons({ appointment }) {
  if (!appointment.time) return null;
  return (
    <div className="btn-pair cal-buttons">
      <a className="btn-sm solid" href={googleCalendarUrl(appointment)} target="_blank" rel="noopener noreferrer">
        Add to Google Calendar
      </a>
      <button type="button" className="btn-sm" onClick={() => downloadIcs(appointment)}>
        Download for other calendars
      </button>
    </div>
  );
}

export default CalendarButtons;
