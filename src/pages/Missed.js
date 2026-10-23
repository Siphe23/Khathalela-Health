import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import useAsyncAction from '../hooks/useAsyncAction';
import { markFollowedUp } from '../features/care/careService';
import { missedAppointments } from '../features/care/careSelectors';
import { REASONS } from '../config/reasons';
import { formatDate } from '../utils/format';

const FILTERS = ['All', 'Transport', 'No Show', 'Other'];

function groupOf(reason) {
  if (reason === 'transport') return 'Transport';
  if (reason === 'noshow') return 'No Show';
  return 'Other';
}

function Missed() {
  const { appointments, loaded } = useSelector((state) => state.care);
  const { run, busy, error } = useAsyncAction();
  const [filter, setFilter] = useState('All');

  const list = missedAppointments(appointments).filter((a) => filter === 'All' || groupOf(a.missedReason) === filter);

  return (
    <AppShell wide title="Missed Appointments" backTo="/dashboard">
      <div className="chips" role="group" aria-label="Filter by reason">
        {FILTERS.map((name) => (
          <button key={name} type="button" aria-pressed={filter === name}
            className={filter === name ? 'chip active' : 'chip'} onClick={() => setFilter(name)}>
            {name}
          </button>
        ))}
      </div>
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      {!loaded.appointments && <p className="empty">Loading…</p>}
      {loaded.appointments && list.length === 0 && <p className="empty">No missed appointments to show.</p>}

      <ul className="plain-list">
        {list.map((item) => (
          <li key={item.id} className="card tight appt-row">
            <span className="row-icon red"><Icon name="alert" /></span>
            <span className="row-text">
              <span className="small muted">{formatDate(item.date)}</span>
              <Link to={`/patients/${item.patientId}`}><strong>{item.patientName}</strong></Link>
              <span>{REASONS[item.missedReason] || 'Other'}</span>
            </span>
            <button type="button" className={item.followedUp ? 'btn-sm done' : 'btn-sm solid'}
              disabled={item.followedUp || busy} onClick={() => run(() => markFollowedUp(item.id))}>
              {item.followedUp ? 'Followed up' : 'Follow Up'}
            </button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

export default Missed;
