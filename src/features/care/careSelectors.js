// Plain functions that work things out from the lists in Redux.
import { addDays, todayISO } from '../../utils/format';

const byDateTime = (a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`);
const sortAsc = (list) => [...list].sort(byDateTime);
const sortDesc = (list) => [...list].sort((a, b) => byDateTime(b, a));

export const activeAppointments = (list) => sortAsc(list.filter((a) => a.status === 'upcoming' || a.status === 'checked-in'));

export function nextVisit(appointments, patientId) {
  const list = patientId ? appointments.filter((a) => a.patientId === patientId) : appointments;
  return activeAppointments(list)[0] || null;
}

export function lastVisit(appointments, patientId) {
  return sortDesc(appointments.filter((a) => a.patientId === patientId && a.status === 'past'))[0] || null;
}

export const nextCollection = (appointments) => activeAppointments(appointments).find((a) => a.type === 'Medication Collection') || null;

export const requestedAppointments = (appointments) => sortAsc(appointments.filter((a) => a.status === 'requested'));

export const todaysAppointments = (appointments) => {
  const today = todayISO();
  return sortAsc(appointments.filter((a) => a.date === today && a.status !== 'requested'));
};

export const missedAppointments = (appointments) => sortDesc(appointments.filter((a) => a.status === 'missed'));

// Missed in the last 7 days (today and the 6 days before)
export const recentMissed = (appointments) => {
  const cutoff = addDays(todayISO(), -6);
  return missedAppointments(appointments).filter((a) => a.date >= cutoff);
};

// The last 7 days of medication records the patient entered (patient-reported)
export function doseSummary(doseLogs, medications, today = todayISO()) {
  const from = addDays(today, -6);
  const ids = new Set(medications.map((m) => m.id));
  const logs = doseLogs.filter((l) => ids.has(l.medicationId) && l.date >= from && l.date <= today);
  const taken = logs.filter((l) => l.status === 'taken').length;
  const missed = logs.filter((l) => l.status === 'missed').length;
  const expected = medications.length * 7;
  return { expected, taken, missed, notRecorded: Math.max(0, expected - taken - missed) };
}

export const openHelpRequests = (list) => list
  .filter((r) => r.status === 'open')
  .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

// The to-do groups on the Follow-up Actions screen, worked out from missed visits
export function followUpGroups(appointments) {
  const missed = missedAppointments(appointments);
  const open = missed.filter((a) => !a.followedUp);
  return [
    { id: 'transport', title: 'Plan transport support', icon: 'bus', done: 'followedUp',
      items: open.filter((a) => a.missedReason === 'transport') },
    { id: 'call', title: 'Call patient', icon: 'phone', done: 'followedUp',
      items: open.filter((a) => a.missedReason === 'noshow' || a.missedReason === 'other') },
    { id: 'sms', title: 'Send reminder SMS', icon: 'sms', done: 'followedUp',
      items: open.filter((a) => a.missedReason === 'waiting' || a.missedReason === 'work') },
    { id: 'records', title: 'Update records', icon: 'edit', done: 'recordUpdated',
      items: missed.filter((a) => a.followedUp && !a.recordUpdated) },
  ];
}
