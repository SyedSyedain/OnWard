/**
 * Renders the new-card form, including validation messages.
 */

import { escapeHtml } from '../lib/html.js';

function renderError(id, message) {
  return message ? `<p class="field-error" id="${id}" role="alert">${escapeHtml(message)}</p>` : '';
}

/**
 * @param {{ values?: { title?: string, assignee?: string, dueDate?: string }, errors?: { title?: string, dueDate?: string }, assignees?: string[] }} props
 * @returns {string}
 */
export function renderNewCardForm({ values = {}, errors = {}, assignees = [] } = {}) {
  const options = assignees
    .map((name) => {
      const selected = name === values.assignee ? ' selected' : '';
      return `<option value="${escapeHtml(name)}"${selected}>${escapeHtml(name)}</option>`;
    })
    .join('');

  return `<form class="new-card-form" novalidate>
  <label for="card-title">Title</label>
  <input id="card-title" name="title" type="text" value="${escapeHtml(values.title ?? '')}"${errors.title ? ' aria-invalid="true" aria-describedby="card-title-error"' : ''} />
  ${renderError('card-title-error', errors.title)}
  <label for="card-assignee">Assignee</label>
  <select id="card-assignee" name="assignee"><option value="">Unassigned</option>${options}</select>
  <label for="card-due">Due date</label>
  <input id="card-due" name="dueDate" type="date" value="${escapeHtml(values.dueDate ?? '')}"${errors.dueDate ? ' aria-invalid="true" aria-describedby="card-due-error"' : ''} />
  ${renderError('card-due-error', errors.dueDate)}
  <button type="submit">Add card</button>
</form>`;
}
