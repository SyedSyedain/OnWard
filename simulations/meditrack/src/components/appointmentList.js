/**
 * Upcoming appointments with a pager and cancel buttons.
 */

import { escapeHtml } from '../lib/html.js';
import { formatDay, formatDoctorName, formatTime } from '../lib/format.js';

/**
 * @param {{pageData: {items: object[], page: number, totalPages: number, hasPrev: boolean, hasNext: boolean}, doctors: object[]}} props
 * @returns {string}
 */
export function renderAppointmentList({ pageData, doctors }) {
  const nameOf = (id) => {
    const doctor = doctors.find((d) => d.id === id);
    return doctor ? formatDoctorName(doctor) : 'Your doctor';
  };

  const items = pageData.items
    .map((appt) => {
      const when = `${formatDay(appt.date)} at ${formatTime(appt.time)}`;
      return `<li class="appointment">
        <div>
          <strong>${escapeHtml(nameOf(appt.doctorId))}</strong>
          <span>${escapeHtml(when)}</span>
          <em>${escapeHtml(appt.reason)}</em>
        </div>
        <button type="button" data-action="request-cancel" data-id="${escapeHtml(appt.id)}" aria-label="Cancel appointment with ${escapeHtml(nameOf(appt.doctorId))} on ${escapeHtml(when)}">Cancel</button>
      </li>`;
    })
    .join('');

  const body = pageData.items.length
    ? `<ul class="appointment-list">${items}</ul>`
    : '<p class="empty">You have no upcoming appointments.</p>';

  const pager = `<nav class="pager" aria-label="Appointments pages">
      <button type="button" data-action="page" data-page="${pageData.page - 1}"${pageData.hasPrev ? '' : ' disabled'}>Previous</button>
      <span>Page ${pageData.page} of ${pageData.totalPages}</span>
      <button type="button" data-action="page" data-page="${pageData.page + 1}"${pageData.hasNext ? '' : ' disabled'}>Next</button>
    </nav>`;

  return `<section class="panel" aria-labelledby="appointments-heading">
    <h2 id="appointments-heading">Upcoming appointments</h2>
    ${body}
    ${pager}
  </section>`;
}
