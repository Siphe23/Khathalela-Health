import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { collectionLoaded, careError, clearCare } from '../features/care/careSlice';
import { watchPatientData, watchWorkerData, ensurePatientRecord } from '../features/care/careService';
import { getCareErrorMessage } from '../features/care/careErrors';
import { isFirebaseConfigured } from '../firebase/firebaseConfig';

// Invisible. Starts the right Firestore listeners for whoever is signed in
// and stops them when they sign out. Mounted once in App.js.
function CareSync() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const userRef = useRef(user);
  userRef.current = user;

  const uid = user ? user.uid : null;
  const role = user ? user.role : null;
  const verified = Boolean(user && user.verificationStatus === 'verified');

  useEffect(() => {
    dispatch(clearCare());
    if (!uid || !isFirebaseConfigured) return undefined;

    const handlers = {
      onItems: (name, items) => dispatch(collectionLoaded({ name, items })),
      onError: (error) => dispatch(careError(getCareErrorMessage(error))),
    };

    if (role === 'patient') {
      ensurePatientRecord(userRef.current).catch((error) => getCareErrorMessage(error));
      return watchPatientData(uid, handlers);
    }
    // Workers only get data once an administrator has verified them
    if (role === 'worker' && verified) return watchWorkerData(handlers);
    return undefined;
  }, [dispatch, uid, role, verified]);

  return null;
}

export default CareSync;
