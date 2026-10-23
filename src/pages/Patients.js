import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { nextVisit } from '../features/care/careSelectors';
import { formatDate } from '../utils/format';

function Patients() {
  const { patients, appointments, loaded } = useSelector((state) => state.care);
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const list = [...patients]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter((p) => (p.name || '').toLowerCase().includes(term) || (p.code || '').toLowerCase().includes(term));

  return (
    <AppShell wide title="Patients" backTo="/dashboard">
      <div className="search">
        <Icon name="search" size={18} />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or ID" aria-label="Search patients" />
      </div>

      {!loaded.patients && <p className="empty">Loading…</p>}
      {loaded.patients && patients.length === 0 && (
        <p className="empty">No patients yet. Patients appear here when they register. For a demo, press Load demo data on the Dashboard.</p>
      )}
      {loaded.patients && patients.length > 0 && list.length === 0 && <p className="empty">No patients match your search.</p>}

      <ul className="plain-list">
        {list.map((p) => {
          const next = nextVisit(appointments, p.id);
          return (
            <li key={p.id}>
              <Link to={`/patients/${p.id}`} className="card tight appt-row">
                <Avatar name={p.name} size={44} />
                <span className="row-text">
                  <strong>{p.name}</strong>
                  <span>{p.code} · {next ? `Next: ${formatDate(next.date)}` : 'No upcoming visit'}</span>
                </span>
                <span className="row-arrow"><Icon name="chevron" size={18} /></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}

export default Patients;
