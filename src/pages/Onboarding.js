import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  HealthIllustration,
  ScheduleIllustration,
  ConnectIllustration,
} from '../components/OnboardingIllustrations';
import '../css-styles/Onboarding.css';

// The content for each screen lives in one array, so we write the layout only once.
const slides = [
  {
    headline: 'Your Health Matters',
    description: 'Keep your healthcare journey organised in one convenient place.',
    Illustration: HealthIllustration,
  },
  {
    headline: 'Stay on Track',
    description: 'Keep track of appointments and medication reminders.',
    Illustration: ScheduleIllustration,
  },
  {
    headline: 'Care That Keeps You Connected',
    description: 'Access helpful healthcare support and follow-up information.',
    Illustration: ConnectIllustration,
  },
];

function Onboarding() {
  // useState remembers which screen we are on (0, 1 or 2).
  // When setStep changes it, React redraws the screen automatically.
  const [step, setStep] = useState(0);
  const navigate = useNavigate(); // lets us move to another page

  const isFirst = step === 0;
  const isLast = step === slides.length - 1;
  const { headline, description, Illustration } = slides[step];

  const goNext = () => setStep(step + 1);
  const goBack = () => setStep(step - 1);
  const finish = () => navigate('/choose-role');

  return (
    <main className="onboarding">
      <div className="onboarding-card">
        <header className="onboarding-top">
          <Logo size={36} />
          {/* Skip is hidden on the last screen */}
          {!isLast && (
            <button className="btn btn-text" onClick={finish}>
              Skip
            </button>
          )}
        </header>

        <div className="onboarding-visual">
          <Illustration />
        </div>

        {/* aria-live tells screen readers when the text changes */}
        <section className="onboarding-text" aria-live="polite">
          <h1>{headline}</h1>
          <p>{description}</p>
        </section>

        {/* Progress dots */}
        <div className="onboarding-dots" aria-label={`Step ${step + 1} of ${slides.length}`}>
          {slides.map((_, index) => (
            <span key={index} className={index === step ? 'dot active' : 'dot'} />
          ))}
        </div>

        <div className="onboarding-actions">
          {!isFirst && (
            <button className="btn btn-secondary" onClick={goBack}>
              Back
            </button>
          )}
          {isLast ? (
            <button className="btn btn-primary grow" onClick={finish}>
              Get Started
            </button>
          ) : (
            <button className="btn btn-primary grow" onClick={goNext}>
              Next
            </button>
          )}
        </div>

        {isLast && (
          <p className="onboarding-login">
            Already have an account?{' '}
            <button className="btn btn-text" onClick={() => navigate('/login')}>
              Log in
            </button>
          </p>
        )}
      </div>
    </main>
  );
}

export default Onboarding;
