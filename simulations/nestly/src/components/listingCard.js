/**
 * A listing card for the search results grid.
 */

import { escapeHtml } from '../lib/html.js';
import { formatPrice, averageRating, ratingLabel, pluralize } from '../lib/format.js';

/**
 * @param {{id: string, title: string, city: string, pricePerNight: number, maxGuests: number, reviews: {rating: number}[]}} listing
 * @param {{isFavourite: boolean}} props
 * @returns {string}
 */
export function listingCard(listing, { isFavourite }) {
  return `<li class="card" data-listing-id="${escapeHtml(listing.id)}">
  <button type="button" class="heart${isFavourite ? ' is-active' : ''}" data-action="toggle-favourite" data-id="${escapeHtml(listing.id)}">${isFavourite ? '♥' : '♡'}</button>
  <h3><a href="#/listing/${escapeHtml(listing.id)}" data-action="open-listing" data-id="${escapeHtml(listing.id)}">${escapeHtml(listing.title)}</a></h3>
  <p class="city">${escapeHtml(listing.city)} · sleeps ${pluralize(listing.maxGuests, 'guest')}</p>
  <p class="rating">${ratingLabel(averageRating(listing.reviews))}</p>
  <p class="price"><strong>${formatPrice(listing.pricePerNight)}</strong> / night</p>
</li>`;
}

/**
 * @param {object[]} listings
 * @param {{favourites: string[]}} state
 * @returns {string}
 */
export function listingGrid(listings, state) {
  if (listings.length === 0) return '<p class="empty">No stays match your filters.</p>';
  const cards = listings
    .map((listing) => listingCard(listing, { isFavourite: state.favourites.includes(listing.id) }))
    .join('\n');
  return `<ul class="grid">\n${cards}\n</ul>`;
}
