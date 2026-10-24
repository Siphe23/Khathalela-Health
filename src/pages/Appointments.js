import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Tabs from '../components/Tabs';
import Icon from '../components/Icon';
import CalendarButtons from '../components/CalendarButtons';
import { formatDate, STATUS_LABELS } from '../utils/format';

function Appointments() {
  const { appointments, loaded } = useSelector((state) => state.care);
  const [tab, setTab] = useState('upcoming');
  const [openId, setOpenId] = useState(null);

  const isPast = (a) => a.status === 'past' || a.status === 'missed';
  const sorted = [...appointments].sort((a, b) => (tab === 'past'
    ? `${b.date}`.localeCompare(`${a.date}`)
    : `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`)));
  const list = sorted.filter((a) => (tab === 'past' ? isPast(a) : !isPast(a)));

  const plus = (
    <Link to="/appointments/new" className="icon-btn" aria-label="Book an appointment">
      <Icon name="plus" />
    </Link>
  );

  return (
    <AppShell title="My Appointments" right={plus}>
      <Tabs label="Appointments" value={tab} onChange={setTab}
        tabs={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }]} />

      {!loaded.appointments && <p className="empty">Loading…</p>}
      {loaded.appointments && list.length === 0 && <p className="empty">No {tab} appointments.</p>}

      <ul className="plain-list">
        {list.map((a) => (
          <li key={a.id} className="card tight">
            <div className="card-head">
              <div>
                <p className="strong">{formatDate(a.date)}{a.time ? ` · ${a.time}` : ''}</p>
                <p className="meta">{a.clinic}</p>
                <p className="meta muted">{a.type}</p>
              </div>
              <button type="button" className="btn-sm" aria-expanded={openId === a.id}
                onClick={() => setOpenId(openId === a.id ? null : a.id)}>
                {openId === a.id ? 'Hide' : 'View'}
              </button>
            </div>
            {openId === a.id && (
              <div className="detail-box">
                <p><span className="muted">Status:</span> <span className={`badge ${a.status}`}>{STATUS_LABELS[a.status]}</span></p>
                {a.status === 'requested' && <p className="muted">Your clinic will confirm the date and time.</p>}
                {a.status === 'upcoming' && <CalendarButtons appointment={a} />}
                {a.status === 'upcoming' && (
                  <Link to="/scan" className="btn btn-secondary btn-block btn-link">Scan QR to check in</Link>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

export default Appointments;
