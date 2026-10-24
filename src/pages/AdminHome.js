import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import WorkerApprovalCard from '../components/WorkerApprovalCard';
import useAsyncAction from '../hooks/useAsyncAction';
import { setWorkerStatus } from '../features/care/careService';

function AdminHome() {
  const user = useSelector((state) => state.auth.user);
  const { users, patients, appointments, loaded } = useSelector((state) => state.care);
  const { run, busy, error } = useAsyncAction();

  const workers = users.filter((u) => u.role === 'worker');
  const pending = workers.filter((w) => (w.verificationStatus || 'pending') === 'pending');
  const verified = workers.filter((w) => w.verificationStatus === 'verified').length;
  const firstName = (user.displayName || 'Administrator').split(' ')[0];

  const change = (uid, status) => run(() => setWorkerStatus(uid, status));

  return (
    <AppShell wide title={`Hello, ${firstName}`} subtitle="Administrator">
      {error && <div className="banner banner-error" role="alert">{error}</div>}

      <div className="stat-grid">
        <Link to="/admin/users" className="stat">
          <span className="stat-icon blue"><Icon name="users" /></span>
          <span className="stat-label">Patients</span>
          <strong>{users.filter((u) => u.role === 'patient').length}</strong>
        </Link>
        <Link to="/admin/users" className="stat">
          <span className="stat-icon blue"><Icon name="user" /></span>
          <span className="stat-label">Healthcare workers ({verified} verified)</span>
          <strong>{workers.length}</strong>
        </Link>
        <Link to="/admin/users" className="stat">
          <span className="stat-icon red"><Icon name="alert" /></span>
          <span className="stat-label">Waiting for approval</span>
          <strong>{pending.length}</strong>
        </Link>
      </div>

      <div className="stat-grid">
        <Link to="/admin/activity" className="stat">
          <span className="stat-icon blue"><Icon name="calendar" /></span>
          <span className="stat-label">Appointments</span>
          <strong>{appointments.length}</strong>
        </Link>
        <Link to="/admin/activity" className="stat">
          <span className="stat-icon blue"><Icon name="clipboard" /></span>
          <span className="stat-label">Patient records</span>
          <strong>{patients.length}</strong>
        </Link>
      </div>

      <h2 className="section-title">Healthcare workers waiting for approval</h2>
      {!loaded.users && <p className="empty">Loading…</p>}
      {loaded.users && pending.length === 0 && <p className="empty">Nobody is waiting. New healthcare workers appear here when they register.</p>}
      <ul className="plain-list">
        {pending.map((w) => <WorkerApprovalCard key={w.id} worker={w} busy={busy} onSetStatus={change} />)}
      </ul>
    </AppShell>
  );
}

export default AdminHome;
