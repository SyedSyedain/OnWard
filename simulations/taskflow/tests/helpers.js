/**
 * Factory helpers: every call builds fresh objects so tests never share state.
 */

import { ADD_CARD, createInitialState, reducer } from '../src/store/reducer.js';

export const NOW = new Date(2026, 10, 24, 15, 30, 0);

export function makeCard(overrides = {}) {
  return { id: 'c-1', title: 'Write release notes', assignee: 'Asha', dueDate: '', archived: false, ...overrides };
}

/**
 * Builds a board by dispatching ADD_CARD for each spec: { title, assignee, dueDate, columnId }.
 */
export function makeBoard(specs = []) {
  return specs.reduce(
    (state, payload) => reducer(state, { type: ADD_CARD, payload }),
    createInitialState(),
  );
}

export function defaultBoard() {
  return makeBoard([
    { title: 'Design login', assignee: 'Asha', columnId: 'todo' },
    { title: 'Fix header', assignee: 'Ben', columnId: 'todo' },
    { title: 'Write docs', assignee: 'Asha', columnId: 'doing' },
  ]);
}
