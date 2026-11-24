/**
 * Formatting helpers for times, dates and names shown to patients.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Converts a 24-hour "HH:mm" string to a 12-hour label such as "3:45 PM".
 * @param {string} time
 * @returns {string}
 */
export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Converts a "YYYY-MM-DD" string to a short label such as "Tue, 1 Dec".
 * @param {string} date
 * @returns {string}
 */
export function formatDay(date) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAYS[weekday]}, ${day} ${MONTHS[month - 1]}`;
}

/**
 * Returns the display name of a doctor, e.g. "Dr. Meera Iyer".
 * @param {{name: string}} doctor
 * @returns {string}
 */
export function formatDoctorName(doctor) {
  return `Dr. ${doctor.name}`;
}
