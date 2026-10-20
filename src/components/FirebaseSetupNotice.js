import { APP_NAME } from '../config/appInfo';
import '../css-styles/AuthForm.css';
import '../css-styles/AuthExtras.css';

// Shown instead of the app when the .env file is missing or incomplete.
function FirebaseSetupNotice() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>{APP_NAME} needs Firebase</h1>
        <p className="auth-sub">
          The Firebase settings were not found. Create a file named <strong>.env</strong> in the
          project root (next to package.json) containing:
        </p>
        <pre className="env-box">{`REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=`}</pre>
        <p className="auth-sub">
          Paste your values after each = sign, then stop and restart <strong>npm start</strong>.
          React only reads the .env file when it starts.
        </p>
      </div>
    </main>
  );
}

export default FirebaseSetupNotice;
