import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import { nextVisit, nextCollection } from '../features/care/careSelectors';
import { formatDate, greeting } from '../utils/format';

function PatientHome() {
  const user = useSelector((state) => state.auth.user);
  const { appointments, loaded } = useSelector((state) => state.care);

  const next = nextVisit(appointments);
  const collection = nextCollection(appointments);
  const requests = appointments.filter((a) => a.status === 'requested').length;
  const firstName = (user.displayName || 'there').split(' ')[0];

  return (
    <AppShell wide title={`${greeting()}, ${firstName}`} subtitle="Stay healthy. Stay connected.">
      {requests > 0 && (
        <div className="banner banner-info" role="status">
          You have {requests} appointment request{requests === 1 ? '' : 's'} waiting for your clinic to confirm.
        </div>
      )}

      <div className="grid grid-side">
      <div className="stack">
      <section className="card" aria-labelledby="next-visit">
        <div className="card-head">
          <h2 id="next-visit">Next Clinic Visit</h2>
          <Link to="/scan" className="icon-btn tinted" aria-label="Scan the clinic QR code to check in">
            <Icon name="qr" />
          </Link>
        </div>
        {!loaded.appointments ? (
          <p className="muted">Loading…</p>
        ) : next ? (
          <>
            <p className="meta"><Icon name="clock" size={18} /> {formatDate(next.date)}{next.time ? ` · ${next.time}` : ''}</p>
            <p className="meta"><Icon name="pin" size={18} /> {next.clinic}</p>
            <p className="meta muted">{next.type}{next.status === 'checked-in' ? ' · Checked in' : ''}</p>
            <Link to="/appointments" className="btn btn-primary btn-block btn-link">View Details</Link>
          </>
        ) : (
          <p className="muted">You have no upcoming visits. Use Book Appointment below.</p>
        )}
      </section>

      <Link to="/medications" className="card card-gold link-card">
        <span className="row-icon gold"><Icon name="pill" /></span>
        <span className="row-text">
          <strong>Medication Reminder</strong>
          {collection ? (
            <>
              <span>Collect your medication</span>
              <span>{formatDate(collection.date)}</span>
            </>
          ) : (
            <span>No collection booked yet</span>
          )}
        </span>
        <span className="row-arrow"><Icon name="chevron" size={18} /></span>
      </Link>

      </div>
      <div className="stack">
      <h2 className="section-title" style={{ margin: 0 }}>Quick Actions</h2>
      <div className="quick-grid">
        <Link to="/appointments/new" className="quick">
          <span className="quick-icon"><Icon name="plus" /></span>Book Appointment
        </Link>
        <Link to="/appointments" className="quick">
          <span className="quick-icon"><Icon name="calendar" /></span>My Appointments
        </Link>
        <Link to="/help" className="quick">
          <span className="quick-icon"><Icon name="help" /></span>Get Help
        </Link>
      </div>
      </div>
      </div>
    </AppShell>
  );
}

export default PatientHome;
