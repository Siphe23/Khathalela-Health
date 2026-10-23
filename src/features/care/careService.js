// All Firestore reading and writing for appointments, patients, medication and notes.
// No React, no Redux. Pages call these small functions.
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  onSnapshot, query, where, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { buildSeed } from '../../data/seedData';
import { memberId, todayISO } from '../../utils/format';

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
  ];
  return () => stops.forEach((stop) => stop());
}

// Only VERIFIED healthcare workers are allowed to read these (see firestore.rules).
export function watchWorkerData(handlers) {
  const stops = ['patients', 'appointments', 'medications', 'notes'].map(
    (name) => listen(collection(db, name), name, handlers)
  );
  return () => stops.forEach((stop) => stop());
}

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

export function requestAppointment(user, { date, type, clinic }) {
  return addDoc(collection(db, 'appointments'), {
    patientId: user.uid,
    patientName: user.displayName || 'Patient',
    clinic, type, date,
    time: null,
    status: 'requested',
    missedReason: null,
    followedUp: false,
    recordUpdated: false,
    demo: false,
    createdAt: serverTimestamp(),
  });
}

// Used by the patient (scan QR) and by the worker (Check-in button)
export function checkInAppointment(id) {
  return updateDoc(doc(db, 'appointments', id), { status: 'checked-in', checkedInAt: serverTimestamp() });
}

export function setMedicationReminder(id, value) {
  return updateDoc(doc(db, 'medications', id), { reminder: value });
}

// ---------- Healthcare worker actions ----------

export const approveRequest = (id, time) => updateDoc(doc(db, 'appointments', id), { status: 'upcoming', time });
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
