/**
 * The search field above the track list.
 * @module components/searchBox
 */

import { escapeHtml } from '../lib/html.js';

/**
 * @param {{ query: string }} props
 * @returns {string}
 */
export function searchBox({ query }) {
  return `<div class="search">
  <label for="search-input">Search tracks</label>
  <input id="search-input" type="search" value="${escapeHtml(query)}" placeholder="Title or artist" />
</div>`;
}
