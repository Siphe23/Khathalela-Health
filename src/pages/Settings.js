import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Collapsible from '../components/Collapsible';
import Switch from '../components/Switch';
import Icon from '../components/Icon';
import { LANGUAGES } from '../config/roles';
import { APP_NAME, TAGLINE } from '../config/appInfo';
import { setLanguage, toggleNotification } from '../features/care/careSlice';
import { clearError } from '../features/auth/authSlice';
import { logout, requestPasswordReset } from '../features/auth/authThunks';

function Settings() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { language, notifications } = useSelector((state) => state.care.settings);
  const [resetSent, setResetSent] = useState(false);

  const sendReset = async () => {
    setResetSent(false);
    dispatch(clearError());
    const ok = await dispatch(requestPasswordReset(user.email));
    if (ok) setResetSent(true);
  };

  return (
    <AppShell title="Settings" backTo="/profile">
      <div className="list-card">
        <Collapsible icon="globe" title="Language" subtitle={language}>
          <label htmlFor="language" className="small muted">App language</label>
          <select id="language" className="plain-select" value={language} onChange={(e) => dispatch(setLanguage(e.target.value))}>
            {LANGUAGES.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <p className="muted small">Your choice is saved. Screen translations are coming soon.</p>
        </Collapsible>

        <Collapsible icon="bell" title="Notifications">
          <div className="switch-row">
            <span>Appointment reminders</span>
            <Switch checked={notifications.appointments} label="Appointment reminders"
              onChange={() => dispatch(toggleNotification('appointments'))} />
          </div>
          <div className="switch-row">
            <span>Medication reminders</span>
            <Switch checked={notifications.medication} label="Medication reminders"
              onChange={() => dispatch(toggleNotification('medication'))} />
          </div>
          <p className="muted small">Messages will start once SMS or app notifications are connected.</p>
        </Collapsible>

        <Collapsible icon="lock" title="Privacy & Security">
          <p className="small">We only keep your name, contact details, role and appointment information. Medical records stay with your clinic.</p>
          {resetSent && <div className="banner banner-success" role="status">A password reset link was sent to {user.email}.</div>}
          {error && <div className="banner banner-error" role="alert">{error}</div>}
          <button type="button" className="btn btn-secondary btn-block" onClick={sendReset} disabled={loading}>
            Email me a password reset link
          </button>
        </Collapsible>

        <Collapsible icon="info" title={`About ${APP_NAME}`}>
          <p className="small">{TAGLINE}</p>
          <p className="muted small">Prototype version 0.1</p>
        </Collapsible>
      </div>

      <button type="button" className="btn btn-logout btn-block" onClick={() => dispatch(logout())} disabled={loading}>
        <Icon name="logout" size={18} /> Log Out
      </button>
    </AppShell>
  );
}

export default Settings;
