// Turns Firebase's technical error codes into messages a patient can understand.
const MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/invalid-email': 'That email address does not look right. Please check it.',
  'auth/weak-password': 'That password is too weak. Use at least 8 characters with a letter and a number.',
  'auth/network-request-failed': 'We could not reach the server. Check your internet connection and try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/operation-not-allowed': 'Email sign-in is not switched on yet. (Developer: enable Email/Password in Firebase.)',
  'permission-denied': 'We could not save your profile. If you are registering as an administrator, check your invitation code. Otherwise please try again.',
  unavailable: 'We could not reach the server. Check your internet connection and try again.',
};

export function getAuthErrorMessage(error) {
  const code = error && error.code ? error.code : 'unknown';
  // Log only the short code, never the password or the full error object.
  console.error('Authentication problem, code:', code);
  return MESSAGES[code] || 'Something went wrong. Please try again.';
}
