import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import ClinicQR from '../components/ClinicQR';
import useAsyncAction from '../hooks/useAsyncAction';
import {
  approveRequest, checkInAppointment, completeAppointment, markMissed,
  seedDemoData, clearDemoData,
} from '../features/care/careService';
import {
  todaysAppointments, requestedAppointments, missedAppointments, followUpGroups,
} from '../features/care/careSelectors';
import { REASONS } from '../config/reasons';
import { formatDate } from '../utils/format';

function WorkerHome() {
  const user = useSelector((state) => state.auth.user);
  const { appointments, patients, loaded } = useSelector((state) => state.care);
  const { run, busy, error } = useAsyncAction();

  const [showAll, setShowAll] = useState(false);
  const [missedFor, setMissedFor] = useState(null);
  const [reason, setReason] = useState('transport');
  const [times, setTimes] = useState({});
  const [notice, setNotice] = useState('');

  const verified = user.verificationStatus === 'verified';
  const today = todaysAppointments(appointments);
  const requests = requestedAppointments(appointments);
  const missedOpen = missedAppointments(appointments).filter((a) => !a.followedUp).length;
  const pending = followUpGroups(appointments).reduce((total, group) => total + group.items.length, 0);
  const shown = showAll ? today : today.slice(0, 3);
  const firstName = (user.displayName || 'there').split(' ')[0];
  const facility = user.details && user.details.facilityName;

  const saveMissed = async (id) => {
    const ok = await run(() => markMissed(id, reason));
    if (ok) setMissedFor(null);
  };

  const loadDemo = async () => {
    setNotice('');
    const registered = patients.filter((p) => p.uid && !p.demo);
    const ok = await run(() => seedDemoData(registered));
    if (ok) setNotice('Demo data loaded.');
  };

  const clearDemo = async () => {
    setNotice('');
    const ok = await run(() => clearDemoData());
    if (ok) setNotice('Demo data removed.');
  };

  return (
    <AppShell wide title={`Hello, ${firstName}`} subtitle={facility || 'Healthcare worker'}>
      {!verified && (
        <div className="banner banner-info" role="status">
          Your professional registration number is waiting to be checked. Patient information
          appears here once an administrator verifies your account.
        </div>
      )}
      {error && <div className="banner banner-error" role="alert">{error}</div>}

      <div className="stat-grid">
        <div className="stat">
          <span className="stat-icon blue"><Icon name="calendar" /></span>
          <span className="stat-label">Today's Appointments</span>
          <strong>{today.length}</strong>
        </div>
        <Link to="/missed" className="stat">
          <span className="stat-icon red"><Icon name="alert" /></span>
          <span className="stat-label">Missed Appointments</span>
          <strong>{missedOpen}</strong>
        </Link>
        <Link to="/followups" className="stat">
          <span className="stat-icon blue"><Icon name="clipboard" /></span>
          <span className="stat-label">Follow-ups Pending</span>
          <strong>{pending}</strong>
        </Link>
      </div>

      <Link to="/summary" className="card link-card">
        <span className="row-icon"><Icon name="sparkle" /></span>
        <span className="row-text">
          <strong>Summary</strong>
          <span>See common reasons for missed appointments</span>
        </span>
        <span className="row-arrow"><Icon name="chevron" size={18} /></span>
      </Link>

      {requests.length > 0 && (
        <>
          <h2 className="section-title">Appointment Requests</h2>
          <ul className="plain-list">
            {requests.map((r) => (
              <li key={r.id} className="card tight">
                <p className="strong">{r.patientName}</p>
                <p className="meta muted">{r.type} · {formatDate(r.date)} · {r.clinic}</p>
                <div className="inline-form">
                  <label htmlFor={`time-${r.id}`} className="small muted">Time</label>
                  <input id={`time-${r.id}`} type="time" value={times[r.id] || '09:00'}
                    onChange={(e) => setTimes({ ...times, [r.id]: e.target.value })} />
                  <button type="button" className="btn-sm solid" disabled={busy}
                    onClick={() => run(() => approveRequest(r.id, times[r.id] || '09:00'))}>
                    Approve
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="card-head">
        <h2 className="section-title">Upcoming Appointments</h2>
        {today.length > 3 && (
          <button type="button" className="btn btn-text small-link" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : 'View All'}
          </button>
        )}
      </div>
      {verified && !loaded.appointments && <p className="empty">Loading…</p>}
      {verified && loaded.appointments && today.length === 0 && (
        <p className="empty">No appointments scheduled for today.</p>
      )}
      <ul className="plain-list">
        {shown.map((item) => (
          <li key={item.id} className="card tight">
            <div className="appt-row">
              <span className="time">{item.time || '--:--'}</span>
              <span className="row-text">
                <Link to={`/patients/${item.patientId}`}><strong>{item.patientName}</strong></Link>
                <span>{item.type}</span>
              </span>
              {item.status === 'upcoming' && (
                <span className="btn-pair">
                  <button type="button" className="btn-sm solid" disabled={busy}
                    onClick={() => run(() => checkInAppointment(item.id))}>Check-in</button>
                  <button type="button" className="btn-sm" onClick={() => setMissedFor(missedFor === item.id ? null : item.id)}>Missed</button>
                </span>
              )}
              {item.status === 'checked-in' && (
                <button type="button" className="btn-sm solid" disabled={busy}
                  onClick={() => run(() => completeAppointment(item.id))}>Complete</button>
              )}
              {item.status === 'past' && <span className="badge past">Completed</span>}
              {item.status === 'missed' && <span className="badge requested">Missed</span>}
            </div>
            {missedFor === item.id && (
              <div className="inline-form">
                <label htmlFor={`why-${item.id}`} className="small muted">Reason</label>
                <select id={`why-${item.id}`} className="plain-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {Object.keys(REASONS).map((key) => <option key={key} value={key}>{REASONS[key]}</option>)}
                </select>
                <button type="button" className="btn-sm solid" disabled={busy} onClick={() => saveMissed(item.id)}>Save</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ClinicQR />

      {verified && (
        <section className="card demo-tools" aria-labelledby="demo-tools">
          <h2 id="demo-tools" className="card-title">Demo tools</h2>
          <p className="muted small">
            For presentations only. This adds fictional patients, appointments and medication
            to Firebase. It also gives every registered patient sample visits and medication.
            "Remove" deletes only what was added here.
          </p>
          {notice && <div className="banner banner-success" role="status">{notice}</div>}
          <div className="btn-row">
            <button type="button" className="btn btn-primary grow" disabled={busy} onClick={loadDemo}>
              {busy ? 'Working…' : 'Load demo data'}
            </button>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={clearDemo}>Remove</button>
          </div>
        </section>
      )}
    </AppShell>
  );
}

export default WorkerHome;
