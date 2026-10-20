import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../components/Logo';
import { ROLES } from '../config/roles';
import { logout } from '../features/auth/authThunks';
import '../css-styles/AuthExtras.css';
import '../css-styles/Dashboard.css';

// Placeholder tiles. They are honest: the features are not built yet.
const TILES = {
  patient: ['Appointments', 'Medication reminders', 'Help and support'],
  worker: ['Today\'s appointments', 'Missed appointments', 'Follow-up actions'],
};

function Dashboard() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [logoutError, setLogoutError] = useState('');

  const role = user && user.role ? ROLES[user.role] : null;
  const firstName = user && user.displayName ? user.displayName.split(' ')[0] : 'there';

  const handleLogout = async () => {
    setLogoutError('');
    const ok = await dispatch(logout());
    // On success ProtectedRoute sees the user is gone and opens /login for us.
    if (!ok) setLogoutError('We could not log you out. Please try again.');
  };

  return (
    <main className="dash">
      <header className="dash-header">
        <Logo size={36} />
        <button type="button" className="btn btn-secondary" onClick={handleLogout} disabled={loading}>
          {loading ? 'Logging out…' : 'Log Out'}
        </button>
      </header>

      <section className="dash-body">
        <h1>Hello, {firstName}</h1>

        {role ? (
          <p><span className="role-badge">{role.label}</span></p>
        ) : (
          <div className="banner banner-error" role="alert">
            We could not load your profile. Please log out and sign in again.
          </div>
        )}

        {logoutError && <div className="banner banner-error" role="alert">{logoutError}</div>}

        {user && user.role === 'worker' && user.verificationStatus === 'pending' && (
          <div className="banner banner-info" role="status">
            Your professional registration number is waiting to be checked. You will get full
            healthcare worker access once it is verified.
          </div>
        )}

        {user && user.details && (
          <dl className="dash-details">
            {role && role.fields.filter((f) => user.details[f.name]).map((f) => (
              <div key={f.name}>
                <dt>{f.label}</dt>
                <dd>{user.details[f.name]}</dd>
              </div>
            ))}
          </dl>
        )}

        {role && (
          <div className="dash-grid">
            {TILES[role.id].map((title) => (
              <div className="dash-tile" key={title}>
                <strong>{title}</strong>
                <span>Coming soon</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
