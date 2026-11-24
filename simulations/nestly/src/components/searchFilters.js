/**
 * Search filter form.
 */

import { escapeHtml, boolAttr } from '../lib/html.js';

export const AMENITY_OPTIONS = ['wifi', 'pool', 'kitchen', 'parking', 'air-conditioning', 'pet-friendly'];

/**
 * @param {{query: string, minPrice: number|null, maxPrice: number|null, guests: number, amenities: string[], sort: string}} filters
 * @returns {string}
 */
export function searchFilters(filters) {
  const amenities = AMENITY_OPTIONS.map(
    (name) => `<label><input type="checkbox" name="amenity" value="${escapeHtml(name)}"${boolAttr('checked', filters.amenities.includes(name))}> ${escapeHtml(name)}</label>`,
  ).join('\n    ');
  const sorts = [
    ['recommended', 'Recommended'],
    ['price-asc', 'Price: low to high'],
    ['price-desc', 'Price: high to low'],
    ['rating', 'Top rated'],
  ]
    .map(([value, label]) => `<option value="${value}"${boolAttr('selected', filters.sort === value)}>${label}</option>`)
    .join('');
  return `<form class="filters" aria-label="Search filters">
  <label>Search <input type="search" name="query" value="${escapeHtml(filters.query)}"></label>
  <label>Min price <input type="number" name="minPrice" min="0" value="${filters.minPrice ?? ''}"></label>
  <label>Max price <input type="number" name="maxPrice" min="0" value="${filters.maxPrice ?? ''}"></label>
  <label>Guests <input type="number" name="guests" min="1" value="${filters.guests}"></label>
  <fieldset>
    <legend>Amenities</legend>
    ${amenities}
  </fieldset>
  <label>Sort <select name="sort">${sorts}</select></label>
</form>`;
}
