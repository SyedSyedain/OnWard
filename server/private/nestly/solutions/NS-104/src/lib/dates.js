/**
 * Date helpers. Dates travel as `YYYY-MM-DD` strings and are parsed as UTC.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parses a `YYYY-MM-DD` string to a UTC timestamp, or returns null when invalid.
 * @param {string} value
 * @returns {number|null}
 */
export function parseISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const time = Date.UTC(year, month - 1, day);
  const check = new Date(time);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return time;
}

/**
 * Number of nights between check-in and check-out. Returns 0 if either date is invalid.
 * @param {string} checkIn
 * @param {string} checkOut
 * @returns {number}
 */
export function nightsBetween(checkIn, checkOut) {
  const start = parseISODate(checkIn);
  const end = parseISODate(checkOut);
  if (start === null || end === null) return 0;
  return Math.round((end - start) / DAY_MS);
}

/**
 * Human-friendly label, e.g. "10 Mar - 13 Mar 2026".
 * @param {string} checkIn
 * @param {string} checkOut
 * @returns {string}
 */
export function formatDateRange(checkIn, checkOut) {
  const start = parseISODate(checkIn);
  const end = parseISODate(checkOut);
  if (start === null || end === null) return '';
  const a = new Date(start);
  const b = new Date(end);
  return `${a.getUTCDate()} ${MONTHS[a.getUTCMonth()]} - ${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
}

/**
 * Validates a requested stay and returns a list of human-readable problems (empty when valid).
 * @param {{checkIn: string, checkOut: string, guests: number}} stay
 * @param {{maxGuests: number}} listing
 * @param {string} today `YYYY-MM-DD`
 * @returns {string[]}
 */
export function validateStay(stay, listing, today) {
  const errors = [];
  const start = parseISODate(stay.checkIn);
  const end = parseISODate(stay.checkOut);
  if (start === null || end === null) {
    errors.push('Choose both a check-in and a check-out date.');
    return errors;
  }
  if (start < parseISODate(today)) errors.push('Check-in cannot be in the past.');
  if (end <= start) errors.push('Check-out must be after check-in.');
  if (!Number.isInteger(stay.guests) || stay.guests < 1) errors.push('At least one guest is required.');
  else if (stay.guests > listing.maxGuests) errors.push(`This place sleeps at most ${listing.maxGuests} guests.`);
  return errors;
}
