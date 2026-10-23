import { useState } from 'react';
import { getCareErrorMessage } from '../features/care/careErrors';

// Runs one async action (a save to Firestore) and tracks "busy" and "error".
//   const { run, busy, error } = useAsyncAction();
//   const ok = await run(() => someSave());
export default function useAsyncAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
      return true;
    } catch (err) {
      setError(getCareErrorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { run, busy, error, clearError: () => setError('') };
}
