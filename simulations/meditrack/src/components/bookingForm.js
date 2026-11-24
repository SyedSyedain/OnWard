/**
 * The booking form shown once a slot is selected.
 */

import { escapeHtml } from '../lib/html.js';

function field({ id, label, type, value, error }) {
  const errorId = `${id}-error`;
  const input =
    type === 'textarea'
      ? `<textarea id="${id}" name="${id}" rows="3" aria-invalid="${Boolean(error)}">${escapeHtml(value)}</textarea>`
      : `<input id="${id}" name="${id}" type="${type}" value="${escapeHtml(value)}" aria-invalid="${Boolean(error)}" />`;
  const message = error ? `<p class="error" id="${errorId}" role="alert">${escapeHtml(error)}</p>` : '';
  return `<div class="field"><label for="${id}">${escapeHtml(label)}</label>${input}${message}</div>`;
}

/**
 * @param {{slotLabel: string|null, values?: {name?: string, phone?: string, reason?: string}, errors?: object}} props
 * @returns {string}
 */
export function renderBookingForm({ slotLabel, values = {}, errors = {} }) {
  if (!slotLabel) return '';
  return `<section class="panel" aria-labelledby="booking-heading">
    <h2 id="booking-heading">Your details</h2>
    <p>Selected time: <strong>${escapeHtml(slotLabel)}</strong></p>
    <form id="booking-form" novalidate>
      ${field({ id: 'name', label: 'Full name', type: 'text', value: values.name ?? '', error: errors.name })}
      ${field({ id: 'phone', label: 'Phone number', type: 'tel', value: values.phone ?? '', error: errors.phone })}
      ${field({ id: 'reason', label: 'Reason for visit', type: 'textarea', value: values.reason ?? '', error: errors.reason })}
      <button type="submit">Book appointment</button>
    </form>
  </section>`;
}
