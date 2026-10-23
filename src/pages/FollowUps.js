import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Collapsible from '../components/Collapsible';
import useAsyncAction from '../hooks/useAsyncAction';
import { markFollowedUp, markRecordUpdated } from '../features/care/careService';
import { followUpGroups } from '../features/care/careSelectors';
import { REASONS } from '../config/reasons';
import { formatDate } from '../utils/format';

function FollowUps() {
  const { appointments, loaded } = useSelector((state) => state.care);
  const { run, busy, error } = useAsyncAction();
  const groups = followUpGroups(appointments);

  return (
    <AppShell wide title="Follow-up Actions" backTo="/dashboard">
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      {!loaded.appointments && <p className="empty">Loading…</p>}
      <p className="muted small">
        These actions come from missed appointments. Marking one done updates the record; it does not send a message yet.
      </p>
      <div className="list-card">
        {groups.map((group) => (
          <Collapsible key={group.id} icon={group.icon} title={group.title}
            subtitle={`${group.items.length} patient${group.items.length === 1 ? '' : 's'}`}>
            {group.items.length === 0 && <p className="muted small">Nothing to do here.</p>}
            <ul className="plain-list">
              {group.items.map((item) => (
                <li key={item.id} className="appt-row followup-item">
                  <span className="row-text">
                    <Link to={`/patients/${item.patientId}`}><strong>{item.patientName}</strong></Link>
                    <span>{formatDate(item.date)} · {REASONS[item.missedReason] || 'Other'}</span>
                  </span>
                  <button type="button" className="btn-sm solid" disabled={busy}
                    onClick={() => run(() => (group.done === 'recordUpdated' ? markRecordUpdated(item.id) : markFollowedUp(item.id)))}>
                    Mark done
                  </button>
                </li>
              ))}
            </ul>
          </Collapsible>
        ))}
      </div>
    </AppShell>
  );
}

export default FollowUps;
