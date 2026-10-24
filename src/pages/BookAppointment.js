import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import CalendarButtons from '../components/CalendarButtons';
import FormField from '../components/FormField';
import { bookSlot, DEFAULT_CLINIC } from '../features/care/careService';
import { getCareErrorMessage } from '../features/care/careErrors';
import { SLOT_CAPACITY } from '../config/booking';
import { bookingDays, bookedAt, dayLabel, freePlaces, slotsForDay } from '../utils/slots';
import { formatDate } from '../utils/format';

const TYPES = ['General Check-up', 'Medication Collection', 'Follow-up'];

function BookAppointment() {
  const user = useSelector((state) => state.auth.user);
  const { slots, loaded } = useSelector((state) => state.care);
  const clinic = (user.details && user.details.preferredClinic) || DEFAULT_CLINIC;

  const days = bookingDays();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(null);

  const chooseDate = (value) => { setDate(value); setTime(''); setErrors({}); setError(''); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};
    if (!date) newErrors.date = 'Please choose a day.';
    else if (!time) newErrors.time = 'Please choose a time.';
    if (!type) newErrors.type = 'Please choose the reason for your visit.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setBusy(true);
    setError('');
    try {
      const made = await bookSlot(user, { date, time, type, clinic }, bookedAt(slots, date, time));
      setBooked(made);
    } catch (err) {
      setError(err && err.code === 'permission-denied'
        ? 'That time was just taken by someone else. Please choose another time.'
        : getCareErrorMessage(err));
      setTime('');
    } finally {
      setBusy(false);
    }
  };

  if (booked) {
    return (
      <AppShell title="Appointment booked" backTo="/appointments" backLabel="My appointments">
        <section className="card center">
          <h2 className="card-title center-title">You are booked in</h2>
          <p className="strong">{formatDate(booked.date)} at {booked.time}</p>
          <p className="muted">{booked.type} · {booked.clinic}</p>
          <p className="muted small">Save it in your calendar so you do not forget.</p>
          <CalendarButtons appointment={booked} />
          <Link to="/appointments" className="btn btn-primary btn-block btn-link">See my appointments</Link>
        </section>
      </AppShell>
    );
  }

  const daySlots = date ? slotsForDay(slots, date) : [];

  return (
    <AppShell title="Book Appointment" backTo="/appointments" subtitle={`Clinic: ${clinic}`}>
      <div className="banner banner-info" role="note">
        Choose a day and a time that suits you. Up to {SLOT_CAPACITY} people can book each time.
        If you need care today, do not wait: <Link to="/urgent">press Need help now</Link>.
      </div>
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      {!loaded.slots && <p className="empty">Loading available times…</p>}

      <form onSubmit={handleSubmit} noValidate>
        <h2 className="section-title tight-top">1. Choose a day</h2>
        <div className="day-grid" role="group" aria-label="Choose a day">
          {days.map((d) => {
            const free = freePlaces(slots, d);
            const full = loaded.slots && free === 0;
            return (
              <button key={d} type="button" disabled={full} aria-pressed={date === d}
                className={date === d ? 'day-chip active' : 'day-chip'} onClick={() => chooseDate(d)}>
                <strong>{dayLabel(d)}</strong>
                <span>{full ? 'Fully booked' : `${free} places left`}</span>
              </button>
            );
          })}
        </div>
        {errors.date && <p className="field-error" role="alert">{errors.date}</p>}

        {date && (
          <>
            <h2 className="section-title">2. Choose a time</h2>
            <div className="slot-grid" role="group" aria-label="Choose a time">
              {daySlots.map((s) => (
                <button key={s.time} type="button" disabled={s.full} aria-pressed={time === s.time}
                  className={time === s.time ? 'slot active' : 'slot'} onClick={() => setTime(s.time)}>
                  {s.time}
                  <small>{s.full ? 'Full' : `${SLOT_CAPACITY - s.booked} left`}</small>
                </button>
              ))}
              {daySlots.length === 0 && <p className="muted">No times left today. Choose another day.</p>}
            </div>
            {errors.time && <p className="field-error" role="alert">{errors.time}</p>}
          </>
        )}

        <h2 className="section-title">3. Reason for your visit</h2>
        <FormField id="type" label="Reason for visit" type="select" options={TYPES}
          value={type} onChange={(e) => setType(e.target.value)} error={errors.type} />

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Booking…' : 'Book this time'}
        </button>
      </form>
    </AppShell>
  );
}

export default BookAppointment;
