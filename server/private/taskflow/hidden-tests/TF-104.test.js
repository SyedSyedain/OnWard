import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SET_FILTER, reducer } from '../../src/store/reducer.js';
import { selectColumnViews, selectVisibleCards } from '../../src/store/selectors.js';
import { makeBoard } from '../helpers.js';

function board() {
  return makeBoard([
    { title: 'Owned by Asha', assignee: 'Asha' },
    { title: 'Nobody yet' },
    { title: 'Owned by Ben', assignee: 'Ben' },
  ]);
}

test('[acceptance] choosing everyone shows unassigned cards as well', () => {
  const state = reducer(board(), { type: SET_FILTER, payload: { filter: 'all' } });
  assert.deepEqual(selectVisibleCards(state, 'todo').map((c) => c.title), ['Owned by Asha', 'Nobody yet', 'Owned by Ben']);
});

test('[acceptance] column counts include unassigned cards when everyone is shown', () => {
  const state = board();
  assert.equal(state.filter, 'all');
  assert.deepEqual(selectColumnViews(state).map((c) => c.count), [3, 0, 0]);
});

test('[acceptance] filtering by a person still hides everyone else', () => {
  const state = reducer(board(), { type: SET_FILTER, payload: { filter: 'Ben' } });
  assert.deepEqual(selectVisibleCards(state, 'todo').map((c) => c.title), ['Owned by Ben']);
  const none = reducer(board(), { type: SET_FILTER, payload: { filter: 'unassigned' } });
  assert.deepEqual(selectVisibleCards(none, 'todo').map((c) => c.title), ['Nobody yet']);
});
