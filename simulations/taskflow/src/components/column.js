/**
 * Renders one board column with its header and cards.
 */

import { escapeHtml } from '../lib/html.js';
import { renderCard } from './card.js';

/**
 * @param {{ id: string, title: string, count: number, cards: object[] }} column
 * @param {Date} now
 * @returns {string}
 */
export function renderColumn(column, now) {
  const cards = column.cards.map((card) => renderCard(card, now)).join('\n');
  return `<section class="column" data-column-id="${escapeHtml(column.id)}" aria-labelledby="col-${escapeHtml(column.id)}-title">
  <header class="column-header">
    <h2 id="col-${escapeHtml(column.id)}-title">${escapeHtml(column.title)}</h2>
    <span class="column-count" aria-label="${column.count} cards">${column.count}</span>
  </header>
  <div class="column-cards">
${cards}
  </div>
</section>`;
}
