import { SLOT_TIMES, SLOT_CAPACITY, DAYS_AHEAD, CLOSED_WEEKDAYS } from '../config/booking';
import { addDays, todayISO, clockTime, formatDate } from './format';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const slotId = (date, time) => `${date}_${time.replace(':', '')}`;

export function weekday(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
}

// "Mon 26 Oct"
export const dayLabel = (iso) => `${DAY_NAMES[weekday(iso)]} ${formatDate(iso).slice(0, 6)}`;

// The days a patient can choose from: today and the next days, without weekends
export function bookingDays() {
  const today = todayISO();
  const days = [];
  for (let i = 0; i < DAYS_AHEAD; i += 1) {
    const date = addDays(today, i);
    if (!CLOSED_WEEKDAYS.includes(weekday(date))) days.push(date);
  }
  return days;
}

export function bookedAt(slots, date, time) {
  const found = slots.find((s) => s.id === slotId(date, time));
  return found ? found.booked || 0 : 0;
}

// The time slots of one day, with how many are taken. Times that already passed today are left out.
export function slotsForDay(slots, date) {
  const today = todayISO();
  const now = clockTime();
  return SLOT_TIMES
    .filter((time) => date !== today || time > now)
    .map((time) => {
      const booked = bookedAt(slots, date, time);
      return { time, booked, full: booked >= SLOT_CAPACITY };
    });
}

export const freePlaces = (slots, date) => slotsForDay(slots, date)
  .reduce((total, slot) => total + Math.max(0, SLOT_CAPACITY - slot.booked), 0);
