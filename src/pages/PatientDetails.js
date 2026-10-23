import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Avatar from '../components/Avatar';
import Tabs from '../components/Tabs';
import Icon from '../components/Icon';
import Collapsible from '../components/Collapsible';
import FormField from '../components/FormField';
import useAsyncAction from '../hooks/useAsyncAction';
import {
  addNote, scheduleAppointment, addMedication, removeMedication, DEFAULT_CLINIC,
} from '../features/care/careService';
import { nextVisit, lastVisit } from '../features/care/careSelectors';
import { REASONS } from '../config/reasons';
import { formatDate, millisToISO, todayISO, STATUS_LABELS } from '../utils/format';

const TYPES = ['General Check-up', 'Medication Collection', 'Follow-up', 'Medication Review'];

function PatientDetails() {
  const { patientId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const { patients, appointments, medications, notes, loaded } = useSelector((state) => state.care);
  const { run, busy, error, clearError } = useAsyncAction();

  const patient = patients.find((p) => p.id === patientId);

  const [tab, setTab] = useState('overview');
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [noteError, setNoteError] = useState('');
  const [visit, setVisit] = useState({ date: '', time: '09:00', type: '' });
  const [visitErrors, setVisitErrors] = useState({});
  const [med, setMed] = useState({ name: '', dose: '', note: '' });
  const [medErrors, setMedErrors] = useState({});

  if (!patient) {
    return (
      <AppShell wide title="Patient Details" backTo="/patients">
        {loaded.patients
          ? <p className="empty">We could not find that patient. <Link to="/patients">Back to patients</Link></p>
          : <p className="empty">Loading…</p>}
      </AppShell>
    );
  }

  const myAppointments = appointments.filter((a) => a.patientId === patient.id);
  const myMeds = medications.filter((m) => m.patientId === patient.id);
  const myNotes = notes.filter((n) => n.patientId === patient.id).sort((a, b) => b.createdAt - a.createdAt);
  const next = nextVisit(appointments, patient.id);
  const last = lastVisit(appointments, patient.id);
  const history = myAppointments
    .filter((a) => a.status === 'past' || a.status === 'missed')
    .sort((a, b) => b.date.localeCompare(a.date));

  const saveNote = async (event) => {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) { setNoteError('Please write a note first.'); return; }
    if (clean.length > 500) { setNoteError('Please keep the note under 500 characters.'); return; }
    setNoteError('');
    const ok = await run(() => addNote(patient.id, clean, user));
    if (ok) { setText(''); setAdding(false); setTab('history'); }
  };

  const saveVisit = async (event) => {
    event.preventDefault();
    const errs = {};
    if (!visit.date) errs.date = 'Please choose a date.';
    else if (visit.date < todayISO()) errs.date = 'Please choose a date from today onwards.';
    if (!visit.time) errs.time = 'Please choose a time.';
    if (!visit.type) errs.type = 'Please choose the type of visit.';
    setVisitErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const clinic = patient.preferredClinic || DEFAULT_CLINIC;
    const ok = await run(() => scheduleAppointment(patient, { date: visit.date, time: visit.time, type: visit.type, clinic }));
    if (ok) setVisit({ date: '', time: '09:00', type: '' });
  };

  const saveMed = async (event) => {
    event.preventDefault();
    const errs = {};
    if (!med.name.trim()) errs.name = 'Please enter the medicine name.';
    if (!med.dose.trim()) errs.dose = 'Please enter how it is taken.';
    setMedErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const ok = await run(() => addMedication(patient.id, { name: med.name.trim(), dose: med.dose.trim(), note: med.note.trim() }));
    if (ok) setMed({ name: '', dose: '', note: '' });
  };

  const change = (setter, current) => (event) => setter({ ...current, [event.target.name]: event.target.value });

  return (
    <AppShell wide title="Patient Details" backTo="/patients">
      <div className="profile-top left">
        <Avatar name={patient.name} size={72} />
        <div>
          <h2>{patient.name}</h2>
          <p className="muted">Patient ID: {patient.code}</p>
          <p className="muted small">
            {[patient.gender, patient.age !== null && patient.age !== undefined ? `${patient.age} years` : '', patient.preferredLanguage]
              .filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {error && <div className="banner banner-error" role="alert">{error}</div>}

      <Tabs label="Patient information" value={tab} onChange={setTab}
        tabs={[{ value: 'overview', label: 'Overview' }, { value: 'history', label: 'History' }]} />

      {tab === 'overview' ? (
        <>
          <section className="card">
            <h3 className="card-title"><Icon name="calendar" size={18} /> Next Appointment</h3>
            {next ? (
              <>
                <p className="strong">{formatDate(next.date)}{next.time ? ` · ${next.time}` : ''}</p>
                <p className="meta muted">{next.clinic}</p>
                <p className="meta muted">{next.type}{next.status === 'checked-in' ? ' · Checked in' : ''}</p>
              </>
            ) : <p className="muted">No upcoming appointment.</p>}
          </section>
          <section className="card">
            <h3 className="card-title"><Icon name="clock" size={18} /> Last Visit</h3>
            {last ? (
              <>
                <p className="strong">{formatDate(last.date)}</p>
                <p className="meta muted">{last.type}</p>
              </>
            ) : <p className="muted">No completed visits yet.</p>}
          </section>
          <section className="card">
            <h3 className="card-title"><Icon name="pill" size={18} /> Medication</h3>
            {myMeds.length === 0 && <p className="muted">No medication recorded.</p>}
            <ul className="plain-list">
              {myMeds.map((m) => (
                <li key={m.id} className="appt-row followup-item">
                  <span className="row-text"><strong>{m.name}</strong><span>{m.dose}{m.note ? ` (${m.note})` : ''}</span></span>
                  <button type="button" className="btn-sm" disabled={busy} onClick={() => run(() => removeMedication(m.id))}>Remove</button>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          {myNotes.length === 0 && history.length === 0 && <p className="empty">No history yet.</p>}
          <ul className="plain-list">
            {myNotes.map((note) => (
              <li key={note.id} className="card tight">
                <p className="small muted">Follow-up note · {formatDate(millisToISO(note.createdAt))} · {note.authorName}</p>
                <p>{note.text}</p>
              </li>
            ))}
            {history.map((item) => (
              <li key={item.id} className="card tight">
                <p className="small muted">{formatDate(item.date)} · {STATUS_LABELS[item.status]}</p>
                <p>{item.type}{item.status === 'missed' ? ` (${REASONS[item.missedReason] || 'Other'})` : ''}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="list-card actions-card">
        <Collapsible icon="calendar" title="Schedule appointment">
          <form onSubmit={saveVisit} noValidate>
            <FormField id="date" label="Date" type="date" value={visit.date} onChange={change(setVisit, visit)} error={visitErrors.date} />
            <FormField id="time" label="Time" type="time" value={visit.time} onChange={change(setVisit, visit)} error={visitErrors.time} />
            <FormField id="type" label="Type of visit" type="select" options={TYPES} value={visit.type}
              onChange={change(setVisit, visit)} error={visitErrors.type} />
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>Schedule</button>
          </form>
        </Collapsible>
        <Collapsible icon="pill" title="Add medication">
          <form onSubmit={saveMed} noValidate>
            <FormField id="name" label="Medicine name" value={med.name} onChange={change(setMed, med)} error={medErrors.name} />
            <FormField id="dose" label="How it is taken" value={med.dose} onChange={change(setMed, med)} error={medErrors.dose} hint="For example: 1 tablet daily" />
            <FormField id="note" label="Note" value={med.note} onChange={change(setMed, med)} optional hint="For example: Refill monthly" />
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>Add medication</button>
          </form>
        </Collapsible>
      </div>

      {adding ? (
        <form onSubmit={saveNote} className="note-form" noValidate>
          <label htmlFor="note-text">Follow-up note</label>
          <textarea id="note-text" rows="4" value={text} onChange={(e) => setText(e.target.value)}
            aria-invalid={noteError ? 'true' : 'false'} />
          {noteError && <p className="field-error" role="alert">{noteError}</p>}
          <p className="muted small">Do not write diagnoses or ID numbers in notes.</p>
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={() => { setAdding(false); setNoteError(''); clearError(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary grow" disabled={busy}>{busy ? 'Saving…' : 'Save Note'}</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-primary btn-block" onClick={() => setAdding(true)}>
          Add Follow-up Note
        </button>
      )}
    </AppShell>
  );
}

export default PatientDetails;
