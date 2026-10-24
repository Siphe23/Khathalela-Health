// All Firestore reading and writing for appointments, patients, medication and notes.
// No React, no Redux. Pages call these small functions.
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  onSnapshot, query, where, writeBatch, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { buildSeed } from '../../data/seedData';
import { memberId, todayISO, clockTime } from '../../utils/format';
import { slotId } from '../../utils/slots';

export const DEFAULT_CLINIC = 'Mthatha Clinic';

// Firestore document -> plain object for Redux (timestamps become milliseconds)
function toPlain(snapshot) {
  const data = snapshot.data({ serverTimestamps: 'estimate' });
  const item = { id: snapshot.id };
  Object.keys(data).forEach((key) => {
    const value = data[key];
    item[key] = value && typeof value.toMillis === 'function' ? value.toMillis() : value;
  });
  return item;
}

function listen(q, name, { onItems, onError }) {
  return onSnapshot(q, (snapshot) => onItems(name, snapshot.docs.map(toPlain)), onError);
}

// ---------- Live data (updates on every device instantly) ----------

// A patient may only ask for their OWN records. Firestore rules require this filter.
export function watchPatientData(uid, handlers) {
  const stops = [
    listen(query(collection(db, 'appointments'), where('patientId', '==', uid)), 'appointments', handlers),
    listen(query(collection(db, 'medications'), where('patientId', '==', uid)), 'medications', handlers),
    listen(query(collection(db, 'doseLogs'), where('patientId', '==', uid)), 'doseLogs', handlers),
    listen(query(collection(db, 'helpRequests'), where('patientId', '==', uid)), 'helpRequests', handlers),
    // Only counts per time slot (no names), so patients can see which times are full
    listen(collection(db, 'slots'), 'slots', handlers),
  ];
  return () => stops.forEach((stop) => stop());
}

// Only VERIFIED healthcare workers are allowed to read these (see firestore.rules).
export function watchWorkerData(handlers) {
  const stops = ['patients', 'appointments', 'medications', 'notes', 'doseLogs', 'helpRequests'].map(
    (name) => listen(collection(db, name), name, handlers)
  );
  return () => stops.forEach((stop) => stop());
}

// Administrators read the accounts (users) plus the clinic records (read only).
export function watchAdminData(handlers) {
  const stops = ['users', 'patients', 'appointments', 'notes'].map(
    (name) => listen(collection(db, name), name, handlers)
  );
  return () => stops.forEach((stop) => stop());
}

// Administrator action: approve, reject or revoke a healthcare worker.
// status is 'verified', 'rejected' or 'pending'. Only this one field can be changed.
export const setWorkerStatus = (uid, status) => updateDoc(doc(db, 'users', uid), { verificationStatus: status });

// ---------- Patient records ----------

export function buildPatientRecord(uid, { fullName, phone, details }) {
  const d = details || {};
  return {
    uid,
    name: fullName || 'Patient',
    code: memberId(uid),
    phone: phone || '',
    gender: d.gender || '',
    age: typeof d.age === 'number' ? d.age : null,
    preferredLanguage: d.preferredLanguage || '',
    preferredClinic: d.preferredClinic || '',
    demo: false,
    createdAt: serverTimestamp(),
  };
}

// Accounts made before this feature have no patient record yet: create it once.
export async function ensurePatientRecord(user) {
  const ref = doc(db, 'patients', user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;
  await setDoc(ref, buildPatientRecord(user.uid, {
    fullName: user.displayName, phone: user.phone, details: user.details,
  }));
}

// ---------- Patient actions ----------

// Books a time slot. The slot counter and the appointment are saved together, or not at all.
// `booked` is how many people already have this slot (the page reads it from Firestore).
export async function bookSlot(user, { date, time, type, clinic }, booked) {
  const batch = writeBatch(db);
  const slotRef = doc(db, 'slots', slotId(date, time));
  if (booked > 0) batch.update(slotRef, { booked: increment(1) });
  else batch.set(slotRef, { date, time, booked: 1 });

  const appointmentRef = doc(collection(db, 'appointments'));
  const data = {
    patientId: user.uid,
    patientName: user.displayName || 'Patient',
    clinic, type, date, time,
    status: 'upcoming',
    missedReason: null,
    followedUp: false,
    recordUpdated: false,
    demo: false,
    createdAt: serverTimestamp(),
  };
  batch.set(appointmentRef, data);
  await batch.commit();
  return { id: appointmentRef.id, date, time, type, clinic };
}

// Someone who arrives without a booking can still check in. The nurse sees them at once.
export function checkInWalkIn(user, clinic) {
  return addDoc(collection(db, 'appointments'), {
    patientId: user.uid,
    patientName: user.displayName || 'Patient',
    clinic: clinic || DEFAULT_CLINIC,
    type: 'Walk-in',
    date: todayISO(),
    time: clockTime(),
    status: 'checked-in',
    checkedInAt: serverTimestamp(),
    missedReason: null,
    followedUp: false,
    recordUpdated: false,
    demo: false,
    createdAt: serverTimestamp(),
  });
}

// ---------- Urgent help ----------

export function requestUrgentHelp(user, message) {
  return addDoc(collection(db, 'helpRequests'), {
    patientId: user.uid,
    patientName: user.displayName || 'Patient',
    phone: user.phone || '',
    message: message || '',
    status: 'open',
    demo: false,
    createdAt: serverTimestamp(),
  });
}

export const resolveHelpRequest = (id, worker) => updateDoc(doc(db, 'helpRequests', id), {
  status: 'resolved', resolvedBy: worker.displayName || 'Healthcare worker', resolvedAt: serverTimestamp(),
});

// ---------- Care progress (patient-reported) ----------

// One record per medicine per day: taken or missed
export function logDose(user, medication, date, status) {
  return setDoc(doc(db, 'doseLogs', `${medication.id}_${date}`), {
    patientId: user.uid,
    medicationId: medication.id,
    medicationName: medication.name,
    date, status,
    createdAt: serverTimestamp(),
  });
}

export function saveConcern(uid, concern, note) {
  return updateDoc(doc(db, 'patients', uid), { concern, concernNote: note || '', concernAt: serverTimestamp() });
}

// Used by the patient (scan QR) and by the worker (Check-in button)
export function checkInAppointment(id) {
  return updateDoc(doc(db, 'appointments', id), { status: 'checked-in', checkedInAt: serverTimestamp() });
}

export function setMedicationReminder(id, value) {
  return updateDoc(doc(db, 'medications', id), { reminder: value });
}

// ---------- Healthcare worker actions ----------

export const completeAppointment = (id) => updateDoc(doc(db, 'appointments', id), { status: 'past' });
export const markMissed = (id, reason) => updateDoc(doc(db, 'appointments', id), {
  status: 'missed', missedReason: reason, followedUp: false, recordUpdated: false,
});
export const markFollowedUp = (id) => updateDoc(doc(db, 'appointments', id), { followedUp: true });
export const markRecordUpdated = (id) => updateDoc(doc(db, 'appointments', id), { recordUpdated: true });

export function scheduleAppointment(patient, { date, time, type, clinic }) {
  return addDoc(collection(db, 'appointments'), {
    patientId: patient.id,
    patientName: patient.name,
    clinic, type, date, time,
    status: 'upcoming',
    missedReason: null,
    followedUp: false,
    recordUpdated: false,
    demo: false,
    createdAt: serverTimestamp(),
  });
}

export function addMedication(patientId, { name, dose, note }) {
  return addDoc(collection(db, 'medications'), {
    patientId, name, dose, note: note || '', reminder: true, demo: false, createdAt: serverTimestamp(),
  });
}

export const removeMedication = (id) => deleteDoc(doc(db, 'medications', id));

export function addNote(patientId, text, worker) {
  return addDoc(collection(db, 'notes'), {
    patientId, text,
    authorId: worker.uid,
    authorName: worker.displayName || 'Healthcare worker',
    demo: false,
    createdAt: serverTimestamp(),
  });
}

// ---------- Demo tools (verified workers only) ----------

async function commitInChunks(operations, apply) {
  for (let start = 0; start < operations.length; start += 400) {
    const batch = writeBatch(db);
    operations.slice(start, start + 400).forEach((operation) => apply(batch, operation));
    await batch.commit(); // eslint-disable-line no-await-in-loop
  }
}

export async function seedDemoData(registeredPatients) {
  const writes = buildSeed(todayISO(), registeredPatients);
  await commitInChunks(writes, (batch, write) => {
    batch.set(doc(db, write.collection, write.id), { ...write.data, createdAt: serverTimestamp() });
  });
}

export async function clearDemoData() {
  const refs = [];
  for (const name of ['notes', 'appointments', 'medications', 'patients']) {
    const snapshot = await getDocs(query(collection(db, name), where('demo', '==', true))); // eslint-disable-line no-await-in-loop
    snapshot.docs.forEach((item) => refs.push(item.ref));
  }
  await commitInChunks(refs, (batch, ref) => batch.delete(ref));
}
