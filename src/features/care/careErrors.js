const MESSAGES = {
  'permission-denied': 'You are not allowed to do that. Healthcare workers must be verified first.',
  unauthenticated: 'Please sign in again.',
  unavailable: 'We could not reach the server. Check your internet connection and try again.',
  'failed-precondition': 'The app is still being set up. Please try again in a minute.',
  'resource-exhausted': 'Too many requests. Please wait a moment and try again.',
};

export function getCareErrorMessage(error) {
  const code = error && error.code ? error.code : 'unknown';
  console.error('Data problem, code:', code);
  return MESSAGES[code] || 'Something went wrong. Please try again.';
}
