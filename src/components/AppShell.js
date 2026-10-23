import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Icon from './Icon';
import Logo from './Logo';
import Avatar from './Avatar';
import CareStatus from './CareStatus';
import { logout } from '../features/auth/authThunks';
import '../css-styles/AuthForm.css';
import '../css-styles/AuthExtras.css';
import '../css-styles/App.css';

const NAV = {
  patient: [
    { to: '/dashboard', label: 'Home', icon: 'home' },
    { to: '/appointments', label: 'Appointments', icon: 'calendar' },
    { to: '/medications', label: 'Medication', icon: 'pill' },
    { to: '/help', label: 'Help', icon: 'help' },
    { to: '/profile', label: 'Profile', icon: 'user' },
  ],
  worker: [
    { to: '/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/patients', label: 'Patients', icon: 'users' },
    { to: '/missed', label: 'Missed', icon: 'alert' },
    { to: '/followups', label: 'Follow-ups', icon: 'clipboard' },
    { to: '/summary', label: 'Summary', icon: 'sparkle' },
    { to: '/profile', label: 'Profile', icon: 'user' },
  ],
};

// The frame around every signed-in page: top menu, page title and content.
function AppShell({ title, subtitle, backTo, backLabel = 'Back', actions, right, wide = false, center = false, children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Back goes to the page you came from. If there is none (page opened directly), use backTo.
  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate(backTo || '/dashboard');
  };
  const { user, loading, error } = useSelector((state) => state.auth);
  const items = NAV[user && user.role] || NAV.patient;

  return (
    <div className="web">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/dashboard" className="brand" aria-label="Go to your home page">
            <Logo size={34} textSize="1.2rem" />
          </Link>

          <nav className="topnav" aria-label="Main menu">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="topbar-user">
            <Link to="/profile" className="user-chip" aria-label="Your profile">
              <Avatar name={user && user.displayName} size={36} />
              <span className="user-name">{user && user.displayName}</span>
            </Link>
            <button type="button" className="btn-sm" onClick={() => dispatch(logout())} disabled={loading}>
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <div className={wide ? 'page-inner' : 'page-inner centered'}>
          {backTo && (
            <button type="button" className="back-link" onClick={goBack}><Icon name="back" size={18} /> {backLabel}</button>
          )}
          <div className={center ? 'page-head center-head' : 'page-head'}>
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
            {(actions || right) && <div className="page-actions">{actions || right}</div>}
          </div>
          {error && <div className="banner banner-error" role="alert">{error}</div>}
          <CareStatus />
          <div className={wide ? 'content' : 'content narrow'}>{children}</div>
        </div>
      </main>
    </div>
  );
}

export default AppShell;
