import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import Switch from '../components/Switch';
import useAsyncAction from '../hooks/useAsyncAction';
import { setMedicationReminder } from '../features/care/careService';
import { nextCollection } from '../features/care/careSelectors';
import { formatDate } from '../utils/format';

function Medications() {
  const { medications, appointments, loaded } = useSelector((state) => state.care);
  const { run, error } = useAsyncAction();
  const collection = nextCollection(appointments);

  return (
    <AppShell title="Medication Reminders">
      <section className="card card-gold">
        <div className="link-card nopad">
          <span className="row-icon gold"><Icon name="pill" /></span>
          <span className="row-text">
            <span>Next Collection</span>
            {collection ? (
              <>
                <strong className="big">{formatDate(collection.date)}</strong>
                <span>{collection.clinic}</span>
              </>
            ) : (
              <strong className="big">Not booked yet</strong>
            )}
          </span>
        </div>
      </section>

      <h2 className="section-title">Your Medication</h2>
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      {!loaded.medications && <p className="empty">Loading…</p>}
      {loaded.medications && medications.length === 0 && (
        <p className="empty">No medication recorded yet. Your clinic adds your medication for you.</p>
      )}

      <ul className="plain-list">
        {medications.map((med) => (
          <li key={med.id} className="card tight med">
            <span className="row-icon"><Icon name="pill" /></span>
            <span className="row-text">
              <strong>{med.name}</strong>
              <span>{med.dose}</span>
              {med.note && <span>({med.note})</span>}
            </span>
            <span className="remind">
              <span className="muted small">Remind me</span>
              <Switch checked={Boolean(med.reminder)} label={`Remind me about ${med.name}`}
                onChange={() => run(() => setMedicationReminder(med.id, !med.reminder))} />
            </span>
          </li>
        ))}
      </ul>
      <p className="muted small">
        Your choice is saved. Reminder messages will start once SMS or app notifications are connected.
      </p>
    </AppShell>
  );
}

export default Medications;
