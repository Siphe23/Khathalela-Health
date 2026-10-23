// FICTIONAL demo data for the hackathon. The worker's "Load demo data" button
// writes this into Firestore. Every document is marked demo: true, so the
// "Remove demo data" button can delete exactly these and nothing else.
// Dates are worked out from today, so the demo always looks current.
import { addDays } from '../utils/format';

const CLINIC = 'Mthatha Clinic';

const PEOPLE = {
  p1: { name: 'Nomsa Mthembu', code: 'KH-00045', gender: 'Female', age: 52, lang: 'isiXhosa' },
  p2: { name: 'Sipho Dlamini', code: 'KH-00061', gender: 'Male', age: 47, lang: 'isiZulu' },
  p3: { name: 'Thandi Mthethwa', code: 'KH-00123', gender: 'Female', age: 39, lang: 'isiZulu' },
  p4: { name: 'Sicwe Nkosi', code: 'KH-00078', gender: 'Male', age: 61, lang: 'isiXhosa' },
  p5: { name: 'Lindiwe Fakude', code: 'KH-00092', gender: 'Female', age: 44, lang: 'English' },
  p6: { name: 'Zodwa Khumalo', code: 'KH-00104', gender: 'Female', age: 58, lang: 'isiZulu' },
  p7: { name: 'Bongani Zulu', code: 'KH-00117', gender: 'Male', age: 36, lang: 'isiZulu' },
  p8: { name: 'Ayanda Ndlovu', code: 'KH-00130', gender: 'Other', age: 29, lang: 'English' },
};

const TODAY_VISITS = [
  ['p1', '08:00', 'General Check-up'],
  ['p2', '09:30', 'Medication Review'],
  ['p6', '10:15', 'Follow-up'],
  ['p7', '11:00', 'Medication Collection'],
  ['p8', '13:30', 'General Check-up'],
];

const NEXT_VISIT_DAYS = { p1: 5, p2: 6, p3: 2, p4: 9, p5: 10, p6: 14, p7: 14, p8: 7 };

// [patient, days ago, reason]
const MISSED = [
  ['p3', 1, 'transport'], ['p4', 1, 'noshow'], ['p5', 2, 'transport'], ['p1', 2, 'waiting'],
  ['p6', 3, 'work'], ['p7', 3, 'transport'], ['p8', 4, 'other'], ['p2', 5, 'transport'],
  ['p3', 5, 'waiting'], ['p4', 6, 'work'], ['p5', 6, 'transport'], ['p1', 6, 'noshow'],
];

// Returns a list of { collection, id, data } to write.
// `registeredPatients` are real patient accounts: they also get sample visits and
// medication so their own screens are not empty during the demo.
export function buildSeed(today, registeredPatients = []) {
  const writes = [];
  const add = (collection, id, data) => writes.push({ collection, id, data: { ...data, demo: true } });

  const visit = (id, patientId, patientName, fields) => add('appointments', id, {
    patientId, patientName, clinic: CLINIC, time: null,
    missedReason: null, followedUp: false, recordUpdated: false, ...fields,
  });

  Object.keys(PEOPLE).forEach((key, index) => {
    const person = PEOPLE[key];
    const patientId = `demo-${key}`;
    add('patients', patientId, {
      uid: null, name: person.name, code: person.code, phone: '', gender: person.gender,
      age: person.age, preferredLanguage: person.lang, preferredClinic: CLINIC,
    });
    visit(`demo-${key}-next`, patientId, person.name, {
      date: addDays(today, NEXT_VISIT_DAYS[key]), time: '09:00', type: 'Follow-up', status: 'upcoming',
    });
    visit(`demo-${key}-past`, patientId, person.name, {
      date: addDays(today, -(25 + index)), time: '09:00', type: 'General Check-up', status: 'past',
    });
  });

  TODAY_VISITS.forEach(([key, time, type]) => {
    visit(`demo-${key}-today`, `demo-${key}`, PEOPLE[key].name, { date: today, time, type, status: 'upcoming' });
  });

  MISSED.forEach(([key, daysAgo, reason], index) => {
    visit(`demo-missed-${index + 1}`, `demo-${key}`, PEOPLE[key].name, {
      date: addDays(today, -daysAgo), time: '09:00', type: 'General Check-up',
      status: 'missed', missedReason: reason,
    });
  });

  const medication = (id, patientId, name, dose) => add('medications', id, {
    patientId, name, dose, note: 'Refill monthly', reminder: true,
  });
  medication('demo-med-1', 'demo-p1', 'Amlodipine', '1 tablet daily');
  medication('demo-med-2', 'demo-p1', 'Metformin', '1 tablet twice daily');
  medication('demo-med-3', 'demo-p2', 'Metformin', '1 tablet twice daily');

  registeredPatients.forEach((patient) => {
    const id = patient.id;
    visit(`demo-${id}-a1`, id, patient.name, { date: addDays(today, 5), time: '09:00', type: 'General Check-up', status: 'upcoming' });
    visit(`demo-${id}-a2`, id, patient.name, { date: addDays(today, 20), time: '10:30', type: 'Medication Collection', status: 'upcoming' });
    visit(`demo-${id}-a3`, id, patient.name, { date: addDays(today, 45), time: '09:00', type: 'Follow-up', status: 'upcoming' });
    visit(`demo-${id}-a4`, id, patient.name, { date: addDays(today, -30), time: '09:00', type: 'General Check-up', status: 'past' });
    medication(`demo-${id}-m1`, id, 'Amlodipine', '1 tablet daily');
    medication(`demo-${id}-m2`, id, 'Metformin', '1 tablet twice daily');
  });

  return writes;
}
