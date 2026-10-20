// All the talking to Firebase lives here. No React, no Redux.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { ROLES, isValidRole } from '../../config/roles';

// Firebase signs you in the instant the account exists, BEFORE we have saved
// the profile. This flag tells the auth listener to wait during registration.
let registrationInProgress = false;

// Reads the saved profile (role, clinic, etc.) from Firestore: users/{uid}
async function loadProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

// Builds the small plain object we keep in Redux. No password, no medical data.
function toUser(firebaseUser, profile) {
  const role = profile && isValidRole(profile.role) ? profile.role : null;
  const details = {};
  if (role) {
    ROLES[role].fields.forEach((field) => {
      details[field.name] = profile[field.name] || '';
    });
  }
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || (profile && profile.fullName) || '',
    role,
    verificationStatus: (profile && profile.verificationStatus) || null,
    details,
  };
}

export async function registerUser({ fullName, phone, email, password, role, details }) {
  registrationInProgress = true;
  let createdUser = null;
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    createdUser = credential.user;
    await updateProfile(createdUser, { displayName: fullName });

    const profile = {
      fullName,
      email,
      phone,
      role,
      ...details,
      // Workers must be checked by an administrator before they get worker access.
      ...(role === 'worker' ? { verificationStatus: 'pending' } : {}),
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', createdUser.uid), profile);

    return toUser(createdUser, profile);
  } catch (error) {
    // If the profile could not be saved, remove the half-made account so the
    // person can simply try again with the same email.
    if (createdUser) {
      try {
        await deleteUser(createdUser);
      } catch (cleanupError) {
        // Nothing more we can do here.
      }
    }
    throw error;
  } finally {
    registrationInProgress = false;
  }
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  let profile;
  try {
    profile = await loadProfile(credential.user.uid);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  return toUser(credential.user, profile);
}

export function logoutUser() {
  return signOut(auth);
}

export function sendResetEmail(email) {
  return sendPasswordResetEmail(auth, email);
}

// Firebase calls this when the app starts and whenever someone signs in or out.
// It is how the app remembers you after a page refresh.
// Returns an "unsubscribe" function for cleanup.
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (registrationInProgress) return; // registerUser will report the result itself
    if (!firebaseUser) {
      callback(null);
      return;
    }
    let profile = null;
    try {
      profile = await loadProfile(firebaseUser.uid);
    } catch (error) {
      profile = null; // dashboard will tell the person the profile could not load
    }
    callback(toUser(firebaseUser, profile));
  });
}
