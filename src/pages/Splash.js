import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import '../css-styles/Splash.css';

function Splash() {
  const navigate = useNavigate();

  // useEffect runs code once when the page appears.
  // After 2.5 seconds we move to onboarding.
  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding', { replace: true }), 2500);
    return () => clearTimeout(timer); // cleanup if the user leaves early
  }, [navigate]);

  return (
    <main className="splash">
      <div className="splash-content">
        <Logo size={96} textSize="2.2rem" stacked />
        <p className="splash-tagline">Your Health, Supported Every Step.</p>
      </div>

      <svg className="splash-hills" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 120 Q100 60 200 110 T400 90 V200 H0 Z" fill="#a8c8ae" />
        <path d="M0 150 Q120 100 230 145 T400 130 V200 H0 Z" fill="#174d3a" opacity="0.9" />
      </svg>

      <p className="splash-loading" role="status">Loading…</p>
    </main>
  );
}

export default Splash;
