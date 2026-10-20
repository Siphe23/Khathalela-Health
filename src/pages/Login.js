import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../components/Logo';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import { login } from '../features/auth/authThunks';
import { clearError } from '../features/auth/authSlice';
import '../css-styles/AuthForm.css';
import '../css-styles/AuthExtras.css';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address, e.g. name@example.com.';
    }
    if (!form.password) newErrors.password = 'Please enter your password.';
    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // When login succeeds, Redux marks the user as authenticated and
    // PublicOnlyRoute sends them to /dashboard. Nothing else to do here.
    dispatch(login(form.email.trim(), form.password));
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="auth-logo">
          <Logo size={56} stacked />
        </div>

        <h1>Welcome Back</h1>
        <p className="auth-sub">Sign in to continue your healthcare journey.</p>

        {error && <div className="banner banner-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField id="email" label="Email Address" type="email" value={form.email}
            onChange={handleChange} error={errors.email} autoComplete="email" />
          <PasswordField id="password" label="Password" value={form.password}
            onChange={handleChange} error={errors.password} autoComplete="current-password" />

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (<><span className="spinner" aria-hidden="true" /> Signing in…</>) : 'Log In'}
          </button>
        </form>

        <p className="auth-switch"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="auth-switch">
          Don't have an account? <Link to="/choose-role">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
