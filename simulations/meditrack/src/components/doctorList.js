/**
 * Doctor search box, specialty filter and the list of doctors.
 */

import { escapeHtml } from '../lib/html.js';
import { formatDoctorName } from '../lib/format.js';

/**
 * @param {{doctors: object[], specialties: string[], filters: {query: string, specialty: string}, selectedDoctorId: string|null}} props
 * @returns {string}
 */
export function renderDoctorList({ doctors, specialties, filters, selectedDoctorId }) {
  const options = ['all', ...specialties]
    .map((value) => {
      const label = value === 'all' ? 'All specialties' : value;
      const selected = value === filters.specialty ? ' selected' : '';
      return `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(label)}</option>`;
    })
    .join('');

  const items = doctors
    .map((doctor) => {
      const pressed = doctor.id === selectedDoctorId;
      return `<li>
        <button type="button" class="doctor" data-action="select-doctor" data-id="${escapeHtml(doctor.id)}" aria-pressed="${pressed}">
          <strong>${escapeHtml(formatDoctorName(doctor))}</strong>
          <span>${escapeHtml(doctor.specialty)} · ${doctor.experienceYears} yrs</span>
        </button>
      </li>`;
    })
    .join('');

  const body = doctors.length
    ? `<ul class="doctor-list">${items}</ul>`
    : '<p class="empty">No doctors match your search.</p>';

  return `<section class="panel" aria-labelledby="doctors-heading">
    <h2 id="doctors-heading">Find a doctor</h2>
    <div class="filters">
      <label for="doctor-search">Search by name</label>
      <input id="doctor-search" type="search" value="${escapeHtml(filters.query)}" />
      <label for="specialty-filter">Specialty</label>
      <select id="specialty-filter">${options}</select>
    </div>
    ${body}
  </section>`;
}
