/**
 * Confirmation dialog shown before an appointment is cancelled.
 */

import { escapeHtml } from '../lib/html.js';
import { formatDay, formatDoctorName, formatTime } from '../lib/format.js';

/**
 * @param {{appointment?: object, doctor?: object}} props
 * @returns {string} empty string when no appointment is being cancelled
 */
export function renderCancelDialog({ appointment, doctor }) {
  if (!appointment) return '';
  const who = doctor ? formatDoctorName(doctor) : 'your doctor';
  const when = `${formatDay(appointment.date)} at ${formatTime(appointment.time)}`;

  return `<div class="backdrop">
    <div role="dialog" aria-modal="true" aria-labelledby="cancel-title" aria-describedby="cancel-desc">
      <h2 id="cancel-title">Cancel this appointment?</h2>
      <p id="cancel-desc">Your visit with ${escapeHtml(who)} on ${escapeHtml(when)} will be released for other patients.</p>
      <button type="button" data-action="dismiss-cancel">Keep appointment</button>
      <button type="button" data-action="confirm-cancel">Yes, cancel it</button>
    </div>
  </div>`;
}
