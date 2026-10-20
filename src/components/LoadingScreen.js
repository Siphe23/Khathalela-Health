import '../css-styles/LoadingScreen.css';

function LoadingScreen({ text = 'Loading…' }) {
  return (
    <main className="loading-screen" role="status" aria-live="polite">
      <span className="spinner spinner-large" aria-hidden="true" />
      <p>{text}</p>
    </main>
  );
}

export default LoadingScreen;
