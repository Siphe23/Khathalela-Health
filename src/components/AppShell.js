import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    { to: '/progress', label: 'Progress', icon: 'clipboard' },
    { to: '/profile', label: 'Profile', icon: 'user' },
    { to: '/urgent', label: 'Need help now', icon: 'alert', urgent: true },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/activity', label: 'Activity', icon: 'clipboard' },
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the phone menu when you open a page, or press Escape
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
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

          <nav id="main-menu" className={menuOpen ? 'topnav open' : 'topnav'} aria-label="Main menu">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}${item.urgent ? ' urgent' : ''}`}>
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button type="button" className="nav-link nav-logout" onClick={() => dispatch(logout())} disabled={loading}>
              <Icon name="back" size={18} /><span>Log Out</span>
            </button>
          </nav>

          <div className="topbar-user">
            <Link to="/profile" className="user-chip" aria-label="Your profile">
              <Avatar name={user && user.displayName} size={36} />
              <span className="user-name">{user && user.displayName}</span>
            </Link>
            <button type="button" className="btn-sm" onClick={() => dispatch(logout())} disabled={loading}>
              Log Out
            </button>
            <button type="button" className="menu-btn" aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen} aria-controls="main-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
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
