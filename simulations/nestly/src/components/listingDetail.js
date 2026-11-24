/**
 * Listing detail page.
 */

import { escapeHtml } from '../lib/html.js';
import { formatPrice } from '../lib/format.js';
import { reviewList, reviewSummary } from './reviewList.js';
import { bookingWidget } from './bookingWidget.js';

/**
 * @param {object} listing
 * @param {{stay: {checkIn: string, checkOut: string, guests: number}}} state
 * @param {string} today `YYYY-MM-DD`
 * @returns {string}
 */
export function listingDetail(listing, state, today) {
  const amenities = listing.amenities.map((name) => `<li>${escapeHtml(name)}</li>`).join('');
  return `<article class="detail">
  <a href="#/" data-action="back">Back to results</a>
  <h2>${escapeHtml(listing.title)}</h2>
  <p>${escapeHtml(listing.city)} · ${formatPrice(listing.pricePerNight)} / night</p>
  <p>${escapeHtml(listing.description)}</p>
  <ul class="amenities">${amenities}</ul>
  ${bookingWidget(listing, state.stay, today)}
  <section aria-labelledby="reviews-title">
    <h3 id="reviews-title">Reviews: ${reviewSummary(listing.reviews)}</h3>
    ${reviewList(listing.reviews)}
  </section>
</article>`;
}
