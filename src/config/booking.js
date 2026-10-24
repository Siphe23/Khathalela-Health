// Booking settings. SLOT_CAPACITY must match the number in firestore.rules (slots).
export const SLOT_CAPACITY = 2;          // patients allowed per time slot
export const DAYS_AHEAD = 14;            // how many days ahead a patient can book
export const CLOSED_WEEKDAYS = [0, 6];   // 0 = Sunday, 6 = Saturday
export const VISIT_MINUTES = 30;

// 08:00, 08:30 ... 15:30
export const SLOT_TIMES = [];
for (let hour = 8; hour < 16; hour += 1) {
  SLOT_TIMES.push(`${String(hour).padStart(2, '0')}:00`, `${String(hour).padStart(2, '0')}:30`);
}

// South African emergency numbers
export const EMERGENCY = { ambulance: '10177', cellphone: '112' };

export const CONCERNS = [
  'Transport to the clinic',
  'Long waiting times',
  'Work commitments',
  'Cost',
  'I do not feel well',
  'Running out of medication',
  'Other',
];
