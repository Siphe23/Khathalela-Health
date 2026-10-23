import { useDispatch, useSelector } from 'react-redux';
import Logo from '../components/Logo';
import PatientHome from './PatientHome';
import WorkerHome from './WorkerHome';
import { logout } from '../features/auth/authThunks';
import '../css-styles/AuthForm.css';
import '../css-styles/AuthExtras.css';

// /dashboard shows the right home screen for the signed-in role.
function Dashboard() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  if (user && user.role === 'worker') return <WorkerHome />;
  if (user && user.role === 'patient') return <PatientHome />;

  // Signed in, but the saved profile (role) could not be loaded
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Logo size={40} /></div>
        <h1>We could not load your profile</h1>
        <div className="banner banner-error" role="alert">
          Please log out and sign in again. If this keeps happening, check your internet connection.
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={() => dispatch(logout())} disabled={loading}>
          Log Out
        </button>
      </div>
    </main>
  );
}

export default Dashboard;
