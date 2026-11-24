/**
 * Date helpers. Due dates are `YYYY-MM-DD` strings in the user's local time zone.
 */

export const DUE_SOON_DAYS = 2;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parses a `YYYY-MM-DD` string into a Date at local midnight.
 * @param {string} day
 * @returns {Date}
 */
export function parseDay(day) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

/**
 * Returns a new Date at local midnight of the given date.
 * @param {Date} date
 * @returns {Date}
 */
export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Whole calendar days from `from` to `to` (negative when `to` is earlier).
 * @param {Date} from
 * @param {Date} to
 * @returns {number}
 */
export function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

/**
 * Classifies a due date relative to `now`.
 * @param {string | null | undefined} dueDate `YYYY-MM-DD` or empty
 * @param {Date} now
 * @returns {'none' | 'overdue' | 'soon' | 'later'}
 */
export function getDueStatus(dueDate, now) {
  if (!dueDate) return 'none';
  const due = parseDay(dueDate);
  if (due < now) return 'overdue';
  if (daysBetween(now, due) <= DUE_SOON_DAYS) return 'soon';
  return 'later';
}

/**
 * Formats a due date for display, for example `Nov 24`.
 * @param {string} dueDate `YYYY-MM-DD`
 * @returns {string}
 */
export function formatDueDate(dueDate) {
  const date = parseDay(dueDate);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
