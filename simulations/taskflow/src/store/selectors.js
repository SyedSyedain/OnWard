/**
 * Derived data for the board.
 */

import { ALL, UNASSIGNED } from './reducer.js';

function matchesFilter(card, filter) {
  if (filter === ALL) return Boolean(card.assignee);
  if (filter === UNASSIGNED) return !card.assignee;
  return card.assignee === filter;
}

/**
 * Cards of one column that are not archived and match the current assignee filter.
 * @param {object} state
 * @param {string} columnId
 * @returns {object[]}
 */
export function selectVisibleCards(state, columnId) {
  const column = state.columns.find((c) => c.id === columnId);
  if (!column) return [];
  return column.cardIds
    .map((id) => state.cards[id])
    .filter((card) => card && !card.archived && matchesFilter(card, state.filter));
}

/**
 * One view model per column, with the number of visible cards.
 * @param {object} state
 * @returns {{ id: string, title: string, count: number, cards: object[] }[]}
 */
export function selectColumnViews(state) {
  return state.columns.map((column) => {
    const cards = selectVisibleCards(state, column.id);
    return { id: column.id, title: column.title, count: cards.length, cards };
  });
}

/**
 * Sorted list of everyone assigned to a live (non-archived) card.
 * @param {object} state
 * @returns {string[]}
 */
export function selectAssignees(state) {
  const names = new Set();
  for (const card of Object.values(state.cards)) {
    if (!card.archived && card.assignee) names.add(card.assignee);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}
