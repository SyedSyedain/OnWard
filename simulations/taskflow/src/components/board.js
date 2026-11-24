/**
 * Renders the whole board: filter bar plus columns.
 */

import { escapeHtml } from '../lib/html.js';
import { ALL, UNASSIGNED } from '../store/reducer.js';
import { selectAssignees, selectColumnViews } from '../store/selectors.js';
import { renderColumn } from './column.js';

function renderFilter(state) {
  const names = selectAssignees(state);
  const choices = [
    { value: ALL, label: 'Everyone' },
    { value: UNASSIGNED, label: 'Unassigned' },
    ...names.map((name) => ({ value: name, label: name })),
  ];
  const options = choices
    .map((c) => `<option value="${escapeHtml(c.value)}"${c.value === state.filter ? ' selected' : ''}>${escapeHtml(c.label)}</option>`)
    .join('');
  return `<div class="filter-bar"><label for="assignee-filter">Show cards for</label><select id="assignee-filter">${options}</select></div>`;
}

/**
 * @param {object} state
 * @param {Date} now
 * @returns {string}
 */
export function renderBoard(state, now) {
  const columns = selectColumnViews(state)
    .map((column) => renderColumn(column, now))
    .join('\n');
  return `<main class="board">
${renderFilter(state)}
<div class="columns">
${columns}
</div>
</main>`;
}
