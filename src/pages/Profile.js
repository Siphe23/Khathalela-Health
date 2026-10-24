import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Avatar from '../components/Avatar';
import ListRow from '../components/ListRow';
import Icon from '../components/Icon';
import { ROLES } from '../config/roles';
import { logout } from '../features/auth/authThunks';
import { memberId } from '../utils/format';

function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [error, setError] = useState('');
  const role = user && user.role ? ROLES[user.role] : null;

  const handleLogout = async () => {
    setError('');
    const ok = await dispatch(logout());
    // On success, ProtectedRoute notices and opens the login page.
    if (!ok) setError('We could not log you out. Please try again.');
  };

  return (
    <AppShell title="My Profile" backTo="/dashboard">
      <div className="profile-top">
        <Avatar name={user.displayName} size={96} />
        <h2>{user.displayName || 'Your name'}</h2>
        <p className="muted">{role ? role.label : user.role === 'admin' ? 'Administrator' : 'Member'} · ID: {memberId(user.uid)}</p>
      </div>

      <div className="list-card">
        <ListRow icon="user" title="Personal Information" to="/profile/personal" />
        <ListRow icon="phone" title="Contact Details" to="/profile/contact" />
        <ListRow icon="lock" title="Health Information" to="/profile/health" />
        <ListRow icon="info" title="Settings" to="/settings" />
      </div>

      {error && <div className="banner banner-error" role="alert">{error}</div>}
      <button type="button" className="btn btn-logout btn-block" onClick={handleLogout} disabled={loading}>
        <Icon name="logout" size={18} /> {loading ? 'Logging out…' : 'Log Out'}
      </button>
    </AppShell>
  );
}

export default Profile;
