import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../components/Logo';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import { ROLES, isValidRole } from '../config/roles';
import { APP_NAME } from '../config/appInfo';
import { register } from '../features/auth/authThunks';
import { clearError } from '../features/auth/authSlice';
import '../css-styles/AuthForm.css';
import '../css-styles/AuthExtras.css';

function Register() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  // The role chosen on the previous screen
  const roleId = location.state && location.state.role;
  const role = isValidRole(roleId) ? ROLES[roleId] : null;

  // One object holds every value. Role-specific fields are added as the person types.
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', password: '', confirmPassword: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});

  // Clear any old error from another page when this page opens
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Opened /register directly without choosing a role? Go and choose one.
  if (!role) return <Navigate to="/choose-role" replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Please enter your full name.';

    const phone = form.phone.replace(/\s/g, '');
    if (!phone) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^(\+27|0)[0-9]{9}$/.test(phone)) {
      newErrors.phone = 'Enter a valid South African number, e.g. 082 123 4567.';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address, e.g. name@example.com.';
    }

    if (!form.password) {
      newErrors.password = 'Please create a password.';
    } else if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must be at least 8 characters with a letter and a number.';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // The extra fields for THIS role (patient or worker)
    role.fields.forEach((field) => {
      const value = (form[field.name] || '').trim();
      if (field.required && !value) {
        newErrors[field.name] = field.type === 'select'
          ? `Please choose your ${field.label.toLowerCase()}.`
          : `Please enter your ${field.label.toLowerCase()}.`;
      } else if (value && field.pattern && !field.pattern.test(value)) {
        newErrors[field.name] = field.patternMessage;
      }
    });

    if (!acceptedTerms) newErrors.terms = 'Please accept the Terms of Service and Privacy Policy.';
    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const details = {};
    role.fields.forEach((field) => {
      const value = (form[field.name] || '').trim();
      details[field.name] = field.valueType === 'number' ? Number(value) : value;
    });

    // On success, PublicOnlyRoute notices isAuthenticated is true and moves
    // the person to the dashboard automatically. On failure, `error` shows below.
    dispatch(register({
      fullName: form.fullName.trim(),
      phone: form.phone.replace(/\s/g, ''),
      email: form.email.trim(),
      password: form.password,
      role: role.id,
      details,
    }));
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size={40} />
        </div>

        <h1>Create Your Account</h1>
        <p className="auth-sub">
          Join {APP_NAME} and take the next step in managing your healthcare.
        </p>

        <div className="role-summary">
          <span>Registering as <span className="role-badge">{role.label}</span></span>
          <Link to="/choose-role">Change</Link>
        </div>

        {error && <div className="banner banner-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField id="fullName" label="Full Name" value={form.fullName} onChange={handleChange}
            error={errors.fullName} autoComplete="name" />
          <FormField id="phone" label="Phone Number" type="tel" value={form.phone} onChange={handleChange}
            error={errors.phone} autoComplete="tel" inputMode="tel" />
          <FormField id="email" label="Email Address" type="email" value={form.email} onChange={handleChange}
            error={errors.email} autoComplete="email" />

          {/* The fields below change depending on the chosen role */}
          <fieldset className="role-fields">
            <legend>{role.label} details</legend>
            {role.fields.map((field) => (
              <FormField
                key={field.name}
                id={field.name}
                label={field.label}
                type={field.type}
                options={field.options}
                hint={field.hint}
                optional={!field.required}
                inputMode={field.inputMode}
                value={form[field.name] || ''}
                onChange={handleChange}
                error={errors[field.name]}
              />
            ))}
          </fieldset>

          <PasswordField id="password" label="Password" value={form.password} onChange={handleChange}
            error={errors.password} autoComplete="new-password"
            hint="At least 8 characters, with a letter and a number." />
          <PasswordField id="confirmPassword" label="Confirm Password" value={form.confirmPassword}
            onChange={handleChange} error={errors.confirmPassword} autoComplete="new-password" />

          <label className="terms">
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
            <span>
              I accept the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
            </span>
          </label>
          {errors.terms && <p className="field-error" role="alert">{errors.terms}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (<><span className="spinner" aria-hidden="true" /> Creating account…</>) : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
