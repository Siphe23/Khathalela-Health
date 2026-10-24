import { useState } from 'react';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import { STATUS_LABELS, formatDate, millisToISO } from '../utils/format';

const FILTERS = ['Appointments', 'Follow-up notes', 'Patient records'];
const byNewest = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);

// Read-only view of what is happening in Firestore.
function AdminActivity() {
  const { appointments, notes, patients, loaded } = useSelector((state) => state.care);
  const [filter, setFilter] = useState('Appointments');

  const names = {};
  patients.forEach((p) => { names[p.id] = p.name; });

  return (
    <AppShell wide title="Activity" subtitle="Records in the database (read only)" backTo="/dashboard">
      <div className="chips chips-plain" role="group" aria-label="Choose records">
        {FILTERS.map((name) => (
          <button key={name} type="button" className={name === filter ? 'chip active' : 'chip'}
            aria-pressed={name === filter} onClick={() => setFilter(name)}>{name}</button>
        ))}
      </div>

      {!loaded.appointments && <p className="empty">Loading…</p>}

      {filter === 'Appointments' && (
        <ul className="plain-list">
          {[...appointments].sort(byNewest).slice(0, 50).map((a) => (
            <li key={a.id} className="card tight">
              <div className="appt-row">
                <span className="row-text">
                  <strong>{a.patientName}</strong>
                  <span>{a.type} · {formatDate(a.date)}{a.time ? ` at ${a.time}` : ''} · {a.clinic}</span>
                </span>
                <span className={a.status === 'missed' ? 'badge missed' : a.status === 'requested' ? 'badge requested' : 'badge'}>
                  {STATUS_LABELS[a.status] || a.status}
                </span>
              </div>
            </li>
          ))}
          {loaded.appointments && appointments.length === 0 && <p className="empty">No appointments yet.</p>}
        </ul>
      )}

      {filter === 'Follow-up notes' && (
        <ul className="plain-list">
          {[...notes].sort(byNewest).slice(0, 50).map((n) => (
            <li key={n.id} className="card tight">
              <p className="small muted">
                {n.authorName} wrote about {names[n.patientId] || 'a patient'}
                {n.createdAt ? ` · ${formatDate(millisToISO(n.createdAt))}` : ''}
              </p>
              <p>{n.text}</p>
            </li>
          ))}
          {loaded.notes && notes.length === 0 && <p className="empty">No notes yet.</p>}
        </ul>
      )}

      {filter === 'Patient records' && (
        <ul className="plain-list">
          {[...patients].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((p) => (
            <li key={p.id} className="card tight">
              <div className="appt-row">
                <span className="row-text">
                  <strong>{p.name}</strong>
                  <span>{p.code} · {p.gender || 'gender not given'}{typeof p.age === 'number' ? ` · ${p.age} years` : ''} · {p.preferredClinic || 'no clinic chosen'}</span>
                </span>
              </div>
            </li>
          ))}
          {loaded.patients && patients.length === 0 && <p className="empty">No patient records yet.</p>}
        </ul>
      )}
    </AppShell>
  );
}

export default AdminActivity;
