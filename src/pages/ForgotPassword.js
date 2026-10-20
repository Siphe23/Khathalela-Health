import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../components/Logo';
import FormField from '../components/FormField';
import { requestPasswordReset } from '../features/auth/authThunks';
import { clearError } from '../features/auth/authSlice';
import '../css-styles/AuthForm.css';
import '../css-styles/AuthExtras.css';

function ForgotPassword() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSent(false);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address, e.g. name@example.com.');
      return;
    }
    setEmailError('');

    const ok = await dispatch(requestPasswordReset(email.trim()));
    if (ok) setSent(true);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size={40} />
        </div>

        <h1>Reset Your Password</h1>
        <p className="auth-sub">Enter your email and we will send you a link to choose a new password.</p>

        {error && <div className="banner banner-error" role="alert">{error}</div>}

        {/* The same message is shown whether or not the email has an account */}
        {sent && (
          <div className="banner banner-success" role="status">
            If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField id="email" label="Email Address" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} error={emailError} autoComplete="email" />

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (<><span className="spinner" aria-hidden="true" /> Sending…</>) : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-switch"><Link to="/login">Back to Log In</Link></p>
      </div>
    </main>
  );
}

export default ForgotPassword;
