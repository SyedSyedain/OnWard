/**
 * Date range picker summary with night count and total price.
 */

import { escapeHtml } from '../lib/html.js';
import { formatPrice, pluralize } from '../lib/format.js';
import { formatDateRange, validateStay } from '../lib/dates.js';
import { quoteStay } from '../lib/pricing.js';

/**
 * @param {object} listing
 * @param {{checkIn: string, checkOut: string, guests: number}} stay
 * @param {string} today `YYYY-MM-DD`
 * @returns {string}
 */
export function bookingWidget(listing, stay, today) {
  const form = `<form class="booking" aria-label="Choose your dates">
  <label>Check-in <input type="date" name="checkIn" value="${escapeHtml(stay.checkIn)}"></label>
  <label>Check-out <input type="date" name="checkOut" value="${escapeHtml(stay.checkOut)}"></label>
  <label>Guests <input type="number" name="guests" min="1" value="${stay.guests}"></label>
</form>`;
  if (!stay.checkIn && !stay.checkOut) {
    return `${form}\n<p class="hint">Add dates to see the total price.</p>`;
  }
  const quote = quoteStay(listing, stay, today);
  if (!quote) {
    const problems = validateStay(stay, listing, today)
      .map((message) => `<li>${escapeHtml(message)}</li>`)
      .join('');
    return `${form}\n<ul class="errors" role="alert">${problems}</ul>`;
  }
  return `${form}
<dl class="quote">
  <dt>${escapeHtml(formatDateRange(stay.checkIn, stay.checkOut))}</dt>
  <dd class="nights">${pluralize(quote.nights, 'night')}</dd>
  <dt>${formatPrice(quote.nightly)} x ${pluralize(quote.nights, 'night')}</dt>
  <dd>${formatPrice(quote.subtotal)}</dd>
  <dt>Cleaning fee</dt>
  <dd>${formatPrice(quote.cleaningFee)}</dd>
  <dt>Service fee</dt>
  <dd>${formatPrice(quote.serviceFee)}</dd>
  <dt>Total</dt>
  <dd class="total">${formatPrice(quote.total)}</dd>
</dl>`;
}
