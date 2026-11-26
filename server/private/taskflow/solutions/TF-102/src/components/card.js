/**
 * Renders one kanban card.
 */

import { escapeHtml } from '../lib/html.js';
import { formatDueDate, getDueStatus } from '../lib/dates.js';

const BADGE_LABELS = { overdue: 'Overdue', soon: 'Due soon', later: '' };

/**
 * @param {{ dueDate?: string }} card
 * @param {Date} now
 * @returns {string} badge markup, or an empty string when no badge applies
 */
export function renderDueBadge(card, now) {
  const status = getDueStatus(card.dueDate, now);
  if (status === 'none') return '';
  const label = BADGE_LABELS[status] || formatDueDate(card.dueDate);
  return `<span class="badge badge-${status}">${escapeHtml(label)}</span>`;
}

/**
 * @param {{ id: string, title: string, assignee?: string, dueDate?: string }} card
 * @param {Date} now
 * @returns {string}
 */
export function renderCard(card, now) {
  const assignee = card.assignee
    ? `<span class="card-assignee">${escapeHtml(card.assignee)}</span>`
    : '<span class="card-assignee card-assignee-empty">Unassigned</span>';

  return `<article class="card" data-card-id="${escapeHtml(card.id)}" draggable="true">
  <h3 class="card-title">${escapeHtml(card.title)}</h3>
  <div class="card-meta">${assignee}${renderDueBadge(card, now)}</div>
</article>`;
}
