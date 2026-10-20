import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { RoleImage } from '../components/RoleIllustrations';
import { ROLES } from '../config/roles';
import { APP_NAME } from '../config/appInfo';
import '../css-styles/AuthForm.css';
import '../css-styles/ChooseRole.css';

function ChooseRole() {
  const navigate = useNavigate();

  // The chosen role travels to the Register page through the route "state"
  const choose = (roleId) => navigate('/register', { state: { role: roleId } });

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size={40} />
        </div>

        <h1>Welcome to {APP_NAME}</h1>
        <p className="auth-sub">Who are you?</p>

        <div className="role-cards">
          {/* Object.values turns the ROLES object into a list we can loop over */}
          {Object.values(ROLES).map((role) => (
            <button key={role.id} type="button" className="role-card" onClick={() => choose(role.id)}>
              <span className="role-visual">
                <RoleImage role={role} />
              </span>
              <span className="role-info">
                <strong>{role.label}</strong>
                <span className="role-text">{role.description}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </main>
  );
}

export default ChooseRole;
