import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import useAsyncAction from '../hooks/useAsyncAction';
import { saveConcern } from '../features/care/careService';
import { doseSummary, nextVisit, missedAppointments } from '../features/care/careSelectors';
import { CONCERNS } from '../config/booking';
import { addDays, todayISO, formatDate, millisToISO } from '../utils/format';

function Progress() {
  const user = useSelector((state) => state.auth.user);
  const { medications, doseLogs, appointments, patients, loaded } = useSelector((state) => state.care);
  const { run, busy, error } = useAsyncAction();

  const mine = patients.find((p) => p.id === user.uid);
  const [concern, setConcern] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const today = todayISO();
  const from = addDays(today, -6);
  const summary = doseSummary(doseLogs, medications, today);
  const next = nextVisit(appointments);
  const missedRecently = missedAppointments(appointments).filter((a) => a.date >= addDays(today, -30)).length;
  const percent = summary.expected === 0 ? 0 : Math.round((summary.taken / summary.expected) * 100);

  const perMedicine = medications.map((m) => {
    const logs = doseLogs.filter((l) => l.medicationId === m.id && l.date >= from && l.date <= today);
    const taken = logs.filter((l) => l.status === 'taken').length;
    const missed = logs.filter((l) => l.status === 'missed').length;
    return { m, taken, missed, none: 7 - taken - missed };
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!concern) return;
    const ok = await run(() => saveConcern(user.uid, concern, note.trim().slice(0, 200)));
    if (ok) { setSaved(true); setNote(''); }
  };

  return (
    <AppShell title="My Care Progress" subtitle="What you record here helps your nurse support you." backTo="/dashboard">
      <section className="card" aria-labelledby="week">
        <h2 id="week" className="card-title">Medication this week</h2>
        {!loaded.medications ? <p className="muted">Loading…</p> : medications.length === 0 ? (
          <p className="muted">No medication recorded yet. Your clinic adds your medication.</p>
        ) : (
          <>
            <p className="big">{summary.taken} of {summary.expected} doses recorded as taken</p>
            <div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{ width: `${percent}%` }} /></div>
            <p className="muted small">
              {summary.missed} recorded as missed · {summary.notRecorded} not recorded. This is what you told us. It does not prove how the medicine was taken.
            </p>
            <ul className="plain-list progress-list">
              {perMedicine.map(({ m, taken, missed, none }) => (
                <li key={m.id} className="line">
                  <span className="row-text"><strong>{m.name}</strong><span>{m.dose}</span></span>
                  <span className="small muted">{taken} taken · {missed} missed · {none} not recorded</span>
                </li>
              ))}
            </ul>
            <Link to="/medications" className="btn btn-primary btn-block btn-link">Record today's medication</Link>
          </>
        )}
      </section>

      <section className="card" aria-labelledby="visits">
        <h2 id="visits" className="card-title">Clinic visits</h2>
        <p><span className="muted">Next visit:</span> <strong>{next ? `${formatDate(next.date)}${next.time ? ` at ${next.time}` : ''}` : 'none booked'}</strong></p>
        <p><span className="muted">Missed in the last 30 days:</span> <strong>{missedRecently}</strong></p>
        {!next && <Link to="/appointments/new" className="btn btn-secondary btn-block btn-link">Book a visit</Link>}
      </section>

      <section className="card" aria-labelledby="concern">
        <h2 id="concern" className="card-title">What makes care hard for you?</h2>
        <p className="muted">Your nurse can see this. It helps them plan, for example transport help.</p>
        {mine && mine.concern && (
          <p className="banner banner-info">
            Saved: <strong>{mine.concern}</strong>{mine.concernNote ? ` · ${mine.concernNote}` : ''}
            {mine.concernAt ? ` (${formatDate(millisToISO(mine.concernAt))})` : ''}
          </p>
        )}
        {error && <div className="banner banner-error" role="alert">{error}</div>}
        {saved && <div className="banner banner-success" role="status">Thank you. Your clinic can now see this.</div>}
        <form onSubmit={submit} className="note-form" noValidate>
          <label htmlFor="concern-select">Main difficulty</label>
          <select id="concern-select" className="plain-select" value={concern} onChange={(e) => { setConcern(e.target.value); setSaved(false); }}>
            <option value="">Select…</option>
            {CONCERNS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label htmlFor="concern-note">Anything to add? (optional)</label>
          <textarea id="concern-note" rows="2" maxLength="200" value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-block" disabled={busy || !concern}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

export default Progress;
