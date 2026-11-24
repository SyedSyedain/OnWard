/**
 * Appointment slots for the selected doctor, grouped by day.
 */

import { escapeHtml } from '../lib/html.js';
import { formatDoctorName } from '../lib/format.js';

/**
 * @param {{doctor?: object, groups: Array<object>, selectedSlotId: string|null}} props
 * @returns {string}
 */
export function renderSlotPicker({ doctor, groups, selectedSlotId }) {
  if (!doctor) {
    return `<section class="panel" aria-labelledby="slots-heading">
      <h2 id="slots-heading">Pick a time</h2>
      <p class="empty">Choose a doctor to see available times.</p>
    </section>`;
  }

  const days = groups
    .map((group) => {
      const buttons = group.slots
        .map((slot) => {
          const pressed = slot.id === selectedSlotId;
          const disabled = slot.available ? '' : ' disabled';
          return `<button type="button" class="slot" data-action="select-slot" data-id="${escapeHtml(slot.id)}" aria-pressed="${pressed}"${disabled}>${escapeHtml(slot.label)}</button>`;
        })
        .join('');
      return `<div class="slot-day">
        <h3>${escapeHtml(group.label)}</h3>
        <div class="slot-grid">${buttons}</div>
      </div>`;
    })
    .join('');

  return `<section class="panel" aria-labelledby="slots-heading">
    <h2 id="slots-heading">Pick a time with ${escapeHtml(formatDoctorName(doctor))}</h2>
    ${days || '<p class="empty">No slots are open right now.</p>'}
  </section>`;
}
